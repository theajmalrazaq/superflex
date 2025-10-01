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

function NavBar({currentPage = "", onAttendanceLinkFound }) {
  const [menuLinks, setMenuLinks] = useState([]);

  // Icon mapping based on link text or path
  const iconStyle = "h-10 w-10 rounded-xl flex text-x items-center !bg-[#161616] justify-center";
  const iconMapping = {
    Home: <span className={iconStyle}><Home size={18} /></span>,
    "Course Registration": <span className={iconStyle}><BookOpen size={18} /></span>,
    Attendance: <span className={iconStyle}><Calendar size={18} /></span>,
    Marks: <span className={iconStyle}><Award size={18} /></span>,
    "Marks PLO Report": <span className={iconStyle}><BarChart size={18} /></span>,
    Transcript: <span className={iconStyle}><FileText size={18} /></span>,
    "Fee Challan": <span className={iconStyle}><Receipt size={18} /></span>,
    "Fee Details": <span className={iconStyle}><DollarSign size={18} /></span>,
    "Course Feedback": <span className={iconStyle}><MessageSquare size={18} /></span>,
    "Retake Exam Request": <span className={iconStyle}><Clock size={18} /></span>,
    "Course Withdraw": <span className={iconStyle}><XCircle size={18} /></span>,
    "Grade Change Request": <span className={iconStyle}><RefreshCw size={18} /></span>,
    "Tentative Study Plan": <span className={iconStyle}><ListChecks size={18} /></span>,
    "Grade Report": <span className={iconStyle}><GraduationCap size={18} /></span>,
    // Fallback icon for any unmatched menu items
    default: <span className={iconStyle}><FileText size={18} /></span>,
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
      // Filter out "Grade Report" links
      return links.filter((link) => link.text.trim() !== "Grade Report");
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
    <div className="flex flex-col  px-1 pt-4 pb-1 h-screen">
      {/* Logo Section with Gradient Background */}
      <div className="px-4 pb-0 flex justify-center items-center">
        <img
          src={chrome.runtime.getURL("public/logo.svg")}
          alt="Logo"
          className="h-14 w-auto filter"
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r via-slate-600/50 from-transparent to-transparent my-3 mx-4"></div>

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
                        className={`flex items-center gap-3 pr-4 pl-2 py-1.5 rounded-2xl transition-all duration-300 text-sm no-underline hover:no-underline
                                                    ${isActive
                            ? "!bg-x !text-white"
                            : "!text-slate-300 hover:!bg-[#161616] hover:text-white"
                          }`}
                      >
                        <span
                          className={`rounded-2xl flex items-center justify-center`}
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
          {/* Profile Card with Logout Button */}
          <div className="rounded-2xl overflow-visible bg-white/2 relative flex flex-col items-center w-full">
            <div className="w-full flex flex-col items-center" style={{position:'relative'}}>
              <div className="flex items-center gap-3 p-3 w-full">
                
               
                <a
                  href="/Login/logout"
                  className="ml-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/5 text-white font-medium text-sm no-underline hover:bg-slate-100 transition-all duration-200"
                >
                  <LogOut size={18} className="text-x" />
                  Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
