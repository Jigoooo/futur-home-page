import { heroPoints } from '../config';
import { Button } from './button';

function FloatingCard({
  className,
  badge,
  title,
  description,
}: {
  className: string;
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className={`float-card ${className}`} aria-hidden='true'>
      <div className='ico'>{badge}</div>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className='hero container'>
      <div className='hero-grid'>
        <div className='hero-copy'>
          <div className='eyebrow'>SI · 웹/앱/업무 시스템 개발</div>
          <h1>
            아이디어를 현실의 서비스로,
            <br />
            복잡한 업무를
            <br />
            <span className='accent'>쉬운 흐름으로.</span>
          </h1>
          <p>
            FUTUR는 기획서가 완성되지 않은 단계부터 함께 정리하고, 웹·앱·업무 시스템을 운영 가능한
            형태로 만듭니다.
          </p>
          <div className='hero-actions'>
            <Button href='#contact' cursorText='START'>
              <span className='btn-label'>프로젝트 문의하기</span>
              <span className='btn-arrow'>→</span>
            </Button>
            <Button href='#cases' variant='ghost' cursorText='VIEW'>
              <span className='btn-label'>사례 둘러보기</span>
              <span className='btn-arrow'>↓</span>
            </Button>
          </div>
          <div className='hero-points'>
            {heroPoints.map((point) => (
              <div key={point.title} className='point'>
                <strong>{point.title}</strong>
                <span>{point.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className='hero-visual'>
          <div className='visual-orbit' aria-hidden='true' />
          <div className='visual-orbit two' aria-hidden='true' />
          <div className='bubble b1' aria-hidden='true' />
          <div className='bubble b2' aria-hidden='true' />
          <div className='bubble b3' aria-hidden='true' />
          <div className='bubble b4' aria-hidden='true' />
          <FloatingCard className='f1' badge='UX' title='흐름 정리' description='화면·업무 구조' />
          <FloatingCard className='f2' badge='API' title='연동 설계' description='인증·데이터' />
          <FloatingCard className='f3' badge='APP' title='현장 앱' description='모바일 업무' />
          <FloatingCard className='f4' badge='OPS' title='운영 지원' description='배포·개선' />
          <div className='hero-panel'>
            <img
              className='hero-product-image'
              src='/landing/hero-product-preview.png'
              alt='업무 대시보드, 현장 모바일 앱, API 연동 흐름을 함께 보여주는 FUTUR 서비스 화면 예시'
            />
            <div className='hero-preview-caption' aria-hidden='true'>
              <span>Product Preview</span>
              <strong>업무 흐름을 한 화면으로 연결</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
