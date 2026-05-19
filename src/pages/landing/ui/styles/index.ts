/* eslint-disable import/order -- CSS cascade order is semantic for the landing page. */
import shellStyles from './landing-shell.module.css';
import heroStyles from './hero.module.css';
import formControlStyles from './form-controls.module.css';
import servicesStyles from './services.module.css';
import caseStoriesStyles from './case-stories.module.css';
import teamStyles from './team.module.css';
import processStyles from './process.module.css';
import reviewsStyles from './reviews.module.css';
import contactStyles from './contact.module.css';
import footerStyles from './footer.module.css';
import scrollTopStyles from './scroll-top.module.css';
import motionStyles from './landing-motion.module.css';
import responsiveStyles from './landing-responsive.module.css';

export const landingStyleAnchors = [
  shellStyles.moduleAnchor,
  heroStyles.moduleAnchor,
  formControlStyles.moduleAnchor,
  servicesStyles.moduleAnchor,
  caseStoriesStyles.moduleAnchor,
  teamStyles.moduleAnchor,
  processStyles.moduleAnchor,
  reviewsStyles.moduleAnchor,
  contactStyles.moduleAnchor,
  footerStyles.moduleAnchor,
  scrollTopStyles.moduleAnchor,
  motionStyles.moduleAnchor,
  responsiveStyles.moduleAnchor,
].join(' ');
