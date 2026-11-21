"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/app/(app)/nav";

export function AppNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex gap-1.5">
        {NAV.map((item) => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition ${
                  active ? "bg-sage-700 text-white" : "text-ink-muted hover:bg-sage-50 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
