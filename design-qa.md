# FUTUR Capability Gallery Design QA

## Comparison Target

- Source visual truth: `/Users/kimjigoooo/.codex/generated_images/019ff475-0153-78a0-9cba-d75a3678efad/exec-c8c2654f-7d0f-4df0-b131-a9059df7963e.png`
- Browser-rendered implementation: `http://127.0.0.1:3000/`
- Service screenshot: `/tmp/futur-services-final.png`
- Technology screenshot: `/tmp/futur-technology-continuous-marquee.png`
- Full-page implementation screenshot: `/tmp/futur-capability-full.png`
- Combined focused comparison: `/tmp/futur-section-comparison-final.png`
- Service anchor post-fix evidence: `/tmp/futur-service-anchor-postfix.png`

## Viewport and Normalization

- Source: `875 × 1797px`, generated long-form design direction.
- Implementation viewport: `1280 × 720 CSS px`, screenshot `1280 × 720px`, density `1x`.
- Full implementation: `1280 × 7248px`.
- The source is a condensed concept rather than a one-to-one browser viewport. For focused comparison, the Services and Technology source regions were cropped, proportionally scaled to `720px` height, and centered on a `1280 × 720px` canvas. The implementation captures stayed unscaled. The two pairs were placed side by side in `/tmp/futur-section-comparison.png`.
- State: Services top, Technology top, and direct `#service-system` anchor. Header is hydrated and reveal animations have settled. The source mock contains service imagery, but the user's later explicit direction to remove all imagery is the authoritative visual override.

## Full-view Comparison Evidence

The source and full implementation keep the same overall hierarchy: light asymmetric Services, near-black unboxed Technology, then a dark Footer with a blue inquiry CTA. The live page is intentionally longer because it preserves readable Korean copy, the existing Hero, FAQ, legal information, and the complete technology disclosure. Service imagery is intentionally omitted by the latest user direction.

## Focused Region Comparison Evidence

- Services: both source and implementation use a two-column intro and an asymmetric four-card bento. The implementation retains the low-saturation ice, sand, mint, and periwinkle surfaces without border or shadow, then uses only typography and whitespace after the user removed imagery.
- Technology: both use a near-black editorial surface, hairline row separation, compact capability explanations, and technology names that pass through the viewport edge. The implementation caps the names at `52px` after the user requested a smaller scale and uses a slow, continuous marquee without sticky cards or page-scroll coupling.
- Footer CTA: the implementation uses an opaque cobalt surface and centers the single `문의하기` label. Magnetic movement and liquid fill remain independent of label alignment.
- Direct service anchors: the revised capture shows the selected card title fully below the fixed Header.

## Required Fidelity Surfaces

- Fonts and typography: SUIT Variable is used for Korean copy and Space Grotesk Variable for Hero display, logo, service numbers, and large technology names. Weight, line-height, and wrapping preserve the source hierarchy without the prior extra-heavy presentation styling.
- Spacing and layout rhythm: the Services intro is shorter than one viewport, wide and half cards form a deliberate bento, and Technology rows use open full-width rhythm rather than stacked panels. `1180px`, `900px`, and `390px` checks show no horizontal overflow.
- Colors and visual tokens: warm off-white, charcoal, navy, cobalt, and four muted service surfaces match the selected direction. There are no decorative gradients, card borders, or sheet shadows.
- Image quality and asset fidelity: the final Services section intentionally renders no image, picture, SVG, icon, placeholder, or CSS illustration. The removed generated WebP files are no longer shipped.
- Copy and content: the four services, AI integration boundary, technology groups, FAQ, company name, and legal information remain factual. No customer work, project imagery, or performance evidence is implied.
- Accessibility and behavior: the native technology disclosure remains keyboard accessible; service and technology number labels meet WCAG AA contrast; reduced motion removes card and marquee transforms; no-JS exposes all primary content; the operating-system pointer is retained; Footer focus and liquid states do not displace the label.

## Findings

No actionable P0, P1, or P2 differences remain.

## Comparison History

1. Initial focused browser pass found a P2 anchor-offset issue: opening `#service-system` placed its heading under the fixed Header.
2. Fix: added `scroll-margin-top: 112px` to service cards.
3. Post-fix evidence: `/tmp/futur-service-anchor-postfix.png` shows the card number and heading below the Header with clear breathing room.
4. User review then removed service imagery and requested smaller technology names. The four generated WebP assets and their data fields were removed; the cards were recomposed as typographic bento surfaces; technology names were reduced from about `100px` at `1280px` to about `43px`, with a hard desktop maximum of `52px`.
5. Post-fix evidence: `/tmp/futur-section-comparison-final.png` shows the image-free service composition and reduced technology scale side by side with the selected direction.
6. The final accessibility pass found insufficient contrast on the service-card and technology-row numbers. Their ink colors were strengthened and all eight WCAG 2.2 AA scans passed on rerun.
7. Revised comparison found no remaining P0/P1/P2 mismatch.
8. User review found that the scroll-driven technology track stopped when page scrolling stopped and remained static at intermediate tablet widths. The track now loops at a constant speed at `1280px`, `900px`, and `390px`, alternates direction by row, pauses on hover or focus, and remains static for reduced motion.

## Primary Interactions and Runtime Check

- Tested native Technology disclosure open/close and verified all 16 groups and 70 technologies.
- Tested continuous marquee progress without page scroll at desktop, tablet, and mobile widths, plus hover pause and reduced-motion fallback.
- Tested Footer magnetic movement, liquid fill surface, centered label, and reduced-motion fallback.
- Tested service and technology hash navigation, Header light/dark surface switching, and responsive overflow.
- In-app browser console contained Vite connection and React development messages only; no error or warning entries were present.

## Open Questions

- None blocking. The selected source is a direction board rather than an exact full-page viewport, so its compressed page length is not treated as a one-to-one spacing requirement.

## Implementation Checklist

- [x] Four image-free editorial service cards without sticky index or curtain.
- [x] Unboxed kinetic technology index with static responsive fallback.
- [x] Solid, optically centered Footer CTA.
- [x] Native pointer with no custom cursor DOM or global cursor suppression.
- [x] Direct anchors, reduced motion, no-JS, and responsive overflow checks.

## Follow-up Polish

- No P3 item is required for the current approved scope.

final result: passed
