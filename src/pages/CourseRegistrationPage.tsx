import React, { useEffect, useState } from "react";
import PageLayout from "../components/layouts/PageLayout";
import { BookOpen, Layers } from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import { PageSkeleton } from "../components/ui/Skeleton";
import { parseCourseRegistrationPage } from "../parsers/courseRegistration";
import { findFlexPageRoot } from "../parsers/dom";

function CourseRegistrationPage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const parseData = () => {
      try {
        const root = findFlexPageRoot(document);
        if (!root) {
          setLoading(false);
          return;
        }

        const parsed = parseCourseRegistrationPage(root);
        setAlerts(parsed.alerts);
        setTables(parsed.tables);

        root.style.display = "none";

        setLoading(false);
      } catch (e) {
        console.error("Course Registration Parsing Error", e);
        setLoading(false);
      }
    };

    parseData();
  }, []);

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="mx-auto w-full max-w-[1600px] space-y-3.5 sm:space-y-7">
        <header className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/90 sm:text-[10px] sm:font-bold sm:tracking-[0.16em] sm:text-white/80">
            Academics
          </p>
          <h1 className="text-[30px] font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl sm:font-bold sm:tracking-tight">
            Course Registration
          </h1>
          <p className="text-xs text-white/85 sm:text-sm">
            Choose your fighters. Naya semester, naye subjects, same old trauma.
          </p>
        </header>

        {loading ? (
          <PageSkeleton
            label="Loading course registration"
            cards={0}
            rows={7}
            showTabs={false}
            showHeader={false}
          />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {tables.length > 0 ? (
              <>
                <NotificationBanner alerts={alerts} />
                {tables.map((table, tIdx) => (
                  <div
                    key={tIdx}
                    className="rounded-2xl border border-black/[0.06] bg-white p-3.5 text-[#101010] shadow-none dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:rounded-[32px] sm:p-7 xl:p-8"
                  >
                    <div className="mb-4 flex items-center gap-2.5 sm:mb-6 sm:gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:h-12 sm:w-12 sm:rounded-2xl">
                        <Layers size={18} className="sm:h-[21px] sm:w-[21px]" />
                      </div>
                      <h2 className="text-base font-bold tracking-tight sm:text-xl">
                        {table.title}
                      </h2>
                    </div>

                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="sf-data-table w-full min-w-[800px]">
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
                                    className="[&>a]:font-semibold [&>a]:text-accent [&>a]:hover:underline [&>button]:rounded-full [&>button]:bg-[#230052] [&>button]:px-3 [&>button]:py-1 [&>button]:text-xs [&>button]:font-bold [&>button]:text-white dark:[&>button]:bg-white dark:[&>button]:text-[#0a192f]"
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
              <section className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-black/[0.06] bg-white px-5 py-8 text-center dark:border-white/[0.14] dark:bg-black sm:min-h-[320px] sm:rounded-[32px] sm:px-6 sm:py-12">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
                  <BookOpen size={25} />
                </div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#230052]/70 dark:text-white">
                  Registration status
                </p>
                <h2 className="text-xl font-bold tracking-tight text-[#101010] dark:text-[#f5f6fb] sm:text-2xl">
                  Registration Closed
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#626262] dark:text-[#c4cad6]">
                  {alerts[0]?.message ||
                    "The registration window is closed. Registrar ka mood badalne ka wait karo."}
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
