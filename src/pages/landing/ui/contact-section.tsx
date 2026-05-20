import { useState } from 'react';

import { Button } from './button';
import { ContactBriefFields } from './contact-brief-fields';
import { ContactIdentityFields } from './contact-identity-fields';
import { Icon } from './icons';
import {
  briefStages,
  budgetOptions,
  contactChips,
  replyTypeOptions,
  timelineOptions,
} from '../config';
import { cx } from './lib/cx';
import buttonStyles from './styles/button.module.css';
import styles from './styles/contact.module.css';
import formStyles from './styles/form-controls.module.css';
import sharedStyles from './styles/shared.module.css';
import { mailHref, phoneHref } from '../lib/company-links';

export function ContactSection() {
  const [stage, setStage] = useState(briefStages[0].value);
  const [timeline, setTimeline] = useState(timelineOptions[0].value);
  const [budget, setBudget] = useState(budgetOptions[0].value);
  const [replyType, setReplyType] = useState(replyTypeOptions[0].value);
  const [result, setResult] = useState('');

  return (
    <section className={cx(styles.contactSection, sharedStyles.container)} id='contact'>
      <div
        className={cx(styles.ctaWrap, sharedStyles.reveal, sharedStyles.revealUp)}
        data-landing-reveal='up'
      >
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
        <div className={styles.ctaActions}>
          <Button href={mailHref} cursorText='MAIL'>
            <span data-landing-label>메일로 문의</span>
            <span data-landing-arrow>→</span>
          </Button>
          <Button href={phoneHref} variant='ghost' cursorText='CALL'>
            <span data-landing-label>전화 상담</span>
            <span data-landing-arrow>↗</span>
          </Button>
        </div>
      </div>

      <div className={cx(styles.contactLayout, sharedStyles.gridLayout)}>
        <aside
          className={cx(
            styles.contactCard,
            sharedStyles.stickyLead,
            sharedStyles.reveal,
            sharedStyles.revealLeft,
          )}
          data-landing-reveal='left'
        >
          <h3>상담 전 확인사항</h3>
          <p>정확한 견적보다 먼저, 프로젝트의 목적과 우선순위를 맞추는 것부터 시작합니다.</p>
          {contactChips.map((chip) => (
            <div key={chip.label} className={styles.contactChip}>
              <Icon name={chip.icon} />
              {chip.label}
            </div>
          ))}
        </aside>

        <form
          className={cx(styles.contactForm, sharedStyles.reveal, sharedStyles.revealRight)}
          data-landing-contact-form
          data-landing-reveal='right'
          aria-label='프로젝트 상담 양식'
          onSubmit={(event) => {
            event.preventDefault();
            setResult('입력 내용을 확인했습니다. 실제 서비스에서는 전송 API와 연결하면 됩니다.');
          }}
        >
          <ContactBriefFields
            stage={stage}
            timeline={timeline}
            budget={budget}
            replyType={replyType}
            onStageChange={setStage}
            onTimelineChange={setTimeline}
            onBudgetChange={setBudget}
            onReplyTypeChange={setReplyType}
          />

          <ContactIdentityFields />

          <label className={cx(formStyles.formControl, formStyles.full)}>
            <span className={formStyles.formLabel}>
              문의 내용 <span className={formStyles.required}>*</span>
            </span>
            <textarea
              className={formStyles.textareaInput}
              name='message'
              required
              placeholder='현재 상황, 필요한 기능, 참고 서비스, 일정, 예산 범위, 걱정되는 부분 등을 자유롭게 적어주세요.'
            />
            <span className={formStyles.help}>
              정확하지 않아도 괜찮습니다. 확인 후 필요한 내용을 다시 질문드릴게요.
            </span>
          </label>

          <label
            className={cx(formStyles.consent, formStyles.checkTile)}
            data-landing-interactive='check-tile'
          >
            <input type='checkbox' name='agree' required />
            <span className={formStyles.checkUi} data-landing-surface>
              <span className={formStyles.checkBox}>
                <Icon name='check' />
              </span>
              개인정보 수집 및 이용에 동의합니다.
            </span>
          </label>

          <div className={styles.formActions}>
            <div className={styles.result} aria-live='polite'>
              {result}
            </div>
            <button
              type='submit'
              className={cx(buttonStyles.button, buttonStyles.blue, styles.submitButton)}
              data-landing-interactive='button'
              data-landing-spotlight='button'
              data-cursor-text='SEND'
            >
              <span data-landing-label>상담 신청하기</span>
              <span data-landing-arrow>→</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
