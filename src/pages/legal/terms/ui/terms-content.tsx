import styles from '../../privacy/ui/legal-content.module.css';
import { COMPANY_INFOS } from '@/entities/company';

export function TermsContent() {
  return (
    <article className={styles.legalContent}>
      <header className={styles.header}>
        <h1>이용약관</h1>
      </header>

      <section>
        <h2>제1조 (목적)</h2>
        <p>
          본 약관은 {COMPANY_INFOS.NAME}(이하 &ldquo;회사&rdquo;)가 운영하는 웹사이트(
          <a href={COMPANY_INFOS.URL} target='_blank' rel='noreferrer'>
            {COMPANY_INFOS.URL}
          </a>
          , 이하 &ldquo;사이트&rdquo;)의 이용 조건과 절차, 회사와 이용자 간의 권리·의무를 규정함을
          목적으로 합니다.
        </p>
      </section>

      <section>
        <h2>제2조 (정의)</h2>
        <ol>
          <li>
            &ldquo;사이트&rdquo;: 회사가 서비스 소개·상담 문의 접수 목적으로 운영하는 웹사이트
          </li>
          <li>&ldquo;이용자&rdquo;: 사이트에 접속하여 본 약관에 따라 서비스를 이용하는 자</li>
          <li>
            &ldquo;상담 문의&rdquo;: 이용자가 사이트의 문의 폼·이메일을 통해 회사에 요청하는
            프로젝트 상담
          </li>
        </ol>
      </section>

      <section>
        <h2>제3조 (약관의 효력 및 변경)</h2>
        <ol>
          <li>본 약관은 사이트에 게시함으로써 효력이 발생합니다.</li>
          <li>
            회사는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 시행일 7일
            전부터 사이트에 공지합니다.
          </li>
        </ol>
      </section>

      <section>
        <h2>제4조 (서비스의 제공)</h2>
        <ol>
          <li>사이트는 회사의 서비스·사례 소개와 상담 문의 접수 기능을 제공합니다.</li>
          <li>사이트 자체는 재화·용역의 거래·결제를 수행하지 않습니다.</li>
          <li>실제 프로젝트 수행은 회사와 이용자 간 별도 계약서를 통해 진행됩니다.</li>
        </ol>
      </section>

      <section>
        <h2>제5조 (이용자의 의무)</h2>
        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
        <ul>
          <li>허위 정보 제공, 타인의 정보 도용</li>
          <li>사이트의 정상 운영을 방해하는 행위</li>
          <li>회사 또는 제3자의 권리를 침해하는 행위</li>
        </ul>
      </section>

      <section>
        <h2>제6조 (서비스 중단)</h2>
        <p>
          회사는 시스템 점검·장애 등 부득이한 사유로 서비스를 일시 중단할 수 있으며, 사전에 공지함을
          원칙으로 합니다.
        </p>
      </section>

      <section>
        <h2>제7조 (저작권)</h2>
        <p>
          사이트에 게시된 모든 콘텐츠의 저작권은 회사에 귀속됩니다. 이용자는 사전 서면 동의 없이
          이를 복제·배포할 수 없습니다.
        </p>
      </section>

      <section>
        <h2>제8조 (면책)</h2>
        <ol>
          <li>
            회사는 천재지변, 통신 장애 등 회사의 통제를 벗어난 사유로 인한 서비스 장애에 대해 책임을
            지지 않습니다.
          </li>
          <li>사이트의 상담 문의는 단순 접수이며, 견적·계약 조건은 별도 협의로 확정됩니다.</li>
        </ol>
      </section>

      <section>
        <h2>제9조 (준거법 및 관할)</h2>
        <p>
          본 약관은 대한민국 법령에 따르며, 분쟁 발생 시 회사 본점 소재지 관할 법원을 전속 관할
          법원으로 합니다.
        </p>
      </section>

      <footer className={styles.footer}>
        <p>공고일자: {COMPANY_INFOS.LEGAL_EFFECTIVE_DATE}</p>
        <p>시행일자: {COMPANY_INFOS.LEGAL_EFFECTIVE_DATE}</p>
      </footer>
    </article>
  );
}
