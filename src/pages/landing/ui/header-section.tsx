import { navigationItems } from '../config';
import { Button } from './button';

export function HeaderSection() {
  return (
    <header id='top' className='nav container'>
      <a href='#top' className='logo' aria-label='FUTUR home'>
        FUTUR<span>.</span>
      </a>
      <nav className='nav-menu' aria-label='주요 메뉴'>
        {navigationItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <Button href='#contact' cursorText='문의'>
        <span className='btn-label'>문의하기</span>
        <span className='btn-arrow'>→</span>
      </Button>
    </header>
  );
}
