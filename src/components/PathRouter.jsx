import React, { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import CourseRegistrationPage from "./pages/CourseRegistrationPage";
import AttendancePage from "./pages/AttendancePage";
import MarksPage from "./pages/MarksPage";
import MarksPloReportPage from "./pages/MarksPloReportPage";
import TranscriptPage from "./pages/TranscriptPage";
import FeeChallanPage from "./pages/FeeChallanPage";
import FeeDetailsPage from "./pages/FeeDetailsPage";
import CourseFeedbackPage from "./pages/CourseFeedbackPage";
import RetakeExamPage from "./pages/RetakeExamPage";
import CourseWithdrawPage from "./pages/CourseWithdrawPage";
import GradeChangePage from "./pages/GradeChangePage";
import StudyPlanPage from "./pages/StudyPlanPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import SessionExpirePage from "./pages/SessionExpirePage";
import NotFoundPage from "./pages/NotFoundPage";

function PathRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    const checkSession = () => {
      const txt = (document.body?.innerText + document.title + document.querySelector("h1")?.innerText).toLowerCase();
      const isError = ["server error", "runtime error", "internal server error", "500"].some(err => txt.includes(err));

      setIsSessionExpired(isError);
      if (isError) {
        Object.assign(document.body.style, { backgroundColor: "black", backgroundImage: "none", fontFamily: "'Google Sans Flex', sans-serif" });
        document.body.removeAttribute("bgcolor");
        document.body.classList.add("!bg-black", "!overflow-hidden", "!font-sans");
        Array.from(document.body.children).forEach(c => {
          if (!["react-chrome-app", "SCRIPT", "LINK"].includes(c.id || c.tagName)) c.style.display = "none";
        });
      }
    };

    checkSession();
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [currentPath]);

  const renderComponent = () => {
    if (isSessionExpired) {
      return <SessionExpirePage />;
    }

    if (currentPath === "/" || currentPath.startsWith("/?dump=")) {
      return <HomePage />;
    }

    if (currentPath.includes("/Student/CourseRegistration")) {
      return <CourseRegistrationPage />;
    }

    if (currentPath.includes("/Student/StudentAttendance")) {
      return <AttendancePage />;
    }

    if (currentPath.includes("/Student/StudentMarks")) {
      return <MarksPage />;
    }

    if (currentPath.includes("/Student/StudentPloRpt")) {
      return <MarksPloReportPage />;
    }

    if (currentPath.includes("/Student/Transcript")) {
      return <TranscriptPage />;
    }

    if (currentPath.includes("/Student/Challan")) {
      return <FeeChallanPage />;
    }

    if (currentPath.includes("/ConsolidatedFeeReport")) {
      return <FeeDetailsPage />;
    }

    if (currentPath.includes("/Student/CourseFeedback")) {
      return <CourseFeedbackPage />;
    }

    if (currentPath.includes("/Student/RetakeRequest")) {
      return <RetakeExamPage />;
    }

    if (currentPath.includes("/Student/CourseWithdraw")) {
      return <CourseWithdrawPage />;
    }

    if (currentPath.includes("/Student/GradeChangeRequest")) {
      return <GradeChangePage />;
    }

    if (currentPath.includes("/Student/TentativeStudyPlan")) {
      return <StudyPlanPage />;
    }

    if (currentPath.includes("/Student/ChangePassword")) {
      return <ChangePasswordPage />;
    }

    return <NotFoundPage />;
  };

  return renderComponent();
}

export default PathRouter;
