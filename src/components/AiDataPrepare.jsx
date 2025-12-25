import React, { useEffect, useState, useCallback } from "react";
import {
  parseProfile,
  parseAttendance,
  parseMarks,
  parseStudyPlan,
} from "../utils/dataParsers";

const AiDataPrepare = ({ rawLinks }) => {
  const [syncedData, setSyncedData] = useState({
    attendance: null,
    marks: null,
    studyPlan: null,
    studentName: null,
    universityInfo: null,
  });

  const [processedLinks, setProcessedLinks] = useState({});

  useEffect(() => {
    if (!rawLinks || !Array.isArray(rawLinks)) return;

    const linkMap = {};
    rawLinks.forEach((l) => {
      const text = l.text.trim();
      if (text === "Home") linkMap.profile = l.href;
      if (text.includes("Attendance")) linkMap.attendance = l.href;
      if (text.includes("Marks") && !text.includes("PLO"))
        linkMap.marks = l.href;
      if (text.includes("Tentative Study Plan") || text.includes("Study Plan"))
        linkMap.studyPlan = l.href;
    });

    setProcessedLinks(linkMap);
  }, [rawLinks]);

  useEffect(() => {
    const permission = localStorage.getItem("superflex_ai_data_permission");
    if (permission !== "granted") return;

    try {
      const savedCtx = localStorage.getItem("superflex_ai_context");
      if (savedCtx) {
        const parsed = JSON.parse(savedCtx);
        setSyncedData({
          attendance: parsed.attendance,
          marks: parsed.marks,
          studyPlan: parsed.studyPlan,
          studentName: parsed.studentName,
          universityInfo: parsed.universityInfo,
        });

        const cleanedCtx = { ...parsed };
        delete cleanedCtx.feeHistory;
        delete cleanedCtx.studentCms;
        delete cleanedCtx.personalInfo;
        delete cleanedCtx.alerts;

        window.superflex_ai_context = {
          ...window.superflex_ai_context,
          ...cleanedCtx,
        };

        window.dispatchEvent(
          new CustomEvent("superflex-data-updated", {
            detail: { ...window.superflex_ai_context, isFromCache: true },
          }),
        );
      }
    } catch (e) {
      console.error("AiDataPrepare: Error loading context", e);
    }
  }, []);

  const updateContext = useCallback((newData) => {
    try {
      const existing = JSON.parse(
        localStorage.getItem("superflex_ai_context") || "{}",
      );
      const merged = {
        ...existing,
        ...newData,
        lastScanned: new Date().toISOString(),
      };

      localStorage.setItem("superflex_ai_context", JSON.stringify(merged));
      localStorage.setItem("superflex_last_scan_time", Date.now().toString());
      window.superflex_ai_context = merged;

      window.dispatchEvent(
        new CustomEvent("superflex-data-updated", { detail: merged }),
      );
    } catch (e) {
      console.error("Update Context Error", e);
    }
  }, []);

  const syncAll = useCallback(
    async (force = false) => {
      const permission = localStorage.getItem("superflex_ai_data_permission");
      if (permission !== "granted") {
        return;
      }

      if (!processedLinks || Object.keys(processedLinks).length === 0) return;

      if (force) {
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: true }),
        );
      }

      const newData = {};
      let hasUpdates = false;

      const fetchDoc = async (url) => {
        try {
          const res = await fetch(url);
          const html = await res.text();
          return new DOMParser().parseFromString(html, "text/html");
        } catch (e) {
          console.error(`Failed to fetch ${url}`, e);
          return null;
        }
      };

      const fetchQueue = [];

      if (processedLinks.profile) {
        fetchQueue.push(
          fetchDoc(processedLinks.profile).then((doc) => {
            if (doc) {
              const profileData = parseProfile(doc);
              if (profileData) {
                if (profileData.studentName)
                  newData.studentName = profileData.studentName;
                if (profileData.universityInfo)
                  newData.universityInfo = profileData.universityInfo;
                if (profileData.profileSections)
                  newData.profileSections = profileData.profileSections;
                hasUpdates = true;
              }
            }
          }),
        );
      }

      if (processedLinks.attendance) {
        fetchQueue.push(
          fetchDoc(processedLinks.attendance).then((doc) => {
            if (doc) {
              const attendanceData = parseAttendance(doc);
              if (attendanceData) {
                newData.attendance = attendanceData;
                hasUpdates = true;
              }
            }
          }),
        );
      }

      if (processedLinks.marks) {
        fetchQueue.push(
          fetchDoc(processedLinks.marks).then((doc) => {
            if (doc) {
              const marksData = parseMarks(doc);
              if (marksData) {
                newData.marks = marksData;
                hasUpdates = true;
              }
            }
          }),
        );
      }

      if (processedLinks.studyPlan) {
        fetchQueue.push(
          fetchDoc(processedLinks.studyPlan).then((doc) => {
            if (doc) {
              const planData = parseStudyPlan(doc);
              if (planData) {
                newData.studyPlan = planData;
                hasUpdates = true;
              }
            }
          }),
        );
      }

      await Promise.all(fetchQueue);

      if (hasUpdates) {
        setSyncedData((prev) => ({ ...prev, ...newData }));
        updateContext(newData);
      }

      if (force) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("superflex-scan-complete"));
          window.dispatchEvent(
            new CustomEvent("superflex-update-loading", { detail: false }),
          );
        }, 500);
      }
    },
    [processedLinks, updateContext],
  );

  useEffect(() => {
    const handleScanRequest = () => syncAll(true);
    window.addEventListener("superflex-trigger-scan", handleScanRequest);
    return () =>
      window.removeEventListener("superflex-trigger-scan", handleScanRequest);
  }, [syncAll]);

  useEffect(() => {
    if (Object.keys(processedLinks).length > 0) {
      const permission = localStorage.getItem("superflex_ai_data_permission");
      if (permission !== "granted") return;

      const lastScanned = localStorage.getItem("superflex_last_scan_time");

      if (!lastScanned) {
        syncAll(false);
      }
    }
  }, [processedLinks, syncAll]);

  useEffect(() => {
    const handlePermissionChange = (e) => {
      if (e.detail === "granted") {
        syncAll(false);
      } else if (e.detail === "denied") {
        localStorage.removeItem("superflex_ai_context");
        localStorage.removeItem("superflex_last_scan_time");
        setSyncedData({
          attendance: null,
          marks: null,
          studyPlan: null,
          studentName: null,
          universityInfo: null,
        });
        window.superflex_ai_context = {};
        window.dispatchEvent(
          new CustomEvent("superflex-data-updated", { detail: {} }),
        );
      }
    };
    window.addEventListener(
      "superflex-permission-updated",
      handlePermissionChange,
    );
    return () =>
      window.removeEventListener(
        "superflex-permission-updated",
        handlePermissionChange,
      );
  }, [syncAll]);

  return null;
};

export default AiDataPrepare;
