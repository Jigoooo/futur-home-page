# FUTUR Service Hover and Footer Signature Design

## Status

Approved for implementation. This design extends the current image-free capability gallery with a restrained tactile hover system and replaces the plain Footer information area with a branded signature field.

Once implemented, this document supersedes only the following parts of `2026-08-14-capability-gallery-design.md`:

- the rule that service cards have no hover ornament
- the current Footer lower information layout

The service content, asymmetric card arrangement, Technology, FAQ, Header, Hero, legal routes and inquiry CTA contract remain unchanged.

## Goals

- Give the four service cards a tactile response without making them look clickable.
- Preserve the current borderless, image-free and evidence-based service presentation.
- Make the Footer feel like an intentional closing scene without adding unsupported customers, projects, statistics, social channels or navigation.
- Reuse the existing GSAP and reveal systems without adding a motion dependency.
- Keep touch, reduced-motion and no-JavaScript experiences static and fully readable.

## Non-goals

- No images, video, SVG decoration, WebGL, texture assets or generated artwork.
- No 3D tilt, rotation, wobble, glare border, glow border or shared active-card selector.
- No hidden service information, click action, card link, pointer cursor or keyboard focus target.
- No infinite Footer pulse, marquee, parallax, cinematic curtain or pinned scroll scene.
- No change to service copy, company facts, inquiry destination or legal information.

## 1. Service Cards: Lifted Ink Surface

### Structure

The existing service `<article>` remains the semantic and reveal owner. Hover transforms must not be applied to it because its current entrance animation already uses `transform`.

Each article gains one inner motion surface and one decorative lens:

- `data-service-card`: article, existing reveal owner
- `data-service-card-surface`: inner surface, hover translation and scale owner
- `data-service-card-lens`: decorative pointer-following color field, `aria-hidden="true"`

The existing number, title, description and scope list stay inside the motion surface and remain visible at all times.

### Visual behavior

The card keeps its current base color, radius and borderless appearance.

On a real fine-pointer hover:

- the inner surface moves to `translateY(-7px)`
- the inner surface scales to `1.006`
- a pre-rendered `0 28px 70px rgba(11, 23, 52, 0.12)` diffuse shadow layer fades in instead of animating `box-shadow` every frame
- a soft radial ink lens becomes visible around the pointer
- the lens radius is `clamp(220px, 24vw, 340px)`
- the lens uses one fixed translucent color for each existing surface: ice `rgba(92, 145, 255, 0.2)`, sand `rgba(255, 180, 105, 0.18)`, mint `rgba(70, 190, 145, 0.16)`, periwinkle `rgba(128, 116, 255, 0.18)`
- text and scope rows do not move independently

The hover enters in `320ms` with `power3.out`. On leave, the surface returns over `480ms` with `back.out(1.35)` to provide a small follow-through without a visible bounce. Lens opacity fades out in `180ms`.

The card must never rotate, skew or exceed `scale(1.006)`. Only one hovered card responds because each card owns its own local motion state.

### Pointer tracking

Add a scoped hook:

```ts
useServiceCardHoverMotion(sectionRef: RefObject<HTMLElement | null>): void
```

The hook:

- activates only for `(hover: hover) and (pointer: fine)` and no reduced motion
- listens to pointer enter, move, leave and cancel within the Services section
- initializes the lens at the actual entry position to avoid jumping from the center
- uses `gsap.quickTo()` for the lens X and Y CSS variables
- uses GSAP transforms only on `data-service-card-surface`
- interrupts and redirects active tweens when the pointer re-enters during the return motion
- removes listeners, kills tweens and clears temporary inline transforms on cleanup

The hook does not add `tabIndex`, roles, links, click handlers or hidden content. Because the articles are informational rather than controls, keyboard users receive the same complete content without a simulated interactive state.

### Fallbacks

- Coarse pointer and touch: static card, no lens and no lift.
- `prefers-reduced-motion: reduce`: static card, no lens, lift, scale or shadow transition.
- No JavaScript: current card colors and content remain visible; the lens remains hidden.
- Unsupported masking or CSS-variable animation: the card may still lift, but content and layout remain unaffected.

## 2. Footer: Signature Lens

### Information architecture

The inquiry heading, description and existing magnetic/liquid `문의하기` button remain unchanged.

The lower Footer becomes an editorial information rail followed by a full-width signature field:

1. Service statement and contact details
2. Legal links and business/legal metadata
3. Oversized `FUTUR.` signature

The small duplicated `FUTUR.` heading in the current two-column grid is removed. The existing service statement remains as plain supporting copy. Email, address, privacy policy, terms, copyright, representative, registration data, mail-order registration and privacy officer details all remain available.

Use exactly two horizontal hairlines in the lower Footer:

- one above the information rail
- one between the information rail and legal metadata

### Signature structure

Add a decorative signature field at the bottom of the Footer:

- `data-footer-signature`: clipped signature wrapper, `aria-hidden="true"`
- `data-footer-signature-base`: low-contrast solid `FUTUR.` wordmark
- `data-footer-signature-lens`: matching wordmark with pointer-revealed color

The signature is decorative because the brand is already present elsewhere in the page and legal copy. It must not be announced twice by assistive technology.

Desktop sizing uses `clamp(112px, 18vw, 260px)` with a compact line-height so the wordmark fills the bottom width and is intentionally clipped at the lower edge. Mobile uses `clamp(72px, 26vw, 124px)` and remains on one line without horizontal overflow.

The base wordmark uses `rgba(255, 255, 255, 0.07)`. It has no outline, glow, gradient border or continuous pulse.

### Reveal and pointer response

The signature uses the existing one-time landing reveal observer. On first entry:

- the wrapper reveals from bottom to top with `clip-path: inset(0 0 100% 0) → inset(0)`
- the wordmark translates from `18px` below to its final position
- opacity reaches its final value over `700ms`
- the animation never resets when the user scrolls away and back

On a real fine-pointer hover over the signature field, the matching overlay becomes visible only around the pointer. A `clamp(180px, 22vw, 320px)` radial mask reveals a `#315cff` to `rgba(255, 255, 255, 0.92)` fill inside the letter shapes. The color must not spill outside the glyphs or create an outer glow.

Add a scoped hook:

```ts
useFooterSignatureMotion(footerRef: RefObject<HTMLElement | null>): void
```

The hook:

- activates only for `(hover: hover) and (pointer: fine)` and no reduced motion
- updates signature lens coordinates with `gsap.quickTo()`
- fades the overlay in on pointer enter and out on pointer leave or cancel
- does not translate, scale, rotate or magnetize the wordmark
- removes listeners, kills tweens and clears temporary inline styles on cleanup

This creates a responsive material effect without making the decorative wordmark appear clickable.

### Responsive and fallback behavior

- Desktop: supporting statement and contact details use an asymmetric two-column rail; legal metadata uses one compact flex row with `flex-wrap: wrap` so long legal text wraps without creating horizontal overflow.
- Tablet and mobile: all real information stacks in reading order before the signature.
- Coarse pointer and touch: show the static low-contrast wordmark without the pointer lens.
- `prefers-reduced-motion: reduce`: show the final static wordmark immediately and remove the pointer lens.
- No JavaScript: show the final static wordmark and all Footer information.
- The current mailto CTA, focus ring, magnetic button boundary and Header dark-surface contract remain unchanged.

## 3. Component Boundaries

Implementation is limited to the following responsibilities:

- `ServicesSection`: owns the Services ref and renders the hover surface/lens DOM.
- `use-service-card-hover-motion.ts`: owns service pointer motion only.
- `FooterSection`: owns the Footer ref, information rail and signature DOM.
- `use-footer-signature-motion.ts`: owns signature pointer motion only.
- `services.module.css`: owns card lift layers, lens colors and responsive fallbacks.
- `footer.module.css`: owns the information rail, signature typography, mask and responsive fallbacks.

Do not expand the shared button or global landing interaction hook unless implementation proves a shared primitive is required. The service and signature effects have different semantics from buttons, so keeping them scoped avoids turning informational surfaces into generic interactive controls.

## 4. State and Failure Handling

There is no product data state and no user-submitted state in this change. Motion state is ephemeral and local to the relevant section.

- Missing section, card surface, lens or signature nodes cause the hooks to no-op.
- Pointer cancellation follows the same cleanup path as pointer leave.
- Rapid enter/leave reverses from the current transform and opacity rather than queueing animations.
- Route unmount, hot reload and media-query changes kill active tweens and clear temporary styles.
- A motion or masking failure cannot hide real content or legal information.

## 5. Accessibility and Interaction Contract

- Service cards remain semantic articles, not buttons or links.
- No new focus stops are introduced.
- No information is available only on hover.
- Footer signature is decorative and `aria-hidden`.
- CTA, email and legal links retain keyboard focus indicators and current destinations.
- Text contrast is measured against the base card colors, not the transient lens.
- Motion does not run for reduced-motion users.
- Touch users never receive a stuck hover state.

## 6. Verification Contract

Add a dedicated Playwright regression file for the service and Footer motion rather than overloading unrelated FAQ or Technology tests.

### Services

- Four service cards and all existing copy remain present.
- Every card contains one motion surface and one decorative lens.
- Fine-pointer hover moves the surface between `-5.5px` and `-8.5px` on Y and scales it between `1.003` and `1.009`.
- No rotation, skew, pointer cursor, link, button, `tabIndex`, image or SVG is introduced.
- Lens coordinates change as the pointer moves and return motion finishes without residual inline transforms.
- Rapid enter, leave and re-enter ends in the correct active state.
- Coarse pointer and reduced motion keep cards static.

### Footer

- Inquiry CTA text, mailto destination and existing magnetic/liquid layers remain unchanged.
- Current small duplicated Footer logo is absent.
- The supporting statement, contact details, legal links and all business/legal data remain visible.
- Exactly one decorative signature exists and is hidden from assistive technology.
- Signature reveal runs once; scrolling away and back does not reset it.
- Fine-pointer movement changes the lens position without moving the wordmark.
- Touch and reduced-motion modes show a static signature without the pointer lens.

### Responsive and regression

- Verify `1280×900`, `900×844` and `390×844` with no horizontal overflow.
- Verify no-JavaScript content and Footer information.
- Run the dedicated motion test, landing runtime-error test, capability gallery regression, accessibility suites, full E2E, lint and build.
- Confirm Services and Footer visually in the Codex in-app browser after implementation.
- Run `graphify update .` after implementation.

## References

- [Aceternity UI Wobble Card](https://ui.aceternity.com/components/wobble-card): translate and scale response on pointer movement, reduced here to a single restrained lift.
- [React Bits Spotlight Card](https://reactbits.dev/components/spotlight-card) and [Aceternity Card Spotlight](https://ui.aceternity.com/components/card-spotlight): pointer-localized surface response, adapted without borders or glow.
- [Aceternity Footer With Big Text](https://ui.aceternity.com/blocks/footers/footer-with-big-text): oversized brand signature as the closing visual anchor.
- [Aceternity Text Hover Effect](https://ui.aceternity.com/components/text-hover-effect): pointer-revealed typography, adapted to a low-contrast solid wordmark without an outline effect.
- [Motion hover guidance](https://motion.dev/docs/react-hover-animation): hover must not become stuck on touch devices.
- [GSAP `quickTo()`](https://gsap.com/docs/v3/GSAP/gsap.quickTo%28%29/): optimized redirection of frequently updated pointer-driven numeric values.
