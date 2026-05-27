import { ArrowRight, ChevronRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from './button';
import { ContactBriefFields } from './contact-brief-fields';
import { ContactIdentityFields, type ContactFieldErrors } from './contact-identity-fields';
import { Icon } from './icons';
import { LegalModal } from './legal-modal';
import { briefStages, budgetOptions, contactChips, timelineOptions } from '../config';
import { cx } from './lib/cx';
import buttonStyles from './styles/button.module.css';
import styles from './styles/contact.module.css';
import formStyles from './styles/form-controls.module.css';
import sharedStyles from './styles/shared.module.css';
import { mailHref } from '../lib/company-links';
import { COMPANY_INFOS } from '@/entities/company';
import { PrivacyContent } from '@/pages/legal/privacy';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactFieldName = keyof ContactFieldErrors;

const FIELD_ORDER: ContactFieldName[] = ['name', 'email', 'services', 'message', 'agree'];

export function ContactSection() {
  const [stage, setStage] = useState(briefStages[0]!.value);
  const [timeline, setTimeline] = useState(timelineOptions[0]!.value);
  const [budget, setBudget] = useState(budgetOptions[0]!.value);
  const [etcChecked, setEtcChecked] = useState(false);
  const [etcText, setEtcText] = useState('');
  const [result, setResult] = useState('');
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const clearFieldError = (field: ContactFieldName) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleEtcCheckedChange = (checked: boolean) => {
    setEtcChecked(checked);
    clearFieldError('services');
    if (!checked) setEtcText('');
  };

  const validate = (formEl: HTMLFormElement): ContactFieldErrors => {
    const data = new FormData(formEl);
    const next: ContactFieldErrors = {};
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const agree = data.get('agree');
    const services = data.getAll('services');

    if (!name) next.name = '담당자명을 입력해 주세요.';
    if (!email) next.email = '이메일 주소를 입력해 주세요.';
    else if (!EMAIL_PATTERN.test(email)) next.email = '이메일 주소를 정확히 입력해 주세요.';
    if (services.length === 0) next.services = '필요한 서비스를 한 개 이상 선택해 주세요.';
    if (!message) next.message = '문의 내용을 알려주세요.';
    if (!agree) next.agree = '개인정보 수집·이용 동의가 필요합니다.';
    return next;
  };

  const focusFirstError = (formEl: HTMLFormElement, nextErrors: ContactFieldErrors) => {
    const firstField = FIELD_ORDER.find((field) => nextErrors[field]);
    if (!firstField) return;
    const target = formEl.elements.namedItem(firstField);
    const el =
      target instanceof HTMLElement
        ? target
        : target instanceof RadioNodeList
          ? (target[0] as HTMLElement | undefined)
          : null;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof (el as HTMLInputElement).focus === 'function') {
      (el as HTMLInputElement).focus({ preventScroll: true });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const nextErrors = validate(formEl);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setResult('');
      focusFirstError(formEl, nextErrors);
      return;
    }
    setErrors({});
    setResult('입력 내용을 확인했습니다. 실제 서비스에서는 전송 API와 연결하면 됩니다.');
  };

  return (
    <>
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
              기획서가 없어도 괜찮습니다. 현재 상황과 만들고 싶은 결과를 알려주시면, 다음 단계를
              함께 정리하겠습니다.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Button href={mailHref} cursorText='MAIL'>
              <span data-landing-label>메일로 문의</span>
              <span data-landing-arrow>
                <ArrowRight size={14} strokeWidth={2.2} />
              </span>
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
            <div className={styles.contactCardDivider} aria-hidden='true' />
            <dl className={styles.contactCardInfo}>
              <div>
                <dt>이메일</dt>
                <dd>
                  <a href={mailHref}>{COMPANY_INFOS.EMAIL}</a>
                </dd>
              </div>
              <div>
                <dt>평균 회신</dt>
                <dd>영업일 기준 24시간 이내</dd>
              </div>
              <div>
                <dt>사무실</dt>
                <dd>{COMPANY_INFOS.ADDRESS}</dd>
              </div>
            </dl>
          </aside>

          <form
            className={cx(styles.contactForm, sharedStyles.reveal, sharedStyles.revealRight)}
            data-landing-contact-form
            data-landing-reveal='right'
            aria-label='프로젝트 상담 양식'
            noValidate
            onSubmit={handleSubmit}
          >
            <ContactBriefFields
              stage={stage}
              timeline={timeline}
              budget={budget}
              etcChecked={etcChecked}
              etcText={etcText}
              errors={errors}
              onStageChange={setStage}
              onTimelineChange={setTimeline}
              onBudgetChange={setBudget}
              onEtcCheckedChange={handleEtcCheckedChange}
              onEtcTextChange={setEtcText}
              onServicesChange={() => clearFieldError('services')}
            />

            <ContactIdentityFields errors={errors} onFieldChange={clearFieldError} />

            <label className={cx(formStyles.formControl, formStyles.full)}>
              <span className={formStyles.formLabel}>
                문의 내용 <span className={formStyles.required}>*</span>
              </span>
              <textarea
                className={cx(formStyles.textareaInput, errors.message && formStyles.invalid)}
                name='message'
                placeholder='현재 상황, 필요한 기능, 참고 서비스, 일정, 예산 범위, 걱정되는 부분 등을 자유롭게 적어주세요.'
                aria-invalid={errors.message ? 'true' : 'false'}
                aria-describedby={errors.message ? 'contact-error-message' : undefined}
                onChange={() => clearFieldError('message')}
              />
              {errors.message ? (
                <span id='contact-error-message' className={formStyles.fieldError} role='alert'>
                  {errors.message}
                </span>
              ) : (
                <span className={formStyles.help}>
                  정확하지 않아도 괜찮습니다. 확인 후 필요한 내용을 다시 질문드릴게요.
                </span>
              )}
            </label>

            <div className={styles.consentBlock}>
              <div className={styles.consentRow}>
                <label
                  className={cx(
                    formStyles.consent,
                    formStyles.checkTile,
                    errors.agree && formStyles.invalid,
                  )}
                  data-landing-interactive='check-tile'
                >
                  <input
                    type='checkbox'
                    name='agree'
                    aria-invalid={errors.agree ? 'true' : 'false'}
                    aria-describedby={errors.agree ? 'contact-error-agree' : undefined}
                    onChange={() => clearFieldError('agree')}
                  />
                  <span className={formStyles.checkUi} data-landing-surface>
                    <span className={formStyles.checkBox}>
                      <Icon name='check' />
                    </span>
                    개인정보 수집·이용에 동의합니다.
                  </span>
                </label>
                <button
                  type='button'
                  className={styles.consentLink}
                  onClick={() => setPrivacyOpen(true)}
                  aria-label='개인정보 처리방침 자세히 보기'
                >
                  자세히 보기
                  <ChevronRight size={14} strokeWidth={2.4} aria-hidden='true' />
                </button>
              </div>
              <ul className={styles.consentNotice} aria-label='개인정보 수집·이용 고지'>
                <li>
                  <strong>목적</strong>
                  <span>프로젝트 상담 문의 접수 및 회신</span>
                </li>
                <li>
                  <strong>항목</strong>
                  <span>담당자명, 이메일, (선택) 회사명, 문의 내용 등</span>
                </li>
                <li>
                  <strong>보유 기간</strong>
                  <span>상담 종료 후 1년</span>
                </li>
                <li>
                  <strong>거부권</strong>
                  <span>거부 가능 · 거부 시 상담 응대가 어려울 수 있음</span>
                </li>
              </ul>
              {errors.agree ? (
                <span id='contact-error-agree' className={formStyles.fieldError} role='alert'>
                  {errors.agree}
                </span>
              ) : null}
            </div>

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
                <span data-landing-arrow>
                  <ArrowRight size={14} strokeWidth={2.2} />
                </span>
              </button>
            </div>
          </form>
        </div>
      </section>
      <LegalModal
        open={privacyOpen}
        title='개인정보 처리방침'
        onClose={() => setPrivacyOpen(false)}
      >
        <PrivacyContent />
      </LegalModal>
    </>
  );
}
