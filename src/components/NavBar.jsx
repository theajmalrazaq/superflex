/* eslint-disable no-undef */
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
  LogOut,
  User,
  Lock,
} from "lucide-react";

function NavBar({ currentPage = "", onAttendanceLinkFound }) {
  const [menuLinks, setMenuLinks] = useState([]);
  const [username, setUsername] = useState("");

  // Icon mapping based on link text or path
  const iconMapping = {
    Home: <Home size={20} />,
    "Course Registration": <BookOpen size={20} />,
    Attendance: <Calendar size={20} />,
    Marks: <Award size={20} />,
    "Marks PLO Report": <BarChart size={20} />,
    Transcript: <FileText size={20} />,
    "Fee Challan": <Receipt size={20} />,
    "Fee Details": <DollarSign size={20} />,
    "Course Feedback": <MessageSquare size={20} />,
    "Retake Exam Request": <Clock size={20} />,
    "Course Withdraw": <XCircle size={20} />,
    "Grade Change Request": <RefreshCw size={20} />,
    "Tentative Study Plan": <ListChecks size={20} />,
    "Grade Report": <GraduationCap size={20} />,
    // Fallback icon for any unmatched menu items
    default: <FileText size={20} />,
  };

  // Function to determine which icon to use
  const getIcon = (link) => {
    const linkText = link.text.trim();
    return iconMapping[linkText] || iconMapping["default"];
  };

  useEffect(() => {
    // Important: Extract menu links BEFORE removing any elements
    const extractMenuLinks = () => {
      const links = [];
      const menuElements = document.querySelectorAll(".m-menu__link");

      if (menuElements.length === 0) {
        // If no menu links found, check in the specific container
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
        // Process the menu links that were found
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
      return links;
    };

    // Extract links first
    const links = extractMenuLinks();

    if (links.length > 0) {
      setMenuLinks(links);
      const attendanceLink = links.find(
        (link) => link.text.trim() === "Attendance"
      );
      if (attendanceLink && onAttendanceLinkFound) {
        onAttendanceLinkFound(attendanceLink.href);
      }
    }

    // Extract username
    const usernameElement = document.querySelector(
      ".m-topbar__username.m--hidden-tablet.m--hidden-mobile.m--padding-right-15"
    );
    if (usernameElement) {
      setUsername(usernameElement.textContent.trim());
    }

    // Now it's safe to remove elements after extraction
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
        element.classList.add(
          "!bg-dark",
          "!bg-black",
          "!rounded-3xl",
          "!shadow-md",
          "!p-4"
        );
      });

    document.querySelector(".m-subheader")?.remove();
    // Remove the close button
    document.querySelector("#m_aside_left_close_btn")?.remove();
  }, [onAttendanceLinkFound]);

  // For debugging
  useEffect(() => {
    if (menuLinks.length === 0) {
      console.log("Menu links array is empty");
    } else {
      console.log(`Found ${menuLinks.length} menu links`);
    }
  }, [menuLinks]);

  return (
    <div className="flex flex-col h-screen">
      {/* Logo Section with Gradient Background */}
      <div className="px-6 pt-3 pb-0">
        <img
          src={chrome.runtime.getURL("public/logo.svg")}
          alt="Logo"
          className="h-10 w-auto filter"
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent my-3 mx-4"></div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto px-3 flex-1 scrollbar-hide">
          <nav className="py-2">
            {menuLinks.length === 0 ? (
              <div className="text-white/70 p-4 text-center text-sm">
                No navigation links found
              </div>
            ) : (
              <ul className="space-y-1.5">
                {menuLinks.map((link, index) => {
                  // Fixed active state logic for Home link
                  let isActive;

                  if (link.text.trim() === "Home") {
                    isActive =
                      currentPage === "/" || currentPage.startsWith("/?dump=");
                  } else {
                    isActive =
                      link.path &&
                      currentPage &&
                      currentPage.includes(link.path);
                  }

                  return (
                    <li key={index}>
                      <a
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm no-underline hover:no-underline
                                                    ${
                                                      isActive
                                                        ? "bg-x text-white "
                                                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                                                    }`}
                      >
                        <span
                          className={`${
                            isActive ? "text-white" : "text-slate-400"
                          }`}
                        >
                          {getIcon(link)}
                        </span>
                        <span className="font-medium">{link.text}</span>
                        {isActive && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-white"></span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
        </div>

        {/* User Profile and Logout Section */}
        <div className="mt-auto py-8 px-4">
          <div className="rounded-2xl overflow-hidden  !border !border-white/10">
            {/* User Profile Section */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/10  flex-shrink-0">
                <img
                  src="/Login/GetImage"
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-100 font-medium truncate">
                  {username || "Student"}
                </div>
                <div className="text-slate-400 text-xs">Student Portal</div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-700/70 mx-3"></div>

            {/* Logout and Change Password Buttons */}
            <div className="p-3 flex gap-2">
              <a
                href="https://flexstudent.nu.edu.pk/Student/ChangePassword"
                className="flex items-center justify-center bg-white text-black py-2.5 px-2 w-1/3 rounded-xl transition-all duration-300"
              >
                <Lock size={18} />
              </a>
              <a
                href="/Login/logout"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-2.5 px-4 w-2/3 rounded-xl transition-all duration-300 font-medium text-sm no-underline"
              >
                <LogOut size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
