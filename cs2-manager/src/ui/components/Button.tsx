import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string };
export function Button({ label, children, ...rest }: Props) {
  return (
    <button {...rest} className="cs2-btn">
      {label ?? children}
    </button>
  );
}
