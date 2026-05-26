import { cx } from './lib/cx';
import formStyles from './styles/form-controls.module.css';

export type ContactFieldErrors = Partial<
  Record<'name' | 'email' | 'message' | 'agree' | 'services', string>
>;

interface ContactIdentityFieldsProps {
  errors: ContactFieldErrors;
  onFieldChange: (field: 'name' | 'email') => void;
}

export function ContactIdentityFields({ errors, onFieldChange }: ContactIdentityFieldsProps) {
  return (
    <fieldset className={formStyles.formSection}>
      <div className={formStyles.formGrid}>
        <label className={formStyles.formControl}>
          <span className={formStyles.formLabel}>회사명</span>
          <input className={formStyles.input} name='company' placeholder='회사 또는 서비스명' />
        </label>
        <label className={formStyles.formControl}>
          <span className={formStyles.formLabel}>
            담당자명 <span className={formStyles.required}>*</span>
          </span>
          <input
            className={cx(formStyles.input, errors.name && formStyles.invalid)}
            name='name'
            placeholder='성함'
            aria-invalid={Boolean(errors.name)}
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
            aria-invalid={Boolean(errors.email)}
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
