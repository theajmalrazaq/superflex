import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getTeacherImageUrl, resolveFacultyImageUrl } from "../../src/utils/teacherImage";
import TeacherAvatar from "../../src/components/TeacherAvatar";

describe("faculty image URL resolution", () => {
  it("honors Peshawar's document base instead of treating its route as an asset directory", () => {
    expect(
      resolveFacultyImageUrl(
        "images/faculty/thumb6840.jpg",
        "https://pwr.nu.edu.pk/cs-faculty/",
        "/",
      ),
    ).toBe("https://pwr.nu.edu.pk/images/faculty/thumb6840.jpg");
  });

  it("supports ordinary relative assets and absolute document bases", () => {
    expect(
      resolveFacultyImageUrl("../photos/teacher.jpg", "https://example.edu/department/faculty/"),
    ).toBe("https://example.edu/department/photos/teacher.jpg");
    expect(
      resolveFacultyImageUrl(
        "photos/teacher.jpg",
        "https://example.edu/faculty",
        "https://cdn.example.edu/assets/",
      ),
    ).toBe("https://cdn.example.edu/assets/photos/teacher.jpg");
  });

  it("ignores malformed base URLs and rejects unsupported image protocols", () => {
    expect(resolveFacultyImageUrl("teacher.jpg", "https://example.edu/faculty/", "https://[")).toBe(
      "https://example.edu/faculty/teacher.jpg",
    );
    expect(resolveFacultyImageUrl("javascript:alert(1)", "https://example.edu/")).toBe("");
    expect(resolveFacultyImageUrl("data:image/png;base64,aGVsbG8=", "https://example.edu/")).toBe(
      "",
    );
  });

  it("repairs previously saved Peshawar image paths without rewriting other campuses", () => {
    expect(
      getTeacherImageUrl(
        "https://pwr.nu.edu.pk/sh-faculty/images/faculty/thumb6840.jpg?size=small#photo",
      ),
    ).toBe("https://pwr.nu.edu.pk/images/faculty/thumb6840.jpg?size=small#photo");
    expect(getTeacherImageUrl("https://example.edu/cs-faculty/images/faculty/teacher.jpg")).toBe(
      "https://example.edu/cs-faculty/images/faculty/teacher.jpg",
    );
  });

  it("uses repaired paths for saved selections and initials for unavailable images", () => {
    const markup = renderToStaticMarkup(
      <TeacherAvatar
        teacher={{
          name: "Dr. Ali Sayyed",
          image: "https://pwr.nu.edu.pk/cs-faculty/images/faculty/thumb6670.jpg",
        }}
      />,
    );
    expect(markup).toContain('src="https://pwr.nu.edu.pk/images/faculty/thumb6670.jpg"');
    expect(markup).not.toContain("/cs-faculty/images/");
    const initials = renderToStaticMarkup(
      <TeacherAvatar teacher={{ name: "Ali Sayyed", image: "" }} size="xs" />,
    );
    expect(initials).toContain(">AS</span>");
    expect(initials).not.toContain("<img");
  });
});
