import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 3h12l-4 8 4 8H6l4-8z" fill="hsl(var(--primary))" />
    <path d="M12 3v18" stroke="hsl(var(--primary-foreground))" strokeWidth={1.5} />
  </svg>
);

export default Logo;
