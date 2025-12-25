import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  LogOut,
  Lock,
  Menu,
  X,
} from "lucide-react";

function NavBar({ currentPage = "", onAttendanceLinkFound, onLinksFound }) {
  // Synced data state removed - now handled by AiDataPrepare

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

      return links.filter(
        (link) =>
          link.text.trim() !== "Grade Report"
      );
    };

    const links = extractMenuLinks();

    if (links.length > 0) {
      setMenuLinks(links);
      const attendanceLink = links.find(
        (link) => link.text.trim() === "Attendance",
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
        ".m-grid__item.m-grid__item--fluid.m-grid.m-grid--ver-desktop.m-grid--desktop.m-body",
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

  // Data sync logic removed - migrated to AiDataPrepare


  const isCategoryActive = (categoryLinks) => {
    return categoryLinks.some(
      (link) => link.path && currentPage && currentPage.includes(link.path),
    );
  };

  const NavItem = ({ link, isActive }) => (
    <button
      onClick={() => {
        window.location.href = link.href;
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-[13px] font-medium whitespace-nowrap cursor-pointer ${isActive ? "bg-[#a098ff]/10 text-[#a098ff] border  border-white/10" : "text-zinc-400 border-transparent hover:text-white hover:bg-white/5"}`}
    >
      <span className={isActive ? "text-inherit" : "text-current"}>
        {React.cloneElement(getIcon(link), { size: 16 })}
      </span>
      <span>{link.text}</span>
    </button>
  );

  const DropdownItem = ({ link, isActive }) => (
    <div
      onClick={() => {
        window.location.href = link.href;
      }}
      className={`group flex items-center !bg-zinc-900/50 backdrop-blur-xl gap-4 p-4 rounded-xl transition-all duration-200 no-underline hover:no-underline border cursor-pointer
        ${
          isActive
            ? "bg-zinc-800 border-white/10"
            : "bg-zinc-900 border-white/5 hover:bg-zinc-800 hover:border-white/10"
        } 
      `}
    >
      <div
        className={`p-2.5 rounded-full shrink-0 ${isActive ? "bg-[#a098ff] text-white" : "bg-black/40 text-[#a098ff] group-hover:bg-[#a098ff] group-hover:text-white transition-colors duration-300"}`}
      >
        {React.cloneElement(getIcon(link), { size: 20 })}
      </div>
      <div>
        <div
          className={`text-sm font-semibold mb-0.5 ${isActive ? "text-white " : "text-zinc-200 group-hover:text-white"}`}
        >
          {link.text}
        </div>
        <div className="text-[11px] text-zinc-500 font-medium group-hover:text-zinc-400">
          View {link.text.toLowerCase()}
        </div>
      </div>
    </div>
  );

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileCategories, setOpenMobileCategories] = useState({});

  useEffect(() => {
    const activeCategory = ["Academics", "Finance", "Services", "More"].find(
      (cat) => groupedLinks[cat] && isCategoryActive(groupedLinks[cat]),
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

  return (
    <div className="flex items-center justify-between lg:justify-start px-4 lg:px-6 py-2.5 lg:py-3 w-full lg:w-fit relative">
      <div className="flex items-center gap-4">
        {}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center shrink-0">
          <img
            src={chrome.runtime.getURL("assets/logo.svg")}
            alt="Logo"
            className="h-7 lg:h-8 w-auto"
          />
        </div>
      </div>

      {}
      <div className="hidden lg:flex justify-center !px-8">
        <nav>
          {menuLinks.length === 0 ? (
            <div className="text-white/50 text-sm">Loading...</div>
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
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white/5
                        ${isActive ? "bg-[#a098ff]/10 text-[#a098ff] border border-white/10" : "!text-zinc-400 hover:!text-white"}
                      `}
                    >
                      {category}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[999] w-max animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-black border border-white/10 rounded-2xl p-2 min-w-[520px]">
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

      {/* Mobile Menu Sidebar */}
      {/* Mobile Menu Modern Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[90vw] max-w-[400px] bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 z-[999] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex flex-col gap-4 max-h-[70vh] backdrop-blur-2xl overflow-y-auto scrollbar-hide">
            
            {/* User Profile Snippet */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 overflow-hidden shrink-0">
                    <img src="/Login/GetImage" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-white truncate">Student Account</span>
                    <a href="/Student/ChangePassword" className="text-xs text-[#a098ff] font-medium hover:underline">Settings</a>
                </div>
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
                    className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl transition-all ${
                      isHome
                        ? "col-span-2 flex-row aspect-[3/1]"
                        : "flex-col aspect-[4/3]"
                    } ${
                      isActive
                        ? "bg-[#a098ff]/10 text-[#a098ff] border border-[#a098ff]/20"
                        : "bg-zinc-900/50 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
                    }`}
                  >
                    <div className={isActive ? "text-[#a098ff]" : "text-zinc-500"}>
                      {React.cloneElement(getIcon(link), { size: 24 })}
                    </div>
                    <span className="font-bold text-xs">{link.text}</span>
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
                    <div key={category} className="rounded-2xl overflow-hidden bg-zinc-900/30 border border-white/5">
                        <button
                            onClick={() =>
                            setOpenMobileCategories((prev) => ({
                                ...prev,
                                [category]: !prev[category],
                            }))
                            }
                            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <span>{category}</span>
                            <div className={`p-1 rounded-full bg-white/5 transition-transform duration-300 ${isExpanded ? "rotate-180 bg-white/10 text-white" : ""}`}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
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
                                        ? "bg-[#a098ff]/10 text-[#a098ff] border border-[#a098ff]/20"
                                        : "text-zinc-400 bg-black/20 hover:text-white hover:bg-white/5 border border-white/5"
                                    }`}
                                >
                                    <div className={isActive ? "text-[#a098ff]" : "text-zinc-500"}>
                                        {React.cloneElement(getIcon(link), { size: 20 })}
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
        {}
        <div className="relative dropdown-container">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === "profile" ? null : "profile");
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-white/5 transition-all duration-200"
          >
            <img
              src="/Login/GetImage"
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover border border-white/10"
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect fill="%23a098ff" width="32" height="32"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="14">?</text></svg>';
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-zinc-400 transition-transform duration-200 ${openDropdown === "profile" ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {}
          {openDropdown === "profile" && (
            <div className="absolute right-0 top-full mt-2 z-[999] w-56 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-black border border-white/10 rounded-2xl p-2 ">
                <a
                  href="/Student/ChangePassword"
                  onClick={() => {
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left text-zinc-300 hover:text-white no-underline"
                >
                  <Lock size={18} />
                  <span className="text-sm font-medium">Change Password</span>
                </a>
                <div className="h-px bg-white/10 my-1"></div>
                <a
                  href="/Login/logout"
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-all text-left text-zinc-300 hover:text-red-400 no-underline"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
