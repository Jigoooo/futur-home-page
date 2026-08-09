import { ArrowRight } from 'lucide-react';

import { reviews } from '../config';
import { Button } from './button';
import { cx } from './lib/cx';
import styles from './styles/reviews.module.css';
import sharedStyles from './styles/shared.module.css';

export function ReviewsSection() {
  const featured = reviews[0]!;
  const rest = reviews.slice(1);

  return (
    <section className={cx(sharedStyles.sectionBlock, sharedStyles.bgSoft, styles.reviewSection)}>
      <div className={sharedStyles.container}>
        <div
          className={cx(styles.reviewHead, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          <div>
            <span className={sharedStyles.kicker}>Review</span>
            <h2 className={sharedStyles.sectionTitle}>
              함께 일한 고객의
              <br />
              이야기.
            </h2>
          </div>
          <Button href='#contact' variant='ghost' cursorText='문의'>
            <span data-landing-label>상담 문의</span>
            <span data-landing-arrow>
              <ArrowRight size={14} strokeWidth={2.2} />
            </span>
          </Button>
        </div>
        <div
          className={cx(styles.reviewGrid, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          <article className={styles.quoteBig} aria-label='5점 만점 5점 리뷰'>
            <div className={styles.quoteMark}>“</div>
            <div className={styles.stars} aria-hidden='true'>
              ★★★★★
            </div>
            <p className={styles.quoteText}>{featured.quote}</p>
            <div className={styles.quotePerson}>
              <strong>{featured.person}</strong>
              {featured.context}
            </div>
          </article>
          <div className={styles.quoteStack}>
            {rest.map((review) => (
              <article
                key={review.person}
                className={styles.quoteSmall}
                aria-label='5점 만점 5점 리뷰'
              >
                <div className={styles.stars} aria-hidden='true'>
                  ★★★★★
                </div>
                <p className={styles.quoteText}>{review.quote}</p>
                <div className={styles.quotePerson}>
                  <strong>{review.person}</strong>
                  {review.context}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
