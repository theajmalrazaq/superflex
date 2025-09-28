/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";
import {
  Calendar,
  Check,
  X,
  GraduationCap,
  User,
  Users,
  MapPin,
  UserCheck,
  Building,
  BookOpen,
  Activity,
  ChevronRight,
  Award,
  Github, 
  Globe,
  Instagram,
  TrendingUp,
  FileText,
} from "lucide-react";
import ReviewCarousel from "../ReviewCarousel";

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
  const [transcriptLink, setTranscriptLink] = useState(null);
  const [transcriptData, setTranscriptData] = useState(null);
  const [transcriptSummary, setTranscriptSummary] = useState({});
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [universityInfo, setUniversityInfo] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [familyInfo, setFamilyInfo] = useState(null);

  // Separate state for modal and dropdown
  const [activePopup, setActivePopup] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

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
      if (sheet.href && sheet.href.includes("style.bundle.css")) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule.selectorText === ".border") {
              sheet.deleteRule(j);
              console.log("Removed problematic .border class from CSS");
              break;
            }
          }
        } catch (e) {
          console.warn("Could not access CSS rules:", e);
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

  // Function to fetch transcript data when the link is available
  useEffect(() => {
    if (transcriptLink) {
      fetchTranscriptData();
    }
  }, [transcriptLink]);

  // Process attendance data after it's loaded
  useEffect(() => {
    if (attendanceData) {
      processAttendanceData();
    }
  }, [attendanceData]);

  // Process transcript data after it's loaded
  useEffect(() => {
    if (transcriptData) {
      processTranscriptData();
    }
  }, [transcriptData]);

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

  const fetchTranscriptData = async () => {
    setIsLoadingTranscript(true);
    try {
      const response = await fetch(transcriptLink);
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const transcriptContent = doc.querySelector(".m-content");

      if (transcriptContent) {
        const scripts = transcriptContent.querySelectorAll("script");
        scripts.forEach((script) => script.remove());

        setTranscriptData(transcriptContent.innerHTML);
      }
    } catch (error) {
      console.error("Error fetching transcript data:", error);
    } finally {
      setIsLoadingTranscript(false);
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

  const processTranscriptData = () => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = transcriptData;

    const summaryData = {
      semesters: [],
      overallStats: {}
    };

    // Extract student info from the first row
    const studentInfoRow = tempElement.querySelector(".row .m-portlet__body");
    if (studentInfoRow) {
      const infoColumns = studentInfoRow.querySelectorAll(".col-md-2, .col-md-3");
      const studentInfo = {};
      
      infoColumns.forEach((col) => {
        const label = col.querySelector(".m--font-boldest")?.textContent.trim().replace(":", "");
        const value = col.querySelector("span:not(.m--font-boldest)")?.textContent.trim();
        if (label && value) {
          studentInfo[label] = value;
        }
      });
      summaryData.studentInfo = studentInfo;
    }

    // Process each semester
    const semesterColumns = tempElement.querySelectorAll(".col-md-6");
    
    semesterColumns.forEach((column) => {
      const semesterHeader = column.querySelector("h5");
      if (!semesterHeader) return;

      const semesterName = semesterHeader.textContent.trim();
      
      // Extract semester stats (Cr. Att, Cr. Ernd, CGPA, SGPA)
      const statsDiv = column.querySelector(".pull-right");
      const stats = {};
      
      if (statsDiv) {
        const spans = statsDiv.querySelectorAll("span");
        spans.forEach((span) => {
          const text = span.textContent.trim();
          if (text.includes("Cr. Att:")) {
            stats.creditsAttempted = text.replace("Cr. Att:", "").trim();
          } else if (text.includes("Cr. Ernd:")) {
            stats.creditsEarned = text.replace("Cr. Ernd:", "").trim();
          } else if (text.includes("CGPA:")) {
            stats.cgpa = text.replace("CGPA:", "").trim();
          } else if (text.includes("SGPA:")) {
            stats.sgpa = text.replace("SGPA:", "").trim();
          }
        });
      }

      // Extract courses for this semester
      const courses = [];
      const table = column.querySelector("table");
      
      if (table) {
        const rows = table.querySelectorAll("tbody tr");
        
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 6) {
            const course = {
              code: cells[0].textContent.trim(),
              name: cells[1].textContent.trim(),
              section: cells[2].textContent.trim(),
              creditHours: cells[3].textContent.trim(),
              grade: cells[4].textContent.trim(),
              points: cells[5].textContent.trim(),
              type: cells[6]?.textContent.trim() || "N/A",
              remarks: cells[7]?.textContent.trim() || ""
            };
            courses.push(course);
          }
        });
      }

      summaryData.semesters.push({
        name: semesterName,
        stats,
        courses,
        courseCount: courses.length
      });
    });

    // Calculate overall statistics
    if (summaryData.semesters.length > 0) {
      const latestSemester = summaryData.semesters[summaryData.semesters.length - 1];
      const totalCourses = summaryData.semesters.reduce((sum, sem) => sum + sem.courseCount, 0);
      
      summaryData.overallStats = {
        totalSemesters: summaryData.semesters.length,
        totalCourses,
        currentCGPA: latestSemester.stats.cgpa || "N/A",
        totalCreditsEarned: latestSemester.stats.creditsEarned || "0"
      };
    }

    setTranscriptSummary(summaryData);
  };

  const handleAttendanceLinkFound = (link) => {
    setAttendanceLink(link);
  };

  const handleTranscriptLinkFound = (link) => {
    setTranscriptLink(link);
  };

  // Calculate quick stats based on attendance and transcript data
  const calculateStats = () => {
    const attendanceStats = calculateAttendanceStats();
    const transcriptStats = calculateTranscriptStats();
    
    return { ...attendanceStats, ...transcriptStats };
  };

  const calculateAttendanceStats = () => {
    if (!attendanceSummary || Object.keys(attendanceSummary).length === 0) {
      return {
        avgAttendance: 0,
        totalCourses: 0,
        bestSubject: null,
        worstSubject: null,
        attendanceWarnings: 0,
      };
    }

    const courses = Object.values(attendanceSummary);
    const totalCourses = courses.length;

    // Average attendance
    const avgAttendance = (
      courses.reduce((sum, course) => sum + parseFloat(course.attendancePercentage), 0) / totalCourses
    ).toFixed(1);

    // Best performing subject (highest attendance)
    const bestSubject = courses.reduce((max, course) =>
      parseFloat(course.attendancePercentage) > parseFloat(max.attendancePercentage) ? course : max
    , courses[0]);

    // Worst performing subject (lowest attendance)
    const worstSubject = courses.reduce((min, course) =>
      parseFloat(course.attendancePercentage) < parseFloat(min.attendancePercentage) ? course : min
    , courses[0]);

    // Attendance warnings (subjects below 80%)
    const attendanceWarnings = courses.filter(
      (course) => parseFloat(course.attendancePercentage) < 80
    ).length;

    return {
      avgAttendance,
      totalCourses,
      bestSubject,
      worstSubject,
      attendanceWarnings,
    };
  };

  const calculateTranscriptStats = () => {
    if (!transcriptSummary.semesters || transcriptSummary.semesters.length === 0) {
      return {
        currentCGPA: "N/A",
        totalSemesters: 0,
        totalCreditsEarned: 0,
        totalCoursesCompleted: 0
      };
    }

    return {
      currentCGPA: transcriptSummary.overallStats?.currentCGPA || "N/A",
      totalSemesters: transcriptSummary.overallStats?.totalSemesters || 0,
      totalCreditsEarned: transcriptSummary.overallStats?.totalCreditsEarned || 0,
      totalCoursesCompleted: transcriptSummary.overallStats?.totalCourses || 0
    };
  };

  const stats = calculateStats();
  // Loading state for stats
  const isStatsLoading = (!attendanceSummary || Object.keys(attendanceSummary).length === 0) && 
                         (!transcriptSummary.semesters || transcriptSummary.semesters.length === 0);

  // Loading SVG component
  const LoadingSplash = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="none">
      <path className="animate-splash" fill="#a098ff" d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z"/>
    </svg>
  );

  // Function to render popups based on activePopup state
  const renderActivePopup = () => {
    if (!activePopup) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
        <div
          className={`bg-[#161616] rounded-3xl overflow-hidden  border border-white/10 w-full ${
            activePopup === "about" ? "max-w-3xl" : "max-w-lg"
          } relative backdrop-blur-xl`}
        >
          <div className="py-4 px-6 flex items-center justify-between border-b border-white/10 bg-white/5">
            <h2 className="font-bold text-white text-xl">
              {activePopup === "personal" && "Personal Information"}
              {activePopup === "contact" && "Contact Information"}
              {activePopup === "family" && "Family Information"}
              {activePopup === "university" && "University Information"}
              {activePopup === "about" && "About SuperFlex"}
            </h2>
            <button
              onClick={() => setActivePopup(null)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>

          <div className="p-6 max-h-[75vh] overflow-auto custom-scrollbar">
            {/* Personal Info Popup */}
            {activePopup === "personal" && (
              <div className="animate-fadeIn">
                <div className="space-y-4">
                  {personalInfo &&
                    Object.entries(personalInfo).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-4 px-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-[#161616] flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white/60 text-sm font-medium uppercase tracking-wide">
                              {key}
                            </p>
                            <p className="text-white font-semibold text-lg">
                              {value || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {!personalInfo ||
                  (Object.keys(personalInfo).length === 0 && (
                    <div className="text-center py-12 text-white/50">
                      <User className="h-16 w-16 mx-auto mb-4 text-white/20" />
                      <p className="text-lg">No personal information available</p>
                    </div>
                  ))}
              </div>
            )}

            {/* Contact Info Popup */}
            {activePopup === "contact" && (
              <div className="animate-fadeIn space-y-8">
                {/* Permanent Address */}
                <div>
                  <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    Permanent Address
                  </h4>
                  <div className="space-y-3">
                    {contactInfo?.permanent &&
                      Object.entries(contactInfo.permanent).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                          <span className="text-white/60 text-sm font-medium">{key}</span>
                          <span className="text-white font-semibold">{value || "N/A"}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Current Address */}
                <div>
                  <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-400" />
                    Current Address
                  </h4>
                  <div className="space-y-3">
                    {contactInfo?.current &&
                      Object.entries(contactInfo.current).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                          <span className="text-white/60 text-sm font-medium">{key}</span>
                          <span className="text-white font-semibold">{value || "N/A"}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {(!contactInfo || (!contactInfo.permanent && !contactInfo.current)) && (
                  <div className="text-center py-12 text-white/50">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-white/20" />
                    <p className="text-lg">No contact information available</p>
                  </div>
                )}
              </div>
            )}

            {/* Family Info Popup */}
            {activePopup === "family" && (
              <div className="animate-fadeIn">
                <div className="space-y-4">
                  {familyInfo?.map((member, index) => (
                    <div key={index} className="flex items-center gap-4 py-4 px-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                      <div className="h-12 w-12 rounded-xl bg-[#161616] flex items-center justify-center">
                        <Users className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-semibold text-lg">{member.name}</span>
                          <span className="text-white/60 text-sm">{member.cnic}</span>
                        </div>
                        <span className="text-purple-400 text-sm font-medium">{member.relation}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {(!familyInfo || familyInfo.length === 0) && (
                  <div className="text-center py-12 text-white/50">
                    <Users className="h-16 w-16 mx-auto mb-4 text-white/20" />
                    <p className="text-lg">No family information available</p>
                  </div>
                )}
              </div>
            )}

            {/* University Info Popup */}
            {activePopup === "university" && (
              <div className="animate-fadeIn">
                <div className="space-y-4">
                  {universityInfo ? (
                    Object.entries(universityInfo).map(([key, value]) => {
                      let icon;
                      let iconColor;
                      switch (key) {
                        case "Roll No":
                          icon = <UserCheck size={22} />;
                          iconColor = "text-blue-400";
                          break;
                        case "Section":
                          icon = <Users size={22} />;
                          iconColor = "text-green-400";
                          break;
                        case "Degree":
                          icon = <Award size={22} />;
                          iconColor = "text-yellow-400";
                          break;
                        case "Session":
                          icon = <Calendar size={22} />;
                          iconColor = "text-purple-400";
                          break;
                        case "Department":
                          icon = <Building size={22} />;
                          iconColor = "text-red-400";
                          break;
                        default:
                          icon = <ChevronRight size={22} />;
                          iconColor = "text-gray-400";
                      }

                      return (
                        <div
                          key={key}
                          className="flex items-center gap-4 py-5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
                        >
                          <div className={`h-12 w-12 rounded-xl bg-[#161616] flex items-center justify-center ${iconColor}`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/60 text-sm font-medium uppercase tracking-wide mb-1">
                              {key}
                            </p>
                            <p className="text-white font-bold text-lg truncate">
                              {value}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <LoadingSplash />
                      <p className="text-white/50 mt-4">Loading university information...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About Popup */}
            {activePopup === "about" && (
              <div className="animate-fadeIn">
                <div className="flex flex-col items-center mb-10">
                  <div className="w-70 relative">
                    
                    <img
                      src={chrome.runtime.getURL("public/logo.svg")}
                      alt="SuperFlex Logo"
                      className="w-full h-full object-contain relative z-10"
                    />
                  </div>
                  <div className="mt-4 flex justify-center items-center px-4 py-1.5 bg-white/5 rounded-full">
                    <p className="text-white/70 text-sm font-medium !m-0">
                      Version 1.0.0
                    </p>
                  </div>
                </div>

                <div className="flex justify-center items-center m-4 gap-2">
                  <a
                    className="flex justify-center items-center px-6 py-2 border !border-white/10 text-white rounded-full gap-4 bg-[#161616] hover:no-underline"
                    href="https://ajmalrazaqbhatti.github.io/superflex"
                  >
                    <Globe className="h-6 w-6" /> Website
                  </a>
                  <a
                    className="flex justify-center items-center px-6 py-2 border !border-white/10 text-white rounded-full gap-4 bg-[#161616] hover:no-underline"
                    href="https://instagram.com/superflexbyajmal"
                  >
                    <Instagram className="h-6 w-6" /> Instagram
                  </a>
                </div>

                <h4 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
                  Made With
                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                  >
                    <style>
                      {`@keyframes pulsate {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(0.9); }
    }`}
                    </style>
                    <g
                      style={{
                        animation: "pulsate 0.5s ease-in-out infinite both",
                        transformOrigin: "center center",
                      }}
                      strokeWidth="1.5"
                    >
                      <path
                        className="stroke-white"
                        d="M11.515 6.269l.134.132a.5.5 0 00.702 0l.133-.132A4.44 4.44 0 0115.599 5c.578 0 1.15.112 1.684.33a4.41 4.41 0 011.429.939c.408.402.733.88.954 1.406a4.274 4.274 0 010 3.316 4.331 4.331 0 01-.954 1.405l-6.36 6.259a.5.5 0 01-.702 0l-6.36-6.259A4.298 4.298 0 014 9.333c0-1.15.464-2.252 1.29-3.064A4.439 4.439 0 018.401 5c1.168 0 2.288.456 3.114 1.269z"
                      />
                      <path
                        className="stroke-x"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.5 7.5c.802.304 1.862 1.43 2 2"
                      />
                    </g>
                  </svg>
                </h4>
                <div className="bg-[#161616] rounded-2xl p-6 mb-10 border border-white/10 transform transition-all">
                  <div className="flex items-center">
                    <div className="w-16 h-16  rounded-xl mr-4">
                      <img
                        src={chrome.runtime.getURL("public/dev.png")}
                        alt="Developer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h5 className="text-white text-lg font-medium">
                        Ajmal Razaq Bhatti
                      </h5>
                      <div className="flex gap-3 mt-3">
                        <a
                          href="https://github.com/ajmalrazaqbhatti"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1.5 hover:no-underline"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                          LinkedIn
                        </a>
                        <span className="text-white/30">•</span>
                        <a
                          href="https://instagram.com/ajmalzrandoms"
                          className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1.5 hover:no-underline"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
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
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-white text-base mb-6">
                      Help save lives in Gaza by supporting emergency
                      humanitarian aid efforts
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <a
                        href="https://alkhidmat.org/appeal/emergency-appeal-palestine-save-lives-in-gaza-today"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/5 text-white px-5 py-2.5 rounded-lg font-medium text-base flex items-center gap-2 hover:no-underline"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
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
                  <div className="space-y-3 bg-[#161616] p-6 rounded-2xl border border-white/10">
                    <p className="text-base text-white/80 leading-relaxed">
                      SuperFlex is an independent project and is not affiliated
                      with, endorsed by, or connected to your university or its
                      official portal. This extension does not store, collect,
                      or transmit any user data to external servers. All
                      information displayed is fetched directly from your
                      university's portal and remains within your browser.
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
      onTranscriptLinkFound={handleTranscriptLinkFound}
    >
      {renderActivePopup()}
      <div className="flex pb-12 w-full">
        {/* Main Content */}
        <div className="p-6 w-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            {/* Welcome column */}
            <div className="flex flex-col gap-2 flex-1">
              <h1 className="!text-4xl !font-semibold text-white">
                {getWelcomeMessage()} <span className="text-x">{personalInfo?.["Name"] || "Student"}</span> 🎓
              </h1>
              <p className="text-white/70 !font-medium text-lg mb-4">
                Welcome to SuperFlex By{" "}
                <a
                  href="https://theajmalrazaq.github.io"
                  className="text-x hover:no-underline hover:text-white transition-colors"
                >
                  Ajmal Razaq Bhatti
                </a>
              </p>
              <ReviewCarousel />
            </div>
            {/* Profile column */}
            <div className="flex flex-col items-end">
              <div className="relative">
                <button
                  className="flex items-center gap-4 px-3 py-3 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] hover:border-white/20 transition-all duration-300"
                  onClick={() => setIsProfileDropdownOpen((open) => !open)}
                >
                  {/* Profile icon */}
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-x/20 to-x/10 flex items-center justify-center text-white font-bold text-lg border border-x/20">
                    <img
                      src="/Login/GetImage"
                      alt="Profile"
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-white text-lg">
                      {personalInfo?.["Name"] || "Student"}
                    </span>
                    <span className="text-x text-sm font-semibold">
                      {universityInfo?.["Roll No"] || personalInfo?.["RollNo"]}
                    </span>
                  </div>
                  {/* Dropdown arrow */}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="ml-2 transition-transform duration-200" style={{ transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <path d="M6 8L10 12L14 8" stroke="#a098ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {/* Dropdown menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 !w-[200px] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]  rounded-3xl border border-white/10 z-50 flex flex-col justify-start py-3 backdrop-blur-xl">
                    <button
                      onClick={() => { setActivePopup("personal"); setIsProfileDropdownOpen(false); }}
                      className="flex gap-3 pl-3 py-3 text-sm text-white hover:bg-x/20 transition-colors rounded-xl mx-2"
                    >
                      <User className="h-5 w-5 text-x" /> Personal Info
                    </button>
                    <button
                      onClick={() => { setActivePopup("family"); setIsProfileDropdownOpen(false); }}
                      className="flex items-center gap-3 pl-3 py-3 text-sm text-white hover:bg-x/20 transition-colors rounded-xl mx-2"
                    >
                      <Users className="h-5 w-5 text-x" /> Family Info
                    </button>
                    <button
                      onClick={() => { setActivePopup("contact"); setIsProfileDropdownOpen(false); }}
                      className="flex items-center gap-3 pl-3 py-3 text-sm text-white hover:bg-x/20 transition-colors rounded-xl mx-2"
                    >
                      <MapPin className="h-5 w-5 text-x" /> Contact Info
                    </button>
                    <button
                      onClick={() => { setActivePopup("university"); setIsProfileDropdownOpen(false); }}
                      className="flex items-center gap-3 pl-3 py-3 text-sm text-white hover:bg-x/20 transition-colors rounded-xl mx-2"
                    >
                      <GraduationCap className="h-5 w-5 text-x" /> University Info
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modern Stats Cards - Enhanced UI/UX */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Registered Courses */}
            <div className="group p-8 rounded-[30px] border-2 border-[#1c1c1c] bg-[#161616] ">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <BookOpen className="text-x" size={28} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline space-x-2 min-h-[50px]">
                    {isStatsLoading ? (
                      <span className="w-full flex justify-center">
                        <LoadingSplash />
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-white tracking-tight">
                          {stats.totalCourses}
                        </span>
                        <span className="text-white/50 text-base font-medium">courses</span>
                      </>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white/90 leading-relaxed">
                      Registered Courses
                    </p>
                    <div className="w-16 h-1 bg-gradient-to-r from-x to-transparent mt-3 group-hover:w-20 transition-all duration-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Attendance */}
            <div className="group p-8 rounded-[30px] border-2 border-[#1c1c1c] bg-[#161616] ">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <Activity className="text-x" size={28} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline space-x-2 min-h-[50px]">
                    {isStatsLoading ? (
                      <span className="w-full flex justify-center">
                        <LoadingSplash />
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-white tracking-tight">
                          {stats.avgAttendance}
                        </span>
                        <span className="text-white text-xl font-bold">%</span>
                      </>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white/90 leading-relaxed">
                      Average Attendance
                    </p>
                    <div className="w-16 h-1 bg-gradient-to-r from-x to-transparent mt-3 group-hover:w-20 transition-all duration-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current CGPA */}
            <div className="group p-8 rounded-[30px] border-2 border-[#1c1c1c] bg-[#161616] ">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <TrendingUp className="text-x" size={28} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline space-x-2 min-h-[50px]">
                    {isStatsLoading ? (
                      <span className="w-full flex justify-center">
                        <LoadingSplash />
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-white tracking-tight">
                          {stats.currentCGPA}
                        </span>
                      </>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white/90 leading-relaxed">
                      Current CGPA
                    </p>
                    <div className="w-16 h-1 bg-gradient-to-r from-x to-transparent mt-3 group-hover:w-20 transition-all duration-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Semesters */}
            <div className="group p-8 rounded-[30px] border-2 border-[#1c1c1c] bg-[#161616] ">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <Calendar className="text-x" size={28} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline space-x-2 min-h-[50px]">
                    {isStatsLoading ? (
                      <span className="w-full flex justify-center">
                        <LoadingSplash />
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-white tracking-tight">
                          {stats.totalSemesters}
                        </span>
                        <span className="text-white/50 text-base font-medium">sems</span>
                      </>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white/90 leading-relaxed">
                      Total Semesters
                    </p>
                    <div className="w-16 h-1 bg-gradient-to-r from-x to-transparent mt-3 group-hover:w-20 transition-all duration-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Warnings */}
            <div className="group p-8 rounded-[30px] border-2 border-[#1c1c1c] bg-[#161616] ">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <X className="text-x" size={28} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1 min-h-[50px]">
                    {isStatsLoading ? (
                      <span className="w-full flex justify-center">
                        <LoadingSplash />
                      </span>
                    ) : (
                      <span className="text-4xl font-bold text-white tracking-tight">
                        {stats.attendanceWarnings}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white/90 leading-relaxed">
                      Subjects &lt; 80%
                    </p>
                    <div className="w-16 h-1 bg-gradient-to-r from-x to-transparent mt-3 group-hover:w-20 transition-all duration-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout for Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Attendance Overview */}
            <div className="rounded-3xl border border-white/10 p-0 flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a1a1a] to-[#161616] rounded-t-3xl px-8 py-6 flex items-center gap-5 border-b border-white/10">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Activity className="text-x" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Current Attendance</h3>
                  <p className="text-base text-white/80">Track your progress across subjects</p>
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 max-h-[600px]">
                {isLoadingAttendance ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <LoadingSplash />
                    <p className="text-white/50 mt-4 text-lg">Loading attendance data...</p>
                  </div>
                ) : attendanceData && Object.keys(attendanceSummary).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(attendanceSummary).map(([id, data]) => {
                      const percentage = parseFloat(data.attendancePercentage);
                      let statusConfig;
                      
                      if (percentage >= 85) {
                        statusConfig = {
                          icon: <Check size={20} className="text-emerald-400" />,
                          progressColor: 'rgb(16,185,129)',
                          status: 'Excellent',
                          statusColor: 'text-emerald-400'
                        };
                      } else if (percentage >= 75) {
                        statusConfig = {
                          icon: <Activity size={20} className="text-amber-400" />,
                          progressColor: 'rgb(245,158,11)',
                          status: 'Warning',
                          statusColor: 'text-amber-400'
                        };
                      } else {
                        statusConfig = {
                           icon: <X size={20} className="text-red-400" />,
                          progressColor: 'rgb(225,29,72)',
                          status: 'Critical',
                          statusColor: 'text-red-400'
                        };
                      }

                      return (
                        <div 
                          key={id} 
                          className="p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 transition-all duration-300 border border-white/10 hover:border-white/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-[#161616] flex items-center justify-center border border-white/10">
                                {statusConfig.icon}
                              </div>
                              <div>
                                <h4 className="text-white font-bold text-base truncate max-w-[180px]" title={data.title}>
                                  {data.title}
                                </h4>
                                <span className={`text-xs font-semibold ${statusConfig.statusColor}`}>
                                  {statusConfig.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold text-white">{percentage}%</span>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                            <div 
                              className="h-full rounded-full transition-all duration-500 ease-out" 
                              style={{ 
                                width: `${percentage}%`, 
                                backgroundColor: statusConfig.progressColor 
                              }}
                            ></div>
                          </div>
                          
                          {/* Stats */}
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex gap-4">
                              <span className="text-emerald-400 font-semibold">
                                P: {data.presentCount}
                              </span>
                              <span className="text-red-400 font-semibold">
                                A: {data.absentCount}
                              </span>
                            </div>
                            <span className="text-white/50 font-medium">
                              Total: {data.totalLectures}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <Activity className="h-16 w-16 text-white/20 mb-4" />
                    <p className="text-white/50 text-base">No attendance data available</p>
                    <p className="text-white/30 text-sm mt-2">Data will appear once attendance records are loaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transcript Overview */}
            <div className="rounded-3xl border border-white/10 p-0 flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a1a1a] to-[#161616] rounded-t-3xl px-8 py-6 flex items-center gap-5 border-b border-white/10">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <FileText className="text-x" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Academic Transcript</h3>
                  <p className="text-base text-white/80">View your academic history</p>
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 max-h-[600px]">
                {isLoadingTranscript ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <LoadingSplash />
                    <p className="text-white/50 mt-4 text-lg">Loading transcript data...</p>
                  </div>
                ) : transcriptData && transcriptSummary.semesters && transcriptSummary.semesters.length > 0 ? (
                  <div className="space-y-4">
                    {transcriptSummary.semesters.map((semester, index) => {
                      const cgpa = parseFloat(semester.stats.cgpa || "0");
                      
                      let gradeConfig;
                      if (cgpa >= 3.5) {
                        gradeConfig = {
                          icon: <Award size={20} className="text-emerald-400" />,
                          bgColor: 'bg-emerald-500/10',
                          borderColor: 'border-emerald-500/20',
                          status: 'Excellent',
                          statusColor: 'text-emerald-400'
                        };
                      } else if (cgpa >= 3.0) {
                        gradeConfig = {
                          icon: <TrendingUp size={20} className="text-blue-400" />,
                          bgColor: 'bg-blue-500/10',
                          borderColor: 'border-blue-500/20',
                          status: 'Good',
                          statusColor: 'text-blue-400'
                        };
                      } else if (cgpa >= 2.5) {
                        gradeConfig = {
                          icon: <Activity size={20} className="text-amber-400" />,
                          bgColor: 'bg-amber-500/10',
                          borderColor: 'border-amber-500/20',
                          status: 'Average',
                          statusColor: 'text-amber-400'
                        };
                      } else {
                        gradeConfig = {
                          icon: <X size={20} className="text-red-400" />,
                          bgColor: 'bg-red-500/10',
                          borderColor: 'border-red-500/20',
                          status: 'Needs Improvement',
                          statusColor: 'text-red-400'
                        };
                      }

                      return (
                        <div 
                          key={index}
                          className={`p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 transition-all duration-300 border border-white/10 hover:border-white/20`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-[#161616] flex items-center justify-center border border-white/10">
                                {gradeConfig.icon}
                              </div>
                              <div>
                                <h4 className="text-white font-bold text-base">
                                  {semester.name}
                                </h4>
                                <span className={`text-xs font-semibold ${gradeConfig.statusColor}`}>
                                  {gradeConfig.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold text-white">{semester.stats.cgpa || "N/A"}</span>
                              <p className="text-xs text-white/50">CGPA</p>
                            </div>
                          </div>
                          
                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-white/60">SGPA:</span>
                              <span className="text-white font-semibold">{semester.stats.sgpa || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Courses:</span>
                              <span className="text-white font-semibold">{semester.courseCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Cr. Att:</span>
                              <span className="text-white font-semibold">{semester.stats.creditsAttempted || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Cr. Ernd:</span>
                              <span className="text-white font-semibold">{semester.stats.creditsEarned || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <FileText className="h-16 w-16 text-white/20 mb-4" />
                    <p className="text-white/50 text-base">No transcript data available</p>
                    <p className="text-white/30 text-sm mt-2">Data will appear once transcript records are loaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default HomePage;