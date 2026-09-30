"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors } from "@/lib/design-tokens";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "COMMAND", href: "/command" },
  { label: "INCIDENTS", href: "/incidents" },
  { label: "RESOURCES", href: "/resources" },
  { label: "RESPONDER", href: "/responder" },
  { label: "CITIZEN PORTAL", href: "/citizen-portal" },
  { label: "SIMULATOR", href: "/simulate" },
];

export default function Navbar() {
  const pathname = usePathname();
  // ── All state declarations FIRST ─────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Determine active item dynamically based on current route
  const isItemActive = (href: string): boolean => {
    if (!pathname) return false;
    if (href === "/command") {
      return (
        pathname === "/" ||
        pathname === "/command" ||
        pathname.startsWith("/command/")
      );
    }
    if (href === "/citizen-portal") {
      return (
        pathname === "/citizen-portal" ||
        pathname.startsWith("/citizen-portal/") ||
        pathname === "/report" ||
        pathname.startsWith("/report/")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      style={{
        background: colors.washiCard,
        borderBottom: `2.5px solid ${colors.ink}`,
        width: "100%",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "0 16px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          boxSizing: "border-box",
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Link
            href="/command"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
                fontWeight: 900,
                color: colors.ink,
                letterSpacing: "0.08em",
                lineHeight: 1,
              }}
            >
              AEGISFLOW
            </span>
          </Link>
          <span
            style={{
              display: "none",
              border: `1.5px solid ${colors.vermilion}`,
              color: colors.vermilion,
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "1px 5px",
              letterSpacing: "0.08em",
            }}
            className="sm:inline-block"
          >
            COMMAND GRID
          </span>
        </div>

        {/* Desktop Navigation Links (lg+) */}
        <nav
          aria-label="Global Navigation"
          className="hidden lg:flex"
          style={{
            alignItems: "center",
            gap: 6,
            flexWrap: "nowrap",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  padding: "6px 12px",
                  background: active ? colors.vermilion : colors.washiMuted,
                  color: active ? "#FAF4E8" : colors.ink,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: active ? `2px 2px 0 ${colors.ink}` : "none",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "background 140ms ease, box-shadow 100ms ease",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Tablet Navigation — scrollable (md to lg) */}
        <nav
          aria-label="Tablet Navigation"
          className="hidden md:flex lg:hidden"
          style={{
            alignItems: "center",
            gap: 4,
            overflowX: "auto",
            maxWidth: "calc(100vw - 220px)",
            paddingBottom: 2,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  padding: "5px 8px",
                  background: active ? colors.vermilion : colors.washiMuted,
                  color: active ? "#FAF4E8" : colors.ink,
                  border: `1.5px solid ${colors.ink}`,
                  boxShadow: active ? `2px 2px 0 ${colors.ink}` : "none",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button (< md) */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            style={{
              background: mobileMenuOpen ? colors.vermilion : colors.washiMuted,
              color: mobileMenuOpen ? "#FAF4E8" : colors.ink,
              border: `2px solid ${colors.ink}`,
              boxShadow: `2px 2px 0 ${colors.ink}`,
              width: 40,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              fontSize: "1.2rem",
              lineHeight: 1,
            }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          role="dialog"
          aria-label="Mobile Navigation"
          className="md:hidden"
          style={{
            background: colors.washiCard,
            borderTop: `2px solid ${colors.ink}`,
            borderBottom: `3px solid ${colors.ink}`,
            padding: "12px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            boxShadow: `0 8px 16px rgba(13, 13, 21, 0.15)`,
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              color: colors.vermilion,
              letterSpacing: "0.1em",
              borderBottom: `1px solid ${colors.ink}`,
              paddingBottom: 4,
              marginBottom: 4,
            }}
          >
            AEGISFLOW DISASTER RESPONSE MODULES
          </div>

          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  padding: "12px 14px",
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: active ? colors.vermilion : colors.washiMuted,
                  color: active ? "#FAF4E8" : colors.ink,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: active ? `3px 3px 0 ${colors.ink}` : `1px 1px 0 ${colors.ink}`,
                  textDecoration: "none",
                  transition: "background 100ms ease",
                }}
              >
                <span>{item.label}</span>
                {active && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: colors.ink,
                      color: colors.washiCard,
                      padding: "2px 6px",
                      letterSpacing: "0.08em",
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
