import React, { useState, useEffect } from 'react';

interface SmartNumericInputProps {
  value: number;
  onChange: (val: number) => void;
  decimals?: number;
  className?: string;
  placeholder?: string;
  title?: string;
  min?: number;
  align?: 'left' | 'center' | 'right';
  readOnly?: boolean;
}

export const SmartNumericInput: React.FC<SmartNumericInputProps> = ({
  value,
  onChange,
  decimals = 0,
  className = '',
  placeholder = '',
  title,
  align = 'left',
  readOnly = false
}) => {
  const [strVal, setStrVal] = useState<string | null>(null);

  // Synchronize when external value changes and user is not actively typing
  useEffect(() => {
    if (strVal === null) return;
    const currentNum = parseFloat(strVal.replace(',', '.'));
    if (!isNaN(currentNum) && Math.abs(currentNum - value) > 0.0001) {
      setStrVal(null);
    }
  }, [value]);

  const formatExternal = (val: number): string => {
    if (val === 0 && placeholder) return '';
    if (decimals > 0) {
      return val.toFixed(decimals).replace('.', ',');
    }
    return String(val);
  };

  const displayVal = strVal !== null ? strVal : formatExternal(value);

  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <input
      type="text"
      inputMode="decimal"
      readOnly={readOnly}
      title={title}
      placeholder={placeholder}
      value={displayVal}
      onFocus={(e) => {
        // "Dès que je touche les cases changeables, ils doivent rester vides sans 0 et 1 que je trouve"
        const currentStr = strVal !== null ? strVal : formatExternal(value);
        const trimmed = currentStr.trim();
        const numVal = parseFloat(trimmed.replace(',', '.'));

        if (
          trimmed === '0' ||
          trimmed === '1' ||
          trimmed === '0,0' ||
          trimmed === '0,00' ||
          trimmed === '0,000' ||
          trimmed === '1,0' ||
          trimmed === '1,00' ||
          trimmed === '1,000' ||
          numVal === 0 ||
          numVal === 1
        ) {
          setStrVal('');
        } else {
          e.currentTarget.select();
        }
      }}
      onChange={(e) => {
        // Point and comma are considered as comma ("Point et virgule sont consideres comme virgule")
        const text = e.target.value.replace('.', ',');

        // If the user clears the input completely, keep it empty without forcing 0 or 1
        if (text === '' || text === '-') {
          setStrVal(text);
          onChange(0);
          return;
        }

        // Validate valid numeric format with optional comma
        if (/^-?\d*,?\d*$/.test(text)) {
          setStrVal(text);
          const parsed = parseFloat(text.replace(',', '.'));
          if (!isNaN(parsed)) {
            onChange(parsed);
          }
        }
      }}
      onBlur={() => {
        // On blur, format cleanly
        if (strVal === '' || strVal === null) {
          setStrVal(null);
          return;
        }
        const parsed = parseFloat(strVal.replace(',', '.'));
        if (isNaN(parsed) || parsed === 0) {
          setStrVal(null);
          onChange(0);
        } else {
          setStrVal(null);
        }
      }}
      className={`${alignClass} ${className}`}
    />
  );
};
