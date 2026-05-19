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
    <div className={`float-card ${className}`}>
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

        <div className='hero-visual' aria-hidden='true'>
          <div className='visual-orbit' />
          <div className='visual-orbit two' />
          <div className='bubble b1' />
          <div className='bubble b2' />
          <div className='bubble b3' />
          <div className='bubble b4' />
          <FloatingCard className='f1' badge='UX' title='흐름 정리' description='화면·업무 구조' />
          <FloatingCard className='f2' badge='API' title='연동 설계' description='인증·데이터' />
          <FloatingCard className='f3' badge='APP' title='현장 앱' description='모바일 업무' />
          <FloatingCard className='f4' badge='OPS' title='운영 지원' description='배포·개선' />
          <div className='hero-panel'>
            <div className='panel-dots'>
              <i />
              <i />
              <i />
            </div>
            <div className='panel-label'>Project Brief</div>
            <div className='panel-title'>
              복잡한 요구사항을
              <br />
              작동하는 서비스로.
            </div>
            <div className='skeleton s1' />
            <div className='skeleton s2' />
            <div className='skeleton s3' />
            <div className='mini-chart'>
              <svg viewBox='0 0 140 56'>
                <path d='M4 42 C22 25, 33 31, 47 19 S77 30, 91 17 S115 13, 136 8' />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
