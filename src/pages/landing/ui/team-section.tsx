import { teamRoles } from '../config';

export function TeamSection() {
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
