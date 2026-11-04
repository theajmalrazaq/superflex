import React, { useEffect, useState } from "react";
import PageLayout from "../components/layouts/PageLayout";
import { BookOpen, Layers } from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import { LoadingSpinner } from "../components/ui/LoadingOverlay";

function CourseRegistrationPage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: true }));

    const parseData = () => {
      try {
        const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
        if (!root) {
          setLoading(false);
          window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
          return;
        }

        const alertList = [];
        root.querySelectorAll(".m-alert, .alert").forEach((alert) => {
          if (
            alert.style.display === "none" ||
            alert.id === "DataErrormsgdiv" ||
            alert.closest(".modal")
          )
            return;

          const textContainer = alert.querySelector(".m-alert__text") || alert;
          const clone = textContainer.cloneNode(true);

          clone
            .querySelectorAll(".m-alert__close, button, a, strong, .m-alert__icon")
            .forEach((el) => el.remove());

          let message = clone.textContent
            .replace(/Alert!/gi, "")
            .replace(/Close/gi, "")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          if (message && message.length > 3) {
            const type =
              alert.classList.contains("alert-danger") ||
              alert.classList.contains("m-alert--outline-danger")
                ? "error"
                : "info";
            alertList.push({ type, message });
          }
        });
        setAlerts(alertList);
        const parsedTables = [];
        const rawTables = root.querySelectorAll("table");

        rawTables.forEach((table) => {
          const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
            th.textContent.trim(),
          );
          const rows = [];
          table.querySelectorAll("tbody tr").forEach((tr) => {
            const cells = Array.from(tr.querySelectorAll("td")).map((td) => td.innerHTML);
            if (cells.length > 0) {
              rows.push(cells);
            }
          });

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

        root.style.display = "none";

        setLoading(false);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
      } catch (e) {
        console.error("Course Registration Parsing Error", e);
        setLoading(false);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
      }
    };

    parseData();
  }, []);

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="mx-auto w-full max-w-[1600px] space-y-7">
        <header className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#230052]/70 dark:text-[#a098ff]">Academics</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#101010] dark:text-[#f5f6fb] sm:text-4xl">Course Registration</h1>
          <p className="text-sm text-[#626262] dark:text-[#c4cad6]">Manage your semester course enrollments.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6">
            {tables.length > 0 ? (
              <>
                <NotificationBanner alerts={alerts} />
                {tables.map((table, tIdx) => (
                  <div
                    key={tIdx}
                    className="rounded-[32px] border border-black/[0.06] bg-white p-5 text-[#101010] shadow-none dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:p-7 xl:p-8"
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]">
                        <Layers size={21} />
                      </div>
                      <h2 className="text-xl font-bold tracking-tight">{table.title}</h2>
                    </div>

                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="border-b border-black/[0.08] dark:border-white/[0.12]">
                            {table.headers.map((h, i) => (
                              <th
                                key={i}
                                className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-foreground/50"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.08]">
                          {table.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="group transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"
                            >
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="px-4 py-4 text-sm text-foreground/70 transition-colors group-hover:text-foreground"
                                >
                                  {}
                                  <div
                                    dangerouslySetInnerHTML={{ __html: cell }}
                                    className="[&>a]:font-semibold [&>a]:text-accent [&>a]:hover:underline [&>button]:rounded-full [&>button]:bg-[#230052] [&>button]:px-3 [&>button]:py-1 [&>button]:text-xs [&>button]:font-bold [&>button]:text-white dark:[&>button]:bg-[#a098ff] dark:[&>button]:text-[#0a192f]"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <section className="flex min-h-[260px] flex-col items-center justify-center rounded-[32px] border border-black/[0.06] bg-white px-6 py-12 text-center dark:border-white/[0.14] dark:bg-black sm:min-h-[320px]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]">
                  <BookOpen size={25} />
                </div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#230052]/70 dark:text-[#a098ff]">Registration status</p>
                <h2 className="text-xl font-bold tracking-tight text-[#101010] dark:text-[#f5f6fb] sm:text-2xl">Course registration is not active</h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#626262] dark:text-[#c4cad6]">
                  {alerts[0]?.message || "Registration may be closed right now. Course options will appear here when enrollment opens."}
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default CourseRegistrationPage;
