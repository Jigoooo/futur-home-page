import type { IconName } from '../model/types';

interface IconProps {
  name: IconName;
}

export function Icon({ name }: IconProps) {
  switch (name) {
    case 'api':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M4 7h16' />
          <path d='M4 17h16' />
          <path d='M8 4v16' />
          <path d='M16 4v16' />
        </svg>
      );
    case 'app':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <rect x='7' y='2.8' width='10' height='18.4' rx='2.4' />
          <path d='M10 18h4' />
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M4 4h16v16H4z' />
          <path d='M4 8h16' />
          <path d='M8 2v4' />
          <path d='M16 2v4' />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox='0 0 16 16' fill='none' aria-hidden='true'>
          <path d='M3 8l3 3 7-7' />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <circle cx='12' cy='12' r='9' />
          <path d='M12 8v5l3 2' />
        </svg>
      );
    case 'desktop':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M4 6h16v12H4z' />
          <path d='M8 20h8' />
          <path d='M12 18v2' />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox='0 0 24 24' aria-hidden='true'>
          <path d='M12 .9a11.1 11.1 0 0 0-3.5 21.6c.55.1.75-.24.75-.53v-2c-3.05.66-3.7-1.3-3.7-1.3-.5-1.26-1.22-1.6-1.22-1.6-1-.68.08-.67.08-.67 1.1.08 1.68 1.14 1.68 1.14.98 1.67 2.58 1.18 3.2.9.1-.7.38-1.18.7-1.45-2.44-.28-5-1.22-5-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.9 0 0 .92-.3 3.02 1.12a10.4 10.4 0 0 1 5.5 0c2.1-1.42 3.02-1.12 3.02-1.12.6 1.5.22 2.62.11 2.9.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.15-5.02 5.42.39.34.74 1.02.74 2.06v3.05c0 .3.2.64.76.53A11.1 11.1 0 0 0 12 .9z' />
        </svg>
      );
    case 'link':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M9 7H7a5 5 0 0 0 0 10h2' />
          <path d='M15 7h2a5 5 0 0 1 0 10h-2' />
          <path d='M8 12h8' />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox='0 0 24 24' aria-hidden='true'>
          <path d='M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.4h4v12.1H3V9.4zm6.8 0h3.8v1.65h.05c.53-1 1.84-2.05 3.8-2.05 4.06 0 4.8 2.67 4.8 6.15v6.35h-4v-5.63c0-1.34-.02-3.06-1.86-3.06-1.87 0-2.16 1.46-2.16 2.96v5.73h-4V9.4z' />
        </svg>
      );
    case 'mail':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M4 4h16v16H4z' />
          <path d='M4 7l8 6 8-6' />
        </svg>
      );
    case 'map':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M12 21s7-4.4 7-11a7 7 0 0 0-14 0c0 6.6 7 11 7 11z' />
          <circle cx='12' cy='10' r='2' />
        </svg>
      );
    case 'phone':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z' />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M12 3l8 4v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V7z' />
          <path d='M9 12l2 2 4-5' />
        </svg>
      );
    case 'system':
      return (
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M4 7h16' />
          <path d='M7 7v13' />
          <path d='M17 7v13' />
          <path d='M5 20h14' />
          <path d='M8 3h8v4H8z' />
        </svg>
      );
    default:
      return null;
  }
}
