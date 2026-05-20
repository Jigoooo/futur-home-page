import {
  briefStages,
  budgetOptions,
  contactServices,
  replyTypeOptions,
  timelineOptions,
} from '../config';
import { CustomSelect } from './custom-select';
import { Icon } from './icons';
import { cx } from './lib/cx';
import formStyles from './styles/form-controls.module.css';
import sharedStyles from './styles/shared.module.css';

interface ContactBriefFieldsProps {
  stage: string;
  timeline: string;
  budget: string;
  replyType: string;
  onStageChange: (value: string) => void;
  onTimelineChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onReplyTypeChange: (value: string) => void;
}

export function ContactBriefFields({
  stage,
  timeline,
  budget,
  replyType,
  onStageChange,
  onTimelineChange,
  onBudgetChange,
  onReplyTypeChange,
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
          필요한 서비스 <small>복수 선택</small>
        </div>
        <div className={formStyles.serviceChecks}>
          {contactServices.map((service) => (
            <label
              key={service.value}
              className={cx(formStyles.checkTile, formStyles.serviceTile)}
              data-landing-interactive='check-tile'
            >
              <input
                type='checkbox'
                name='services'
                value={service.value}
                defaultChecked={service.defaultChecked}
              />
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
        </div>
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
        <CustomSelect
          label='희망 답변 방식'
          name='replyType'
          value={replyType}
          options={replyTypeOptions}
          onChange={onReplyTypeChange}
        />
      </div>
    </fieldset>
  );
}
