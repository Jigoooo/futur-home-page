import type { CSSProperties, ElementType } from 'react';

import styles from './styles/editorial-text-reveal.module.css';

export type EditorialTextRevealProps = {
  as: 'h1' | 'h2';
  lines: readonly string[];
  split: 'words' | 'lines';
  trigger: 'load' | 'in-view';
  className?: string;
  accessibleLabel: string;
  lineAttribute?: 'data-hero-headline-row';
};

type IndexedStyle = CSSProperties & {
  '--editorial-index': number;
  '--editorial-line-index'?: number;
  '--editorial-word-index'?: number;
};

export function EditorialTextReveal({
  as,
  lines,
  split,
  trigger,
  className,
  accessibleLabel,
  lineAttribute,
}: EditorialTextRevealProps) {
  const Heading = as as ElementType;
  let unitIndex = 0;

  return (
    <Heading
      className={className}
      aria-label={accessibleLabel}
      data-editorial-text
      data-editorial-trigger={trigger}
      {...(trigger === 'in-view' ? { 'data-landing-reveal': 'editorial' } : {})}
    >
      <span className={styles.visual} aria-hidden='true'>
        {lines.map((line, lineIndex) => {
          const words = line.split(/\s+/);
          const lineStyle = {
            '--editorial-index': lineIndex,
            '--editorial-line-index': lineIndex,
          } as IndexedStyle;

          return (
            <span
              className={styles.line}
              data-editorial-line={lineIndex}
              {...(lineAttribute ? { [lineAttribute]: true } : {})}
              key={`${lineIndex}-${line}`}
            >
              <span className={styles.lineCopy} data-editorial-line-copy>
                {split === 'lines' ? (
                  <span className={styles.unit} data-editorial-unit style={lineStyle}>
                    {line}
                  </span>
                ) : (
                  words.map((word, wordIndex) => {
                    const index = unitIndex;
                    unitIndex += 1;

                    return (
                      <span
                        className={styles.word}
                        data-editorial-word
                        data-editorial-word-index={wordIndex}
                        data-editorial-word-end={
                          wordIndex === words.length - 1 ? 'true' : undefined
                        }
                        key={`${lineIndex}-${wordIndex}-${word}`}
                        style={
                          {
                            '--editorial-index': index,
                            '--editorial-line-index': lineIndex,
                            '--editorial-word-index': wordIndex,
                          } as IndexedStyle
                        }
                      >
                        {word}
                      </span>
                    );
                  })
                )}
              </span>
            </span>
          );
        })}
      </span>
    </Heading>
  );
}
