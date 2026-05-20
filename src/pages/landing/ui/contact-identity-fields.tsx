import formStyles from './styles/form-controls.module.css';

export function ContactIdentityFields() {
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
          <input className={formStyles.input} name='name' required placeholder='성함' />
        </label>
        <label className={formStyles.formControl}>
          <span className={formStyles.formLabel}>
            이메일 <span className={formStyles.required}>*</span>
          </span>
          <input
            className={formStyles.input}
            name='email'
            type='email'
            required
            placeholder='contact@example.com'
          />
        </label>
        <label className={formStyles.formControl}>
          <span className={formStyles.formLabel}>연락처</span>
          <input
            className={formStyles.input}
            name='phone'
            inputMode='tel'
            placeholder='010-0000-0000'
          />
        </label>
      </div>
    </fieldset>
  );
}
