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
      <rect width="18" height="18" x="3" y="3" rx="4" />
      <path d="M15.5 12a3.5 3.5 0 0 1-3.5 3.5v-7a3.5 3.5 0 0 1 3.5 3.5z" />
      <path d="M8.5 12H12" />
    </svg>
  );
}
