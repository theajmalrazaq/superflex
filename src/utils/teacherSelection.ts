import { teacherSchema } from "../schemas/teacher";
import type { Teacher } from "../types/teacher";

export function filterTeachers<T extends Teacher>(teachers: T[], query: string): T[] {
  const search = query.trim().toLowerCase();
  if (!search) return teachers;
  return teachers.filter((teacher) =>
    [teacher.name, teacher.email, teacher.designation]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search),
  );
}

export function createManualTeacher(nameInput: string, emailInput: string): Teacher | null {
  const name = nameInput.trim();
  const email = emailInput.trim();
  if (!name) return null;
  const parsed = teacherSchema.safeParse({
    id: email
      ? `manual:${email.toLowerCase()}`
      : `manual:${name.toLowerCase()}:${crypto.randomUUID()}`,
    name,
    email,
    designation: "Added by you",
    image: "",
    source: "manual",
  });
  return parsed.success ? parsed.data : null;
}
