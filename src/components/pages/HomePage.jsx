/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";
import {
  Calendar,
  CheckCircle,
  XCircle,
  GraduationCap,
  ClipboardList,
  User,
  Phone,
  Users,
  MapPin,
  UserCheck,
  X,
  Mail,
  Home,
  Building,
  Cake,
  CreditCard,
  Clock,
  Bell,
  MessageCircle,
  BookOpen,
  Activity,
  Layers,
  ChevronRight,
  PieChart,
  Zap,
  Award,
  BarChart2,
  Github,
  Globe,
  Instagram,
} from "lucide-react";

// Add custom scrollbar styles
const scrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

// Function to get appropriate welcome message based on time of day
const getWelcomeMessage = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning,";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon,";
  } else if (hour >= 17 && hour < 22) {
    return "Good Evening,";
  } else {
    return "Good Night,";
  }
};

function HomePage() {
  // Add the style to the document
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollbarStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [attendanceLink, setAttendanceLink] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [universityInfo, setUniversityInfo] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [familyInfo, setFamilyInfo] = useState(null);

  // Replace single profile state with individual popup states
  const [activePopup, setActivePopup] = useState(null);



  // Add the style to the document and remove problematic border class
  useEffect(() => {
    // Add custom scrollbar style
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollbarStyle;
    document.head.appendChild(styleElement);

    // Find and remove the .border class definition from style.bundle.css
    const styleSheets = document.styleSheets;
    for (let i = 0; i < styleSheets.length; i++) {
      const sheet = styleSheets[i];
      if (sheet.href && sheet.href.includes('style.bundle.css')) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule.selectorText === '.border') {
              sheet.deleteRule(j);
              console.log('Removed problematic .border class from CSS');
              break;
            }
          }
        } catch (e) {
          console.warn('Could not access CSS rules:', e);
        }
      }
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const targetElement = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page"
    );
    if (targetElement) {
      const scriptTags = targetElement.querySelectorAll("script");
      scriptTags.forEach((script) => script.remove());
      targetElement.querySelector("#NotificationDetail")?.remove();

      // Process rows to extract university info and academic calendar
      let uniInfo = {};

      const rows = targetElement.querySelectorAll(".row");
      rows.forEach((row) => {
        const portletTitle = row
          .querySelector(".m-portlet__head-text")
          ?.textContent.trim();

        if (portletTitle === "University Information") {
          // Extract university information
          row.querySelectorAll(".col-md-4 p").forEach((p) => {
            const label = p
              .querySelector(".m--font-boldest")
              ?.textContent.trim()
              .replace(":", "");
            const value = p
              .querySelector("span:not(.m--font-boldest)")
              ?.textContent.trim();
            if (label && value) {
              uniInfo[label] = value;
            }
          });
          setUniversityInfo(uniInfo);
        } else if (portletTitle === "Personal Information") {
          // Extract personal information
          let personalData = {};
          row.querySelectorAll(".col-md-4").forEach((col) => {
            col.querySelectorAll("p").forEach((p) => {
              const label = p
                .querySelector(".m--font-boldest")
                ?.textContent.trim()
                .replace(":", "");
              const value = p
                .querySelector("span:not(.m--font-boldest)")
                ?.textContent.trim();
              if (label && value) {
                personalData[label] = value;
              }
            });
          });
          setPersonalInfo(personalData);
        } else if (portletTitle === "Contact Information") {
          // Extract contact information
          let contactData = {
            permanent: {},
            current: {},
          };

          const columns = row.querySelectorAll(".col-md-6");
          columns.forEach((col, index) => {
            const type = index === 0 ? "permanent" : "current";
            col.querySelectorAll("p").forEach((p) => {
              const label = p
                .querySelector(".m--font-boldest")
                ?.textContent.trim()
                .replace(":", "");
              const value = p
                .querySelector("span:not(.m--font-boldest)")
                ?.textContent.trim();
              if (label && value) {
                contactData[type][label] = value;
              }
            });
          });
          setContactInfo(contactData);
        } else if (portletTitle === "Family Information") {
          // Extract family information
          let familyData = [];
          const table = row.querySelector("table");
          if (table) {
            const rows = table.querySelectorAll("tbody tr");
            rows.forEach((tr) => {
              const cells = tr.querySelectorAll("td");
              if (cells.length >= 3) {
                familyData.push({
                  relation: cells[1]?.textContent.trim(),
                  name: cells[2]?.textContent.trim(),
                  cnic: cells[3]?.textContent.trim() || "N/A",
                });
              }
            });
          }
          setFamilyInfo(familyData);
        }
      });

      targetElement.remove();
    }
  }, []);

  // Function to fetch attendance data when the link is available
  useEffect(() => {
    if (attendanceLink) {
      fetchAttendanceData();
    }
  }, [attendanceLink]);

  // Process attendance data after it's loaded
  useEffect(() => {
    if (attendanceData) {
      processAttendanceData();
    }
  }, [attendanceData]);

  const fetchAttendanceData = async () => {
    setIsLoadingAttendance(true);
    try {
      const response = await fetch(attendanceLink);
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const attendanceContent = doc.querySelector(
        ".m-grid.m-grid--hor.m-grid--root.m-page"
      );

      if (attendanceContent) {
        const scripts = attendanceContent.querySelectorAll("script");
        scripts.forEach((script) => script.remove());

        setAttendanceData(attendanceContent.innerHTML);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const processAttendanceData = () => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = attendanceData;

    const attendanceTables = tempElement.querySelectorAll(
      ".table.table-bordered.table-responsive.m-table.m-table--border-info.m-table--head-bg-info"
    );

    const summaryData = {};

    attendanceTables.forEach((table, tableIndex) => {
      // Find the closest tab-pane to get ID
      const tabPane = table.closest(".tab-pane");
      const tabId = tabPane ? tabPane.id : `table-${tableIndex}`;

      // Get the course name/title
      const titleElement = tabPane ? tabPane.querySelector("h5") : null;
      const title = titleElement
        ? titleElement.textContent
        : `Table ${tableIndex + 1}`;

      // Count present and absent entries
      const rows = table.querySelectorAll("tbody tr");
      let presentCount = 0;
      let absentCount = 0;
      let totalLectures = rows.length;

      rows.forEach((row) => {
        const presenceCell = row.querySelector("td:nth-child(4)");
        if (presenceCell) {
          const presenceText = presenceCell.textContent.trim();
          if (presenceText.includes("P")) {
            presentCount++;
          } else if (presenceText.includes("A")) {
            absentCount++;
          }
        }
      });

      // Find the progress bar element to extract percentage
      let attendancePercentage = "0.00";
      const progressBar = tabPane
        ? tabPane.querySelector(".progress-bar")
        : null;
      if (progressBar) {
        // Try to get from aria-valuenow attribute first
        attendancePercentage = progressBar.getAttribute("aria-valuenow") || "0";

        // If not found, try to get from h5 element inside progress bar
        if (!attendancePercentage || attendancePercentage === "0") {
          const percentageElement = progressBar.querySelector("h5");
          if (percentageElement) {
            attendancePercentage = percentageElement.textContent
              .replace("%", "")
              .trim();
          }
        }
      }

      summaryData[tabId] = {
        title,
        totalLectures,
        presentCount,
        absentCount,
        attendancePercentage,
      };
    });

    setAttendanceSummary(summaryData);
  };

  const handleAttendanceLinkFound = (link) => {
    setAttendanceLink(link);
  };

  // Define color themes for the dashboard

  // Calculate quick stats based on attendance data
  const calculateStats = () => {
    if (!attendanceSummary || Object.keys(attendanceSummary).length === 0) {
      return {
        avgAttendance: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalCourses: 0,
        coursesBelow80: 0,
        coursesBelowThreshold: 0,
        coursesWithTooManyAbsents: 0,
      };
    }

    const courses = Object.values(attendanceSummary);
    const totalCourses = courses.length;

    const totalPresent = courses.reduce(
      (sum, course) => sum + course.presentCount,
      0
    );
    const totalAbsent = courses.reduce(
      (sum, course) => sum + course.absentCount,
      0
    );

    const totalPercentage = courses.reduce(
      (sum, course) => sum + parseFloat(course.attendancePercentage),
      0
    );
    const avgAttendance = totalPercentage / totalCourses;

    const coursesBelow80 = courses.filter(
      (course) => parseFloat(course.attendancePercentage) < 80
    ).length;

    const coursesBelowThreshold = courses.filter(
      (course) => parseFloat(course.attendancePercentage) < 75
    ).length;

    // Count courses with too many absents (>6 for regular courses, >3 for labs)
    const coursesWithTooManyAbsents = courses.filter((course) => {
      const isLab = course.title.toLowerCase().includes("lab");
      return isLab ? course.absentCount > 3 : course.absentCount > 6;
    }).length;

    return {
      avgAttendance: avgAttendance.toFixed(1),
      totalPresent,
      totalAbsent,
      totalCourses,
      coursesBelow80,
      coursesBelowThreshold,
      coursesWithTooManyAbsents,
    };
  };

  const stats = calculateStats();

  // Function to render popups based on activePopup state
  const renderActivePopup = () => {
    if (!activePopup) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 transition-all duration-300">
        <div className={`bg-black rounded-2xl overflow-hidden shadow-2xl !border !border-white/10 w-full ${activePopup === "about" ? "max-w-2xl" : "max-w-md"} relative`}>
          <div className="py-3 px-4 flex items-center justify-between !border-b !border-white/10">
            <h2 className="font-bold text-white text-lg">
              {activePopup === "personal" && "Personal Information"}
              {activePopup === "contact" && "Contact Information"}
              {activePopup === "family" && "Family Information"}
              {activePopup === "about" && "About SuperFlex"}
            </h2>
            <button
              onClick={() => setActivePopup(null)}
              className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>

          <div className="p-4 max-h-[70vh] overflow-auto custom-scrollbar">
            {/* Personal Info Popup */}
            {activePopup === "personal" && (
              <div className="animate-fadeIn">
                <table className="w-full border-collapse">
                  <tbody className="divide-y divide-white/10">
                    {personalInfo &&
                      Object.entries(personalInfo).map(([key, value]) => (
                        <tr key={key} className="hover:bg-white/5">
                          <td className="py-3 px-2 text-white/50 text-xs font-medium w-1/3">
                            {key}
                          </td>
                          <td className="py-3 px-2 text-white">
                            <span className="font-medium">
                              {value || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!personalInfo ||
                  (Object.keys(personalInfo).length === 0 && (
                    <div className="text-center py-6 text-white/50">
                      No personal information available
                    </div>
                  ))}
              </div>
            )}
            {/* Contact Info Popup */}
            {activePopup === "contact" && (
              <div className="animate-fadeIn">
                {/* Permanent Address */}
                <h4 className="text-white/70 text-sm font-medium mb-2 px-2">
                  Permanent Address
                </h4>
                <table className="w-full border-collapse mb-6">
                  <tbody className="divide-y divide-white/10">
                    {contactInfo?.permanent &&
                      Object.entries(contactInfo.permanent).map(
                        ([key, value]) => (
                          <tr key={key} className="hover:bg-white/5">
                            <td className="py-3 px-2 text-white/50 text-xs font-medium w-1/3">
                              {key}
                            </td>
                            <td className="py-3 px-2 text-white">
                              <span className="font-medium">
                                {value || "N/A"}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>

                {/* Current Address */}
                <h4 className="text-white/70 text-sm font-medium mb-2 px-2">
                  Current Address
                </h4>
                <table className="w-full border-collapse">
                  <tbody className="divide-y divide-white/10">
                    {contactInfo?.current &&
                      Object.entries(contactInfo.current).map(
                        ([key, value]) => (
                          <tr key={key} className="hover:bg-white/5">
                            <td className="py-3 px-2 text-white/50 text-xs font-medium w-1/3">
                              {key}
                            </td>
                            <td className="py-3 px-2 text-white">
                              <span className="font-medium">
                                {value || "N/A"}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>

                {(!contactInfo ||
                  (!contactInfo.permanent && !contactInfo.current)) && (
                    <div className="text-center py-6 text-white/50">
                      No contact information available
                    </div>
                  )}
              </div>
            )}
            {/* Family Info Popup */}
            {activePopup === "family" && (
              <div className="animate-fadeIn">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-2 text-white/50 text-xs font-medium">
                        Relation
                      </th>
                      <th className="text-left py-3 px-2 text-white/50 text-xs font-medium">
                        Name
                      </th>
                      <th className="text-left py-3 px-2 text-white/50 text-xs font-medium">
                        CNIC
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {familyInfo?.map((member, index) => (
                      <tr key={index} className="hover:bg-white/5">
                        <td className="py-3 px-2 text-white">
                          <span className="font-medium">{member.relation}</span>
                        </td>
                        <td className="py-3 px-2 text-white">
                          <span className="font-medium">{member.name}</span>
                        </td>
                        <td className="py-3 px-2 text-white">
                          <span className="font-medium">{member.cnic}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(!familyInfo || familyInfo.length === 0) && (
                  <div className="text-center py-6 text-white/50">
                    No family information available
                  </div>
                )}
              </div>
            )}
            {/* About Popup */}
            {activePopup === "about" && (
              <div className="animate-fadeIn">
                <div className="flex flex-col items-center mb-10">
                  <div className="w-70 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-x to-x opacity-20 rounded-full blur-xl"></div>
                    <img
                      src={chrome.runtime.getURL("public/logo.svg")}
                      alt="SuperFlex Logo"
                      className="w-full h-full object-contain relative z-10"
                    />
                  </div>
                  <div className="mt-4 flex justify-center items-center px-4 py-1.5 bg-white/5 rounded-full">
                    <p className="text-white/70 text-sm font-medium !m-0">Version 1.0.0</p>
                  </div>
                </div>

                <div className="flex justify-center items-center m-4 gap-2">

                  <a className="flex justify-center items-center px-6 py-2 border !border-white/10 text-white rounded-full gap-4 bg-gradient-to-br from-white/10 to-white/5 hover:no-underline" href="https://github.com/ajmalrazaqbhatti/superflex"> <Github className="h-6 w-6" /> Github</a>
                  <a className="flex justify-center items-center px-6 py-2 border !border-white/10 text-white rounded-full gap-4 bg-gradient-to-br from-white/10 to-white/5 hover:no-underline" href="https://ajmalrazaqbhatti.github.io/superflex"> <Globe className="h-6 w-6" /> Website</a>
                  <a className="flex justify-center items-center px-6 py-2 border !border-white/10 text-white rounded-full gap-4 bg-gradient-to-br from-white/10 to-white/5 hover:no-underline" href="https://instagram.com/superflexbyajmal" > <Instagram className="h-6 w-6" /> Instagram</a>
                </div>



                <h4 className="text-white text-lg font-medium mb-4 flex items-center gap-2">

                  Made With
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                    <style>
                      {`@keyframes pulsate {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(0.9); }
    }`}
                    </style>
                    <g style={{ animation: 'pulsate 0.5s ease-in-out infinite both', transformOrigin: 'center center' }} strokeWidth="1.5">
                      <path className="stroke-white" d="M11.515 6.269l.134.132a.5.5 0 00.702 0l.133-.132A4.44 4.44 0 0115.599 5c.578 0 1.15.112 1.684.33a4.41 4.41 0 011.429.939c.408.402.733.88.954 1.406a4.274 4.274 0 010 3.316 4.331 4.331 0 01-.954 1.405l-6.36 6.259a.5.5 0 01-.702 0l-6.36-6.259A4.298 4.298 0 014 9.333c0-1.15.464-2.252 1.29-3.064A4.439 4.439 0 018.401 5c1.168 0 2.288.456 3.114 1.269z" />
                      <path className="stroke-x" strokeLinecap="round" strokeLinejoin="round" d="M15.5 7.5c.802.304 1.862 1.43 2 2" />
                    </g>
                  </svg>
                </h4>
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 mb-10 border border-white/10 transform transition-all">
                  <div className="flex items-center">
                    <div className="w-16 h-16 overflow-hidden rounded-xl mr-4">
                      <img
                        src={chrome.runtime.getURL("public/dev.png")}
                        alt="Developer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h5 className="text-white text-lg font-medium">Ajmal Razaq Bhatti</h5>
                      <div className="flex gap-3 mt-3">
                        <a
                          href="https://github.com/ajmalrazaqbhatti"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1.5 hover:no-underline"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          GitHub
                        </a>
                        <span className="text-white/30">•</span>
                        <a
                          href="https://linkedin.com/in/ajmalrazaqbhatti"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1.5 hover:no-underline"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                          LinkedIn
                        </a>
                        <span className="text-white/30">•</span>
                        <a
                          href="https://instagram.com/ajmalzrandoms"
                          className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1.5 hover:no-underline"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          Instagram
                        </a>
                      </div>
                    </div>
                  </div>
                </div>



                <div className="mb-10">
                  <h4 className="text-white text-lg font-medium mb-4 flex items-center gap-2">

                    Support Gaza Emergency Relief
                  </h4>
                  <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 border border-red-700/30 p-6 rounded-2xl text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-x rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-white text-base mb-6">
                      Help save lives in Gaza by supporting emergency humanitarian aid efforts
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <a
                        href="https://alkhidmat.org/appeal/emergency-appeal-palestine-save-lives-in-gaza-today"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-x text-white px-5 py-2.5 rounded-lg font-medium text-base flex items-center gap-2 hover:no-underline"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Donate to Gaza Relief
                      </a>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h4 className="text-white text-lg font-medium mb-4 flex items-center gap-2">

                    Disclaimer
                  </h4>
                  <div className="space-y-3 bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl border border-white/10">
                    <p className="text-base text-white/80 leading-relaxed">
                      SuperFlex is an independent project and is not affiliated with, endorsed by, or connected to your university or its official portal.
                      This extension does not store, collect, or transmit any user data to external servers. All information displayed is fetched directly from your university's portal and remains within your browser.

                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout
      currentPage={window.location.pathname}
      onAttendanceLinkFound={handleAttendanceLinkFound}
    >
      {renderActivePopup()}
      <div className="flex h-full w-full overflow-hidden">
        {/* Main Content */}

        <div className=" bg-black rounded-3xl shadow-md p-4 w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div>
                <img
                  src="/Login/GetImage"
                  alt=""
                  className="h-24 w-24 rounded-3xl"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  {getWelcomeMessage()} {personalInfo?.["Name"] || "Student"} 👋
                </h1>
                <p className="text-white/70 mb-3">
                  Welcome to SuperFlex By <a href="https://ajmalrazaqbhatti.github.io" className="text-x hover:no-underline hover:text-white">Ajmal Razaq Bhatti</a>
                </p>

                {/* Profile Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => setActivePopup("personal")}
                    className="flex items-center gap-1.5 bg-gradient-to-br from-white/10 to-white/5  transition-colors px-3 py-1.5 rounded-lg !border !border-white/10 text-sm text-white"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Personal</span>
                  </button>

                  <button
                    onClick={() => setActivePopup("contact")}
                    className="flex items-center gap-1.5 bg-gradient-to-br from-white/10 to-white/5  transition-colors px-3 py-1.5 rounded-lg !border !border-white/10 text-sm text-white"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Contact</span>
                  </button>

                  <button
                    onClick={() => setActivePopup("family")}
                    className="flex items-center gap-1.5 bg-gradient-to-br from-white/10 to-white/5  transition-colors px-3 py-1.5 rounded-lg !border !border-white/10 text-sm text-white"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Family</span>
                  </button>

                  <button
                    onClick={() => setActivePopup("about")}
                    className="flex items-center gap-1.5 bg-x  transition-colors px-3 py-1.5 rounde text-sm text-white"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>About SuperFlex</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Registered Courses */}
            <div className="bg-x p-4 rounded-3xl !border !border-white/10">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-3 rounded-full">
                  <BookOpen className="text-black" size={24} />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">
                      {stats.totalCourses}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-white/70">
                      Total Registered Courses
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Present Count */}
            <div className="bg-x p-4 rounded-3xl !border !border-white/10">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-3 rounded-full">
                  <CheckCircle className="text-black" size={24} />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">
                      {stats.totalPresent}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-white/70">Total Present</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Absent Count */}
            <div className="bg-x p-4 rounded-3xl !border !border-white/10">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-3 rounded-full">
                  <XCircle className="text-black" size={24} />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">
                      {stats.totalAbsent}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-white/70">Total Absent</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Subjects < 80% Attendance */}
            <div className="bg-x p-4 rounded-3xl !border !border-white/10">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-3 rounded-full">
                  <Activity className="text-black" size={24} />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">
                      {stats.coursesBelow80}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-white/70">
                      {"Subjects < 80% Attendance"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* University Information and Attendance Table in a 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-6">
                Attendance Details
              </h2>
              <div className="bg-black rounded-3xl !border !border-white/10 p-6 h-96 overflow-hidden">
                {isLoadingAttendance ? (
                  <div className="flex flex-col justify-center items-center py-16">
                    <div className="w-16 h-16 rounded-full !border-4 !border-gray-800 !border-t-x animate-spin mb-6"></div>
                    <span className="text-gray-300 font-medium">
                      Loading attendance data...
                    </span>
                  </div>
                ) : attendanceData &&
                  Object.keys(attendanceSummary).length > 0 ? (
                  <div className="h-full overflow-y-auto custom-scrollbar">
                    <table className="w-full table-auto">
                      <thead className="sticky top-0 bg-black z-10">
                        <tr className="text-gray-400 text-left border-b border-gray-800">
                          <th className="px-4 py-3 font-medium">Course</th>
                          <th className="px-4 py-3 font-medium">Present</th>
                          <th className="px-4 py-3 font-medium">Absent</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 overflow-scroll h-96 scrollbar-hide">
                        {Object.entries(attendanceSummary).map(([id, data]) => {
                          const percentage = parseFloat(
                            data.attendancePercentage
                          );

                          return (
                            <tr
                              key={id}
                              className="hover:bg-white/5 rounded-xl transition-colors"
                            >
                              <td className="px-4 py-3 text-white font-medium">
                                {data.title}
                              </td>
                              <td className="px-4 py-3 text-slate-300">
                                {data.presentCount}
                              </td>
                              <td className="px-4 py-3 text-slate-300">
                                {data.absentCount}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="w-16 bg-slate-700 rounded-full h-2 mr-3">
                                    <div
                                      className={`h-full rounded-full ${percentage >= 85
                                        ? "bg-emerald-500"
                                        : percentage >= 75
                                          ? "bg-amber-500"
                                          : "bg-rose-500"
                                        }`}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span
                                    className={`text-xs font-medium ${percentage >= 85
                                      ? "text-emerald-400"
                                      : percentage >= 75
                                        ? "text-amber-400"
                                        : "text-rose-400"
                                      }`}
                                  >
                                    {percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center mb-5 !border !border-white/10">
                      <Calendar className="h-10 w-10 text-slate-500" />
                    </div>
                    <h3 className="text-slate-300 font-medium text-lg mb-2">
                      No attendance data available
                    </h3>
                    <p className="text-slate-500 max-w-md text-sm">
                      Your attendance records will appear here once they're
                      available in the system
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                University Info
              </h2>
              <div className="bg-black rounded-3xl !border !border-white/10 p-6 h-96 overflow-scroll scrollbar-hide flex flex-col">
                {/* University Header */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <GraduationCap className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {universityInfo?.["Degree"] || "Student"}
                      </h3>
                      <p className="text-sm text-white/60">
                        {universityInfo?.["Session"] || "Current Session"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info content with scroll */}
                <div className="flex-1 h-96 overflow-y-scroll custom-scrollbar">
                  {universityInfo ? (
                    <div className="space-y-3">
                      {Object.entries(universityInfo).map(([key, value]) => {
                        // Select an appropriate icon for each info type
                        let icon;
                        switch (key) {
                          case "Roll No":
                            icon = (
                              <UserCheck
                                size={16}
                                className="text-indigo-400"
                              />
                            );
                            break;
                          case "Section":
                            icon = (
                              <Users size={16} className="text-emerald-400" />
                            );
                            break;
                          case "Degree":
                            icon = (
                              <Award size={16} className="text-blue-400" />
                            );
                            break;
                          case "Session":
                            icon = (
                              <Calendar size={16} className="text-amber-400" />
                            );
                            break;
                          case "Department":
                            icon = (
                              <Building size={16} className="text-purple-400" />
                            );
                            break;
                          default:
                            icon = (
                              <ChevronRight
                                size={16}
                                className="text-slate-400"
                              />
                            );
                        }

                        return (
                          <div
                            key={key}
                            className="flex items-center p-3 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center mr-3">
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white/50 mb-0.5">
                                {key}
                              </p>
                              <p className="text-sm font-medium text-white truncate">
                                {value}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Building className="h-10 w-10 text-white/20 mb-3" />
                      <p className="text-white/50 text-sm">
                        University information is loading...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default HomePage;
