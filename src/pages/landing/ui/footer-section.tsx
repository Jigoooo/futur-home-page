import { Link } from '@tanstack/react-router';

import { serviceCapabilities } from '../config';
import styles from './styles/footer.module.css';
import sharedStyles from './styles/shared.module.css';
import { mailHref } from '../lib/company-links';
import { COMPANY_INFOS } from '@/entities/company';

export function FooterSection() {
  return (
    <footer
      className={styles.footer}
      id='footer'
      data-landing-section
      data-header-surface='dark'
      data-cursor-contrast='light'
    >
      <div className={sharedStyles.container}>
        <div className={styles.footerTop}>
          <h2>필요한 변화가 있다면, 그 시작부터 함께합니다.</h2>
          <p>
            새로운 아이디어도, 이미 운영 중인 시스템의 문제도 괜찮습니다. 현재 상황과 필요한 기능을
            알려주세요.
          </p>
          <a className={styles.primaryEmail} href={mailHref}>
            {COMPANY_INFOS.EMAIL}
          </a>
        </div>

        <div className={styles.footerGrid}>
          <div>
            <h3>
              FUTUR<span>.</span>
            </h3>
            <p>서비스와 시스템을 만들고, 필요한 기술을 연결해 운영까지 이어갑니다.</p>
          </div>

          <div>
            <strong>문의</strong>
            <div className={styles.contactItem}>
              <a href={mailHref}>{COMPANY_INFOS.EMAIL}</a>
            </div>
            <div className={styles.contactItem}>
              <address>{COMPANY_INFOS.ADDRESS}</address>
            </div>
          </div>

          <nav aria-label='서비스 탐색'>
            <strong>서비스 탐색</strong>
            <div className={styles.serviceLinks}>
              {serviceCapabilities.map((service) => (
                <a key={service.title} href={`#service-${service.key}`}>
                  {service.title}
                </a>
              ))}
            </div>
          </nav>
        </div>

        <nav className={styles.legalLinks} aria-label='법적 고지'>
          <Link to='/privacy' className={styles.legalPrimary}>
            개인정보처리방침
          </Link>
          <span className={styles.legalDivider} aria-hidden='true'>
            ·
          </span>
          <Link to='/terms' className={styles.legalSecondary}>
            이용약관
          </Link>
        </nav>

        <div className={styles.copyright}>
          <span>© 2026 FUTUR. All rights reserved.</span>
          <span>
            대표 {COMPANY_INFOS.CEO} · 사업자등록번호 {COMPANY_INFOS.BUSINESS_LICENSE} · 통신판매업
            {COMPANY_INFOS.MAIL_ORDER_LICENSE}
          </span>
          <span>
            개인정보 보호책임자 {COMPANY_INFOS.PRIVACY_OFFICER.NAME} (
            <a href={`mailto:${COMPANY_INFOS.PRIVACY_OFFICER.EMAIL}`}>
              {COMPANY_INFOS.PRIVACY_OFFICER.EMAIL}
            </a>
            )
          </span>
        </div>
      </div>
    </footer>
  );
}
