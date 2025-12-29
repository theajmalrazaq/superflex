export const parseFloatOrZero = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const str = value.toString();
  if (str === "-" || str.trim() === "") return 0;
  const cleaned = str.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const processCourseMarks = (course) => {
  let globalWeightage = 0;
  let globalObtained = 0;
  let globalAverage = 0;
  let globalMinimum = 0;
  let globalMaximum = 0;
  let globalStdDev = 0;

  const sectionsExceptTotal = course.sections.filter(
    (s) =>
      !s.id?.endsWith("Grand_Total_Marks") && s.title !== "Grand Total Marks",
  );

  const processedSections = sectionsExceptTotal.map((section) => {
    let rows = [...section.rows];

    const rowsWeightSum = rows.reduce(
      (acc, r) => acc + parseFloatOrZero(r.weight),
      0,
    );
    const secWeight = rowsWeightSum;

    const sorted = rows.map((r, i) => {
      const weight = parseFloatOrZero(r.weight);
      const total = parseFloatOrZero(r.total);
      const obtained = parseFloatOrZero(r.obtained);
      const ratio = total > 0 ? obtained / total : 0;
      const score = ratio * weight;
      return { ...r, weight, total, obtained, originalIdx: i, _sortScore: score };
    });

    sorted.sort((a, b) => b._sortScore - a._sortScore);

    let currentAccWeight = 0;
    const includedIndices = new Set();
    const EPSILON = 0.001;

    for (let item of sorted) {
      if (currentAccWeight < secWeight - EPSILON) {
        currentAccWeight += item.weight;
        includedIndices.add(item.originalIdx);
      }
    }

    rows = rows.map((r, i) => ({
      ...r,
      weight: r.weight === "" ? "" : parseFloatOrZero(r.weight),
      total: r.total === "" ? "" : parseFloatOrZero(r.total),
      obtained: r.obtained === "" ? "" : parseFloatOrZero(r.obtained),
      included: includedIndices.has(i),
    }));

    let calculatedSecObtained = 0;
    let secWeightedAvg = 0;
    let secWeightedMin = 0;
    let secWeightedMax = 0;
    let secWeightedStd = 0;

    rows.forEach((r) => {
      if (r.included && r.total > 0) {
        const ratio = r.weight / r.total;

        calculatedSecObtained += (r.obtained / r.total) * r.weight;

        secWeightedAvg += (r.avg || 0) * ratio;
        secWeightedMin += (r.min || 0) * ratio;
        secWeightedMax += (r.max || 0) * ratio;
        secWeightedStd += (r.stdDev || 0) * ratio;
      }
    });

    globalWeightage += secWeight;
    globalObtained += calculatedSecObtained;
    globalAverage += secWeightedAvg;
    globalMinimum += secWeightedMin;
    globalMaximum += secWeightedMax;
    globalStdDev += secWeightedStd;

    return {
      ...section,
      weight: secWeight,
      obtained: calculatedSecObtained,
      rows,
      stats: {
        weightedAvg: secWeightedAvg,
        weightedStdDev: secWeightedStd,
        weightedMin: secWeightedMin,
        weightedMax: secWeightedMax,
      },
    };
  });

  const grandTotalSection = {
    id: `${course.id}-Grand_Total_Marks`,
    title: "Grand Total Marks",
    weight: globalWeightage,
    obtained: globalObtained,
    rows: [],
    stats: {
      weightedAvg: globalAverage,
      weightedStdDev: globalStdDev,
      weightedMin: globalMinimum,
      weightedMax: globalMaximum,
    },
  };

  const finalSections = [...processedSections, grandTotalSection];

  return {
    ...course,
    sections: finalSections,
    grandTotalStats: {
      weight: globalWeightage,
      obtained: globalObtained,
      percentage:
        globalWeightage > 0 ? (globalObtained / globalWeightage) * 100 : 0,
    },
  };
};

export const processAllCourses = (courses) => {
  return courses.map((course) => processCourseMarks(course));
};
