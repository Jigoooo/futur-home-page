#!/usr/bin/env bash

set -Eeuo pipefail

action="${1:-}"
deploy_path="${2:-}"
release_sha="${3:-}"
incoming_dir="${4:-}"

if [[ ! "$deploy_path" =~ ^/ ]] || [[ "$deploy_path" == '/' ]] || [[ -z "$release_sha" ]]; then
  printf 'Invalid deployment target.\n' >&2
  exit 64
fi

case "$release_sha" in
  *[!0-9a-f]*)
    printf 'Invalid release SHA.\n' >&2
    exit 64
    ;;
esac

releases_dir="${deploy_path}/releases"
release_dir="${releases_dir}/${release_sha}"
current_link="${deploy_path}/current"
shared_dir="${deploy_path}/shared"
state_dir="${shared_dir}/deploy-state/${release_sha}"
runtime_env="${shared_dir}/runtime.env"
ecosystem_config="${shared_dir}/ecosystem.config.cjs"
pm2_home="${PM2_HOME:-${HOME}/.pm2}"

export NVM_DIR="${NVM_DIR:-${HOME}/.nvm}"
if [[ -s "${NVM_DIR}/nvm.sh" ]]; then
  # shellcheck disable=SC1091
  source "${NVM_DIR}/nvm.sh"
  nvm use 22 --silent >/dev/null
fi

for command_name in pm2 curl tar; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Required command is unavailable: %s\n' "$command_name" >&2
    exit 69
  fi
done

mkdir -p "$releases_dir" "$shared_dir" "$state_dir"

load_runtime_env() {
  if [[ ! -f "$runtime_env" ]]; then
    printf 'Runtime environment file is missing.\n' >&2
    return 1
  fi

  set -a
  # shellcheck disable=SC1090
  source "$runtime_env"
  set +a
  export DEPLOY_PATH="$deploy_path"
}

switch_current() {
  local target="$1"
  local next_link="${current_link}.next-${release_sha}"

  case "$target" in
    "${releases_dir}/"*) ;;
    *)
      printf 'Refusing to activate a path outside releases.\n' >&2
      return 1
      ;;
  esac

  rm -f -- "$next_link"
  ln -s "$target" "$next_link"
  if [[ -e "$current_link" && ! -L "$current_link" ]]; then
    rm -f -- "$next_link"
    printf 'Refusing to replace a non-symlink current path.\n' >&2
    return 1
  fi
  mv -f "$next_link" "$current_link"
}

wait_for_new_homepage() {
  local attempt
  for attempt in {1..12}; do
    if curl -fsS --max-time 10 http://127.0.0.1:3000/ | grep -Fq 'BUILT FOR WHAT'; then
      return 0
    fi
    sleep 3
  done
  return 1
}

wait_for_any_homepage() {
  local attempt
  for attempt in {1..12}; do
    if curl -fsS --max-time 10 http://127.0.0.1:3000/ >/dev/null; then
      return 0
    fi
    sleep 3
  done
  return 1
}

rollback_release() {
  local previous_release=''
  if [[ -f "${state_dir}/previous-release" ]]; then
    previous_release="$(<"${state_dir}/previous-release")"
  fi

  if [[ -n "$previous_release" && -d "$previous_release" ]]; then
    switch_current "$previous_release"
    load_runtime_env
    pm2 startOrReload "$ecosystem_config" --update-env
    wait_for_new_homepage
    return
  fi

  if [[ -L "$current_link" ]]; then
    unlink "$current_link"
  fi
  pm2 delete futur >/dev/null 2>&1 || true
  if [[ -f "${state_dir}/pm2-before-release.dump" ]]; then
    install -m 600 "${state_dir}/pm2-before-release.dump" "${pm2_home}/dump.pm2"
    pm2 resurrect
    wait_for_any_homepage
    return
  fi

  printf 'No previous PM2 state is available for rollback.\n' >&2
  return 1
}

deploy_release() {
  if [[ -z "$incoming_dir" ]] || [[ "$incoming_dir" != "${deploy_path}/.incoming/${release_sha}" ]]; then
    printf 'Invalid incoming release directory.\n' >&2
    return 64
  fi

  for required_file in futur-output.tar.gz futur-runtime.env ecosystem.config.cjs; do
    if [[ ! -f "${incoming_dir}/${required_file}" ]]; then
      printf 'Release input is missing: %s\n' "$required_file" >&2
      return 66
    fi
  done

  pm2 save
  if [[ -f "${pm2_home}/dump.pm2" && ! -f "${state_dir}/pm2-before-release.dump" ]]; then
    install -m 600 "${pm2_home}/dump.pm2" "${state_dir}/pm2-before-release.dump"
  fi

  local previous_release=''
  if [[ -L "$current_link" ]]; then
    previous_release="$(readlink "$current_link" || true)"
    case "$previous_release" in
      "${releases_dir}/"*) ;;
      *) previous_release='' ;;
    esac
  fi
  if [[ "$previous_release" == "$release_dir" && -f "${state_dir}/previous-release" ]]; then
    previous_release="$(<"${state_dir}/previous-release")"
  fi
  printf '%s' "$previous_release" > "${state_dir}/previous-release"

  if [[ ! -f "${release_dir}/server/index.mjs" || "$(readlink "$current_link" 2>/dev/null || true)" != "$release_dir" ]]; then
    local staging_dir="${release_dir}.staging"
    rm -rf -- "$staging_dir"
    mkdir -p "$staging_dir"
    tar -xzf "${incoming_dir}/futur-output.tar.gz" -C "$staging_dir"
    if [[ ! -f "${staging_dir}/server/index.mjs" ]]; then
      printf 'Nitro entry point is missing from the verified artifact.\n' >&2
      rm -rf -- "$staging_dir"
      return 66
    fi

    if [[ -d "$release_dir" ]]; then
      rm -rf -- "$release_dir"
    fi
    mv "$staging_dir" "$release_dir"
  fi
  install -m 600 "${incoming_dir}/futur-runtime.env" "$runtime_env"
  install -m 644 "${incoming_dir}/ecosystem.config.cjs" "$ecosystem_config"

  load_runtime_env
  switch_current "$release_dir"
  if ! pm2 startOrReload "$ecosystem_config" --update-env || ! wait_for_new_homepage; then
    rollback_release
    return 1
  fi
}

finalize_release() {
  load_runtime_env
  wait_for_new_homepage
  pm2 save
  printf '%s' "$release_sha" > "${shared_dir}/last-successful-release"

  local old_release
  while IFS= read -r old_release; do
    case "$old_release" in
      "${releases_dir}/"*) rm -rf -- "${old_release%/}" ;;
    esac
  done < <(find "$releases_dir" -mindepth 1 -maxdepth 1 -type d -print0 | xargs -0 -r ls -1dt | tail -n +6)

  if [[ "$incoming_dir" == "${deploy_path}/.incoming/${release_sha}" && -d "$incoming_dir" ]]; then
    rm -rf -- "$incoming_dir"
  fi
}

case "$action" in
  deploy) deploy_release ;;
  rollback) rollback_release ;;
  finalize) finalize_release ;;
  *)
    printf 'Usage: %s <deploy|rollback|finalize> <deploy-path> <release-sha> <incoming-dir>\n' "$0" >&2
    exit 64
    ;;
esac
