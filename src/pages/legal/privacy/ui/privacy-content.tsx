import styles from './legal-content.module.css';
import { COMPANY_INFOS } from '@/entities/company';

export function PrivacyContent() {
  return (
    <article className={styles.legalContent}>
      <header className={styles.header}>
        <h1>개인정보 처리방침</h1>
        <p>
          {COMPANY_INFOS.NAME}(이하 &ldquo;회사&rdquo;)는 「개인정보 보호법」 제30조에 따라
          정보주체의 개인정보 보호 및 권익을 보호하고 관련 고충을 원활하게 처리할 수 있도록 다음과
          같이 개인정보 처리방침을 수립·공개합니다.
        </p>
      </header>

      <section>
        <h2>1. 처리 목적</h2>
        <p>
          회사는 다음의 목적을 위해 개인정보를 처리하며, 이용 목적이 변경될 경우에는 사전에 동의를
          받습니다.
        </p>
        <ul>
          <li>프로젝트 상담 문의 접수 및 회신</li>
          <li>견적·범위 검토 및 후속 제안</li>
        </ul>
      </section>

      <section>
        <h2>2. 처리 항목</h2>
        <p>회사는 상담 문의 접수 시 다음 항목을 수집합니다.</p>
        <ul>
          <li>
            <strong>필수</strong>: 담당자명, 이메일 주소, 문의 내용, 필요한 서비스, 프로젝트 단계,
            일정, 예산 범위
          </li>
          <li>
            <strong>선택</strong>: 회사명
          </li>
        </ul>
      </section>

      <section>
        <h2>3. 처리 및 보유 기간</h2>
        <ul>
          <li>상담 문의 정보의 보유 기간은 법률 검토 후 확정하여 고지할 예정입니다.</li>
          <li>정보주체가 동의를 철회하거나 삭제를 요청하는 경우 지체 없이 파기합니다.</li>
        </ul>
      </section>

      <section>
        <h2>4. 제3자 제공</h2>
        <p>회사는 정보주체의 개인정보를 제3자에게 제공하지 않습니다.</p>
      </section>

      <section>
        <h2>5. 처리 위탁</h2>
        <p>회사는 상담 문의 이메일 전송을 위해 Resend, Inc.의 이메일 전송 서비스를 이용합니다.</p>
      </section>

      <section>
        <h2>6. 개인정보의 국외 이전</h2>
        <p>상담 문의 전송 과정에서 다음과 같이 개인정보가 국외로 이전됩니다.</p>
        <ul>
          <li>
            <strong>이전받는 자</strong>: Resend, Inc.
          </li>
          <li>
            <strong>이전 국가</strong>: 미국
          </li>
          <li>
            <strong>이전 목적</strong>: 상담 문의 이메일 전송
          </li>
          <li>
            <strong>이전 항목</strong>: 담당자명, 이메일 주소, 회사명(선택), 프로젝트 정보 및 문의
            내용
          </li>
          <li>
            <strong>이전 시기 및 방법</strong>: 상담 양식 제출 시 암호화된 통신망을 통한 전송
          </li>
          <li>
            <strong>보유·이용 기간</strong>: 법률 검토와 서비스 계약·정책 확인 후 확정하여 고지할
            예정
          </li>
        </ul>
        <p>국외 이전에 동의하지 않을 수 있으며, 이 경우 이메일로 직접 문의할 수 있습니다.</p>
      </section>

      <section>
        <h2>7. 정보주체의 권리·의무 및 행사 방법</h2>
        <p>정보주체는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
        <ul>
          <li>개인정보 열람·정정·삭제·처리정지 요구</li>
          <li>동의 철회</li>
          <li>
            행사 방법: 아래 개인정보 보호책임자의 이메일(
            <a href={`mailto:${COMPANY_INFOS.PRIVACY_OFFICER.EMAIL}`}>
              {COMPANY_INFOS.PRIVACY_OFFICER.EMAIL}
            </a>
            )로 요청
          </li>
        </ul>
        <p>회사는 요청을 지체 없이 처리합니다.</p>
      </section>

      <section>
        <h2>8. 개인정보의 파기</h2>
        <ul>
          <li>보유 기간 경과·처리 목적 달성 시 지체 없이 파기합니다.</li>
          <li>전자 파일은 복구할 수 없는 방식으로 영구 삭제합니다.</li>
        </ul>
      </section>

      <section>
        <h2>9. 안전성 확보 조치</h2>
        <ul>
          <li>전송 구간 암호화(HTTPS/TLS)</li>
          <li>접근 권한 제한 및 인증</li>
          <li>정기적 백업 및 보안 점검</li>
        </ul>
      </section>

      <section>
        <h2>10. 자동수집장치(쿠키 등) 운영</h2>
        <p>회사는 쿠키·웹 비콘 등 자동수집장치를 운영하지 않습니다.</p>
      </section>

      <section>
        <h2>11. 개인정보 보호책임자</h2>
        <ul>
          <li>성명: {COMPANY_INFOS.PRIVACY_OFFICER.NAME}</li>
          <li>직책: {COMPANY_INFOS.PRIVACY_OFFICER.POSITION}</li>
          <li>
            이메일:{' '}
            <a href={`mailto:${COMPANY_INFOS.PRIVACY_OFFICER.EMAIL}`}>
              {COMPANY_INFOS.PRIVACY_OFFICER.EMAIL}
            </a>
          </li>
        </ul>
        <p>
          정보주체는 회사의 서비스를 이용하면서 발생한 개인정보 보호 관련 문의·불만·피해 구제를 위
          책임자에게 문의할 수 있습니다.
        </p>
      </section>

      <section>
        <h2>12. 권익 침해 구제 방법</h2>
        <ul>
          <li>개인정보분쟁조정위원회: 1833-6972 (privacy.go.kr)</li>
          <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
          <li>대검찰청: 1301 (spo.go.kr)</li>
          <li>경찰청 사이버수사국: 182 (ecrm.cyber.go.kr)</li>
        </ul>
      </section>

      <section>
        <h2>13. 처리방침 변경</h2>
        <p>
          본 처리방침이 변경되는 경우, 변경 사항의 시행 7일 전부터 홈페이지 공지를 통해 고지합니다.
        </p>
      </section>

      <footer className={styles.footer}>
        <p>공고일자: {COMPANY_INFOS.LEGAL_EFFECTIVE_DATE}</p>
        <p>시행일자: {COMPANY_INFOS.LEGAL_EFFECTIVE_DATE}</p>
      </footer>
    </article>
  );
}
