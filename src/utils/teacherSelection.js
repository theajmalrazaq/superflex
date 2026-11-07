export function filterTeachers(teachers, query) {
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

export function createManualTeacher(nameInput, emailInput) {
  const name = nameInput.trim();
  const email = emailInput.trim();
  if (!name) return null;
  return {
    id: email
      ? `manual:${email.toLowerCase()}`
      : `manual:${name.toLowerCase()}:${crypto.randomUUID()}`,
    name,
    email,
    designation: "Added by you",
    image: "",
    source: "manual",
  };
}
