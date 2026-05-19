import { reviews } from '../config';
import { Button } from './button';

export function ReviewsSection() {
  const featured = reviews[0]!;
  const rest = reviews.slice(1);

  return (
    <section className='review-section container'>
      <div className='review-head motion-up'>
        <div>
          <span className='kicker'>Review</span>
          <h2 className='section-title'>
            함께 일한 고객의
            <br />
            이야기.
          </h2>
        </div>
        <Button href='#contact' variant='ghost' cursorText='문의'>
          <span className='btn-label'>상담 문의</span>
          <span className='btn-arrow'>→</span>
        </Button>
      </div>
      <div className='review-grid motion-up'>
        <article className='quote-big'>
          <div className='quote-mark'>“</div>
          <div className='stars'>★★★★★</div>
          <p className='quote-text'>{featured.quote}</p>
          <div className='quote-person'>
            <strong>{featured.person}</strong>
            {featured.context}
          </div>
        </article>
        <div className='quote-stack'>
          {rest.map((review) => (
            <article key={review.person} className='quote-small'>
              <div className='stars'>★★★★★</div>
              <p className='quote-text'>{review.quote}</p>
              <div className='quote-person'>
                <strong>{review.person}</strong>
                {review.context}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
