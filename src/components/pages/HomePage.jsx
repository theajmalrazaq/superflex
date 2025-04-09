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
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl !border !border-white/10 w-full max-w-md relative">
          <div className="py-3 px-4 flex items-center justify-between !border-b !border-white/10">
            <h2 className="font-bold text-white text-lg">
              {activePopup === "personal" && "Personal Information"}
              {activePopup === "contact" && "Contact Information"}
              {activePopup === "family" && "Family Information"}
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
                  Welcome to SuperFlex By Ajmal Razaq Bhatti
                </p>

                {/* Profile Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => setActivePopup("personal")}
                    className="flex items-center gap-1.5 bg-black  transition-colors px-3 py-1.5 rounded-lg !border !border-white/10 text-sm text-white"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Personal</span>
                  </button>

                  <button
                    onClick={() => setActivePopup("contact")}
                    className="flex items-center gap-1.5 bg-black  transition-colors px-3 py-1.5 rounded-lg !border !border-white/10 text-sm text-white"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Contact</span>
                  </button>

                  <button
                    onClick={() => setActivePopup("family")}
                    className="flex items-center gap-1.5 bg-black  transition-colors px-3 py-1.5 rounded-lg !border !border-white/10 text-sm text-white"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Family</span>
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
                                      className={`h-full rounded-full ${
                                        percentage >= 85
                                          ? "bg-emerald-500"
                                          : percentage >= 75
                                          ? "bg-amber-500"
                                          : "bg-rose-500"
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span
                                    className={`text-xs font-medium ${
                                      percentage >= 85
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
