# FUTUR Project Records Design

## Summary

Replace the current abstract case-story section with 4 anonymized project records: web platform, mobile app, business system, and integration automation. Each record uses a product-screen-centered WebP visual and explains the problem, execution approach, and result without exposing customer names or sensitive data.

## Design

- Keep the existing tabbed section pattern and position in the landing page.
- Use `Project Records` copy to make the section feel like real shipped work, not generic capability marketing.
- Show one active record at a time with title, description, factual metrics, process bullets, deliverable/stack tags, and image.
- Treat images as content, not decoration, with descriptive alt text.

## Asset Policy

- Preferred path: generate four product-screen visuals with OpenAI `gpt-image-2`.
- Final asset format: WebP under `public/landing/project-records/`.
- If live generation is blocked by credentials or network, use deterministic WebP fallback assets that match the same product-screen direction and can later be replaced without code changes.

## Verification

- Lint and build must pass.
- Browser verification should cover desktop and mobile rendering, tab changes, and image visibility.
