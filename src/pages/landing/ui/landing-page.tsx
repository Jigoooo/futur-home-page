import { useRef, useState, type KeyboardEvent } from 'react';

import { Button } from './button';
import { CustomCursor } from './custom-cursor';
import { CustomSelect } from './custom-select';
import { Icon } from './icons';
import {
  briefNeeds,
  briefStages,
  budgetOptions,
  caseStories,
  concerns,
  contactChips,
  contactServices,
  footerColumns,
  heroPoints,
  navigationItems,
  processSteps,
  projectTypeOptions,
  replyTypeOptions,
  reviews,
  services,
  teamRoles,
  timelineOptions,
} from '../model/landing-data';
import { useInViewReveal } from '../model/use-in-view-reveal';
import { setCardSpotlight } from '../model/use-pointer-spotlight';
import { COMPANY_INFOS } from '@/entities/company';
import type { CaseStoryKey } from '@/types/landing';

const phoneHref = `tel:${COMPANY_INFOS.PHONE.replaceAll('-', '')}`;
const mailHref = `mailto:${COMPANY_INFOS.EMAIL}`;

function Lines({ text }: { text: string }) {
  return text.split('\n').map((line, index, lines) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

export function LandingPage() {
  useInViewReveal();

  return (
    <>
      <CustomCursor />
      <main className='page'>
        <Header />
        <HeroSection />
        <QuickBriefSection />
        <ServicesSection />
        <CaseStoriesSection />
        <TeamSection />
        <ProcessSection />
        <ReviewsSection />
        <ContactSection />
        <Footer />
        <a className='scroll-top' href='#top' aria-label='상단으로 이동'>
          ↑
        </a>
      </main>
    </>
  );
}

function Header() {
  return (
    <header id='top' className='nav container'>
      <a href='#top' className='logo' aria-label='FUTUR home'>
        FUTUR<span>.</span>
      </a>
      <nav className='nav-menu' aria-label='주요 메뉴'>
        {navigationItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <Button href='#contact' cursorText='문의'>
        <span className='btn-label'>문의하기</span>
        <span className='btn-arrow'>→</span>
      </Button>
    </header>
  );
}

function HeroSection() {
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

function QuickBriefSection() {
  const [stage, setStage] = useState(briefStages[0].value);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(
    briefNeeds.filter((need) => need.defaultChecked).map((need) => need.value),
  );
  const [timeline, setTimeline] = useState(timelineOptions[0].value);
  const [budget, setBudget] = useState(budgetOptions[0].value);
  const [memo, setMemo] = useState('');
  const summaryTokens = [stage, ...selectedNeeds, timeline, budget].filter(Boolean).slice(0, 7);

  const toggleNeed = (value: string) => {
    setSelectedNeeds((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  return (
    <section className='brief-section container'>
      <div className='brief-wrap'>
        <div className='brief-left motion-left'>
          <span className='kicker'>Before Start</span>
          <h2 className='section-title'>
            처음 문의할 때부터
            <br />
            부담 없게.
          </h2>
          <p className='section-desc'>
            완성된 기획서가 없어도 괜찮습니다. 목표와 상황을 먼저 정리하고, 현실적인 개발 범위와
            진행 순서를 함께 잡습니다.
          </p>
          <div className='concern-list'>
            {concerns.map((concern) => (
              <article
                key={concern.index}
                className='concern-card'
                data-cursor-text={concern.cursorText}
              >
                <div className='concern-no'>{concern.index}</div>
                <div>
                  <h3>{concern.title}</h3>
                  <p>{concern.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className='brief-panel motion-right'>
          <div className='brief-title'>
            <h3>Quick Brief</h3>
            <span>선택하면 요약됩니다</span>
          </div>
          <form className='brief-form' aria-label='간단 프로젝트 브리프'>
            <div className='brief-group stage-group'>
              <div className='group-label'>
                현재 단계 <small>하나 선택</small>
              </div>
              <div className='stage-grid' role='radiogroup' aria-label='현재 프로젝트 단계'>
                {briefStages.map((item) => (
                  <label key={item.value} className='stage-choice'>
                    <input
                      type='radio'
                      name='stage'
                      value={item.value}
                      checked={stage === item.value}
                      onChange={() => setStage(item.value)}
                    />
                    <span className='stage-card'>
                      <span className='stage-index'>{item.index}</span>
                      <strong>{item.label}</strong>
                      <em>{item.description}</em>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className='brief-group need-group'>
              <div className='group-label'>
                필요한 영역 <small>복수 선택</small>
              </div>
              <div className='need-grid'>
                {briefNeeds.map((need) => (
                  <label key={need.value} className='check-tile need-tile'>
                    <input
                      type='checkbox'
                      name='briefNeeds'
                      value={need.value}
                      checked={selectedNeeds.includes(need.value)}
                      onChange={() => toggleNeed(need.value)}
                    />
                    <span className='check-ui'>
                      <span className='check-box'>
                        <Icon name='check' />
                      </span>
                      <span className='need-copy'>
                        <strong>{need.label}</strong>
                        <em>{need.description}</em>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className='brief-controls'>
              <CustomSelect
                label='예상 일정'
                name='timeline'
                value={timeline}
                options={timelineOptions}
                onChange={setTimeline}
              />
              <CustomSelect
                label='예산 범위'
                name='budget'
                value={budget}
                options={budgetOptions}
                onChange={setBudget}
              />
            </div>

            <label className='form-control'>
              <span className='form-label'>간단 메모</span>
              <input
                className='input'
                name='memo'
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder='예: 재고 관리 앱과 관리자 페이지가 필요해요'
              />
            </label>

            <div className='brief-summary' aria-live='polite'>
              {summaryTokens.map((token) => (
                <span key={token} className='summary-token'>
                  {token}
                </span>
              ))}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
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

function CaseStoriesSection() {
  const [activeKey, setActiveKey] = useState<CaseStoryKey>('system');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    caseStories.findIndex((story) => story.key === activeKey),
  );
  const activeStory = caseStories[activeIndex] || caseStories[0];

  const activateTabAt = (index: number) => {
    const nextStory = caseStories[index];
    if (!nextStory) return;

    setActiveKey(nextStory.key);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();

    if (event.key === 'ArrowRight') activateTabAt((index + 1) % caseStories.length);
    if (event.key === 'ArrowLeft')
      activateTabAt((index - 1 + caseStories.length) % caseStories.length);
    if (event.key === 'Home') activateTabAt(0);
    if (event.key === 'End') activateTabAt(caseStories.length - 1);
  };

  return (
    <section className='case-section' id='cases'>
      <div className='container'>
        <div className='case-head motion-up'>
          <div>
            <span className='kicker'>Case Stories</span>
            <h2 className='section-title'>
              결과가 보이는
              <br />
              프로젝트 이야기.
            </h2>
            <p className='section-desc'>
              업종보다 중요한 것은 업무의 흐름입니다. FUTUR는 화면, 데이터, 운영 과정을 함께
              설계합니다.
            </p>
          </div>
          <div className='tabs' role='tablist' aria-label='프로젝트 사례'>
            {caseStories.map((story, index) => (
              <button
                key={story.key}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type='button'
                className='tab'
                role='tab'
                id={`tab-${story.key}`}
                aria-controls='panel-case'
                aria-selected={story.key === activeKey}
                tabIndex={story.key === activeKey ? 0 : -1}
                onClick={() => setActiveKey(story.key)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                {story.tabLabel}
              </button>
            ))}
          </div>
        </div>
        <article
          className='case-panel motion-up'
          id='panel-case'
          role='tabpanel'
          aria-labelledby={`tab-${activeStory.key}`}
        >
          <div className='case-panel-inner'>
            <div className='case-copy'>
              <span className='case-label'>{activeStory.label}</span>
              <h3 className='case-title'>
                <Lines text={activeStory.title} />
              </h3>
              <p className='case-desc'>{activeStory.description}</p>
              <div className='case-metrics'>
                {activeStory.metrics.map((metric) => (
                  <div key={metric.label} className='metric'>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
              <ul className='case-list'>
                {activeStory.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className='case-visual' aria-hidden='true'>
              <div className='device-card'>
                <div className='device-top'>
                  <i />
                  <i />
                  <i />
                </div>
                <div className='device-row r1' />
                <div className='device-row r2' />
                <div className='device-chart'>
                  <svg viewBox='0 0 330 92' preserveAspectRatio='none'>
                    <path d='M10 66 C50 30,75 50,104 28 S158 38,188 22 S250 18,320 32' />
                  </svg>
                </div>
              </div>
              <div className='side-note'>
                <div className='note-icon'>{activeStory.icon}</div>
                <div>
                  <strong>{activeStory.noteTitle}</strong>
                  <span>{activeStory.noteDescription}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className='section container' id='team'>
      <div className='team-layout'>
        <div className='team-lead motion-left'>
          <span className='kicker'>Our Team</span>
          <h2 className='section-title'>
            프로젝트를 움직이는
            <br />
            역할들.
          </h2>
          <p className='section-desc'>
            각자의 전문 영역을 나누되, 프로젝트 목표와 사용자의 업무 흐름은 함께 이해합니다.
          </p>
        </div>
        <div className='role-grid motion-right'>
          {teamRoles.map((role) => (
            <article key={role.badge} className='role-card' data-cursor-text={role.cursorText}>
              <div className='role-top'>
                <div className='role-badge'>{role.badge}</div>
                <div className='role-meta'>
                  {role.location}
                  <br />
                  {role.experience}
                </div>
              </div>
              <h3>{role.title}</h3>
              <div className='role-job'>{role.job}</div>
              <div className='role-info'>
                <div>
                  <strong>강점</strong>
                  {role.strength}
                </div>
                <div>
                  <strong>경험</strong>
                  {role.projectExperience}
                </div>
              </div>
              <div className='tags'>
                {role.tags.map((tag) => (
                  <span key={tag} className='tag'>
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className='process-section container' id='process'>
      <div className='process-layout'>
        <div className='motion-left'>
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

function ReviewsSection() {
  const featured = reviews[0]!;
  const rest = reviews.slice(1);

  return (
    <section className='review-section container'>
      <div className='review-head motion-up'>
        <div>
          <span className='kicker'>Review</span>
          <h2 className='section-title'>
            함께 일한 고객의
            <br />
            이야기.
          </h2>
        </div>
        <Button href='#contact' variant='ghost' cursorText='문의'>
          <span className='btn-label'>상담 문의</span>
          <span className='btn-arrow'>→</span>
        </Button>
      </div>
      <div className='review-grid motion-up'>
        <article className='quote-big'>
          <div className='quote-mark'>“</div>
          <div className='stars'>★★★★★</div>
          <p className='quote-text'>{featured.quote}</p>
          <div className='quote-person'>
            <strong>{featured.person}</strong>
            {featured.context}
          </div>
        </article>
        <div className='quote-stack'>
          {rest.map((review) => (
            <article key={review.person} className='quote-small'>
              <div className='stars'>★★★★★</div>
              <p className='quote-text'>{review.quote}</p>
              <div className='quote-person'>
                <strong>{review.person}</strong>
                {review.context}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [projectType, setProjectType] = useState(projectTypeOptions[0].value);
  const [replyType, setReplyType] = useState(replyTypeOptions[0].value);
  const [result, setResult] = useState('');

  return (
    <section className='contact-section container' id='contact'>
      <div className='cta-wrap motion-up'>
        <div>
          <h2>
            새로운 프로젝트를
            <br />
            가볍게 이야기해보세요.
          </h2>
          <p>
            기획서가 없어도 괜찮습니다. 현재 상황과 만들고 싶은 결과를 알려주시면, 다음 단계를 함께
            정리하겠습니다.
          </p>
        </div>
        <div className='cta-actions'>
          <Button href={mailHref} cursorText='MAIL'>
            <span className='btn-label'>메일로 문의</span>
            <span className='btn-arrow'>→</span>
          </Button>
          <Button href={phoneHref} variant='ghost' cursorText='CALL'>
            <span className='btn-label'>전화 상담</span>
            <span className='btn-arrow'>↗</span>
          </Button>
        </div>
      </div>

      <div className='contact-layout'>
        <aside className='contact-card motion-left'>
          <h3>상담 전 확인사항</h3>
          <p>정확한 견적보다 먼저, 프로젝트의 목적과 우선순위를 맞추는 것부터 시작합니다.</p>
          {contactChips.map((chip) => (
            <div key={chip.label} className='contact-chip'>
              <Icon name={chip.icon} />
              {chip.label}
            </div>
          ))}
        </aside>

        <form
          className='contact-form motion-right'
          aria-label='프로젝트 상담 양식'
          onSubmit={(event) => {
            event.preventDefault();
            setResult('입력 내용을 확인했습니다. 실제 서비스에서는 전송 API와 연결하면 됩니다.');
          }}
        >
          <fieldset>
            <div className='form-grid'>
              <label className='form-control'>
                <span className='form-label'>회사명</span>
                <input className='input' name='company' placeholder='회사 또는 서비스명' />
              </label>
              <label className='form-control'>
                <span className='form-label'>
                  담당자명 <span className='required'>*</span>
                </span>
                <input className='input' name='name' required placeholder='성함' />
              </label>
              <label className='form-control'>
                <span className='form-label'>
                  이메일 <span className='required'>*</span>
                </span>
                <input
                  className='input'
                  name='email'
                  type='email'
                  required
                  placeholder='contact@example.com'
                />
              </label>
              <label className='form-control'>
                <span className='form-label'>연락처</span>
                <input className='input' name='phone' inputMode='tel' placeholder='010-0000-0000' />
              </label>
            </div>
          </fieldset>

          <fieldset className='full'>
            <div className='brief-group'>
              <div className='group-label'>
                필요한 서비스 <small>복수 선택</small>
              </div>
              <div className='service-checks'>
                {contactServices.map((service) => (
                  <label key={service.value} className='check-tile service-tile'>
                    <input
                      type='checkbox'
                      name='services'
                      value={service.value}
                      defaultChecked={service.defaultChecked}
                    />
                    <span className='check-ui'>
                      <span className='check-box'>
                        <Icon name='check' />
                      </span>
                      <span className='service-check-copy'>
                        <strong>{service.title}</strong>
                        <em>{service.description}</em>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <div className='form-grid'>
            <CustomSelect
              label='프로젝트 유형'
              name='projectType'
              value={projectType}
              options={projectTypeOptions}
              onChange={setProjectType}
            />
            <CustomSelect
              label='희망 답변 방식'
              name='replyType'
              value={replyType}
              options={replyTypeOptions}
              onChange={setReplyType}
            />
          </div>

          <label className='form-control full'>
            <span className='form-label'>
              문의 내용 <span className='required'>*</span>
            </span>
            <textarea
              className='textarea-input'
              name='message'
              required
              placeholder='현재 상황, 필요한 기능, 참고 서비스, 일정 등을 자유롭게 적어주세요.'
            />
            <span className='help'>
              정확하지 않아도 괜찮습니다. 확인 후 필요한 내용을 다시 질문드릴게요.
            </span>
          </label>

          <label className='consent check-tile'>
            <input type='checkbox' name='agree' required />
            <span className='check-ui'>
              <span className='check-box'>
                <Icon name='check' />
              </span>
              개인정보 수집 및 이용에 동의합니다.
            </span>
          </label>

          <div className='form-actions'>
            <div className='result' aria-live='polite'>
              {result}
            </div>
            <button type='submit' className='btn btn-blue submit-btn' data-cursor-text='SEND'>
              <span className='btn-label'>상담 신청하기</span>
              <span className='btn-arrow'>→</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className='footer'>
      <div className='container'>
        <div className='footer-top'>
          <div>
            <h2>FUTUR와 다음 프로젝트를 시작해보세요.</h2>
            <p>기술을 어렵게 보이지 않게, 필요한 결과를 명확하게 만들겠습니다.</p>
          </div>
          <div className='footer-contact'>
            <a className='footer-pill' href={mailHref}>
              <Icon name='mail' />
              {COMPANY_INFOS.EMAIL}
            </a>
            <a className='footer-pill' href={phoneHref}>
              <Icon name='phone' />
              {COMPANY_INFOS.PHONE}
            </a>
          </div>
        </div>

        <div className='footer-grid'>
          <div>
            <h3>
              FUTUR<span>.</span>
            </h3>
            <p>아이디어를 현실의 서비스로 만드는 SI·외주 개발 파트너.</p>
            <div className='socials'>
              <a className='social' href='#top' aria-label='GitHub' data-cursor-text='GitHub'>
                <Icon name='github' />
              </a>
              <a className='social' href='#top' aria-label='LinkedIn' data-cursor-text='LinkedIn'>
                <Icon name='linkedin' />
              </a>
              <a className='social' href={mailHref} aria-label='Email' data-cursor-text='Email'>
                <Icon name='mail' />
              </a>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <strong>{column.title}</strong>
              {column.links.map((link) => (
                <a key={`${column.title}-${link.label}`} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}

          <div>
            <strong>문의</strong>
            <div className='contact-item'>
              <Icon name='mail' />
              {COMPANY_INFOS.EMAIL}
            </div>
            <div className='contact-item'>
              <Icon name='phone' />
              {COMPANY_INFOS.PHONE}
            </div>
            <div className='contact-item'>
              <Icon name='map' />
              {COMPANY_INFOS.ADDRESS}
            </div>
          </div>
        </div>

        <div className='copyright'>
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
