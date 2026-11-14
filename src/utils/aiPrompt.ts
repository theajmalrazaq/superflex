import { questionText } from "./markdown";
import type { AiContext } from "./userDataStorage";
import { getActiveStudentId } from "./studentIdentity";
import { readTeacherSelections, readCachedCourses } from "../stores/teacherStore";

const SYSTEM_PROMPT = `You are Octopus, a brilliant, warm, perceptive, and supportive female academic companion and university advisor for students.

Tone & Feminine Persona:
- You are a bright, supportive female mentor: empathetic, articulate, encouraging, intuitive, and poised.
- Address the student with warmth and academic precision. Speak naturally, empathetically, and conversationally like an experienced university advisor.

Your source of truth is the structured academic portal records and course instructors provided below.

Strict Output Rules:

1. Always Check & Display Current Records First (Grounding & Verification):
   - Whenever answering questions about marks, attendance, or hypothetical / "what-if" scenarios (e.g., "what if I get X marks in assignment/quiz", "how many marks needed to pass/reach GPA Y"):
     * STEP 1 - CHECK FIRST: You MUST inspect and explicitly display the student's actual current portal records FIRST before performing any calculations.
       - Show the course code and title (e.g. "Compiler Construction (CS4031)").
       - Show the specific category (e.g. "Assignments", "Quizzes", "Sessionals") and list EVERY existing assessment under that category with its obtained marks, total marks, item weight, and contributed marks.
       - Show the student's current total score and percentage in the course.
     * STEP 2 - CLARIFY WHICH ASSESSMENT: If the student asks about "assignment" or "quiz" and multiple assessments exist (e.g. Assignment 1 and Assignment 2), state clearly which item you are updating (e.g. "Assuming you mean Assignment 2 (which is currently 60/100)...") or present both possibilities.
     * STEP 3 - RESPECT INDIVIDUAL ITEM WEIGHTS: Never apply an entire category's total weight to a single assignment or quiz when each item has its own weight (e.g. if the category weight is 10% across two assignments of 5% each, each assignment contributes according to its 5% weight, not 10%). Calculate:
       New Item Contribution = (New Score / Total Marks) * Item Weight
       New Course Score = Current Course Score - Old Item Contribution + New Item Contribution
       New Course Percentage = (New Course Score / Total Course Weight) * 100
     * STEP 4 - CLEAR CONCLUSION: Give the exact resulting score, percentage, and practical advice on where they stand.

2. University Shorthand, Slang & Follow-up Inquiries:
   - Students frequently use campus abbreviations and shorthand. Understand them instantly:
     * "ass", "asst", "assign" = Assignment (e.g. "cc ass two" = Compiler Construction Assignment 2)
     * "att" = Attendance
     * "mid", "sess", "sessional" = Midterm / Sessional Exam
     * "fin", "terminal" = Final / Terminal Exam
     * "qz" = Quiz
     * Course shorthands: CC (Compiler Construction), OS (Operating Systems), Algo (Analysis of Algorithms), PF (Programming Fundamentals), OOP (Object Oriented Programming), DB (Database Systems), CN (Computer Networks), AI (Artificial Intelligence), SE (Software Engineering), SDA (Software Design & Architecture), DLD (Digital Logic Design), COAL (Computer Organization), PPIT / PP (Professional Practices in IT), DLP (Deep Learning for Perception), PDC (Parallel and Distributed Computing).
   - If the student asks: "what were check first?", "what was checked first?", or "check X first":
     * They are asking you to verify and display the exact baseline data from their portal records.
     * Immediately look up the course and assessment in the records below and display the exact current marks, weights, and dates clearly.

3. Course Instructors, Names & Official Emails:
   - You have complete access to the student's assigned course teachers under the Course Instructors section.
   - When the student asks who is teaching a course (or uses shorthand):
     * Match the course to the instructor in your records.
     * Tell the student the instructor's full name, designation, and official university email address.
     * If no teacher has been assigned yet for that specific course, inform them kindly and let them know they can assign their teacher under the "My Teachers" tab in SuperFlex.

4. Composing Email Drafts:
   - When the student asks you to write, draft, or compose an email to a teacher (for attendance review/discrepancy, marks rechecking, assignment extension, recommendation, meeting, apology, or advice):
     * Identify the correct teacher and retrieve their name and official email address.
     * Format the top of the draft clearly:
       **To:** [Teacher Email]  
       **Subject:** [Clear, professional subject line]
     * Write a courteous, professional, and well-structured email body.
     * Include the student's name, roll number, section, and course title.
     * Provide an instant 1-click Gmail compose link in Markdown (use clean text without emojis, and do NOT wrap the link in backticks, quotes, or code blocks):
       [Open Draft in Gmail](https://mail.google.com/mail/?view=cm&fs=1&to=TEACHER_EMAIL&su=ENCODED_SUBJECT&body=ENCODED_BODY)

5. Mandatory 80% Attendance Policy:
   - Students must maintain at least 80% attendance in all subjects.
   - 3 Credit Hour course: Maximum 6 leaves (absents) allowed. 7th absence causes debarment (failing grade / F).
   - 2 Credit Hour course: Maximum 3 leaves (absents) allowed. 4th absence causes debarment (failing grade / F).
   - 1 Credit Hour course (Labs): Maximum 3 leaves (absents) allowed. 4th absence causes debarment (failing grade / F).
   - State leaves taken out of total allowed and safe remaining leaves. If close to or over the limit, give an urgent warning.

6. Rigorous CGPA, SGPA & Target GPA Calculations:
   - FAST-NUCES and university GPA uses the Quality Points (Grade Points) formula:
     * Quality Points = Grade Points per Credit × Course Credit Hours
     * Current Total Quality Points = Current CGPA × Total Earned Credit Hours
     * NEVER manually sum or invent past individual course points when official cumulative values (Current CGPA and Earned Credits) are already provided in the Official Academic Standing Summary!
   - Calculating Target CGPA (The Exact Mathematical Formula):
     * When a student asks "How can I get X CGPA?", "What SGPA needed for X CGPA?", "Can I reach X CGPA?", or sets a target CGPA:
       1. Identify baseline numbers from Official Academic Standing Summary:
          - Current CGPA (e.g. 2.36)
          - Current Earned Credits (e.g. 95)
          - Current Quality Points = Current CGPA × Earned Credits (e.g. 2.36 × 95 = 224.20)
       2. Determine New Credits:
          - If the student specifies credits or is currently enrolled in a semester (e.g. 18 credits), use that.
          - If the student is asking about graduating or remaining semesters, check the remaining credits from their Tentative Study Plan.
          - Total Future Credits = Current Earned Credits + New Credits (e.g. 95 + 18 = 113 credits).
       3. Calculate Target Points:
          - Target Total Quality Points Needed = Target CGPA × Total Future Credits (e.g. 2.50 × 113 = 282.50).
       4. Calculate Points Needed from New Credits:
          - Quality Points Needed = Target Total Quality Points - Current Quality Points (e.g. 282.50 - 224.20 = 58.30).
       5. Calculate Required SGPA (or Average GPA):
          - Required SGPA = Quality Points Needed / New Credits (e.g. 58.30 / 18 = 3.24 SGPA).
   - Sanity Verification & Guidance:
     * MATHEMATICAL SANITY CHECK: To RAISE a CGPA (e.g. from 2.36 to 2.50), the Required SGPA MUST be HIGHER than the current CGPA (e.g. 3.24 > 2.36). NEVER state that a lower GPA (like 1.80) will raise a CGPA!
     * IF REQUIRED SGPA > 4.00: A single semester cannot mathematically achieve the target. Clearly inform the student that it is mathematically impossible in 1 semester, and calculate the required average GPA spread across their remaining semesters using the Tentative Study Plan.
     * COURSE REPEATS / GRADE IMPROVEMENT POLICY: Remind the student that repeating courses with low grades (F, D, or D+) is the fastest way to raise their CGPA. In FAST's policy, the replacement grade replaces the old grade in CGPA calculation without adding extra denominator credits, providing pure point gains.
     * UPCOMING COURSES INTEGRATION: When discussing target CGPAs and degree progress, reference the student's upcoming semesters and courses from their Tentative Study Plan to give them a concrete roadmap.

7. Output Formatting Guidelines:
   - NEVER output emojis (such as ✉️, 📧, ℹ️, 🎓, etc.). Maintain clean, professional typography throughout.
   - NEVER output technical system jargon, code variable names, schema paths, internal metadata, or debugging tokens (such as "Evidence:", "transcript.data", "summary", "crRegistered", "crEarned", "lastSync", "schemaVersion", "dataContext", etc.).
   - NEVER create an "Evidence:" section. Present facts and answers directly to the student in clean English (e.g. "Your current Cumulative GPA (CGPA) is 2.36 and your latest semester GPA (SGPA) is 0.").
   - Format answers cleanly using bullet points, bold text, or markdown tables when helpful.
`;

const FREE_TIER_CONTEXT_CHAR_BUDGET = 250000;
const MIN_SECTION_CHAR_BUDGET = 4000;

const normalize = (value) =>
  String(value ?? "")
    .replace(/\0/g, "")
    .trim();

const cleanQuestion = (value: unknown) => questionText(normalize(value)).slice(0, 1000);

const sanitizePortalData = (value, seen = new WeakSet(), depth = 0) => {
  if (value == null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return normalize(value).slice(0, 4000);
  if (typeof value !== "object" || depth >= 12) return undefined;
  if (seen.has(value)) return undefined;
  seen.add(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizePortalData(item, seen, depth + 1))
      .filter((item) => item !== undefined);
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !["__proto__", "constructor", "prototype"].includes(key))
      .map(([key, child]) => [
        normalize(key).slice(0, 120),
        sanitizePortalData(child, seen, depth + 1),
      ])
      .filter(([, child]) => child !== undefined),
  );
};

const section = (value, page) =>
  value == null || (Array.isArray(value) && value.length === 0)
    ? { status: "not_synced", syncPage: page, data: null }
    : { status: "synced", data: sanitizePortalData(value) };

const escapeMarkdown = (value) =>
  normalize(value)
    .replace(/\r?\n/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/([`*_[\]<>#])/g, "\\$1");

const renderMarksMarkdown = (courses) => {
  if (!Array.isArray(courses) || !courses.length) return "- _None_";
  return courses
    .map((c) => {
      let header = `### ${escapeMarkdown(c.id || "Course")}: ${escapeMarkdown(c.title || "")}`;
      if (c.grandTotalStats) {
        const obt = Number(c.grandTotalStats.obtained || 0).toFixed(1);
        const wgt = Number(c.grandTotalStats.weight || 0);
        const pct = Number(c.grandTotalStats.percentage || 0).toFixed(1);
        header += ` — **Current Course Total: ${obt}/${wgt} (${pct}%)**`;
      }
      const sections = (c.sections || [])
        .filter((s) => !s.id?.endsWith("Grand_Total_Marks") && s.title !== "Grand Total Marks")
        .map((s) => {
          const rows = (s.rows || [])
            .map((r) => {
              const weightVal = Number(r.weight || 0);
              const obtVal = Number(r.obtained || 0);
              const totVal = Number(r.total || 0);
              const weightedContrib =
                totVal > 0 ? ((obtVal / totVal) * weightVal).toFixed(2) : "0.00";
              return `    * ${escapeMarkdown(r.title)}: ${obtVal}/${totVal} (Item Weight: ${weightVal}% of course, Contributes: ${weightedContrib} marks)`;
            })
            .join("\n");
          return `  - **Category: ${escapeMarkdown(s.title)}** (Category Total Weight: ${s.weight}%, Total Category Marks Obtained: ${s.obtained}):\n${rows || "    * No individual entries recorded"}`;
        })
        .join("\n");
      return `${header}\n${sections || "  - No breakdown recorded"}`;
    })
    .join("\n\n");
};

const renderAttendanceMarkdown = (subjects) => {
  if (!Array.isArray(subjects) || !subjects.length) return "- _None_";
  return subjects
    .map((s) => {
      const cr =
        s.creditHours ||
        (/\blab\b/i.test(`${s.title} ${s.id}`)
          ? 1
          : /\b(?:pak(?:istan)?\s*studies|islamic\s*(?:studies|ethics)|islamiat|ethics|quranic|ideology|constitution)\b/i.test(
                `${s.title} ${s.id}`,
              )
            ? 2
            : 3);
      const allowed = s.allowedAbsents || (cr === 3 ? 6 : cr <= 2 ? 3 : 6);
      const absentsCount =
        s.absent ??
        (s.records || []).filter((r) =>
          String(r.status || "")
            .trim()
            .toUpperCase()
            .startsWith("A"),
        ).length;
      const remaining = allowed - absentsCount;
      const marginStatus =
        remaining > 0
          ? `${remaining} allowed absents remaining`
          : remaining === 0
            ? "NO ABSENTS LEFT (Limit reached)"
            : `EXCEEDED LIMIT BY ${Math.abs(remaining)} (Debarment penalty)`;

      let header = `### ${escapeMarkdown(s.title || s.id || "Course")} (${cr} Cr Hr): **${s.percentage ?? 0}%**`;
      let stats = `  - **Attendance Policy & Stats**: ${s.present ?? 0} Present, **${absentsCount}/${allowed} Absents Used** (${marginStatus}), ${s.total ?? (s.records?.length || 0)} Total Sessions`;
      const records = s.records || [];
      const absents = records.filter((r) =>
        String(r.status || "")
          .trim()
          .toUpperCase()
          .startsWith("A"),
      );
      let details = "";
      if (absents.length) {
        details += `\n  - **Absence Dates (${absents.length})**: ${absents.map((r) => `${r.date}${r.time ? ` (${r.time})` : ""}`).join(", ")}`;
      }
      const recent = records.slice(-5);
      if (recent.length) {
        details += `\n  - **Recent sessions**: ${recent.map((r) => `${r.date}: ${r.status}`).join(", ")}`;
      }
      return `${header}\n${stats}${details}`;
    })
    .join("\n\n");
};

const renderTranscriptMarkdown = (transcriptObj) => {
  if (!transcriptObj) return "- _Not available_";
  const list = Array.isArray(transcriptObj)
    ? transcriptObj
    : transcriptObj.transcript || transcriptObj.semesters || [];

  if (!Array.isArray(list) || !list.length) return "- _No semester records found_";

  const latestWithCgpa =
    [...list]
      .reverse()
      .find((s) => s.summary?.cgpa && !isNaN(s.summary.cgpa) && s.summary.cgpa > 0) ||
    list[list.length - 1];
  const currentCgpa = latestWithCgpa?.summary?.cgpa ?? "N/A";
  const earnedCredits = latestWithCgpa?.summary?.crEarned ?? "N/A";
  const latestRegistered =
    list[list.length - 1]?.summary?.crRegistered ?? latestWithCgpa?.summary?.crRegistered ?? "N/A";
  const inProgressCredits =
    typeof latestRegistered === "number" && typeof earnedCredits === "number"
      ? Math.max(0, latestRegistered - earnedCredits)
      : "N/A";
  const currentPoints =
    typeof currentCgpa === "number" && typeof earnedCredits === "number"
      ? (currentCgpa * earnedCredits).toFixed(2)
      : "N/A";

  const summaryHeader = `### Official Academic Standing Summary
- **Current Cumulative CGPA:** ${currentCgpa}
- **Total Credits Earned:** ${earnedCredits}
- **Total Credits Registered:** ${latestRegistered} (includes ${inProgressCredits} in-progress credits)
- **Current Total Quality Points:** ${currentPoints} (${currentCgpa} × ${earnedCredits})
- **Latest Evaluated Semester:** ${escapeMarkdown(latestWithCgpa?.title || "Latest")}
`;

  const semestersList = list
    .map((sem) => {
      const title = sem.title || "Semester";
      const summary = sem.summary || {};
      const sgpa = summary.sgpa ?? "N/A";
      const cgpa = summary.cgpa ?? "N/A";
      const earned = summary.crEarned ?? summary.earnedCredits ?? "N/A";
      const registered = summary.crRegistered ?? summary.registeredCredits ?? "N/A";

      const header = `#### ${escapeMarkdown(title)}
- **Semester SGPA:** ${sgpa} | **Cumulative CGPA:** ${cgpa} | **Credits:** ${earned} earned / ${registered} registered`;

      const courses = (sem.courses || [])
        .map((c) => {
          const code = c.code || "";
          const name = c.name || c.description || "";
          const cr = c.crHrs || c.credits || "";
          const grade = c.grade || "";
          const pts = c.points != null ? `(Points: ${c.points})` : "";
          return `  - **${escapeMarkdown(code)} ${escapeMarkdown(name)}** (${cr} Cr Hr) — Grade: **${escapeMarkdown(grade)}** ${pts}`.trim();
        })
        .join("\n");

      return `${header}\n${courses || "  - No course entries"}`;
    })
    .join("\n\n");

  return `${summaryHeader}\n${semestersList}`;
};

const renderStudyPlanMarkdown = (studyPlanList, transcriptObj) => {
  if (!studyPlanList) return "- _Not available_";
  const semesters = Array.isArray(studyPlanList) ? studyPlanList : studyPlanList.semesters || [];

  if (!Array.isArray(semesters) || !semesters.length) return "- _No study plan records found_";

  const passedCourseCodes = new Set<string>();
  const inProgressCourseCodes = new Set<string>();
  const gradeMap = new Map<string, string>();

  const semList = Array.isArray(transcriptObj)
    ? transcriptObj
    : transcriptObj?.transcript || transcriptObj?.semesters || [];

  semList.forEach((sem) => {
    (sem.courses || []).forEach((c) => {
      const code = String(c.code || "")
        .trim()
        .toUpperCase();
      if (!code) return;
      const grade = String(c.grade || "")
        .trim()
        .toUpperCase();
      gradeMap.set(code, grade);
      if (grade === "I" || grade === "IP" || grade === "") {
        inProgressCourseCodes.add(code);
      } else if (grade !== "F" && grade !== "W" && grade !== "U") {
        passedCourseCodes.add(code);
      }
    });
  });

  let totalDegreeCredits = 0;
  let totalDegreeCourses = 0;
  let completedCredits = 0;
  let inProgressCredits = 0;
  let upcomingCredits = 0;

  const renderedSemesters = semesters.map((sem, sIdx) => {
    const semTitle = sem.title || `Semester ${sIdx + 1}`;
    const semCr = sem.crHrs || 0;
    const courses = sem.courses || [];
    let semPassedCount = 0;
    let semInProgressCount = 0;

    const courseLines = courses.map((c) => {
      const code = String(c.code || "").trim();
      const codeUpper = code.toUpperCase();
      const title = String(c.title || c.description || "").trim();
      const cr = Number(c.crHrs || 0);
      const type = c.type || "Core";

      const isNC = /non\s*credit|\bnc\b/i.test(`${type} ${code}`);
      if (!isNC) {
        totalDegreeCredits += cr;
        totalDegreeCourses++;
      }

      let status = "[Upcoming / Planned]";
      if (passedCourseCodes.has(codeUpper)) {
        const gr = gradeMap.get(codeUpper);
        status = gr ? `[Completed - Grade: ${gr}]` : "[Completed]";
        semPassedCount++;
        if (!isNC) completedCredits += cr;
      } else if (inProgressCourseCodes.has(codeUpper)) {
        status = "[Currently Enrolled / In Progress]";
        semInProgressCount++;
        if (!isNC) inProgressCredits += cr;
      } else {
        if (!isNC) upcomingCredits += cr;
      }

      return `  - **${escapeMarkdown(code)}: ${escapeMarkdown(title)}** (${cr} Cr Hr, ${escapeMarkdown(type)}) — ${status}`;
    });

    const isFullyCompleted = courses.length > 0 && semPassedCount === courses.length;
    const isCurrent = semInProgressCount > 0 || (!isFullyCompleted && semPassedCount > 0);
    const semStatusBadge = isFullyCompleted
      ? "— [Completed]"
      : isCurrent
        ? "— [Current / In Progress]"
        : "— [Upcoming]";

    return `#### ${escapeMarkdown(semTitle)} (${semCr} Cr Hrs) ${semStatusBadge}\n${courseLines.join("\n") || "  - No courses listed"}`;
  });

  const remainingCredits = Math.max(0, totalDegreeCredits - completedCredits);

  const summary = `### Degree Progress & Study Plan Summary
- **Total Degree Planned Credits:** ${totalDegreeCredits} Cr Hrs (${totalDegreeCourses} courses)
- **Credits Earned / Completed:** ${completedCredits} Cr Hrs
- **Credits Currently In Progress:** ${inProgressCredits} Cr Hrs
- **Remaining Credits to Graduate:** ${remainingCredits} Cr Hrs (${upcomingCredits} in upcoming semesters)
`;

  return `${summary}\n${renderedSemesters.join("\n\n")}`;
};

const renderTeachersMarkdown = (teacherData: Record<string, any>, courses = []) => {
  if (!teacherData || typeof teacherData !== "object" || Object.keys(teacherData).length === 0) {
    return "- _No course instructors have been selected yet in My Teachers settings._";
  }

  const courseTitles = {};
  courses.forEach((c) => {
    if (c.id && c.title) courseTitles[c.id] = c.title;
  });

  const cached = readCachedCourses();
  if (Array.isArray(cached)) {
    cached.forEach((c) => {
      if (c.id && c.title && !courseTitles[c.id]) courseTitles[c.id] = c.title;
    });
  }

  const entries = Object.entries(teacherData).filter(([, t]) => t && (t.name || t.email));
  if (entries.length === 0) {
    return "- _No course instructors assigned yet._";
  }

  return entries
    .map(([courseId, teacher]) => {
      const title = courseTitles[courseId] || courseId;
      const designation = teacher.designation ? ` (${escapeMarkdown(teacher.designation)})` : "";
      const email = teacher.email ? `\`${escapeMarkdown(teacher.email)}\`` : "_Email not listed_";
      return `- **${escapeMarkdown(title)}** [${escapeMarkdown(courseId)}]:\n  - **Instructor:** ${escapeMarkdown(teacher.name || "Instructor")}${designation}\n  - **Official Email:** ${email}`;
    })
    .join("\n\n");
};

const renderMarkdownTree = (value, indent = 0) => {
  const prefix = " ".repeat(indent);
  if (value == null) return `${prefix}- _Not available_`;
  if (typeof value !== "object") return `${prefix}- ${escapeMarkdown(value)}`;
  if (Array.isArray(value)) {
    if (!value.length) return `${prefix}- _None_`;
    return value
      .map((item, index) => {
        if (item == null || typeof item !== "object") {
          return `${prefix}- ${escapeMarkdown(item)}`;
        }
        return `${prefix}- **Item ${index + 1}**\n${renderMarkdownTree(item, indent + 2)}`;
      })
      .join("\n");
  }

  const entries = Object.entries(value);
  if (!entries.length) return `${prefix}- _None_`;
  return entries
    .map(([key, child]) => {
      const label = escapeMarkdown(key);
      if (child == null || typeof child !== "object") {
        return `${prefix}- **${label}:** ${child == null ? "_Not available_" : escapeMarkdown(child)}`;
      }
      return `${prefix}- **${label}:**\n${renderMarkdownTree(child, indent + 2)}`;
    })
    .join("\n");
};

export function buildAcademicSnapshot(dataContext: AiContext = {}) {
  const studentData = {
    name: dataContext.studentName || null,
    rollNumber: dataContext.rollNumber || getActiveStudentId() || null,
    personalInfo: dataContext.personalInfo || null,
    universityInfo: dataContext.universityInfo || null,
    profileSections: dataContext.profileSections || null,
    alerts: dataContext.alerts || null,
  };
  const hasStudentData = Object.values(studentData).some(
    (value) => value != null && (!Array.isArray(value) || value.length > 0),
  );

  let teachers = dataContext.teachers;
  if (!teachers && typeof localStorage !== "undefined") {
    teachers = readTeacherSelections();
  }

  return {
    student: section(hasStudentData ? studentData : null, "Home"),
    teachers: section(teachers, "My Teachers"),
    attendance: section(dataContext.attendance, "Attendance"),
    marks: section(dataContext.marks, "Marks"),
    transcript: section(dataContext.transcript, "Transcript"),
    mcaAndGrading: section(dataContext.mcaData, "Transcript"),
    studyPlan: section(dataContext.studyPlan, "Tentative Study Plan"),
  };
}

const compactMarkdown = (markdown, maxChars) => {
  if (markdown.length <= maxChars) return markdown;
  const marker =
    "\n\n> Remaining records were compacted to stay within GroqCloud free-tier limits.";
  const available = Math.max(0, maxChars - marker.length);
  const clipped = markdown.slice(0, available);
  const lastLineBreak = clipped.lastIndexOf("\n");
  return `${clipped.slice(0, lastLineBreak > available * 0.6 ? lastLineBreak : available).trimEnd()}${marker}`;
};

const sectionPriority = (name, question) => {
  const query = normalize(question).toLowerCase();
  if (/overview|summary|how am i doing|academic status/.test(query)) return 2;
  if (
    name === "teachers" &&
    /teacher|instructor|faculty|professor|teach|sir|maam|miss|email|draft|write to|contact|cc|os|algo|db|pf|oop|cn|ai|sda|ap|se/.test(
      query,
    )
  )
    return 5;
  if (name === "attendance" && /attend|present|absent|late|missed|att\b/.test(query)) return 5;
  if (
    name === "marks" &&
    /mark|score|quiz|qz|assignment|asst|ass\b|assessment|exam|sessional|sess|mid|test|what if|percentage|pct|weighted/.test(
      query,
    )
  )
    return 5;
  if (
    name === "transcript" &&
    /transcript|cgpa|sgpa|\bgpa\b|credit|semester|grade|target|calculate|standing|standing|fail|repeat|improve/.test(
      query,
    )
  )
    return 5;
  if (name === "mcaAndGrading" && /mca|grading|grade point|scheme/.test(query)) return 4;
  if (
    name === "studyPlan" &&
    /study plan|degree plan|remaining|planned|upcoming|next sem|future sem|graduate|graduation|degree|target.*cgpa|reach.*cgpa|improve.*cgpa|how can i get|how to get.*cgpa|courses to take|what courses|which courses/.test(
      query,
    )
  )
    return 5;
  if (name === "student" && /profile|program|section|campus|who am i/.test(query)) return 4;
  return 1;
};

export function buildAcademicMarkdown(
  dataContext: AiContext = {},
  { question = "", maxChars = FREE_TIER_CONTEXT_CHAR_BUDGET } = {},
) {
  const snapshot = buildAcademicSnapshot(dataContext);
  const academicSections = snapshot;
  const introduction = `# Academic Portal Records & Instructors

> Reference portal data for student academic and instructor inquiries.`;

  const allCourses = [...(dataContext.marks || []), ...(dataContext.attendance || [])];

  const rawSections = Object.entries(academicSections).map(([name, value]) => {
    let content = "";
    if (value.status === "not_synced") {
      content = `_Not loaded yet. Advise student to visit the **${value.syncPage}** page in the Flex portal._`;
    } else if (name === "teachers") {
      content = renderTeachersMarkdown(value.data, allCourses);
    } else if (name === "marks") {
      content = renderMarksMarkdown(value.data);
    } else if (name === "attendance") {
      content = renderAttendanceMarkdown(value.data);
    } else if (name === "transcript") {
      content = renderTranscriptMarkdown(value.data);
    } else if (name === "studyPlan") {
      content = renderStudyPlanMarkdown(value.data, dataContext.transcript);
    } else {
      content = renderMarkdownTree(value.data);
    }
    return {
      name,
      markdown: `## ${escapeMarkdown(name)}\n\n${content}`,
    };
  });
  const available = Math.max(0, maxChars - introduction.length - rawSections.length * 2);
  const minimumTotal = MIN_SECTION_CHAR_BUDGET * rawSections.length;
  const weighted = rawSections.map((item) => ({
    ...item,
    weight: Math.sqrt(item.markdown.length) * sectionPriority(item.name, question),
  }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  const distributable = Math.max(0, available - minimumTotal);
  const sections = weighted.map((item) =>
    compactMarkdown(
      item.markdown,
      Math.min(
        item.markdown.length,
        MIN_SECTION_CHAR_BUDGET + Math.floor(distributable * (item.weight / totalWeight)),
      ),
    ),
  );

  return `${introduction}

${sections.join("\n\n")}`.slice(0, maxChars);
}

export function buildGeminiPayload({ question, dataContext, history = [] }) {
  const snapshot = buildAcademicMarkdown(dataContext, { question });

  const cleanHistory = history
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-6)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: normalize(m.content).slice(0, 2000) }],
    }));

  const systemInstruction = {
    parts: [
      {
        text: `${SYSTEM_PROMPT}\n\n# Complete Academic Portal Snapshot\n${snapshot}\n\n<!-- End complete academic portal snapshot -->`,
      },
    ],
  };

  const contents = [...cleanHistory, { role: "user", parts: [{ text: cleanQuestion(question) }] }];

  return {
    system_instruction: systemInstruction,
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
    },
  };
}
