import { Icon } from './icons';
import { footerColumns } from '../config';
import { mailHref, phoneHref } from '../lib/company-links';
import { COMPANY_INFOS } from '@/entities/company';

export function FooterSection() {
  return (
    <footer className='footer'>
      <div className='container'>
        <div className='footer-top'>
          <div>
            <h2>FUTUR와 다음 프로젝트를 시작해보세요.</h2>
            <p>기술을 어렵게 보이지 않게, 필요한 결과를 명확하게 만들겠습니다.</p>
          </div>
          <div className='footer-contact'>
            <a className='footer-pill' href={mailHref}>
              <Icon name='mail' />
              {COMPANY_INFOS.EMAIL}
            </a>
            <a className='footer-pill' href={phoneHref}>
              <Icon name='phone' />
              {COMPANY_INFOS.PHONE}
            </a>
          </div>
        </div>

        <div className='footer-grid'>
          <div>
            <h3>
              FUTUR<span>.</span>
            </h3>
            <p>아이디어를 현실의 서비스로 만드는 SI·외주 개발 파트너.</p>
            <div className='socials'>
              <a className='social' href='#top' aria-label='GitHub' data-cursor-text='GitHub'>
                <Icon name='github' />
              </a>
              <a className='social' href='#top' aria-label='LinkedIn' data-cursor-text='LinkedIn'>
                <Icon name='linkedin' />
              </a>
              <a className='social' href={mailHref} aria-label='Email' data-cursor-text='Email'>
                <Icon name='mail' />
              </a>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <strong>{column.title}</strong>
              {column.links.map((link) => (
                <a key={`${column.title}-${link.label}`} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}

          <div>
            <strong>문의</strong>
            <div className='contact-item'>
              <Icon name='mail' />
              {COMPANY_INFOS.EMAIL}
            </div>
            <div className='contact-item'>
              <Icon name='phone' />
              {COMPANY_INFOS.PHONE}
            </div>
            <div className='contact-item'>
              <Icon name='map' />
              {COMPANY_INFOS.ADDRESS}
            </div>
          </div>
        </div>

        <div className='copyright'>
          <span>© 2026 FUTUR. All rights reserved.</span>
          <span>
            대표 {COMPANY_INFOS.CEO} · 사업자등록번호 {COMPANY_INFOS.BUSINESS_LICENSE} · 통신판매업
            {COMPANY_INFOS.MAIL_ORDER_LICENSE}
          </span>
        </div>
      </div>
    </footer>
  );
}
