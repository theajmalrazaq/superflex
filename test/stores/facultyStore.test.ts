import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFacultyStore } from "../../src/stores/facultyStore";
import { sendExtensionMessage } from "../../src/utils/extensionApi";
import { parseFacultyPages } from "../../src/utils/facultyDirectory";

vi.mock("../../src/utils/extensionApi", () => ({ sendExtensionMessage: vi.fn() }));
vi.mock("../../src/utils/facultyDirectory", () => ({ parseFacultyPages: vi.fn() }));
const teacher = {
  id: "one",
  name: "Professor",
  email: "teacher@nu.edu.pk",
  designation: "Lecturer",
  image: "",
  source: "manual",
};
const response = {
  pages: [{ url: "https://khi.nu.edu.pk/Faculty.php", html: "<article>Teacher</article>" }],
};
beforeEach(() => {
  vi.clearAllMocks();
  useFacultyStore.setState({ directories: {} });
});

describe("faculty directory cache", () => {
  it("deduplicates requests and keeps replies isolated by campus", () => {
    const { load } = useFacultyStore.getState();
    load("karachi");
    load("karachi");
    load("lahore");
    expect(sendExtensionMessage).toHaveBeenCalledTimes(2);
    vi.mocked(parseFacultyPages)
      .mockReturnValueOnce([{ ...teacher, id: "lahore" }])
      .mockReturnValueOnce([teacher]);
    vi.mocked(sendExtensionMessage).mock.calls[1][1]!(response);
    vi.mocked(sendExtensionMessage).mock.calls[0][1]!(response);
    expect(useFacultyStore.getState().directories.lahore.teachers[0].id).toBe("lahore");
    expect(useFacultyStore.getState().directories.karachi.teachers[0].id).toBe("one");
    load("karachi");
    expect(sendExtensionMessage).toHaveBeenCalledTimes(2);
    load("karachi", true);
    expect(sendExtensionMessage).toHaveBeenCalledTimes(3);
  });

  it("turns invalid responses into a retriable error", () => {
    const { load } = useFacultyStore.getState();
    load("karachi");
    vi.mocked(sendExtensionMessage).mock.calls[0][1]!({ error: "Unavailable" });
    expect(useFacultyStore.getState().directories.karachi.status).toBe("error");
    load("karachi");
    expect(sendExtensionMessage).toHaveBeenCalledTimes(2);
  });
});
