import { COMPANY_INFOS } from '@/entities/company';

export function RootNotFound() {
  return (
    <main className='not-found-page'>
      <section className='not-found-panel' aria-labelledby='not-found-title'>
        <span className='not-found-eyebrow'>404 Not Found</span>
        <h1 id='not-found-title' className='not-found-title'>
          요청한 페이지를 찾을 수 없습니다
        </h1>
        <p className='not-found-description'>
          주소가 바뀌었거나 더 이상 제공하지 않는 페이지입니다. 홈으로 돌아가거나 프로젝트 상담이
          필요하면 바로 문의해 주세요.
        </p>
        <div className='not-found-actions'>
          <a className='not-found-primary-link' href='/'>
            홈으로 돌아가기
          </a>
          <a className='not-found-secondary-link' href={`mailto:${COMPANY_INFOS.EMAIL}`}>
            문의하기
          </a>
        </div>
      </section>
    </main>
  );
}
