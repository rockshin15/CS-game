import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

// Definimos que o botão aceita todas as props normais de HTML + variant
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

// Note o "export const Button" (Exportação nomeada)
export const Button = ({ variant = 'primary', className, children, ...props }: ButtonProps) => {
  
  const baseStyles = "px-4 py-2 rounded font-bold transition-colors shadow-sm";
  
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white",
    secondary: "bg-gray-600 hover:bg-gray-500 text-white",
    danger: "bg-red-600 hover:bg-red-500 text-white",
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};