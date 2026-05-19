import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import type { SelectOption } from '@/types/landing';

interface CustomSelectProps {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export function CustomSelect({ label, name, value, options, onChange }: CustomSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(selectedIndex);

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
    setIsOpen(true);
  };

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
  const listboxId = `${id}-listbox`;

  return (
    <div className='form-control'>
      <span className='form-label'>{label}</span>
      <div ref={rootRef} className={`custom-select ${isOpen ? 'is-open' : ''}`}>
        <input type='hidden' name={name} value={value} />
        <button
          type='button'
          className='select-trigger'
          role='combobox'
          aria-expanded={isOpen}
          aria-haspopup='listbox'
          aria-controls={listboxId}
          aria-activedescendant={`${id}-option-${focusedIndex}`}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              return;
            }

            openSelect();
          }}
          onKeyDown={handleKeyDown}
        >
          <span className='select-value'>{selected.label}</span>
          <span className='select-arrow' aria-hidden='true'>
            <svg viewBox='0 0 20 20' fill='none'>
              <path
                d='M5.5 7.5L10 12l4.5-4.5'
                stroke='currentColor'
                strokeWidth='2.2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </span>
        </button>
        <ul id={listboxId} className='select-menu' role='listbox'>
          {options.map((option, optionIndex) => (
            <li
              key={option.value}
              id={`${id}-option-${optionIndex}`}
              className={`select-option ${focusedIndex === optionIndex ? 'is-focused' : ''}`}
              role='option'
              aria-selected={option.value === value}
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
