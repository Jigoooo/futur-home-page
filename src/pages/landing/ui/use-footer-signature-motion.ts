import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { type RefObject } from 'react';

gsap.registerPlugin(useGSAP);

export function useFooterSignatureMotion(footerRef: RefObject<HTMLElement | null>): void {
  useGSAP(
    (_, contextSafe) => {
      const footer = footerRef.current;
      const signature = footer?.querySelector<HTMLElement>('[data-footer-signature]');
      const lens = signature?.querySelector<HTMLElement>('[data-footer-signature-lens]');
      if (!footer || !signature || !lens || !contextSafe) return undefined;

      const media = gsap.matchMedia(footer);
      media.add(
        {
          finePointer: '(hover: hover) and (pointer: fine)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const conditions = context.conditions as
            | { finePointer?: boolean; reduceMotion?: boolean }
            | undefined;
          if (!conditions?.finePointer || conditions.reduceMotion) return undefined;

          const moveX = gsap.quickTo(signature, '--footer-signature-x', {
            duration: 0.16,
            ease: 'power3.out',
          });
          const moveY = gsap.quickTo(signature, '--footer-signature-y', {
            duration: 0.16,
            ease: 'power3.out',
          });
          const writePointer = (event: PointerEvent, immediate = false) => {
            const rect = signature.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            if (immediate) {
              gsap.set(signature, { '--footer-signature-x': x, '--footer-signature-y': y });
              return;
            }
            moveX(x);
            moveY(y);
          };
          const enter = contextSafe((event: PointerEvent) => {
            writePointer(event, true);
            gsap.to(lens, {
              opacity: 1,
              duration: 0.2,
              ease: 'power2.out',
              overwrite: true,
            });
          });
          const move = contextSafe((event: PointerEvent) => writePointer(event));
          const leave = contextSafe(() => {
            gsap.to(lens, {
              opacity: 0,
              duration: 0.18,
              ease: 'power2.out',
              overwrite: true,
            });
          });

          signature.addEventListener('pointerenter', enter);
          signature.addEventListener('pointermove', move);
          signature.addEventListener('pointerleave', leave);
          signature.addEventListener('pointercancel', leave);

          return () => {
            signature.removeEventListener('pointerenter', enter);
            signature.removeEventListener('pointermove', move);
            signature.removeEventListener('pointerleave', leave);
            signature.removeEventListener('pointercancel', leave);
            moveX.tween.kill();
            moveY.tween.kill();
            gsap.killTweensOf(lens);
            gsap.set(lens, { clearProps: 'opacity' });
            signature.style.removeProperty('--footer-signature-x');
            signature.style.removeProperty('--footer-signature-y');
          };
        },
      );

      return () => media.revert();
    },
    { scope: footerRef },
  );
}
