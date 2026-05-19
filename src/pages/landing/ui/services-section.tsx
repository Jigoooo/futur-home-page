import { services } from '../config';
import { Icon } from './icons';
import { setCardSpotlight } from '../lib/pointer-spotlight';

export function ServicesSection() {
  return (
    <section className='section container' id='services'>
      <div className='service-layout'>
        <div className='motion-left'>
          <span className='kicker'>Our Services</span>
          <h2 className='section-title'>
            <span className='nowrap'>비즈니스에 필요한</span>
            <br />
            개발 과정을
            <br className='desktop-break' /> 한 흐름으로.
          </h2>
          <p className='section-desc'>
            화면만 만드는 것이 아니라, 사용 방식·데이터·운영까지 연결해 실제로 굴러가는 서비스를
            만듭니다.
          </p>
        </div>
        <div className='service-list motion-right'>
          {services.map((service) => (
            <article
              key={service.title}
              className='service-card'
              data-card
              data-cursor-text={service.cursorText}
              onPointerMove={setCardSpotlight}
            >
              <div className='service-icon'>
                <Icon name={service.icon} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a className='card-link' href='#contact'>
                자세히 보기 <i>→</i>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
