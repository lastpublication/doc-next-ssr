import React from 'react';

/**
 * A reusable button component with various styles and sizes
 * @example
 * <Button variant="primary" size="lg" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 */

interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Click event handler */
  onClick?: () => void;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick 
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}