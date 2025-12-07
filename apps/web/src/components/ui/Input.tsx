import React, { useId } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  id,
  className = '',
  required,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hasError = !!error;

  return (
    <div className={`input-group ${fullWidth ? 'input-group--full-width' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${hasError ? 'input--error' : ''} ${className}`}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        required={required}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="input-error" role="alert">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={`${inputId}-helper`} className="input-helper">
          {helperText}
        </span>
      )}
    </div>
  );
};

