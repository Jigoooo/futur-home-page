import { Link } from '@tanstack/react-router';

import styles from './styles/footer.module.css';
import sharedStyles from './styles/shared.module.css';
import { mailHref } from '../lib/company-links';
import { COMPANY_INFOS } from '@/entities/company';

export function FooterSection() {
  return (
    <footer className={styles.footer} id='footer' data-landing-section data-cursor-contrast='light'>
      <div className={sharedStyles.container}>
        <div className={styles.footerTop}>
          <div>
            <h2>FUTUR</h2>
          </div>
          <div className={styles.footerContact}>
            <a className={styles.footerMail} href={mailHref}>
              {COMPANY_INFOS.EMAIL}
            </a>
          </div>
        </div>

        <div className={styles.footerGrid}>
          <div>
            <strong>사업자 정보</strong>
            <p>
              대표 {COMPANY_INFOS.CEO}
              <br />
              사업자등록번호 {COMPANY_INFOS.BUSINESS_LICENSE}
              <br />
              통신판매업 {COMPANY_INFOS.MAIL_ORDER_LICENSE}
            </p>
          </div>

          <div>
            <strong>연락처</strong>
            <address>{COMPANY_INFOS.ADDRESS}</address>
            <a href={mailHref}>{COMPANY_INFOS.EMAIL}</a>
          </div>
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
