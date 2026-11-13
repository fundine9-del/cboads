"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Posts" },
  { href: "/dashboard/new", label: "New Post" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/marquee", label: "Marquee" },
  { href: "/dashboard/change-password", label: "Change Password" },
];

export default function AdminHeader({
  signOut,
}: {
  signOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-[#af9e73]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <h1 className="text-base sm:text-lg font-bold text-[#010101]">
          Compassion Ministry CBO — Admin
        </h1>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm text-[#010101]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-[#9a3f2c] ${
                pathname === link.href ? "text-[#9a3f2c] font-semibold" : "text-[#010101]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <form action={signOut}>
            <button type="submit" className="text-[#010101] hover:text-red-600">
              Sign Out
            </button>
          </form>
        </nav>

        {/* Hamburger button (small screens) */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-[#010101] hover:bg-[#fffce6] focus:outline-none focus:ring-2 focus:ring-[#9a3f2c]"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav
          id="admin-mobile-nav"
          className="md:hidden border-t border-[#af9e73] bg-white px-6 py-4"
        >
          <div className="flex flex-col gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`hover:text-[#9a3f2c] ${
                  pathname === link.href ? "text-[#9a3f2c] font-semibold" : "text-[#010101]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <form action={signOut}>
              <button
                type="submit"
                className="text-left text-[#010101] hover:text-red-600"
              >
                Sign Out
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
}
