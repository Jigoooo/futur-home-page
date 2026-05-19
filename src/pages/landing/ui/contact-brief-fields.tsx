import {
  briefStages,
  budgetOptions,
  contactServices,
  replyTypeOptions,
  timelineOptions,
} from '../config';
import { CustomSelect } from './custom-select';
import { Icon } from './icons';

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
    <fieldset className='form-section'>
      <div className='form-section-head'>
        <span className='kicker'>Project Brief</span>
        <h3>상담 전에 필요한 내용을 가볍게 정리합니다.</h3>
      </div>

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
                onChange={() => onStageChange(item.value)}
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

      <div className='form-grid'>
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
