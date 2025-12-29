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

    // 1. Determine sum of ALL row weights
    const rowsWeightSum = rows
      .filter((r) => r.title !== "Total")
      .reduce((acc, r) => acc + parseFloatOrZero(r.weight), 0);

    // 2. Determine if we are in Simulation Mode
    const isSimMode = course.simulationMode;

    // 3. Setup Items for Sorting (Capture original indices first)
    const sorted = rows
      .map((r, i) => ({ ...r, _originalIdx: i }))
      .filter((r) => r.title !== "Total")
      .map((r, i) => {
        const weight = parseFloatOrZero(r.weight);
        const total = parseFloatOrZero(r.total);
        const obtained = parseFloatOrZero(r.obtained);
        const ratio = total > 0 ? obtained / total : 0;
        return {
          ...r,
          weight,
          total,
          obtained,
          _performanceRatio: ratio,
        };
      });

    // 4. Determine the cap (secWeight) & Inclusion Logic
    let secWeight = section.weight;
    const includedIndices = new Set();
    const EPSILON = 0.001;

    if (isSimMode) {
      // IN SIMULATION MODE: 
      // 1. Total Weight = Sum of all items
      // 2. All items are included
      secWeight = rowsWeightSum;
      sorted.forEach(item => includedIndices.add(item._originalIdx));
    } else {
      // IN NORMAL MODE: Apply Best-Of Logic
      if (
        section.itemLimit &&
        section.itemLimit > 0 &&
        section.itemLimit < sorted.length
      ) {
        secWeight = sorted
          .slice(0, section.itemLimit)
          .reduce((acc, item) => acc + item.weight, 0);
      } else if (secWeight === undefined || secWeight === null || secWeight <= 0) {
        secWeight = rowsWeightSum;
      }

      // Sort by performance ratio descending for Best-Of picking
      sorted.sort((a, b) => b._performanceRatio - a._performanceRatio);

      let currentAccWeight = 0;
      const itemLimit = section.itemLimit || 999;

      for (let item of sorted) {
        if (
          currentAccWeight < secWeight - EPSILON &&
          includedIndices.size < itemLimit
        ) {
          currentAccWeight += item.weight;
          includedIndices.add(item._originalIdx);
        }
      }
    }

    // 5. Final Row Mapping & Stats Calculation
    rows = rows.map((r, i) => {
      const isTotal = r.title === "Total";
      return {
        ...r,
        weight: r.weight === "" ? "" : parseFloatOrZero(r.weight),
        total: r.total === "" ? "" : parseFloatOrZero(r.total),
        obtained: r.obtained === "" ? "" : parseFloatOrZero(r.obtained),
        included: isTotal ? true : includedIndices.has(i),
      };
    });

    let calculatedSecObtained = 0;
    let tempSumAvg = 0,
      tempSumMin = 0,
      tempSumMax = 0,
      tempSumStd = 0,
      usedWeightBudget = 0;

    const sortedIncluded = sorted
      .filter((s) => includedIndices.has(s._originalIdx));

    // For better stats in normal mode, we sort by performance ratio
    if (!isSimMode) {
      sortedIncluded.sort((a, b) => b._performanceRatio - a._performanceRatio);
    }

    sortedIncluded.forEach((item) => {
      const remaining = secWeight - usedWeightBudget;
      if (remaining <= EPSILON && !isSimMode) return;

      const takenWeight = isSimMode ? item.weight : Math.min(item.weight, remaining);
      const weightRatio = secWeight > 0 ? takenWeight / secWeight : 0;

      calculatedSecObtained += (item.obtained / item.total) * takenWeight;
      tempSumAvg += (item.avg || 0) * weightRatio;
      tempSumMin += (item.min || 0) * weightRatio;
      tempSumMax += (item.max || 0) * weightRatio;
      tempSumStd += (item.stdDev || 0) * weightRatio;

      usedWeightBudget += takenWeight;
    });

    globalWeightage += secWeight;
    globalObtained += calculatedSecObtained;
    globalAverage += tempSumAvg;
    globalMinimum += tempSumMin;
    globalMaximum += tempSumMax;
    globalStdDev += tempSumStd;

    return {
      ...section,
      weight: secWeight,
      obtained: calculatedSecObtained,
      rows,
      stats: {
        weightedAvg: tempSumAvg,
        weightedStdDev: tempSumStd,
        weightedMin: tempSumMin,
        weightedMax: tempSumMax,
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
