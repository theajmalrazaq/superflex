import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  DollarSign,
  FileText,
  GraduationCap,
  House,
  KeyRound,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Receipt,
  RefreshCw,
  Sun,
  X,
  XCircle,
  Clock3,
} from "lucide-react";
import { Logo } from "./ui/Logo";
import ProfileImageModal from "./ui/ProfileImageModal";
import { getExtensionUrl } from "../utils/extensionApi";

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
  "My Teachers": "Settings",
};

const GROUP_ORDER = ["Overview", "Academics", "Finance", "Services", "Settings", "More"];
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
  "My Teachers": GraduationCap,
  "Change Password": KeyRound,
};

const DEFAULT_ICON = FileText;

function readProfileImage() {
  return localStorage.getItem("superflex_user_custom_image") || "/Login/GetImage";
}

function readSidebarLinks() {
  try {
    const storedLinks = JSON.parse(localStorage.getItem("superflex-sidebar-links") || "[]");
    if (!Array.isArray(storedLinks)) return [];
    return storedLinks.flatMap((link) => {
      if (!link?.text || !link?.href) return [];
      try {
        const url = new URL(link.href, window.location.origin);
        if (url.origin !== window.location.origin || !url.pathname.startsWith("/")) return [];
        return [{ href: url.href, text: String(link.text).trim(), path: url.pathname }];
      } catch {
        return [];
      }
    }).filter((link) => link.text && link.text !== "Grade Report");
  } catch {
    return [];
  }
}

function SidebarLink({ link, active, onNavigate, compact = false }) {
  const Icon = ICONS[link.text.trim()] || DEFAULT_ICON;

  return (
    <button
      type="button"
      onClick={() => onNavigate(link.href, link.action)}
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors ${
        active
          ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"
          : "text-white/90 hover:bg-white/15 hover:text-white dark:text-white/90 dark:hover:bg-white/10 dark:hover:text-white"
      } ${compact ? "justify-center px-2" : ""}`}
      title={compact ? link.text : undefined}
    >
      <Icon size={17} strokeWidth={2} className="shrink-0" />
      {!compact && <span className="truncate">{link.text}</span>}
    </button>
  );
}

function NavBar({ currentPage = "", onAttendanceLinkFound, onLinksFound }) {
  const [menuLinks, setMenuLinks] = useState(readSidebarLinks);
  const [profileImage, setProfileImage] = useState(readProfileImage);
  const [userName, setUserName] = useState("Student Account");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem("superflex-theme-mode") || "light",
  );
  const [cloudMode, setCloudMode] = useState(() => {
    const saved = localStorage.getItem("superflex-cloud-mode");
    return saved ? saved === "on" : (localStorage.getItem("superflex-theme-mode") || "light") === "light";
  });
  const callbacksRef = useRef({ onAttendanceLinkFound, onLinksFound });
  callbacksRef.current = { onAttendanceLinkFound, onLinksFound };

  const groupedLinks = useMemo(() => {
    const groups = Object.fromEntries(GROUP_ORDER.map((group) => [group, []]));
    menuLinks.forEach((link) => {
      const name = link.text.trim();
      const group = LINK_GROUPS[name] || "More";
      if (!["Grade Report", "My Teachers", "Change Password"].includes(name)) groups[group].push(link);
    });
    groups.Settings.push({ text: "My Teachers", path: "/settings/teachers", action: "teachers" });
    return groups;
  }, [menuLinks]);

  const changeThemeMode = (mode) => {
    setThemeMode(mode);
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("superflex-theme-mode", mode);
    window.dispatchEvent(new CustomEvent("superflex-theme-mode-changed", { detail: mode }));
    document.dispatchEvent(new CustomEvent("superflex-theme-mode-changed", { detail: mode }));
  };

  const sidebarLogoColor = themeMode === "light" && !cloudMode ? "#000000" : "#ffffff";

  const isLinkActive = (link) => {
    if (link.text.trim() === "Home")
      return currentPage === "/" || currentPage.startsWith("/?dump=");
    if (link.text.trim() === "Course Registration")
      return currentPage.startsWith("/Student/CourseRegistration");
    return Boolean(link.path && currentPage && currentPage.includes(link.path));
  };

  useEffect(() => {
    const menuElements = document.querySelectorAll(".m-menu__link");
    const source = menuElements.length
      ? Array.from(menuElements)
      : Array.from(document.querySelectorAll(".m-aside-left-menu a"));
    const links = source.flatMap((element) => {
      try {
        if (!element.href || element.href.includes("javascript:void")) return [];
        const url = new URL(element.href, window.location.origin);
        return [
          {
            href: element.href,
            text:
              element.querySelector(".m-menu__link-text")?.textContent?.trim() ||
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
    if (filteredLinks.length) {
      localStorage.setItem("superflex-sidebar-links", JSON.stringify(filteredLinks));
    }
    const availableLinks = filteredLinks.length ? filteredLinks : readSidebarLinks();
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
    setMenuLinks(sidebarLinks);
    const attendance = sidebarLinks.find((link) => link.text === "Attendance");
    if (attendance) callbacksRef.current.onAttendanceLinkFound?.(attendance.href);
    callbacksRef.current.onLinksFound?.(sidebarLinks);

    const portalName = document.querySelector(".m-card-user__name")?.textContent?.trim();
    if (portalName) setUserName(portalName);

    document.querySelectorAll("header").forEach((node) => {
      if (!node.closest("#react-chrome-app")) node.remove();
    });
    document
      .querySelectorAll(".m-aside-left.m-aside-left--skin-dark")
      .forEach((node) => node.remove());
    document
      .querySelectorAll(".m-aside-left--fixed .m-body")
      .forEach((node) => node.classList.add("!p-0"));
    document
      .querySelectorAll(
        ".m-grid__item.m-grid__item--fluid.m-grid.m-grid--ver-desktop.m-grid--desktop.m-body",
      )
      .forEach((node) => node.classList.remove("m-grid--desktop", "m-body"));
    document.querySelector(".m-subheader")?.remove();
    document.querySelector("#m_aside_left_close_btn")?.remove();
  }, []);

  useEffect(() => {
    const onStorage = () => setProfileImage(readProfileImage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
    localStorage.setItem("superflex-theme-mode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.classList.toggle("cloud-mode", cloudMode);
    localStorage.setItem("superflex-cloud-mode", cloudMode ? "on" : "off");
  }, [cloudMode]);

  useEffect(() => {
    const root = document.documentElement;
    localStorage.removeItem("superflex-theme-color");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-foreground");
    root.classList.remove("custom-accent");
  }, []);

  const navigate = (href, action) => {
    setMobileOpen(false);
    if (action === "teachers") {
      window.dispatchEvent(new CustomEvent("superflex-open-teacher-settings"));
      return;
    }
    window.location.href = href;
  };

  const renderGroups = () => (
    <nav aria-label="Main navigation" className="space-y-5">
      {GROUP_ORDER.map((group) => {
        const links = groupedLinks[group];
        if (!links.length) return null;
        return (
          <div key={group}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70 dark:text-white/70">
              {group}
            </p>
            <div className="space-y-1">
              {links.map((link) => (
                <SidebarLink
                  key={`${link.path}-${link.text}`}
                  link={link}
                  active={isLinkActive(link)}
                  onNavigate={navigate}
                />
              ))}
            </div>
          </div>
        );
      })}
      {!menuLinks.length && <p className="px-3 text-xs text-white/75">Loading navigation…</p>}
    </nav>
  );

  const sidebarContents = (mobile = false) => (
    <>
      <div className="flex items-center justify-between px-5 py-5">
        <a href="/" aria-label="SuperFlex home" className="inline-flex items-center gap-2.5 rounded-lg">
          <Logo className="h-9 w-auto" style={{ "--accent": sidebarLogoColor, "--foreground": sidebarLogoColor }} />
        </a>
        {mobile && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="rounded-full p-2 text-slate-600 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">{renderGroups()}</div>

      <div className="space-y-3 p-4">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("superflex-toggle-ai"))}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#230052] px-4 text-sm font-bold text-white transition-colors hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80"
        >
          <KeyRound size={17} /> GroqCloud
        </button>

        <div>
          <div className="rounded-2xl bg-white/30 p-3 dark:bg-white/[0.04]">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => changeThemeMode("light")}
                aria-pressed={themeMode === "light"}
                className={`flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-bold ${themeMode === "light" ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "bg-white/70 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}
              >
                <Sun size={14} /> Light
              </button>
              <button
                type="button"
                onClick={() => changeThemeMode("dark")}
                aria-pressed={themeMode === "dark"}
                className={`flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-bold ${themeMode === "dark" ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "bg-white/70 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}
              >
                <Moon size={14} /> Dark
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white/30 p-2.5 dark:bg-white/[0.04]">
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            title="Change profile photo"
            className="shrink-0 rounded-full"
          >
            <img
              src={profileImage}
              alt="Profile"
              className="h-10 w-10 rounded-full object-cover"
              onError={(event) => {
                const fallbackUrl = getExtensionUrl("assets/favicon.png");
                if (fallbackUrl) event.currentTarget.src = fallbackUrl;
                else event.currentTarget.hidden = true;
              }}
            />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{userName}</p>
            <a
              href="/Student/ChangePassword"
              className="text-[11px] font-medium text-slate-500 hover:text-[#230052] dark:text-slate-400 dark:hover:text-white"
            >
              Change Password
            </a>
          </div>
          <a
            href="/Login/logout"
            aria-label="Log out"
            title="Log out"
            className="rounded-full p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-500/10"
          >
            <LogOut size={16} />
          </a>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside
        style={currentPage.startsWith("/Student/CourseRegistration") && window.matchMedia("(min-width: 1024px)").matches ? { display: "flex" } : undefined}
        className="fixed bottom-4 left-4 top-4 z-40 hidden w-[252px] flex-col overflow-hidden rounded-[28px] border-0 bg-transparent text-slate-900 dark:text-[#f5f6fb] lg:flex"
      >
        {sidebarContents()}
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/50 bg-white/55 px-4 py-3 backdrop-blur-xl dark:border-white/[0.14] dark:bg-black lg:hidden">
        <a href="/" aria-label="SuperFlex home">
          <Logo className="h-6 w-auto" style={{ "--accent": sidebarLogoColor, "--foreground": sidebarLogoColor }} />
        </a>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="rounded-full bg-white/70 p-2 text-slate-700 dark:bg-white/10 dark:text-white"
        >
          <Menu size={19} />
        </button>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/35 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="flex h-full w-[min(88vw,320px)] flex-col overflow-hidden border-0 bg-transparent text-slate-900 dark:text-[#f5f6fb]"
            onClick={(event) => event.stopPropagation()}
          >
            {sidebarContents(true)}
          </aside>
        </div>
      )}

      <ProfileImageModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentImage={profileImage}
        onImageUpdate={(image) => {
          setProfileImage(image);
          localStorage.setItem("superflex_user_custom_image", image);
        }}
      />
    </>
  );
}

export default NavBar;
