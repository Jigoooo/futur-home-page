import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import type { SelectOption } from '../model/types';
import { cx } from './lib/cx';
import styles from './styles/form-controls.module.css';

interface CustomSelectProps {
  label: string;
  name: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
}

function updateSelectPlacement(
  trigger: HTMLButtonElement | null,
  menu: HTMLUListElement | null,
  setPlacement: (placement: 'down' | 'up') => void,
) {
  if (!trigger || !menu) return;

  const triggerRect = trigger.getBoundingClientRect();
  const menuHeight = menu.getBoundingClientRect().height;
  const gap = 12;
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;

  setPlacement(spaceBelow < menuHeight + gap && spaceAbove > spaceBelow ? 'up' : 'down');
}

export function CustomSelect({ label, name, value, options, onChange }: CustomSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(selectedIndex);
  const [placement, setPlacement] = useState<'down' | 'up'>('down');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const selectOption = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const openSelect = () => {
    setFocusedIndex(selectedIndex);
    updateSelectPlacement(triggerRef.current, menuRef.current, setPlacement);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    let frame = 0;
    const schedulePlacement = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        updateSelectPlacement(triggerRef.current, menuRef.current, setPlacement);
      });
    };

    window.addEventListener('resize', schedulePlacement);
    window.addEventListener('scroll', schedulePlacement, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedulePlacement);
      window.removeEventListener('scroll', schedulePlacement, true);
    };
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Escape', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (!isOpen) {
      openSelect();
      return;
    }

    if (event.key === 'ArrowDown') {
      setFocusedIndex((current) => (current + 1) % options.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      setFocusedIndex((current) => (current - 1 + options.length) % options.length);
      return;
    }

    if (event.key === 'Home') {
      setFocusedIndex(0);
      return;
    }

    if (event.key === 'End') {
      setFocusedIndex(options.length - 1);
      return;
    }

    const nextOption = options[focusedIndex] ?? options[0];
    if (nextOption) selectOption(nextOption);
  };

  const selected = options[selectedIndex] || options[0];
  if (!selected) return null;
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const listboxId = `${id}-listbox`;

  return (
    <div className={styles.formControl}>
      <span id={labelId} className={styles.formLabel}>
        {label}
      </span>
      <div
        ref={rootRef}
        className={cx(
          styles.customSelect,
          isOpen && styles.isOpen,
          placement === 'up' && styles.isUp,
        )}
        data-landing-cursor-soft
      >
        <input type='hidden' name={name} value={value} />
        <button
          ref={triggerRef}
          type='button'
          className={styles.selectTrigger}
          data-landing-interactive='control'
          role='combobox'
          aria-haspopup='listbox'
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-activedescendant={isOpen ? `${id}-option-${focusedIndex}` : undefined}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              return;
            }

            openSelect();
          }}
          onKeyDown={handleKeyDown}
        >
          <span id={valueId} className={styles.selectValue}>
            {selected.label}
          </span>
          <span className={styles.selectArrow} aria-hidden='true'>
            <ChevronDown strokeWidth={2.2} />
          </span>
        </button>
        <ul
          ref={menuRef}
          id={listboxId}
          className={styles.selectMenu}
          role='listbox'
          aria-labelledby={labelId}
        >
          {options.map((option, optionIndex) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- combobox 패턴: 키보드 처리는 trigger 버튼의 handleKeyDown이 담당, 옵션은 tabIndex=-1로 포커스 받지 않음
            <li
              key={option.value}
              id={`${id}-option-${optionIndex}`}
              className={cx(styles.selectOption, focusedIndex === optionIndex && styles.isFocused)}
              data-landing-interactive='control'
              data-landing-select-option
              role='option'
              aria-selected={option.value === value ? 'true' : 'false'}
              tabIndex={-1}
              onClick={() => selectOption(option)}
              onPointerEnter={() => setFocusedIndex(optionIndex)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
