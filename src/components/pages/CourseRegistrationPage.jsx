import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";
import { LoadingSpinner } from "../LoadingOverlay";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Info,
  Layers,
  AlertTriangle,
} from "lucide-react";
import NotificationBanner from "../NotificationBanner";
import PageHeader from "../PageHeader";
import StatsCard from "../StatsCard";

function CourseRegistrationPage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    // Notify loading start
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const parseData = () => {
      try {
        const root = document.querySelector(
          ".m-grid.m-grid--hor.m-grid--root.m-page",
        );
        if (!root) {
            setLoading(false);
            window.dispatchEvent(
                new CustomEvent("superflex-update-loading", { detail: false }),
            );
            return;
        }

        // Parse Alerts
        const alertList = [];
        root.querySelectorAll(".m-alert, .alert").forEach(alert => {
          if (alert.style.display === "none" || alert.id === "DataErrormsgdiv" || alert.closest(".modal")) return;

          const textContainer = alert.querySelector(".m-alert__text") || alert;
          const clone = textContainer.cloneNode(true);
          // Remove standard UI elements that shouldn't be in the message
          clone.querySelectorAll(".m-alert__close, button, a, strong, .m-alert__icon").forEach(el => el.remove());
          
          let message = clone.textContent
            .replace(/Alert!/gi, "")
            .replace(/Close/gi, "")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          if (message && message.length > 3) {
              const type = alert.classList.contains("alert-danger") || alert.classList.contains("m-alert--outline-danger") ? "error" : "info";
              alertList.push({ type, message });
          }
        });
        setAlerts(alertList);
        const parsedTables = [];
        const rawTables = root.querySelectorAll("table");
        
        rawTables.forEach((table) => {
            const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim());
            const rows = [];
            table.querySelectorAll("tbody tr").forEach(tr => {
                const cells = Array.from(tr.querySelectorAll("td")).map(td => td.innerHTML); // Keep innerHTML for links/buttons
                if (cells.length > 0) {
                    rows.push(cells);
                }
            });

            // Try to find a title for the table (often in a preceding h3/h4 or portlet head)
            let title = "Course List";
            const portlet = table.closest(".m-portlet");
            if (portlet) {
                const headText = portlet.querySelector(".m-portlet__head-text");
                if (headText) title = headText.textContent.trim();
            }

            if (rows.length > 0) {
                parsedTables.push({ title, headers, rows });
            }
        });
        setTables(parsedTables);

        // Hide original content
        root.style.display = "none";
        
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      } catch (e) {
        console.error("Course Registration Parsing Error", e);
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      }
    };

    parseData();
  }, []);

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-6 md:p-8 space-y-8">
        <PageHeader
          title="Course Registration"
          subtitle="Manage your semester course enrollments"
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Notifications */}
            <NotificationBanner alerts={alerts} />

            {/* Tables Section */}
            {tables.length > 0 ? (
              tables.map((table, tIdx) => (
                <div key={tIdx} className="bg-zinc-900/40 rounded-[2.5rem] p-8 backdrop-blur-xl border border-white/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-[#a098ff]/10 rounded-xl text-[#a098ff]">
                        <Layers size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{table.title}</h3>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/10">
                                {table.headers.map((h, i) => (
                                    <th key={i} className="text-left py-4 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-white/5 transition-colors group">
                                    {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="py-4 px-4 text-sm text-zinc-300 group-hover:text-white transition-colors">
                                            {/* Render HTML content safely since it might contain buttons/links */}
                                            <div dangerouslySetInnerHTML={{ __html: cell }} 
                                                 className="[&>a]:text-[#a098ff] [&>a]:hover:underline [&>button]:bg-[#a098ff] [&>button]:text-white [&>button]:px-3 [&>button]:py-1 [&>button]:rounded-lg [&>button]:text-xs [&>button]:font-bold" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
                !loading && alerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <div className="p-6 rounded-full bg-zinc-800/50 mb-4">
                            <BookOpen size={40} className="text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-500">No Information Available</h3>
                        <p className="text-zinc-600 mt-2">Registration might be closed or data is unavailable.</p>
                    </div>
                )
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default CourseRegistrationPage;
