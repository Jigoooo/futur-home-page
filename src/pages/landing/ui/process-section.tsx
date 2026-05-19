import { processSteps } from '../config';

export function ProcessSection() {
  return (
    <section className='process-section container' id='process'>
      <div className='process-layout'>
        <div className='process-lead motion-left'>
          <span className='kicker'>Process</span>
          <h2 className='section-title'>
            가볍게 시작하고,
            <br />
            명확하게 진행합니다.
          </h2>
          <p className='section-desc'>
            처음부터 모든 것을 확정하기보다, 필요한 범위를 정리하고 우선순위에 따라 단계적으로
            진행합니다.
          </p>
        </div>
        <div className='timeline motion-right'>
          {processSteps.map((step) => (
            <div key={step.index} className='step'>
              <div className='step-no'>{step.index}</div>
              <div className='step-card'>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
