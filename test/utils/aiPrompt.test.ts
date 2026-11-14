import { describe, expect, it } from "vitest";
import { buildAcademicMarkdown, buildGeminiPayload } from "../../src/utils/aiPrompt";

describe("aiPrompt academic context and calculations", () => {
  const sampleTranscript = [
    {
      title: "Fall 2023",
      summary: { crRegistered: 16, crEarned: 16, sgpa: 2.58, cgpa: 2.58 },
      courses: [
        { code: "CS1002", name: "Programming Fundamentals", crHrs: 3, grade: "C+", points: 6.99 },
        { code: "MT1003", name: "Calculus", crHrs: 3, grade: "C", points: 6.0 },
      ],
    },
    {
      title: "Summer 2026",
      summary: { crRegistered: 96, crEarned: 95, sgpa: 1.67, cgpa: 2.36 },
      courses: [
        { code: "AI2002", name: "Artificial Intelligence", crHrs: 3, grade: "C", points: 6.0 },
        { code: "CS3005", name: "Theory of Automata", crHrs: 3, grade: "D+", points: 3.99 },
      ],
    },
    {
      title: "Fall 2026",
      summary: { crRegistered: 114, crEarned: 95, sgpa: 0, cgpa: 2.36 },
      courses: [
        { code: "CS4031", name: "Compiler Construction", crHrs: 3, grade: "I", points: 0 },
        { code: "CS4001", name: "Professional Practices", crHrs: 3, grade: "I", points: 0 },
      ],
    },
  ];

  const sampleStudyPlan = [
    {
      title: "Semester 1",
      crHrs: 6,
      courses: [
        { code: "CS1002", title: "Programming Fundamentals", crHrs: 3, type: "Core" },
        { code: "MT1003", title: "Calculus", crHrs: 3, type: "Core" },
      ],
    },
    {
      title: "Semester 7",
      crHrs: 6,
      courses: [
        { code: "CS4031", title: "Compiler Construction", crHrs: 3, type: "Core" },
        { code: "CS4001", title: "Professional Practices", crHrs: 3, type: "Core" },
      ],
    },
    {
      title: "Semester 8",
      crHrs: 6,
      courses: [
        { code: "CS4092", title: "Final Year Project - II", crHrs: 3, type: "Core" },
        { code: "MG4001", title: "Entrepreneurship", crHrs: 3, type: "Core" },
      ],
    },
  ];

  it("includes official academic standing summary with precalculated quality points", () => {
    const md = buildAcademicMarkdown(
      { transcript: sampleTranscript as any },
      { question: "how can i get 2.5 cgpa" },
    );

    expect(md).toContain("Official Academic Standing Summary");
    expect(md).toContain("**Current Cumulative CGPA:** 2.36");
    expect(md).toContain("**Total Credits Earned:** 95");
    expect(md).toContain("**Total Credits Registered:** 114");
    expect(md).toContain("224.20"); // 2.36 * 95
  });

  it("renders structured study plan cross-referenced with transcript", () => {
    const md = buildAcademicMarkdown(
      { transcript: sampleTranscript as any, studyPlan: sampleStudyPlan },
      { question: "what are my upcoming courses" },
    );

    expect(md).toContain("Degree Progress & Study Plan Summary");
    expect(md).toContain("Semester 1 (6 Cr Hrs) — [Completed]");
    expect(md).toContain("Semester 7 (6 Cr Hrs) — [Current / In Progress]");
    expect(md).toContain("Semester 8 (6 Cr Hrs) — [Upcoming]");
    expect(md).toContain("**CS4092: Final Year Project - II** (3 Cr Hr, Core) — [Upcoming / Planned]");
    expect(md).toContain(
      "**CS4031: Compiler Construction** (3 Cr Hr, Core) — [Currently Enrolled / In Progress]",
    );
  });

  it("instructs Gemini with exact CGPA target formulas and sanity checks", () => {
    const payload = buildGeminiPayload({
      question: "how can i get 2.5 cgpa",
      dataContext: { transcript: sampleTranscript as any, studyPlan: sampleStudyPlan },
    });

    const sysText = payload.system_instruction.parts[0].text;
    expect(sysText).toContain("Rigorous CGPA, SGPA & Target GPA Calculations");
    expect(sysText).toContain("Target Total Quality Points Needed = Target CGPA × Total Future Credits");
    expect(sysText).toContain("Required SGPA = Quality Points Needed / New Credits");
    expect(sysText).toContain("MATHEMATICAL SANITY CHECK: To RAISE a CGPA");
    expect(sysText).toContain("Tentative Study Plan");
  });
});
