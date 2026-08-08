import { cx } from './lib/cx';
import formStyles from './styles/form-controls.module.css';

export type ContactFieldErrors = Partial<
  Record<
    | 'name'
    | 'company'
    | 'email'
    | 'message'
    | 'collectionConsent'
    | 'overseasTransferConsent'
    | 'services'
    | 'otherService',
    string
  >
>;

interface ContactIdentityFieldsProps {
  errors: ContactFieldErrors;
  onFieldChange: (field: 'name' | 'company' | 'email') => void;
}

export function ContactIdentityFields({ errors, onFieldChange }: ContactIdentityFieldsProps) {
  return (
    <fieldset className={formStyles.formSection}>
      <div className={formStyles.formGrid}>
        <label className={formStyles.formControl}>
          <span className={formStyles.formLabel}>회사명</span>
          <input
            className={cx(formStyles.input, errors.company && formStyles.invalid)}
            name='company'
            placeholder='회사 또는 서비스명'
            autoComplete='organization'
            maxLength={100}
            aria-invalid={errors.company ? 'true' : 'false'}
            aria-describedby={errors.company ? 'contact-error-company' : undefined}
            onChange={() => onFieldChange('company')}
          />
          {errors.company ? (
            <span id='contact-error-company' className={formStyles.fieldError} role='alert'>
              {errors.company}
            </span>
          ) : null}
        </label>
        <label className={formStyles.formControl}>
          <span className={formStyles.formLabel}>
            담당자명 <span className={formStyles.required}>*</span>
          </span>
          <input
            className={cx(formStyles.input, errors.name && formStyles.invalid)}
            name='name'
            placeholder='성함'
            autoComplete='name'
            maxLength={50}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'contact-error-name' : undefined}
            onChange={() => onFieldChange('name')}
          />
          {errors.name ? (
            <span id='contact-error-name' className={formStyles.fieldError} role='alert'>
              {errors.name}
            </span>
          ) : null}
        </label>
        <label className={formStyles.formControl}>
          <span className={formStyles.formLabel}>
            이메일 <span className={formStyles.required}>*</span>
          </span>
          <input
            className={cx(formStyles.input, errors.email && formStyles.invalid)}
            name='email'
            type='email'
            placeholder='contact@example.com'
            autoComplete='email'
            maxLength={254}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'contact-error-email' : undefined}
            onChange={() => onFieldChange('email')}
          />
          {errors.email ? (
            <span id='contact-error-email' className={formStyles.fieldError} role='alert'>
              {errors.email}
            </span>
          ) : null}
        </label>
      </div>
    </fieldset>
  );
}
