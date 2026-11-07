import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { AssessmentView } from "../../src/pages/MarksPage";
import { processCourseMarks } from "../../src/utils/marksProcessor";

const course = {
  id: "CS1001",
  title: "Programming",
  sections: [
    {
      id: "quizzes",
      title: "Quizzes",
      weight: 10,
      rows: [
        { title: "Quiz 1", weight: 2, obtained: 8, total: 10, avg: 5, min: 0, max: 10, stdDev: 2 },
        {
          title: "Quiz 2",
          weight: 8,
          obtained: 10,
          total: 20,
          avg: 16,
          min: 0,
          max: 20,
          stdDev: 4,
        },
      ],
    },
    {
      id: "labs",
      title: "Labs",
      weight: 5,
      rows: [
        { title: "Lab 1", weight: 5, obtained: 7, total: 10, avg: 6, min: 0, max: 10, stdDev: 2 },
      ],
    },
  ],
};

function renderSections(value: ReturnType<typeof processCourseMarks>) {
  return value.sections.map((section) =>
    renderToStaticMarkup(
      <AssessmentView
        section={section}
        course={value}
        courseId={value.id}
        markedItems={new Set()}
        onUpdate={vi.fn()}
        onToggleMark={vi.fn()}
        onBestOf={vi.fn()}
        onReset={vi.fn()}
        isSimulationMode={Boolean(value.simulationMode)}
        pendingUpdates={null}
      />,
    ),
  );
}

it("shows weighted class averages for every section and Grand Total", () => {
  const markup = renderSections(processCourseMarks(course));
  for (const section of markup) expect(section).toContain("Weighted avg");
  expect(markup[0]).toContain(">~7.40<");
  expect(markup[1]).toContain(">~3.00<");
  expect(markup[2]).toContain("Grand Total Marks");
  expect(markup[2]).toContain(">~10.40<");
});

it("shows recalculated section and overall averages after a best-of simulation", () => {
  const simulated = processCourseMarks({
    ...course,
    simulationMode: true,
    sections: [
      {
        ...course.sections[0],
        itemLimit: 1,
        rows: course.sections[0].rows.map((row) => ({ ...row, weight: 10 })),
      },
      course.sections[1],
    ],
  });
  const markup = renderSections(simulated);
  expect(markup[0]).toContain(">~5.00<");
  expect(markup[1]).toContain(">~3.00<");
  expect(markup[2]).toContain(">~8.00<");
});
