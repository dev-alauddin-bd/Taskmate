"use client";

import { useRouter, usePathname } from "next/navigation";

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname(); // e.g. /en/dashboard

  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments[0] ?? "en";
  const rest = segments.slice(1).join("/");

  const switchLocale = (newLocale: string) => {
    const newPath = `/${newLocale}/${rest}`;
    router.replace(newPath);
  };

  return (
    <select
      className="input text-sm py-1 px-2 h-auto"
      value={currentLocale}
      onChange={(e) => switchLocale(e.target.value)}
    >
      <option value="en">English</option>
      <option value="bn">বাংলা</option>
    </select>
  );
}
