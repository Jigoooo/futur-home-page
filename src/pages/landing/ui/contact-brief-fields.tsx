import { briefStages, budgetOptions, contactServices, timelineOptions } from '../config';
import type { ContactFieldErrors } from './contact-identity-fields';
import { CustomSelect } from './custom-select';
import { Icon } from './icons';
import { cx } from './lib/cx';
import formStyles from './styles/form-controls.module.css';
import sharedStyles from './styles/shared.module.css';

interface ContactBriefFieldsProps {
  stage: string;
  timeline: string;
  budget: string;
  etcChecked: boolean;
  etcText: string;
  errors: ContactFieldErrors;
  onStageChange: (value: string) => void;
  onTimelineChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onEtcCheckedChange: (checked: boolean) => void;
  onEtcTextChange: (value: string) => void;
  onServicesChange: () => void;
}

export function ContactBriefFields({
  stage,
  timeline,
  budget,
  etcChecked,
  etcText,
  errors,
  onStageChange,
  onTimelineChange,
  onBudgetChange,
  onEtcCheckedChange,
  onEtcTextChange,
  onServicesChange,
}: ContactBriefFieldsProps) {
  return (
    <fieldset className={formStyles.formSection}>
      <div className={formStyles.formSectionHead}>
        <span className={sharedStyles.kicker}>Project Brief</span>
        <h3>상담 전에 필요한 내용을 가볍게 정리합니다.</h3>
      </div>

      <div className={formStyles.briefGroup}>
        <div className={formStyles.groupLabel}>
          현재 단계 <small>하나 선택</small>
        </div>
        <div className={formStyles.stageGrid} role='radiogroup' aria-label='현재 프로젝트 단계'>
          {briefStages.map((item) => (
            <label
              key={item.value}
              className={formStyles.stageChoice}
              data-landing-interactive='stage-choice'
            >
              <input
                type='radio'
                name='stage'
                value={item.value}
                checked={stage === item.value}
                onChange={() => onStageChange(item.value)}
              />
              <span className={formStyles.stageCard} data-landing-surface>
                <span className={formStyles.stageIndex}>{item.index}</span>
                <strong>{item.label}</strong>
                <em>{item.description}</em>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className={formStyles.briefGroup}>
        <div className={formStyles.groupLabel}>
          <span>
            필요한 서비스 <span className={formStyles.required}>*</span>
          </span>
          <small>하나 이상 선택</small>
        </div>
        <div className={formStyles.serviceChecks} onChange={onServicesChange}>
          {contactServices.map((service) => (
            <label
              key={service.value}
              className={cx(
                formStyles.checkTile,
                formStyles.serviceTile,
                errors.services && formStyles.invalid,
              )}
              data-landing-interactive='check-tile'
            >
              <input type='checkbox' name='services' value={service.value} />
              <span className={formStyles.checkUi} data-landing-surface>
                <span className={formStyles.checkBox}>
                  <Icon name='check' />
                </span>
                <span className={formStyles.serviceCheckCopy}>
                  <strong>{service.title}</strong>
                  <em>{service.description}</em>
                </span>
              </span>
            </label>
          ))}
          <label
            className={cx(
              formStyles.checkTile,
              formStyles.serviceTile,
              errors.services && formStyles.invalid,
            )}
            data-landing-interactive='check-tile'
          >
            <input
              type='checkbox'
              name='services'
              value='기타'
              checked={etcChecked}
              onChange={(event) => onEtcCheckedChange(event.currentTarget.checked)}
            />
            <span className={formStyles.checkUi} data-landing-surface>
              <span className={formStyles.checkBox}>
                <Icon name='check' />
              </span>
              <span className={formStyles.serviceCheckCopy}>
                <strong>기타</strong>
                <em>직접 입력</em>
              </span>
            </span>
          </label>
        </div>
        {errors.services ? (
          <span id='contact-error-services' className={formStyles.fieldError} role='alert'>
            {errors.services}
          </span>
        ) : null}
        {etcChecked ? (
          <input
            className={formStyles.input}
            name='etcText'
            value={etcText}
            onChange={(event) => onEtcTextChange(event.currentTarget.value)}
            placeholder='기타 항목을 직접 입력해 주세요.'
            aria-label='기타 서비스 직접 입력'
          />
        ) : null}
      </div>

      <div className={formStyles.formGrid}>
        <CustomSelect
          label='예상 일정'
          name='timeline'
          value={timeline}
          options={timelineOptions}
          onChange={onTimelineChange}
        />
        <CustomSelect
          label='예산 범위'
          name='budget'
          value={budget}
          options={budgetOptions}
          onChange={onBudgetChange}
        />
      </div>
    </fieldset>
  );
}
