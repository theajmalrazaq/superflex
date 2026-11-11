import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";
import { parseHomeMarksReport } from "../../src/parsers/home";
import { parseMarksPage } from "../../src/parsers/marks";

describe("parseHomeMarksReport", () => {
  it("retains ungraded assessments and categories with only ungraded rows, matching parseMarksPage", () => {
    const html = `
      <div class="tab-content">
        <div id="CS4001" class="tab-pane active">
          <h5>CS4001-Professional Practices in IT</h5>
          <div id="CS4001-Quiz" class="card">
            <div class="card-header"><button>Quiz</button></div>
            <table>
              <tbody>
                <tr class="calculationrow">
                  <td>1</td><td class="weightage">0</td><td class="ObtMarks">5</td><td class="GrandTotal">10</td><td class="AverageMarks">4.5</td><td class="StdDev">1.2</td><td class="MinMarks">0</td><td class="MaxMarks">9</td>
                </tr>
                <tr class="calculationrow">
                  <td>3</td><td class="weightage">0</td><td class="ObtMarks">-</td><td class="GrandTotal">10</td><td class="AverageMarks">0</td><td class="StdDev">0</td><td class="MinMarks">0</td><td class="MaxMarks">0</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="CS4001-Class_Participation" class="card">
            <div class="card-header"><button>Class Participation</button></div>
            <table>
              <tbody>
                <tr class="calculationrow">
                  <td>1</td><td class="weightage">5</td><td class="ObtMarks"></td><td class="GrandTotal">1</td><td class="AverageMarks">1</td><td class="StdDev">0</td><td class="MinMarks">1</td><td class="MaxMarks">1</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="totalColumn_CS4001"><td class="totalColweightage">5</td></tr>
              </tfoot>
            </table>
          </div>
          <div id="CS4001-Grand_Total_Marks" class="card">
            <div class="card-header"><button>Grand Total Marks</button></div>
            <table><tbody></tbody></table>
          </div>
        </div>
      </div>
    `;
    const parsed = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
    Object.assign(globalThis, { HTMLSelectElement: parsed.window.HTMLSelectElement });
    const doc = parsed.document;
    const homeCourses = parseHomeMarksReport(doc);
    const marksCourses = parseMarksPage(doc, null).courses;

    expect(homeCourses).toHaveLength(1);
    expect(homeCourses[0].sections.map((s) => s.title)).toEqual(["Quiz", "Class Participation"]);
    expect(homeCourses[0].sections[0].rows.map((r) => r.title)).toEqual(["1", "3"]);
    expect(homeCourses[0].sections[0].rows[1].ungraded).toBe(true);
    expect(homeCourses[0].sections[1].rows).toHaveLength(1);
    expect(homeCourses[0].sections[1].rows[0].ungraded).toBe(true);
    expect(marksCourses[0].sections.filter((s) => !s.id.endsWith("Grand_Total_Marks")).length).toBe(
      homeCourses[0].sections.length,
    );
  });

  it("retains ungraded '-' rows in the fallback table parser", () => {
    const html = `
      <div>
        <div id="CS4001" class="tab-pane">
          <h5>CS4001-Professional Practices in IT</h5>
          <div class="card">
            <div class="card-header"><button>Class Participation</button></div>
            <table>
              <tbody>
                <tr>
                  <td>1</td><td>5</td><td>-</td><td>1</td><td>1</td><td>0</td><td>1</td><td>1</td>
                </tr>
              </tbody>
              <tfoot>
                <tr><td class="totalColweightage">5</td></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    `;
    const parsed = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
    Object.assign(globalThis, { HTMLSelectElement: parsed.window.HTMLSelectElement });
    const doc = parsed.document;
    const courses = parseHomeMarksReport(doc);

    expect(courses).toHaveLength(1);
    expect(courses[0].sections).toHaveLength(1);
    expect(courses[0].sections[0].title).toBe("Class Participation");
    expect(courses[0].sections[0].rows[0]).toMatchObject({
      title: "1",
      weight: 5,
      obtained: 0,
      total: 1,
      ungraded: true,
    });
  });
});
