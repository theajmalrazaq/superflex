import React, { useEffect, useState } from "react";
import {
  Home,
  BookOpen,
  Calendar,
  Award,
  BarChart,
  FileText,
  Receipt,
  DollarSign,
  MessageSquare,
  Clock,
  XCircle,
  RefreshCw,
  ListChecks,
  GraduationCap,
  Settings,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Pipette,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { Logo } from "./ui/Logo";
import ProfileImageModal from "./ui/ProfileImageModal";

function NavBar({ currentPage = "", onAttendanceLinkFound, onLinksFound }) {
  const [menuLinks, setMenuLinks] = useState([]);
  const iconMapping = {
    Home: <Home />,
    "Course Registration": <BookOpen />,
    Attendance: <Calendar />,
    Marks: <Award />,
    "Marks PLO Report": <BarChart />,
    Transcript: <FileText />,
    "Fee Challan": <Receipt />,
    "Fee Details": <DollarSign />,
    "Course Feedback": <MessageSquare />,
    "Retake Exam Request": <Clock />,
    "Course Withdraw": <XCircle />,
    "Grade Change Request": <RefreshCw />,
    "Tentative Study Plan": <ListChecks />,
    "Grade Report": <GraduationCap />,
    Settings: <Settings />,

    default: <FileText />,
  };

  const getIcon = (link) => {
    const linkText = link.text.trim();
    return iconMapping[linkText] || iconMapping["default"];
  };

  useEffect(() => {
    const scrollbarStyle = `
      .scrollbar-hide::-webkit-scrollbar {
        width: 6px;
      }
      .scrollbar-hide::-webkit-scrollbar-track {
        background: transparent;
      }
      .scrollbar-hide::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
      }
      .scrollbar-hide::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    `;
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollbarStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("superflex_user_custom_image") || "/Login/GetImage"
  );

  useEffect(() => {
    const handleStorage = () => {
      setProfileImage(
        localStorage.getItem("superflex_user_custom_image") || "/Login/GetImage"
      );
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const extractMenuLinks = () => {
      const links = [];
      const menuElements = document.querySelectorAll(".m-menu__link");

      if (menuElements.length === 0) {
        const leftMenu = document.querySelector(".m-aside-left-menu");
        if (leftMenu) {
          leftMenu.querySelectorAll("a").forEach((element) => {
            try {
              if (element.href && !element.href.includes("javascript:void")) {
                const url = new URL(element.href);
                links.push({
                  href: element.href,
                  icon: element.querySelector("i")?.outerHTML || "",
                  text:
                    element.querySelector(".m-menu__link-text")?.innerHTML ||
                    element.textContent.trim(),
                  path: url.pathname,
                });
              }
            } catch (e) {
              console.error("Error processing menu link:", e);
            }
          });
        }
      } else {
        menuElements.forEach((element) => {
          try {
            if (element.href) {
              const url = new URL(element.href);
              links.push({
                href: element.href,
                icon: element.querySelector("i")?.outerHTML || "",
                text:
                  element.querySelector(".m-menu__link-text")?.innerHTML ||
                  element.textContent.trim(),
                path: url.pathname,
              });
            }
          } catch (e) {
            console.error("Error processing menu link:", e);
          }
        });
      }

      return links.filter((link) => link.text.trim() !== "Grade Report");
    };

    const nameElem = document.querySelector(".m-card-user__name");
    if (nameElem && nameElem.textContent.trim()) {
      setUserName(nameElem.textContent.trim());
    }

    const links = extractMenuLinks();

    if (links.length > 0) {
      setMenuLinks(links);
      const attendanceLink = links.find(
        (link) => link.text.trim() === "Attendance"
      );

      if (attendanceLink && onAttendanceLinkFound) {
        onAttendanceLinkFound(attendanceLink.href);
      }

      if (onLinksFound) {
        onLinksFound(links);
      }
    }

    document.querySelectorAll("header").forEach((element) => {
      element.remove();
    });

    document
      .querySelectorAll(".m-aside-left.m-aside-left--skin-dark")
      .forEach((element) => {
        element.remove();
      });

    document
      .querySelectorAll(".m-aside-left--fixed .m-body")
      .forEach((element) => {
        element.classList.add("!p-0");
      });

    document
      .querySelectorAll(
        ".m-grid__item.m-grid__item--fluid.m-grid.m-grid--ver-desktop.m-grid--desktop.m-body"
      )
      .forEach((element) => {
        element.classList.remove("m-grid--desktop", "m-body");
      });

    document.querySelector(".m-subheader")?.remove();

    document.querySelector("#m_aside_left_close_btn")?.remove();
  }, [onAttendanceLinkFound]);

  useEffect(() => {
    if (menuLinks.length === 0) {
    } else {
    }
  }, [menuLinks]);

  const [groupedLinks, setGroupedLinks] = useState({});

  useEffect(() => {
    const categories = {
      Home: "root",
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

    const newGroupedLinks = {
      root: [],
      Academics: [],
      Finance: [],
      Services: [],
      More: [],
    };

    menuLinks.forEach((link) => {
      const linkText = link.text.trim();
      const category = categories[linkText] || "More";

      if (category === "root") {
        newGroupedLinks.root.push(link);
      } else {
        newGroupedLinks[category].push(link);
      }
    });

    setGroupedLinks(newGroupedLinks);
  }, [menuLinks]);

  const isCategoryActive = (categoryLinks) => {
    return categoryLinks.some(
      (link) => link.path && currentPage && currentPage.includes(link.path)
    );
  };

  const NavItem = ({ link, isActive }) => (
    <button
      onClick={() => {
        window.location.href = link.href;
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-[13px] font-medium whitespace-nowrap cursor-pointer ${
        isActive
          ? "bg-accent/10 text-accent border  border-foreground/10"
          : "text-foreground/60 border-transparent hover:text-foreground hover:bg-foreground/5"
      }`}
    >
      <span className={isActive ? "text-inherit" : "text-current"}>
        {React.cloneElement(getIcon(link), { size: 16 })}
      </span>
      <span className="md:text-sm">{link.text}</span>
    </button>
  );

  const DropdownItem = ({ link, isActive }) => (
    <div
      onClick={() => {
        window.location.href = link.href;
      }}
      className={`group flex items-center !bg-secondary/50 backdrop-blur-xl gap-4 p-4 rounded-xl transition-all duration-200 no-underline hover:no-underline border cursor-pointer
        ${
          isActive
            ? "bg-tertiary border-foreground/10"
            : "bg-secondary border-foreground/10 hover:bg-tertiary hover:border-foreground/10"
        } 
      `}
    >
      <div
        className={`p-2.5 rounded-full shrink-0 ${
          isActive
            ? "bg-accent text-[var(--accent-foreground)]"
            : "bg-background/40 text-accent group-hover:bg-accent group-hover:text-[var(--accent-foreground)] transition-colors duration-300"
        }`}
      >
        {React.cloneElement(getIcon(link), { size: 20 })}
      </div>
      <div>
        <div
          className={`text-sm font-semibold mb-0.5 ${
            isActive
              ? "text-foreground "
              : "text-foreground/80 group-hover:text-foreground"
          }`}
        >
          {link.text}
        </div>
        <div className="text-[11px] text-foreground/50 font-medium group-hover:text-foreground/60">
          View {link.text.toLowerCase()}
        </div>
      </div>
    </div>
  );

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userName, setUserName] = useState("Student Account");
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [openMobileCategories, setOpenMobileCategories] = useState({});

  useEffect(() => {
    const activeCategory = ["Academics", "Finance", "Services", "More"].find(
      (cat) => groupedLinks[cat] && isCategoryActive(groupedLinks[cat])
    );
    if (activeCategory) {
      setOpenMobileCategories((prev) => ({ ...prev, [activeCategory]: true }));
    }
  }, [groupedLinks, currentPage]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const [themeColor, setThemeColor] = useState(
    localStorage.getItem("superflex-theme-color") || "#a098ff"
  );

  const [themeMode, setThemeMode] = useState(
    localStorage.getItem("superflex-theme-mode") || "dark"
  );

  useEffect(() => {
    const savedMode = localStorage.getItem("superflex-theme-mode") || "dark";
    setThemeMode(savedMode);
    if (savedMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleThemeModeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem("superflex-theme-mode", mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(
      new CustomEvent("superflex-theme-mode-changed", { detail: mode })
    );
  };

  const [bgUrl, setBgUrl] = useState(
    localStorage.getItem("superflex-bg-url") ||
      "https://motionbgs.com/media/6867/omen-valorant2.960x540.mp4"
  );

  const [bgEnabled, setBgEnabled] = useState(
    localStorage.getItem("superflex-bg-enabled") !== "false"
  );

  const handleBgChange = (url) => {
    setBgUrl(url);
    localStorage.setItem("superflex-bg-url", url);
    window.dispatchEvent(
      new CustomEvent("superflex-bg-changed", { detail: url })
    );
  };

  const handleBgToggle = () => {
    const newState = !bgEnabled;
    setBgEnabled(newState);
    localStorage.setItem("superflex-bg-enabled", newState);
    window.dispatchEvent(
      new CustomEvent("superflex-bg-enabled-changed", { detail: newState })
    );
  };

  const themeColors = [
    "#a098ff",
    "#F77FBE",
    "#ff3838ff",
    "#ff6a00ff",
    "#ffb83eff",
  ];

  const updateThemeColors = (hex) => {
    if (!hex) return;

    document.documentElement.style.setProperty("--accent", hex);

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    document.documentElement.style.setProperty(
      "--accent-rgb",
      `${r}, ${g}, ${b}`
    );

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const contrast = luminance > 0.5 ? "#000000" : "#ffffff";
    document.documentElement.style.setProperty("--accent-foreground", contrast);
  };

  useEffect(() => {
    const savedColor =
      localStorage.getItem("superflex-theme-color") || "#a098ff";
    updateThemeColors(savedColor);
    setThemeColor(savedColor);
  }, []);

  const handleColorChange = (color, shouldClose = true) => {
    setThemeColor(color);
    localStorage.setItem("superflex-theme-color", color);
    updateThemeColors(color);
    window.dispatchEvent(
      new CustomEvent("superflex-theme-changed", { detail: color })
    );
    if (shouldClose) {
      setOpenDropdown(null);
    }
  };

  return (
    <div className="flex items-center justify-between lg:justify-start px-4 lg:px-6 py-2.5 lg:py-3 w-full lg:w-fit relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-accent/10 blur-[80px] rounded-full pointer-events-none -z-10" />
      <div className="flex items-center gap-4">
        {}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 cursor-pointer text-foreground/60 hover:text-foreground transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center shrink-0">
          <Logo className="h-7 lg:h-8 w-auto" />
        </div>
      </div>

      {}
      <div className="hidden lg:flex justify-center !px-8">
        <nav>
          {menuLinks.length === 0 ? (
            <div className="text-foreground/50 text-sm">Loading...</div>
          ) : (
            <div className="flex items-center gap-1">
              {}
              {groupedLinks.root?.map((link, index) => {
                const isActive =
                  currentPage === "/" || currentPage.startsWith("/?dump=");
                return <NavItem key={index} link={link} isActive={isActive} />;
              })}

              {}
              {["Academics", "Finance", "Services", "More"].map((category) => {
                const links = groupedLinks[category];
                if (!links || links.length === 0) return null;

                const isActive = isCategoryActive(links);
                const isOpen = openDropdown === category;

                return (
                  <div key={category} className="relative dropdown-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(isOpen ? null : category);
                      }}
                      className={`flex items-center cursor-pointer gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-foreground/5 ${
                        isActive
                          ? "bg-accent/10 text-accent border border-foreground/10"
                          : "!text-foreground/60 hover:!text-foreground"
                      }`}
                    >
                      {category}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[999] w-max animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-background border border-foreground/10 rounded-2xl p-2 min-w-[520px]">
                          <div className="grid grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto scrollbar-hide p-1">
                            {links.map((link, idx) => {
                              const isLinkActive =
                                link.path &&
                                currentPage &&
                                currentPage.includes(link.path);
                              return (
                                <DropdownItem
                                  key={idx}
                                  link={link}
                                  isActive={isLinkActive}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      {}
      {}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[90vw] max-w-[400px] bg-background/95 backdrop-blur-3xl border border-foreground/10 rounded-3xl z-[999] animate-in slide-in-from-top-4 fade-in duration-300 max-h-[80vh] overflow-y-auto scrollbar-hide shadow-2xl">
          <div className="flex flex-col gap-4 p-4">
            {}
            <div
              className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
                isProfileExpanded
                  ? "bg-secondary/80 border border-foreground/10"
                  : "bg-secondary/40 border border-foreground/10 hover:bg-secondary/60"
              }`}
            >
              <button
                onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                className="w-full flex items-center justify-between p-4 !cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-tertiary border-2 border-foreground/10 overflow-hidden shrink-0">
                      <img
                        src={profileImage}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-accent text-[var(--accent-foreground)] rounded-full border border-background">
                      <User size={8} />
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="text-foreground font-bold text-sm leading-tight truncate max-w-[150px]">
                      {userName}
                    </h3>
                    <p className="text-[10px] text-foreground/60 font-bold capitalize leading-none mt-1">
                      Profile Info
                    </p>
                  </div>
                </div>
                <div
                  className={`p-1.5 rounded-lg bg-foreground/5 text-foreground/60 transition-transform duration-300 ${
                    isProfileExpanded ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={16} />
                </div>
              </button>

              <div
                className={`overflow-y-auto transition-all duration-300 scrollbar-hide ${
                  isProfileExpanded
                    ? "max-h-60 border-t border-foreground/10"
                    : "max-h-0"
                }`}
              >
                <div className="p-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsProfileModalOpen(true);
                      setIsProfileExpanded(false);
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl text-left hover:bg-foreground/5 transition-colors group"
                  >
                    <div className="p-2 bg-accent/10 text-accent rounded-lg group-hover:bg-accent group-hover:text-[var(--accent-foreground)] transition-colors">
                      <User size={14} />
                    </div>
                    <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground">
                      Change DP
                    </span>
                  </button>

                  <a
                    href="/Student/ChangePassword"
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl text-left hover:bg-foreground/5 transition-colors group no-underline"
                  >
                    <div className="p-2 bg-tertiary text-foreground/60 rounded-lg group-hover:bg-tertiary group-hover:text-foreground transition-colors">
                      <Settings size={14} />
                    </div>
                    <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground">
                      Change Password
                    </span>
                  </a>

                  <a
                    href="/Login/logout"
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl text-left hover:bg-rose-500/10 transition-colors group no-underline"
                  >
                    <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg group-hover:bg-rose-500 group-hover:text-foreground transition-colors">
                      <LogOut size={14} />
                    </div>
                    <span className="text-xs font-bold text-rose-500/80 group-hover:text-rose-500">
                      Logout
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-secondary/40 border border-foreground/10 rounded-3xl overflow-hidden transition-all duration-300">
              <button
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "mobile-aura" ? null : "mobile-aura"
                  )
                }
                className="w-full !cursor-pointer flex items-center justify-between p-5 hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 text-accent rounded-xl">
                    <Pipette size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-foreground font-semibold text-sm leading-tight">
                      Aura Settings
                    </h3>
                    <p className="text-[11px] text-foreground/50 font-medium mt-1">
                      Personalization
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-foreground/50 transition-transform duration-300 ${
                    openDropdown === "mobile-aura" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {}
              {openDropdown === "mobile-aura" && (
                <div className="px-5 pb-5 space-y-6 animate-in slide-in-from-top-2 fade-in duration-200">
                  {}
                  <div className="bg-foreground/5 h-px w-full"></div>

                  <div className="space-y-3">
                    <p className="text-[11px] text-foreground/60 font-medium px-1">
                      Appearance
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleThemeModeChange("light")}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                          themeMode === "light"
                            ? "bg-tertiary border-accent/20 text-accent font-bold"
                            : "bg-background/80 border-foreground/10 text-foreground/60"
                        }`}
                      >
                        <Sun size={14} />
                        <span className="text-xs font-semibold md:mt-2">
                          Light
                        </span>
                      </button>
                      <button
                        onClick={() => handleThemeModeChange("dark")}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                          themeMode === "dark"
                            ? "bg-tertiary border-accent/20 text-accent font-bold"
                            : "bg-background/80 border-foreground/10 text-foreground/60"
                        }`}
                      >
                        <Moon size={14} />
                        <span className="text-xs font-semibold md:mt-2">
                          Dark
                        </span>
                      </button>
                    </div>
                  </div>

                  {}
                  <div className="flex flex-col items-start gap-3 px-1 text-left">
                    <div>
                      <h3 className="text-foreground font-semibold text-sm leading-tight">
                        Accent Color
                      </h3>
                      <p className="text-[11px] text-foreground/50 font-medium mt-0.5">
                        Personalize your aura
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-full border border-foreground/5 w-fit">
                      {themeColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color, false)}
                          className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center`}
                          style={{ backgroundColor: color }}
                        >
                          {themeColor === color && (
                            <Check
                              size={14}
                              className="text-[var(--accent-foreground)]"
                            />
                          )}
                        </button>
                      ))}

                      <div className="w-px h-6 bg-foreground/10 mx-1"></div>

                      <div className="relative group">
                        <button className="w-8 h-8 rounded-full bg-secondary hover:bg-tertiary transition-colors flex items-center justify-center border border-foreground/10">
                          <Pipette size={14} className="text-foreground/70" />
                        </button>
                        <input
                          type="color"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          value={themeColor}
                          onChange={(e) =>
                            handleColorChange(e.target.value, false)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <h3 className="text-foreground font-semibold text-sm leading-tight">
                          Background Aura
                        </h3>
                        <p className="text-[11px] text-foreground/50 font-medium mt-1">
                          Video or image URL
                        </p>
                      </div>
                      <button
                        onClick={handleBgToggle}
                        className={`p-2 rounded-xl transition-all ${
                          bgEnabled
                            ? "bg-accent/10 text-accent"
                            : "bg-foreground/5 text-foreground/40"
                        }`}
                        title={
                          bgEnabled ? "Hide Background" : "Show Background"
                        }
                      >
                        {bgEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="Paste Video/Image URL..."
                        value={bgUrl}
                        onChange={(e) => handleBgChange(e.target.value)}
                        className="w-full bg-background/40 border border-foreground/5 rounded-2xl px-4 py-3.5 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent/30 transition-all"
                      />
                      {bgUrl && (
                        <button
                          onClick={() => handleBgChange("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors p-1"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {groupedLinks.root?.map((link, index) => {
                const isActive =
                  currentPage === "/" || currentPage.startsWith("/?dump=");
                const isHome = link.text.trim() === "Home";
                return (
                  <button
                    key={index}
                    onClick={() => {
                      window.location.href = link.href;
                    }}
                    className={`flex items-center justify-center gap-2 px-4 rounded-2xl transition-all ${
                      isHome ? "col-span-2 flex-row h-14 mt-2" : "flex-col h-24"
                    } ${
                      isActive
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "bg-secondary/50 text-foreground/60 hover:bg-foreground/10 hover:text-foreground border border-foreground/10"
                    }`}
                  >
                    <div
                      className={
                        isActive ? "text-accent" : "text-foreground/50"
                      }
                    >
                      {React.cloneElement(getIcon(link), { size: 24 })}
                    </div>
                    <span className="font-bold md:text-xs">{link.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              {["Academics", "Finance", "Services", "More"].map((category) => {
                const links = groupedLinks[category];
                if (!links || links.length === 0) return null;

                const isExpanded = openMobileCategories[category];

                return (
                  <div
                    key={category}
                    className="rounded-2xl overflow-hidden bg-secondary/30 border border-foreground/10"
                  >
                    <button
                      onClick={() =>
                        setOpenMobileCategories((prev) => ({
                          ...prev,
                          [category]: !prev[category],
                        }))
                      }
                      className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold Cap tracking-wider text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                    >
                      <span>{category}</span>
                      <div
                        className={`p-1 rounded-full bg-foreground/5 transition-transform duration-300 ${
                          isExpanded
                            ? "rotate-180 bg-foreground/10 text-foreground"
                            : ""
                        }`}
                      >
                        <ChevronDown size={14} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="grid grid-cols-2 gap-2 p-2 pt-0 animate-in slide-in-from-top-2 duration-200">
                        {links.map((link, idx) => {
                          const isActive =
                            link.path &&
                            currentPage &&
                            currentPage.includes(link.path);
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                window.location.href = link.href;
                              }}
                              className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-xl transition-all h-24 ${
                                isActive
                                  ? "bg-accent text-[var(--accent-foreground)]"
                                  : "text-foreground/60 bg-background/20 hover:text-foreground hover:bg-foreground/5 border border-foreground/10"
                              }`}
                            >
                              <div
                                className={
                                  isActive
                                    ? "text-[var(--accent-foreground)]"
                                    : "text-foreground/50"
                                }
                              >
                                {React.cloneElement(getIcon(link), {
                                  size: 20,
                                })}
                              </div>
                              <span className="text-[10px] font-bold leading-tight break-words w-full">
                                {link.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {}
      <div className="shrink-0 flex items-center gap-3">
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("superflex-toggle-ai"))
          }
          className="flex items-center !cursor-pointer gap-2 px-4 py-2.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-all duration-300 group animate-border-beam"
        >
          <div className="border-beam-element" />
          <svg
            width="20"
            height="20"
            viewBox="0 0 432 432"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
          >
            <path
              d="M247.227 185.616L282.286 69L133 216L186.861 231.146L133 363L298 208.65L247.227 185.616Z"
              fill="var(--accent)"
            />
            <path
              d="M246.748 185.472L246.623 185.891L247.021 186.071L297.111 208.796L134.327 361.073L187.324 231.335L187.536 230.816L186.996 230.664L133.964 215.751L281.243 70.7275L246.748 185.472Z"
              stroke="white"
              strokeOpacity="0.03"
            />
          </svg>
          <span className="text-xs font-bold Cap tracking-wider hidden sm:inline-block">
            Ask AI
          </span>
        </button>

        <div className="relative dropdown-container hidden md:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === "theme" ? null : "theme");
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-foreground/5 transition-all duration-200 !cursor-pointer"
          >
            <div
              className="w-7 h-7 rounded-full border-2 border-foreground/20"
              style={{ backgroundColor: themeColor }}
            />
          </button>

          {openDropdown === "theme" && (
            <div className="absolute right-0 top-full mt-2 z-[999] w-[calc(100vw-2rem)] sm:w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-background border border-foreground/10 rounded-2xl p-2 flex flex-col">
                {}
                <div className="p-4 space-y-4">
                  <div className="px-1">
                    <h3 className="text-sm font-semibold mb-0.5 text-foreground/80 tracking-tight">
                      Appearance
                    </h3>
                    <p className="text-[11px] text-foreground/50 font-medium">
                      Choice of interface
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pb-2 px-1">
                    <button
                      onClick={() => handleThemeModeChange("light")}
                      className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                        themeMode === "light"
                          ? "bg-tertiary border-foreground/10 text-foreground"
                          : "bg-secondary/50 border-foreground/5 text-foreground/60 hover:bg-tertiary hover:text-foreground"
                      }`}
                    >
                      <Sun size={14} />
                      <span className="text-xs font-semibold">Light</span>
                    </button>
                    <button
                      onClick={() => handleThemeModeChange("dark")}
                      className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                        themeMode === "dark"
                          ? "bg-tertiary border-foreground/10 text-foreground"
                          : "bg-secondary/50 border-foreground/5 text-foreground/60 hover:bg-tertiary hover:text-foreground"
                      }`}
                    >
                      <Moon size={14} />
                      <span className="text-xs font-semibold">Dark</span>
                    </button>
                  </div>
                </div>

                <div className="h-px bg-foreground/10 mx-4"></div>

                {}
                <div className="p-4 flex flex-col items-start gap-3">
                  <div className="px-1">
                    <h3 className="text-sm font-semibold mb-0.5 text-foreground/80 tracking-tight">
                      Accent Color
                    </h3>
                    <p className="text-[11px] text-foreground/50 font-medium">
                      Personalize your aura
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 bg-secondary/30 p-2 rounded-full border border-foreground/5 w-fit">
                    {themeColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color, false)}
                        className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center`}
                        style={{ backgroundColor: color }}
                      >
                        {themeColor === color && (
                          <Check
                            size={14}
                            className="text-[var(--accent-foreground)]"
                          />
                        )}
                      </button>
                    ))}

                    <div className="w-px h-6 bg-foreground/10 mx-1"></div>

                    <div className="relative group">
                      <button className="w-8 h-8 rounded-full bg-secondary hover:bg-tertiary transition-colors flex items-center justify-center border border-foreground/10">
                        <Pipette size={14} className="text-foreground/70" />
                      </button>
                      <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        value={themeColor}
                        onChange={(e) =>
                          handleColorChange(e.target.value, false)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-foreground/10 mx-4"></div>

                {}
                <div className="p-4 space-y-4">
                  <div className="px-1 flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold mb-0.5 text-foreground/80 tracking-tight">
                        Background Aura
                      </h3>
                      <p className="text-[11px] text-foreground/50 font-medium">
                        Video or image URL
                      </p>
                    </div>
                    <button
                      onClick={handleBgToggle}
                      className={`p-1.5 rounded-lg transition-all ${
                        bgEnabled
                          ? "bg-accent/10 text-accent ring-1 ring-accent/20"
                          : "bg-secondary text-foreground/40 hover:bg-tertiary hover:text-foreground/60"
                      }`}
                      title={bgEnabled ? "Hide Background" : "Show Background"}
                    >
                      {bgEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                  <div className="relative group px-1 pb-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={bgUrl}
                      onChange={(e) => handleBgChange(e.target.value)}
                      className="w-full bg-secondary/50 border border-foreground/5 rounded-xl px-4 py-3 text-[11px] text-foreground placeholder:text-foreground/30 focus:outline-none focus:bg-tertiary focus:border-foreground/10 transition-all font-medium"
                    />
                    {bgUrl && (
                      <button
                        onClick={() => handleBgChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors p-1"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative dropdown-container hidden lg:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === "profile" ? null : "profile");
            }}
            className="flex items-center !cursor-pointer gap-3 px-3 py-2 rounded-full hover:bg-foreground/5 transition-all duration-200"
          >
            <img
              src={profileImage}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover border border-foreground/10"
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect fill="%23a098ff" width="32" height="32"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="var(--foreground)" font-size="14">?</text></svg>';
              }}
            />
            <ChevronDown
              size={14}
              className={`text-foreground/60 transition-transform duration-200 ${
                openDropdown === "profile" ? "rotate-180" : ""
              }`}
            />
          </button>

          {}
          {openDropdown === "profile" && (
            <div className="absolute right-0 top-full mt-2 z-[999] w-56 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-background border border-foreground/10 rounded-2xl p-2 ">
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 transition-all text-left text-foreground/70 hover:text-foreground border-0 bg-transparent !cursor-pointer"
                >
                  <User size={18} />
                  <span className="text-sm font-medium">Change DP</span>
                </button>
                <a
                  href="/Student/ChangePassword"
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 transition-all text-left text-foreground/70 hover:text-foreground no-underline"
                >
                  <Settings size={18} />
                  <span className="text-sm font-medium">Change Password</span>
                </a>
                <div className="h-px bg-foreground/10 my-1"></div>
                <a
                  href="/Login/logout"
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-all text-left text-foreground/70 hover:text-red-400 no-underline"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <ProfileImageModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentImage={profileImage}
        onImageUpdate={(newImage) => {
          setProfileImage(newImage);
          localStorage.setItem("superflex_user_custom_image", newImage);
        }}
      />
    </div>
  );
}

export default NavBar;
