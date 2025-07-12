import React from 'react';

/**
 * Reusable Button Component
 * 
 * A flexible button component with multiple variants and styling options.
 * Supports different styles (primary, secondary, danger) and states.
 * 
 * @param {React.ReactNode} children - Button content
 * @param {string} type - Button type ('button', 'submit', 'reset')
 * @param {string} variant - Button style variant ('primary', 'secondary', 'danger')
 * @param {string} className - Additional CSS classes
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {boolean} disabled - Whether button is disabled
 * @param {Function} onClick - Click handler function
 * @returns {JSX.Element} Styled button element
 */
const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary',
  className = '',
  fullWidth = false,
  disabled = false,
  onClick
}) => {
  const baseClasses = 'px-4 py-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
