import gsap from 'gsap';

export const DESKTOP_HEADER_SCROLL_RANGE = 160;

export function getDesktopHeaderProgress(scrollY: number) {
  return Math.min(1, Math.max(0, scrollY / DESKTOP_HEADER_SCROLL_RANGE));
}

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

export function writeDesktopHeaderFrame(
  header: HTMLElement,
  viewportWidth: number,
  progress: number,
) {
  const baseWidth = Math.min(1680, viewportWidth - 48);
  header.style.setProperty(
    '--header-fluid-width',
    `${lerp(baseWidth, baseWidth * 0.92, progress)}px`,
  );
  header.style.setProperty('--header-fluid-height', `${lerp(76, 68, progress)}px`);
  header.style.setProperty('--header-fluid-radius', `${lerp(28, 24, progress)}px`);
  header.style.setProperty('--header-fluid-shell-start', `${lerp(22, 20, progress)}px`);
  header.style.setProperty('--header-fluid-shell-end', `${lerp(18, 16.2, progress)}px`);
  header.style.setProperty('--header-fluid-menu-gap', `${lerp(12, 10.8, progress)}px`);
  header.style.setProperty('--header-fluid-shadow-y', `${lerp(18, 12, progress)}px`);
  header.style.setProperty('--header-fluid-shadow-blur', `${lerp(48, 34, progress)}px`);
  header.style.setProperty('--header-fluid-shadow-alpha', `${lerp(0.12, 0.16, progress)}`);
}

export function clearDesktopHeaderFrame(header: HTMLElement) {
  gsap.killTweensOf(header);
  for (const name of [
    '--header-fluid-width',
    '--header-fluid-height',
    '--header-fluid-radius',
    '--header-fluid-shell-start',
    '--header-fluid-shell-end',
    '--header-fluid-menu-gap',
    '--header-fluid-shadow-y',
    '--header-fluid-shadow-blur',
    '--header-fluid-shadow-alpha',
  ]) {
    header.style.removeProperty(name);
  }
}
