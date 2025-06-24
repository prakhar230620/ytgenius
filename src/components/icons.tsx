import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.48 4.5a2.5 2.5 0 0 0-5 0V6.22a8.91 8.91 0 0 0 5 0V4.5Z" />
      <path d="M17.52 7.5a2.5 2.5 0 0 0-5 0V9h5Z" />
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      <path d="M12 12v6" />
      <path d="m9.5 7.5-.42-1.05" />
      <path d="M14.5 7.5.92-1.05" />
      <path d="M12 18h.01" />
    </svg>
  );
}
