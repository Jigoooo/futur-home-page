import { Icon } from './icons';
import styles from './styles/footer.module.css';
import sharedStyles from './styles/shared.module.css';
import { mailHref } from '../lib/company-links';
import { COMPANY_INFOS } from '@/entities/company';

export function FooterSection() {
  return (
    <footer className={styles.footer}>
      <div className={sharedStyles.container}>
        <div className={styles.footerTop}>
          <div>
            <h2>FUTUR와 다음 프로젝트를 시작해보세요.</h2>
            <p>기술을 어렵게 보이지 않게, 필요한 결과를 명확하게 만들겠습니다.</p>
          </div>
          <div className={styles.footerContact}>
            <span className={styles.footerContactLabel}>새 프로젝트 문의</span>
            <a className={styles.footerPill} href={mailHref} data-landing-interactive='round'>
              <Icon name='mail' />
              {COMPANY_INFOS.EMAIL}
            </a>
            <span className={styles.footerContactNote}>평균 회신 영업일 24시간 이내</span>
          </div>
        </div>

        <div className={styles.footerGrid}>
          <div>
            <h3>
              FUTUR<span>.</span>
            </h3>
            <p>아이디어를 현실의 서비스로 만드는 SI·외주 개발 파트너.</p>
          </div>

          <div>
            <strong>문의</strong>
            <div className={styles.contactItem}>
              <Icon name='mail' />
              {COMPANY_INFOS.EMAIL}
            </div>
            <div className={styles.contactItem}>
              <Icon name='map' />
              {COMPANY_INFOS.ADDRESS}
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
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
