const SYSTEM_PROMPT = `You are SuperFlex, a helpful and intelligent academic companion for a university student.

Your source of truth is the structured academic portal records and course instructors provided below.

Strict Output Rules:
1. Speak naturally, empathetically, and conversationally like an experienced university advisor.
2. Course Instructors, Names & Official Emails:
   - You have complete access to the student's assigned course teachers under the Course Instructors section.
   - When the student asks who is teaching a course (or uses common shorthand/abbreviations like "CC" for Compiler Construction, "OS" for Operating Systems, "Algo" for Analysis of Algorithms, "PF" for Programming Fundamentals, "OOP" for Object Oriented Programming, "DB" for Database Systems, "CN" for Computer Networks, "AI" for Artificial Intelligence, "SE" for Software Engineering, "SDA" for Software Design & Architecture, "DLD" for Digital Logic Design, "COAL" for Computer Organization, "Pak Studies", "AP", etc.):
     * Match the course to the instructor in your records.
     * Tell the student the instructor's full name, designation, and official university email address.
     * If no teacher has been assigned yet for that specific course, inform them kindly and let them know they can assign their teacher under the "My Teachers" tab in SuperFlex.
3. Composing Email Drafts:
   - When the student asks you to write, draft, or compose an email to a teacher (for attendance review/discrepancy, marks rechecking, assignment extension, recommendation, meeting, apology, or advice):
     * Identify the correct teacher and retrieve their name and official email address.
     * Format the top of the draft clearly:
       **To:** \`[Teacher Email]\`  
       **Subject:** \`[Clear, professional subject line]\`
     * Write a courteous, professional, and well-structured email body.
     * Include the student's name, roll number, section, and course title.
     * Provide an instant 1-click Gmail compose link in Markdown:
       \`[✉️ Open Draft in Gmail](https://mail.google.com/mail/?view=cm&fs=1&to=TEACHER_EMAIL&su=ENCODED_SUBJECT&body=ENCODED_BODY)\`
4. NEVER output technical system jargon, code variable names, schema paths, internal metadata, or debugging tokens (such as "Evidence:", "transcript.data", "summary", "crRegistered", "crEarned", "lastSync", "schemaVersion", "dataContext", etc.).
5. NEVER create an "Evidence:" section. Present facts and answers directly to the student in clean English (e.g. "Your current Cumulative GPA (CGPA) is 2.36 and your latest semester GPA (SGPA) is 0.").
6. Mandatory 80% Attendance Policy:
   - Students must maintain at least 80% attendance in all subjects.
   - 3 Credit Hour course: Maximum 6 leaves (absents) allowed. 7th absence causes debarment (failing grade / F).
   - 2 Credit Hour course: Maximum 3 leaves (absents) allowed. 4th absence causes debarment (failing grade / F).
   - 1 Credit Hour course (Labs): Maximum 3 leaves (absents) allowed. 4th absence causes debarment (failing grade / F).
   - State leaves taken out of total allowed and safe remaining leaves. If close to or over the limit, give an urgent warning.
7. Format answers cleanly using bullet points, bold text, or markdown tables when helpful.`;

const FREE_TIER_CONTEXT_CHAR_BUDGET = 250000; // Gemini supports 1M tokens easily
const MIN_SECTION_CHAR_BUDGET = 4000;

const normalize = (value) =>
  String(value ?? "")
    .replace(/\0/g, "")
    .trim();

const cleanQuestion = (value) =>
  normalize(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\bsvg\b/gi, "")
    .replace(/\s+/g, " ")
    .slice(0, 1000);

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
        header += ` — **Total Score: ${obt}/${wgt} (${pct}%)**`;
      }
      const sections = (c.sections || [])
        .filter((s) => !s.id?.endsWith("Grand_Total_Marks") && s.title !== "Grand Total Marks")
        .map((s) => {
          const rows = (s.rows || [])
            .map((r) => `${escapeMarkdown(r.title)}: ${r.obtained}/${r.total} (w: ${r.weight})`)
            .join(", ");
          return `  - **${escapeMarkdown(s.title)}** (Weight: ${s.weight}, Obtained: ${s.obtained}): ${rows || "No individual entries"}`;
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
          String(r.status || "").trim().toUpperCase().startsWith("A"),
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
      const absents = records.filter(
        (r) => String(r.status || "").trim().toUpperCase().startsWith("A"),
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

  return list
    .map((sem) => {
      const title = sem.title || "Semester";
      const summary = sem.summary || {};
      const sgpa = summary.sgpa ?? "N/A";
      const cgpa = summary.cgpa ?? "N/A";
      const earned = summary.crEarned ?? summary.earnedCredits ?? "N/A";
      const registered = summary.crRegistered ?? summary.registeredCredits ?? "N/A";

      const header = `### ${escapeMarkdown(title)}
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
};

const renderTeachersMarkdown = (teacherData, courses = []) => {
  if (!teacherData || typeof teacherData !== "object" || Object.keys(teacherData).length === 0) {
    return "- _No course instructors have been selected yet in My Teachers settings._";
  }

  // Build a lookup map from course IDs to their full titles
  const courseTitles = {};
  courses.forEach((c) => {
    if (c.id && c.title) courseTitles[c.id] = c.title;
  });

  if (typeof localStorage !== "undefined") {
    try {
      const cached = JSON.parse(localStorage.getItem("superflex_cached_courses_v1") || "[]");
      cached.forEach((c) => {
        if (c.id && c.title && !courseTitles[c.id]) courseTitles[c.id] = c.title;
      });
    } catch {}
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

export function buildAcademicSnapshot(dataContext = {}) {
  const studentData = {
    name: dataContext.studentName || null,
    rollNumber:
      dataContext.rollNumber ||
      (typeof localStorage !== "undefined"
        ? localStorage.getItem("superflex_student_roll_number_v1")
        : null),
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
    try {
      teachers = JSON.parse(localStorage.getItem("superflex_course_teachers_v1") || "null");
    } catch {}
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
  const marker = "\n\n> Remaining records were compacted to stay within GroqCloud free-tier limits.";
  const available = Math.max(0, maxChars - marker.length);
  const clipped = markdown.slice(0, available);
  const lastLineBreak = clipped.lastIndexOf("\n");
  return `${clipped.slice(0, lastLineBreak > available * 0.6 ? lastLineBreak : available).trimEnd()}${marker}`;
};

const sectionPriority = (name, question) => {
  const query = normalize(question).toLowerCase();
  if (/overview|summary|how am i doing|academic status/.test(query)) return 2;
  if (name === "teachers" && /teacher|instructor|faculty|professor|teach|sir|maam|miss|email|draft|write to|contact|cc|os|algo|db|pf|oop|cn|ai|sda|ap|se/.test(query)) return 5;
  if (name === "attendance" && /attend|present|absent|late|missed/.test(query)) return 4;
  if (name === "marks" && /mark|score|quiz|assignment|assessment|exam/.test(query)) return 4;
  if (name === "transcript" && /transcript|cgpa|sgpa|gpa|credit|semester|grade/.test(query)) return 4;
  if (name === "mcaAndGrading" && /mca|grading|grade point|scheme/.test(query)) return 4;
  if (name === "studyPlan" && /study plan|degree plan|remaining course|planned course/.test(query)) return 4;
  if (name === "student" && /profile|program|section|campus|who am i/.test(query)) return 4;
  return 1;
};

export function buildAcademicMarkdown(
  dataContext = {},
  { question = "", maxChars = FREE_TIER_CONTEXT_CHAR_BUDGET } = {},
) {
  const snapshot = buildAcademicSnapshot(dataContext);
  const academicSections = snapshot;
  const introduction = `# Academic Portal Records & Instructors

> Reference portal data for student academic and instructor inquiries.`;

  const allCourses = [
    ...(dataContext.marks || []),
    ...(dataContext.attendance || []),
  ];

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
  const sections = weighted.map((item) => compactMarkdown(
    item.markdown,
    Math.min(
      item.markdown.length,
      MIN_SECTION_CHAR_BUDGET + Math.floor(distributable * (item.weight / totalWeight)),
    ),
  ));

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

  const contents = [
    ...cleanHistory,
    { role: "user", parts: [{ text: cleanQuestion(question) }] },
  ];

  return {
    system_instruction: systemInstruction,
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  };
}
