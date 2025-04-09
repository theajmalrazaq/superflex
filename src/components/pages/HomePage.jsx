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
  const [profileVisible, setProfileVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

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

  // Function to get a random welcome greeting
  const getWelcomeMessage = () => {
    const messages = [
      "Welcome back",
      "Hello again",
      "Great to see you",
      "Good day",
      "Let's get started",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

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

  const renderProfileSection = () => {
    if (!profileVisible) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 transition-all duration-300">
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl !border !border-white/10 w-full max-w-4xl">
          <div className="py-3 px-4 flex items-center justify-between !border-b !border-white/10">
            <h2 className="font-bold text-white text-lg">Student Profile</h2>
            <button
              onClick={() => setProfileVisible(false)}
              className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>

          <div className="flex h-[65vh]">
            {/* Profile Sidebar */}
            <div className="w-1/3 !border-r !border-white/10 px-4 py-4 bg-black flex flex-col">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="relative mb-3">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 p-[3px]">
                    <div className="h-full w-full rounded-full bg-black overflow-hidden flex items-center justify-center !border !border-white/10">
                      {personalInfo ? (
                        <img
                          src="/Login/GetImage"
                          alt="Student"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://ui-avatars.com/api/?name=Student&background=6366F1&color=fff";
                          }}
                        />
                      ) : (
                        <User className="h-12 w-12 text-white/70" />
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-500 rounded-full !border-2 !border-black"></div>
                </div>
                <h3 className="text-white text-lg font-bold">
                  {personalInfo?.["Name"] || "Student"}
                </h3>
                <p className="text-white/70 text-xs">
                  {universityInfo?.["Degree"] || "Student"}
                </p>
                <div className="mt-2 px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-white shadow-lg">
                  {universityInfo?.["Roll No"] || "N/A"}
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                    activeTab === "personal"
                      ? "bg-white/5 text-white font-medium"
                      : "text-white/70 hover:bg-white/5"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Personal</span>
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                    activeTab === "contact"
                      ? "bg-white/5 text-white font-medium"
                      : "text-white/70 hover:bg-white/5"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Contact</span>
                </button>
                <button
                  onClick={() => setActiveTab("family")}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                    activeTab === "family"
                      ? "bg-white/5 text-white font-medium"
                      : "text-white/70 hover:bg-white/5"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Family</span>
                </button>
                <button
                  onClick={() => setActiveTab("academic")}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                    activeTab === "academic"
                      ? "bg-white/5 text-white font-medium"
                      : "text-white/70 hover:bg-white/5"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Academic</span>
                </button>
              </nav>

              <div className="mt-auto">
                <div className="p-3 rounded-lg bg-black !border !border-white/10 text-center">
                  <p className="text-white/50 text-xs mb-1">Current Session</p>
                  <p className="text-white text-sm font-bold">
                    {universityInfo?.["Session"] || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="w-2/3 p-4 overflow-auto">
              {/* Personal Tab */}
              {activeTab === "personal" && (
                <div className="animate-fadeIn pb-2">
                  {/* Profile Header Card */}
                  <div className="relative rounded-xl overflow-hidden mb-5 bg-gradient-to-br from-gray-900 to-black">
                    {/* Cover Image/Gradient */}
                    <div className="h-28 w-full bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40"></div>

                    {/* Avatar & Basic Info */}
                    <div className="px-5 pb-5 -mt-14">
                      {/* Avatar */}
                      <div className="w-24 h-24 rounded-full border-4 border-black bg-black mb-3 relative">
                        {personalInfo ? (
                          <img
                            src="/Login/GetImage"
                            alt="Student"
                            className="h-full w-full object-cover rounded-full"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://ui-avatars.com/api/?name=Student&background=6366F1&color=fff";
                            }}
                          />
                        ) : (
                          <User className="h-12 w-12 text-white/70 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>

                      {/* Name & Username */}
                      <div className="space-y-0.5 mb-4">
                        <h3 className="text-xl font-bold text-white">
                          {personalInfo?.["Name"] || "Student"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-sm">
                            {universityInfo?.["Roll No"] || "Student ID"}
                          </span>
                          {universityInfo?.["Roll No"] && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/70">
                              <UserCheck className="w-3 h-3 mr-1" /> Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex gap-6 mt-2 pb-1 border-b border-white/10">
                        <div className="flex flex-col">
                          <span className="text-white font-bold">
                            {stats.totalCourses}
                          </span>
                          <span className="text-white/50 text-xs">Courses</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold">
                            {personalInfo?.["Gender"] || "N/A"}
                          </span>
                          <span className="text-white/50 text-xs">Gender</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold">
                            {stats.avgAttendance}%
                          </span>
                          <span className="text-white/50 text-xs">
                            Attendance
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info Cards */}
                  <div className="space-y-3">
                    {personalInfo &&
                      Object.entries(personalInfo).map(([key, value]) => {
                        if (key === "Name") return null; // Skip name as it's already shown above

                        // Select icon based on field type
                        const iconMap = {
                          "Father Name": (
                            <Users className="h-5 w-5 text-purple-400" />
                          ),
                          Gender: <User className="h-5 w-5 text-pink-400" />,
                          CNIC: (
                            <CreditCard className="h-5 w-5 text-amber-400" />
                          ),
                          "Date of Birth": (
                            <Cake className="h-5 w-5 text-orange-400" />
                          ),
                          Email: <Mail className="h-5 w-5 text-emerald-400" />,
                        };

                        const icon = iconMap[key] || (
                          <User className="h-5 w-5 text-blue-400" />
                        );

                        // Define a color class based on field type
                        const colorClass =
                          {
                            "Father Name":
                              "bg-purple-500/10 border-purple-500/20",
                            Gender: "bg-pink-500/10 border-pink-500/20",
                            CNIC: "bg-amber-500/10 border-amber-500/20",
                            "Date of Birth":
                              "bg-orange-500/10 border-orange-500/20",
                            Email: "bg-emerald-500/10 border-emerald-500/20",
                          }[key] || "bg-blue-500/10 border-blue-500/20";

                        return (
                          <div
                            key={key}
                            className={`p-4 rounded-xl border ${colorClass} hover:bg-white/5 transition-all duration-200 transform hover:translate-y-[-2px]`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-black/30">
                                {icon}
                              </div>
                              <div className="flex-1">
                                <p className="text-white/50 text-xs">{key}</p>
                                <p className="text-white font-medium truncate">
                                  {value || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {/* Account Info */}
                    <div className="p-4 rounded-xl border bg-indigo-500/10 border-indigo-500/20 hover:bg-white/5 transition-all duration-200 transform hover:translate-y-[-2px]">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-black/30">
                          <GraduationCap className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white/50 text-xs">
                            Academic Program
                          </p>
                          <p className="text-white font-medium">
                            {universityInfo?.["Degree"] || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="pl-13 ml-13">
                        <div className="flex items-center justify-between py-2 border-t border-white/5">
                          <span className="text-white/60 text-sm">Session</span>
                          <span className="text-white">
                            {universityInfo?.["Session"] || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-white/5">
                          <span className="text-white/60 text-sm">Section</span>
                          <span className="text-white">
                            {universityInfo?.["Section"] || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === "contact" && (
                <div className="animate-fadeIn">
                  <h4 className="text-white text-base font-bold mb-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    Contact Information
                  </h4>

                  <div className="space-y-4">
                    {/* Permanent Address */}
                    <div className="bg-black rounded-lg p-3 !border !border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
                          <Home className="h-3 w-3 text-white" />
                        </div>
                        <h5 className="text-white font-medium text-sm">
                          Permanent Address
                        </h5>
                      </div>

                      <div className="pl-2 !border-l !border-amber-500 ml-3">
                        <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                          {contactInfo?.permanent &&
                            Object.entries(contactInfo.permanent).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex items-center gap-2"
                                >
                                  <div className="h-6 w-6 rounded-lg bg-black flex items-center justify-center flex-shrink-0 !border !border-white/5">
                                    {key.includes("Phone") ? (
                                      <Phone className="h-3 w-3 text-amber-400" />
                                    ) : key.includes("Address") ? (
                                      <MapPin className="h-3 w-3 text-orange-400" />
                                    ) : (
                                      <Building className="h-3 w-3 text-amber-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-white/50 text-xs">
                                      {key}
                                    </p>
                                    <p className="text-white text-xs font-medium">
                                      {value || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Current Address */}
                    <div className="bg-black rounded-lg p-3 !border !border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Building className="h-3 w-3 text-white" />
                        </div>
                        <h5 className="text-white font-medium text-sm">
                          Current Address
                        </h5>
                      </div>

                      <div className="pl-2 !border-l !border-emerald-500 ml-3">
                        <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                          {contactInfo?.current &&
                            Object.entries(contactInfo.current).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex items-center gap-2"
                                >
                                  <div className="h-6 w-6 rounded-lg bg-black flex items-center justify-center flex-shrink-0 !border !border-white/5">
                                    {key.includes("Phone") ? (
                                      <Phone className="h-3 w-3 text-emerald-400" />
                                    ) : key.includes("Address") ? (
                                      <MapPin className="h-3 w-3 text-green-400" />
                                    ) : (
                                      <Building className="h-3 w-3 text-emerald-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-white/50 text-xs">
                                      {key}
                                    </p>
                                    <p className="text-white text-xs font-medium">
                                      {value || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Family Tab */}
              {activeTab === "family" && (
                <div className="animate-fadeIn">
                  <h4 className="text-white text-base font-bold mb-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    Family Members
                  </h4>

                  <div className="grid grid-cols-1 gap-2">
                    {familyInfo?.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 rounded-lg bg-black !border !border-white/10 hover:!border-slate-600 transition-all"
                      >
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mr-2">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white text-sm font-medium">
                                {member.name}
                              </p>
                              <p className="text-white/50 text-xs">
                                {member.relation}
                              </p>
                            </div>
                            {member.cnic !== "N/A" && (
                              <div className="bg-white/5 px-2 py-1 rounded-full text-xs text-white">
                                {member.cnic}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!familyInfo || familyInfo.length === 0) && (
                      <div className="text-center py-8 bg-black rounded-lg !border !border-white/10">
                        <Users className="h-12 w-12 text-white/20 mx-auto mb-2" />
                        <p className="text-white/50">
                          No family information available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Academic Tab */}
              {activeTab === "academic" && (
                <div className="animate-fadeIn">
                  <h4 className="text-white text-base font-bold mb-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center">
                      <GraduationCap className="h-3 w-3 text-white" />
                    </div>
                    Academic Information
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-black !border !border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="h-4 w-4 text-blue-400" />
                        <p className="text-white/60 text-xs font-medium">
                          Degree
                        </p>
                      </div>
                      <p className="text-white font-bold text-sm pl-6">
                        {universityInfo?.["Degree"] || "N/A"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black !border !border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <p className="text-white/60 text-xs font-medium">
                          Session
                        </p>
                      </div>
                      <p className="text-white font-bold text-sm pl-6">
                        {universityInfo?.["Session"] || "N/A"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black !border !border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-blue-400" />
                        <p className="text-white/60 text-xs font-medium">
                          Section
                        </p>
                      </div>
                      <p className="text-white font-bold text-sm pl-6">
                        {universityInfo?.["Section"] || "N/A"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black !border !border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <UserCheck className="h-4 w-4 text-blue-400" />
                        <p className="text-white/60 text-xs font-medium">
                          Roll Number
                        </p>
                      </div>
                      <p className="text-white font-bold text-sm pl-6">
                        {universityInfo?.["Roll No"] || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
      {renderProfileSection()}
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className=" bg-black rounded-3xl shadow-md p-4">
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
                    {getWelcomeMessage()} {personalInfo?.["Name"] || "Student"}{" "}
                    👋
                  </h1>
                  <p className="text-white/70">
                    Here's what's happening with your attendance
                  </p>
                </div>
              </div>

              <button
                onClick={() => setProfileVisible(true)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-lg !border !border-white/10"
              >
                <User className="h-4 w-4 text-white/70" />
                <span className="text-sm text-white/70">Profile</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Registered Courses */}
              <div className="bg-x p-4 rounded-2xl !border !border-white/10">
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
              <div className="bg-x p-4 rounded-2xl !border !border-white/10">
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
              <div className="bg-x p-4 rounded-2xl !border !border-white/10">
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
              <div className="bg-x p-4 rounded-2xl !border !border-white/10">
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
                <div className="bg-black rounded-3xl !border !border-white/10 p-6 h-full overflow-hidden">
                  {isLoadingAttendance ? (
                    <div className="flex flex-col justify-center items-center py-16">
                      <div className="w-16 h-16 rounded-full !border-4 !border-gray-800 !border-t-x animate-spin mb-6"></div>
                      <span className="text-gray-300 font-medium">
                        Loading attendance data...
                      </span>
                    </div>
                  ) : attendanceData &&
                    Object.keys(attendanceSummary).length > 0 ? (
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black">
                      <table className="w-full">
                        <thead>
                          <tr className="text-gray-400 text-left !border-b !border-gray-800">
                            <th className="px-4 py-3 font-medium">Course</th>
                            <th className="px-4 py-3 font-medium">Present</th>
                            <th className="px-4 py-3 font-medium">Absent</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {Object.entries(attendanceSummary).map(
                            ([id, data]) => {
                              const percentage = parseFloat(
                                data.attendancePercentage
                              );

                              return (
                                <tr
                                  key={id}
                                  className="hover:bg-slate-800/60 transition-colors"
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
                            }
                          )}
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
                <div className="bg-black rounded-3xl !border !border-white/10 p-6 h-full overflow-hidden flex flex-col">
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
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
                                <Calendar
                                  size={16}
                                  className="text-amber-400"
                                />
                              );
                              break;
                            case "Department":
                              icon = (
                                <Building
                                  size={16}
                                  className="text-purple-400"
                                />
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

                  {/* University badge at bottom */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/50">University ID</div>
                      <div className="bg-white/5 rounded-full px-3 py-1 text-xs font-medium text-white">
                        {universityInfo?.["Roll No"] || "N/A"}
                      </div>
                    </div>
                  </div>
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
