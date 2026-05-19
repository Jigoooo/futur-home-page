export function ContactIdentityFields() {
  return (
    <fieldset className='form-section'>
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
  );
}
