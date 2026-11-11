import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  DollarSign,
  FileText,
  GraduationCap,
  House,
  KeyRound,
  LayoutGrid,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Receipt,
  RefreshCw,
  Sun,
  TrendingUp,
  X,
  XCircle,
  Clock3,
  Settings,
} from "lucide-react";
import { Logo } from "./ui/Logo";
import ProfileImageModal from "./ui/ProfileImageModal";
import { getExtensionUrl } from "../utils/extensionApi";
import { usePreferencesStore } from "../stores/preferencesStore";
import { sidebarLinksSchema } from "../stores/preferencesSchemas";
import { readLocalJson } from "../utils/jsonStorage";
import { getPendingUpdates } from "../utils/academicSnapshot";
import { useProfileImage } from "../hooks/useProfileImage";

const LINK_GROUPS = {
  Home: "Overview",
  "Course Registration": "Academics",
  Attendance: "Academics",
  Marks: "Academics",
  "Marks PLO Report": "Academics",
  Transcript: "Academics",
  "Tentative Study Plan": "Academics",
  "Grade Report": "Academics",
  "Fee Challan": "Finance",
  "Fee Details": "Finance",
  "Course Feedback": "Services",
  "Retake Exam Request": "Services",
  "Course Withdraw": "Services",
  "Grade Change Request": "Services",
};

const GROUP_ORDER = ["Overview", "Academics", "Finance", "Services", "More"];
const ICONS = {
  Home: House,
  "Course Registration": BookOpen,
  Attendance: CalendarDays,
  Marks: Award,
  "Marks PLO Report": BarChart3,
  Transcript: FileText,
  "Fee Challan": Receipt,
  "Fee Details": DollarSign,
  "Course Feedback": MessageSquare,
  "Retake Exam Request": Clock3,
  "Course Withdraw": XCircle,
  "Grade Change Request": RefreshCw,
  "Tentative Study Plan": ListChecks,
  "Grade Report": GraduationCap,
  "Change Password": KeyRound,
};

const DEFAULT_ICON = FileText;

function readCachedSidebarLinks() {
  const links = readLocalJson("superflex-sidebar-links", [], sidebarLinksSchema);
  return links
    .flatMap((link) => {
      try {
        const url = new URL(link.href, window.location.origin);
        if (url.origin !== window.location.origin || !url.pathname.startsWith("/")) return [];
        return [{ href: url.href, text: String(link.text).trim(), path: url.pathname }];
      } catch {
        return [];
      }
    })
    .filter((link) => link.text && link.text !== "Grade Report");
}

function readSidebarLinks() {
  if (typeof document === "undefined") return readCachedSidebarLinks();
  const menuElements = document.querySelectorAll<HTMLAnchorElement>(".m-menu__link");
  const source = menuElements.length
    ? Array.from(menuElements)
    : Array.from(document.querySelectorAll<HTMLAnchorElement>(".m-aside-left-menu a"));
  const links = source.flatMap((element) => {
    try {
      if (!element.href || element.href.includes("javascript:void")) return [];
      const url = new URL(element.href, window.location.origin);
      return [
        {
          href: element.href,
          text:
            element.querySelector<HTMLElement>(".m-menu__link-text")?.textContent?.trim() ||
            element.textContent.trim(),
          path: url.pathname,
        },
      ];
    } catch (error) {
      console.warn("SuperFlex skipped an invalid portal navigation link.", error);
      return [];
    }
  });

  const filteredLinks = links.filter((link) => link.text && link.text !== "Grade Report");
  const availableLinks = filteredLinks.length ? filteredLinks : readCachedSidebarLinks();
  const sidebarLinks = availableLinks.length
    ? availableLinks
    : [
        { href: `${window.location.origin}/`, text: "Home", path: "/" },
        {
          href: `${window.location.origin}/Student/CourseRegistrationBS`,
          text: "Course Registration",
          path: "/Student/CourseRegistrationBS",
        },
      ];
  return sidebarLinks;
}

function SidebarLink({ link, active, onNavigate, compact = false, hasUpdate = false }) {
  const Icon = ICONS[link.text.trim()] || DEFAULT_ICON;

  return (
    <button
      type="button"
      onClick={() => onNavigate(link.href, link.action)}
      aria-current={active ? "page" : undefined}
      className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors sm:gap-3 sm:rounded-full sm:px-3.5 sm:py-2.5 sm:text-[13px] ${
        active
          ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"
          : "text-white/90 hover:bg-white/15 hover:text-white dark:text-white/90 dark:hover:bg-white/10 dark:hover:text-white"
      } ${compact ? "justify-center px-2" : ""}`}
      title={compact ? (hasUpdate ? `${link.text} (New updates)` : link.text) : undefined}
    >
      <div className="relative shrink-0">
        <Icon size={16} strokeWidth={2} className="sm:h-[17px] sm:w-[17px]" />
        {hasUpdate && compact && (
          <span className="absolute -top-1.5 -right-1.5 flex p-0.5">
            <span
              className={`h-2 w-2 rounded-full bg-white animate-pulse ring-2 ring-white/40 ${
                active ? "dark:bg-[#0a192f] dark:ring-[#0a192f]/40" : ""
              }`}
            />
          </span>
        )}
      </div>
      {!compact && (
        <span className="flex items-center gap-2 min-w-0">
          <span className="truncate">{link.text}</span>
          {hasUpdate && (
            <span className="flex shrink-0 items-center justify-center p-0.5">
              <span
                className={`h-2 w-2 rounded-full bg-white animate-pulse ring-2 ring-white/40 ${
                  active ? "dark:bg-[#0a192f] dark:ring-[#0a192f]/40" : ""
                }`}
                title="New updates available"
              />
            </span>
          )}
        </span>
      )}
    </button>
  );
}

interface NavBarProps {
  currentPage?: string;
  onAttendanceLinkFound?: (href: string) => void;
  onLinksFound?: (links: ReturnType<typeof readSidebarLinks>) => void;
}

function NavBar({ currentPage = "", onAttendanceLinkFound, onLinksFound }: NavBarProps) {
  const [menuLinks] = useState(readSidebarLinks);
  const profileImage = useProfileImage();
  const [userName] = useState(() =>
    typeof document !== "undefined"
      ? document.querySelector<HTMLElement>(".m-card-user__name")?.textContent?.trim() ||
        "Student Account"
      : "Student Account",
  );
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const setThemeMode = usePreferencesStore((state) => state.setThemeMode);
  const [pendingUpdates, setPendingUpdates] = useState(null);

  useEffect(() => {
    let active = true;
    const handleUpdates = async () => {
      const updates = await getPendingUpdates();
      if (active) setPendingUpdates(updates);
    };
    handleUpdates();
    window.addEventListener("superflex-academic-updates-detected", handleUpdates);
    window.addEventListener("superflex-academic-updates-cleared", handleUpdates);
    window.addEventListener("superflex-student-identity-changed", handleUpdates);
    return () => {
      active = false;
      window.removeEventListener("superflex-academic-updates-detected", handleUpdates);
      window.removeEventListener("superflex-academic-updates-cleared", handleUpdates);
      window.removeEventListener("superflex-student-identity-changed", handleUpdates);
    };
  }, []);

  const checkHasUpdate = (link) => {
    const text = link.text?.trim();
    if (text === "Marks" && pendingUpdates?.newMarks?.length > 0) return true;
    if (text === "Attendance" && pendingUpdates?.newAttendance?.length > 0) return true;
    return false;
  };
  const callbacksRef = useRef({ onAttendanceLinkFound, onLinksFound });
  useEffect(() => {
    callbacksRef.current = { onAttendanceLinkFound, onLinksFound };
  }, [onAttendanceLinkFound, onLinksFound]);

  const groupedLinks = useMemo(() => {
    const groups = Object.fromEntries(GROUP_ORDER.map((group) => [group, []]));
    const seen = new Set<string>();
    for (const link of menuLinks) {
      const name = link.text.trim();
      if (seen.has(name) || ["Grade Report", "My Teachers", "Change Password"].includes(name))
        continue;
      groups[LINK_GROUPS[name] || "More"].push(link);
      seen.add(name);
    }
    return groups;
  }, [menuLinks]);

  const changeThemeMode = setThemeMode;

  const sidebarLogoColor = "#ffffff";
  const sidebarLogoBoltColor = themeMode === "dark" ? "#a098ff" : "#0a192f";

  const isLinkActive = (link) => {
    if (link.text.trim() === "Home")
      return currentPage === "/" || currentPage.startsWith("/?dump=");
    if (link.text.trim() === "Course Registration")
      return currentPage.startsWith("/Student/CourseRegistration");
    return Boolean(link.path && currentPage && currentPage.includes(link.path));
  };

  useEffect(() => {
    if (menuLinks.length)
      localStorage.setItem("superflex-sidebar-links", JSON.stringify(menuLinks));
    const sidebarLinks = menuLinks;
    const attendance = sidebarLinks.find((link) => link.text === "Attendance");
    if (attendance) callbacksRef.current.onAttendanceLinkFound?.(attendance.href);
    callbacksRef.current.onLinksFound?.(sidebarLinks);

    document
      .querySelectorAll<HTMLElement>(".m-grid.m-grid--hor.m-grid--root.m-page header")
      .forEach((node) => {
        if (!node.closest("#react-chrome-app")) node.remove();
      });
    document
      .querySelectorAll<HTMLElement>(".m-aside-left.m-aside-left--skin-dark")
      .forEach((node) => node.remove());
    document
      .querySelectorAll<HTMLElement>(".m-aside-left--fixed .m-body")
      .forEach((node) => node.classList.add("!p-0"));
    document
      .querySelectorAll<HTMLElement>(
        ".m-grid__item.m-grid__item--fluid.m-grid.m-grid--ver-desktop.m-grid--desktop.m-body",
      )
      .forEach((node) => node.classList.remove("m-grid--desktop", "m-body"));
    document.querySelector<HTMLElement>(".m-subheader")?.remove();
    document.querySelector<HTMLElement>("#m_aside_left_close_btn")?.remove();
  }, [menuLinks]);

  const remainingLinks = useMemo(() => {
    const bottomNavKeys = new Set([
      "home",
      "attendance",
      "marks",
      "transcript",
      "octopus ai",
      "octopus",
    ]);
    const seen = new Set<string>();
    const links = [];

    for (const link of menuLinks) {
      const name = link.text.trim();
      const key = name.toLowerCase();
      if (
        bottomNavKeys.has(key) ||
        seen.has(name) ||
        ["Grade Report", "My Teachers", "Change Password"].includes(name)
      ) {
        continue;
      }
      seen.add(name);
      links.push(link);
    }
    return links;
  }, [menuLinks]);

  useEffect(() => {
    if (!plusMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlusMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [plusMenuOpen]);

  const navigate = (href, action) => {
    setPlusMenuOpen(false);
    if (action === "teachers") {
      window.dispatchEvent(new CustomEvent("superflex-open-teacher-settings"));
      return;
    }
    if (action === "octopus") {
      window.dispatchEvent(new CustomEvent("superflex-toggle-ai"));
      return;
    }
    if (href && href !== "#") {
      window.location.href = href;
    }
  };

  const renderGroups = () => (
    <nav aria-label="Main navigation" className="space-y-3.5 sm:space-y-5">
      {GROUP_ORDER.map((group) => {
        const links = groupedLinks[group];
        if (!links.length) return null;
        return (
          <div key={group}>
            <p className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/75 dark:text-white/70 sm:mb-2 sm:px-3 sm:text-[10px]">
              {group}
            </p>
            <div className="space-y-0.5 sm:space-y-1">
              {links.map((link) => (
                <SidebarLink
                  key={`${link.path}-${link.text}`}
                  link={link}
                  active={isLinkActive(link)}
                  onNavigate={navigate}
                  hasUpdate={checkHasUpdate(link)}
                />
              ))}
            </div>
          </div>
        );
      })}
      {!menuLinks.length && <p className="px-3 text-xs text-white/75">Loading navigation…</p>}
    </nav>
  );

  const sidebarContents = () => (
    <>
      <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-5">
        <a
          href="/"
          aria-label="SuperFlex home"
          className="inline-flex items-center gap-2 rounded-lg sm:gap-2.5"
        >
          <Logo
            className="h-7 w-auto sm:h-9"
            style={{
              "--accent": sidebarLogoColor,
              "--foreground": sidebarLogoColor,
              "--bolt": sidebarLogoBoltColor,
            }}
          />
        </a>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2.5 sm:px-3 sm:py-5">
        {renderGroups()}
      </div>

      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <div>
          <div className="rounded-xl bg-white/35 p-1.5 dark:bg-white/[0.04] sm:rounded-2xl sm:p-2">
            <div className="flex items-center gap-1.5">
              <div className="grid flex-1 grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => changeThemeMode("light")}
                  aria-pressed={themeMode === "light"}
                  title="Light Mode"
                  className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold transition-all sm:rounded-full sm:py-2 sm:text-xs ${
                    themeMode === "light"
                      ? "bg-[#230052] text-white shadow-xs dark:bg-white dark:text-[#0a192f]"
                      : "bg-white/70 text-slate-700 hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                  }`}
                >
                  <Sun size={12} /> Light
                </button>
                <button
                  type="button"
                  onClick={() => changeThemeMode("dark")}
                  aria-pressed={themeMode === "dark"}
                  title="Dark Mode"
                  className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold transition-all sm:rounded-full sm:py-2 sm:text-xs ${
                    themeMode === "dark"
                      ? "bg-[#230052] text-white shadow-xs dark:bg-white dark:text-[#0a192f]"
                      : "bg-white/70 text-slate-700 hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                  }`}
                >
                  <Moon size={12} /> Dark
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("superflex-open-global-settings"))
                }
                aria-label="SuperFlex Settings"
                title="SuperFlex Settings"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-slate-700 hover:bg-white hover:text-[#230052] dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20 dark:hover:text-white transition-all shadow-xs sm:h-9 sm:w-9 sm:rounded-full"
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-white/35 p-2 dark:bg-white/[0.04] sm:gap-3 sm:rounded-2xl sm:p-2.5">
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            title="Change profile photo"
            className="shrink-0 rounded-full"
          >
            <img
              src={profileImage}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10"
              onError={(event) => {
                const fallbackUrl = getExtensionUrl("assets/favicon.png");
                if (fallbackUrl) event.currentTarget.src = fallbackUrl;
                else event.currentTarget.hidden = true;
              }}
            />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-slate-900 dark:text-white sm:text-xs">
              {userName}
            </p>
            <a
              href="/Student/ChangePassword"
              className="text-[10px] font-medium text-slate-500 hover:text-[#230052] dark:text-slate-400 dark:hover:text-white sm:text-[11px]"
            >
              Change Password
            </a>
          </div>
          <a
            href="/Login/logout"
            aria-label="Log out"
            title="Log out"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-500/10 sm:rounded-full sm:p-2"
          >
            <LogOut size={15} />
          </a>
        </div>
      </div>
    </>
  );

  const isHomePage =
    !currentPage || currentPage === "/" || currentPage.startsWith("/?dump=");

  const bottomNavItems = useMemo(() => {
    const findHref = (name: string, fallback: string) =>
      menuLinks.find((l) => l.text.trim() === name)?.href ||
      `${window.location.origin}${fallback}`;

    return [
      {
        key: "home",
        label: "Home",
        href: findHref("Home", "/"),
        icon: House,
        active: isHomePage,
        hasUpdate: false,
      },
      {
        key: "attendance",
        label: "Attendance",
        href: findHref("Attendance", "/Student/StudentAttendance"),
        icon: CalendarDays,
        active: Boolean(currentPage && currentPage.includes("Attendance")),
        hasUpdate: Boolean(pendingUpdates?.newAttendance?.length > 0),
      },
      {
        key: "marks",
        label: "Marks",
        href: findHref("Marks", "/Student/StudentMarks"),
        icon: TrendingUp,
        active: Boolean(
          currentPage &&
            currentPage.includes("Marks") &&
            !currentPage.includes("Plo"),
        ),
        hasUpdate: Boolean(pendingUpdates?.newMarks?.length > 0),
      },
      {
        key: "transcript",
        label: "Transcript",
        href: findHref("Transcript", "/Student/Transcript"),
        icon: GraduationCap,
        active: Boolean(currentPage && currentPage.includes("Transcript")),
        hasUpdate: false,
      },
      {
        key: "octopus",
        label: "Octopus AI",
        href: "#",
        action: "octopus",
        icon: Activity,
        active: false,
        hasUpdate: false,
      },
    ];
  }, [menuLinks, currentPage, isHomePage, pendingUpdates]);

  return (
    <>
      <aside
        style={
          currentPage.startsWith("/Student/CourseRegistration") &&
          window.matchMedia("(min-width: 1024px)").matches
            ? { display: "flex" }
            : undefined
        }
        className="fixed bottom-4 left-4 top-4 z-40 hidden w-[252px] flex-col overflow-hidden rounded-[28px] border-0 bg-transparent text-slate-900 dark:text-[#f5f6fb] lg:flex"
      >
        {sidebarContents()}
      </aside>

      {!isHomePage && (
        <header className="relative z-30 flex items-center justify-between px-4 pb-1 pt-3.5 lg:hidden">
          <a
            href="/"
            aria-label="Back to Home"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition-colors active:scale-95 dark:bg-white/10"
          >
            <ArrowLeft size={19} strokeWidth={2.2} />
          </a>
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            aria-label="Profile"
            className="h-9 w-9 overflow-hidden rounded-full border border-white/60 bg-white/20"
          >
            <img
              src={profileImage}
              alt="Profile"
              className="h-full w-full object-cover"
              onError={(event) => {
                const fallbackUrl = getExtensionUrl("assets/favicon.png");
                if (fallbackUrl) event.currentTarget.src = fallbackUrl;
                else event.currentTarget.hidden = true;
              }}
            />
          </button>
        </header>
      )}

      <div
        role="navigation"
        aria-label="Mobile bottom navigation"
        className="fixed inset-x-4 bottom-3.5 z-[70] flex items-center justify-between gap-3 pointer-events-none lg:hidden"
      >
        <div className="sf-floating-dock pointer-events-auto flex h-[58px] flex-1 items-center justify-around rounded-full border border-black/[0.06] bg-white/95 px-2 backdrop-blur-xl dark:border-white/15 dark:bg-[#12121a]/95">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.href, item.action)}
                aria-label={item.label}
                aria-current={item.active ? "page" : undefined}
                className={`relative flex h-11 w-11 shrink-0 aspect-square items-center justify-center rounded-full transition-all ${
                  item.active
                    ? "bg-[#230052] text-white shadow-xs dark:bg-white dark:text-[#0a192f]"
                    : "text-[#52525b] hover:text-[#230052] dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Icon size={20} strokeWidth={item.active ? 2.3 : 1.9} />
                {item.hasUpdate && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#230052] ring-2 ring-white dark:bg-white dark:ring-[#12121a]" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setPlusMenuOpen((prev) => !prev)}
          aria-label="All links and quick actions"
          aria-expanded={plusMenuOpen}
          className={`sf-floating-dock pointer-events-auto flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border border-black/[0.06] backdrop-blur-xl transition-all active:scale-95 ${
            plusMenuOpen
              ? "bg-[#230052] text-white shadow-xs dark:bg-white dark:text-[#0a192f]"
              : "bg-white/95 text-[#52525b] hover:text-[#230052] dark:border-white/15 dark:bg-[#12121a]/95 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {plusMenuOpen ? (
            <X size={22} strokeWidth={2.3} />
          ) : (
            <LayoutGrid size={22} strokeWidth={1.9} />
          )}
        </button>
      </div>

      {/* Mobile Speed Dial Quick Menu (matches Screenshot 6bc5688a) */}
      {plusMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-white/70 backdrop-blur-xl transition-opacity animate-in fade-in duration-200 dark:bg-black/75 dark:backdrop-blur-xl lg:hidden"
            onClick={() => setPlusMenuOpen(false)}
          />

          <div
            className="fixed bottom-[78px] right-4 z-[70] flex max-h-[calc(100dvh-100px)] flex-col items-end gap-3.5 overflow-y-auto overscroll-contain pr-0 pb-1 scrollbar-hide animate-in fade-in slide-in-from-bottom-4 duration-200 lg:hidden"
            role="menu"
            aria-label="Remaining navigation links"
          >
            {remainingLinks.map((link) => {
              const Icon = ICONS[link.text.trim()] || DEFAULT_ICON;
              const hasUpdate = checkHasUpdate(link);
              const active = isLinkActive(link);
              return (
                <button
                  key={`${link.path}-${link.text}`}
                  type="button"
                  onClick={() => {
                    setPlusMenuOpen(false);
                    navigate(link.href, link.action);
                  }}
                  className="group flex items-center gap-3 transition-transform active:scale-95"
                  role="menuitem"
                >
                  <span
                    className={`text-[16px] font-bold tracking-tight transition-colors ${
                      active
                        ? "text-[#230052] dark:text-white"
                        : "text-foreground group-hover:text-[#230052] dark:group-hover:text-white"
                    }`}
                  >
                    {link.text}
                  </span>
                  <div className="flex w-[58px] shrink-0 items-center justify-center">
                    <div
                      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[#230052] text-white shadow-[0_4px_16px_rgba(35,0,82,0.18)] transition-transform group-hover:scale-105 dark:bg-white dark:text-[#0a192f] dark:shadow-none ${
                        active ? "ring-2 ring-[#230052]/40 dark:ring-white/50" : ""
                      }`}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                      {hasUpdate && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="h-full w-full rounded-full bg-emerald-500 animate-pulse ring-2 ring-white dark:ring-[#12121a]" />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setPlusMenuOpen(false);
                window.dispatchEvent(new CustomEvent("superflex-open-global-settings"));
              }}
              className="group flex items-center gap-3 transition-transform active:scale-95"
              role="menuitem"
            >
              <span className="text-[16px] font-bold tracking-tight text-foreground transition-colors group-hover:text-[#230052] dark:group-hover:text-white">
                Settings
              </span>
              <div className="flex w-[58px] shrink-0 items-center justify-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[#230052] text-white shadow-[0_4px_16px_rgba(35,0,82,0.18)] transition-transform group-hover:scale-105 dark:bg-white dark:text-[#0a192f] dark:shadow-none">
                  <Settings size={20} strokeWidth={2.2} />
                </div>
              </div>
            </button>
          </div>
        </>
      )}

      <ProfileImageModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentImage={profileImage}
      />
    </>
  );
}

export default NavBar;
