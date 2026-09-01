import type { ReactNode } from "react";

type IconName = "bell" | "check" | "chevronDown" | "close" | "plus" | "sparkle" | "sales" | "orders" | "users" | "clock";

const paths: Record<IconName, ReactNode> = {
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  sparkle: <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />,
  sales: <path d="M4 19V9m5 10V5m5 14v-8m5 8V3" />,
  orders: <><rect x="4" y="6" width="16" height="14" rx="2" /><path d="M8 6V4h8v2m-8 5h8m-8 4h5" /></>,
  users: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></>,
};

export default function AdminIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg className="ui-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
