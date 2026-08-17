#!/usr/bin/env bash

set -Eeuo pipefail

if ! command -v magick >/dev/null 2>&1; then
  printf 'ImageMagick magick is required.\n' >&2
  exit 69
fi

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mark_source="${project_root}/public/logo_512x512.png"
share_source="${project_root}/public/futur_main.png"
share_dir="${project_root}/public/media/share"
task_tmp_root="${TMPDIR:-/tmp}"
task_tmp_dir="$(mktemp -d "${task_tmp_root%/}/futur-seo-assets.XXXXXX")"

cleanup() {
  rm -rf -- "$task_tmp_dir"
}
trap cleanup EXIT

for source_file in "$mark_source" "$share_source"; do
  if [[ ! -f "$source_file" ]]; then
    printf 'Required source image is missing: %s\n' "$source_file" >&2
    exit 66
  fi
done

mkdir -p "$share_dir"

centered_mark="${task_tmp_dir}/mark-centered.png"
roundel_master="${task_tmp_dir}/roundel-master.png"

magick -size 512x512 canvas:none \
  "$mark_source" -geometry +0+50 -composite \
  "$centered_mark"

magick -size 512x512 canvas:none \
  -fill '#202523' -draw 'circle 256,256 256,0' \
  \( "$centered_mark" -resize 328x328 \) \
  -gravity center -composite \
  "$roundel_master"

magick "$roundel_master" -resize 512x512 "${project_root}/public/organization-logo-512.png"
magick "$roundel_master" -resize 180x180 "${project_root}/public/apple-touch-icon.png"
magick "$roundel_master" -resize 96x96 "${project_root}/public/favicon-96.png"
magick "$roundel_master" -resize 48x48 "${project_root}/public/favicon-48.png"
magick "$roundel_master" -resize 32x32 "${project_root}/public/favicon-32.png"
magick "$roundel_master" -resize 16x16 "${task_tmp_dir}/favicon-16.png"
magick \
  "${task_tmp_dir}/favicon-16.png" \
  "${project_root}/public/favicon-32.png" \
  "${project_root}/public/favicon-48.png" \
  -colors 256 \
  "${project_root}/public/favicon.ico"

font_path='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
if [[ -f "$font_path" ]]; then
  font_args=(-font "$font_path")
else
  font_args=(-font 'DejaVu-Sans-Bold')
fi

magick "$share_source" \
  -crop 3024x1588+0+900 +repage \
  -resize 1200x630 \
  -fill black -draw 'rectangle 0,442 1200,510' \
  "${font_args[@]}" -pointsize 26 -kerning 1.5 -fill white \
  -gravity center -annotate +0+155 'BUILT FOR WHAT’S NEXT.' \
  "${share_dir}/futur-main-og-v2.png"

chmod 644 \
  "${project_root}/public/favicon.ico" \
  "${project_root}/public/favicon-32.png" \
  "${project_root}/public/favicon-48.png" \
  "${project_root}/public/favicon-96.png" \
  "${project_root}/public/apple-touch-icon.png" \
  "${project_root}/public/organization-logo-512.png" \
  "${share_dir}/futur-main-og-v2.png"

printf 'Generated FUTUR SEO assets.\n'
