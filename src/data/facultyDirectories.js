export const CAMPUS_BY_ROLL_PREFIX = {
  K: { id: "karachi", name: "Karachi" },
  L: { id: "lahore", name: "Lahore" },
  I: { id: "islamabad", name: "Islamabad" },
  F: { id: "cfd", name: "Chiniot-Faisalabad" },
  M: { id: "multan", name: "Multan" },
  P: { id: "peshawar", name: "Peshawar" },
};

export const getCampusFromRollNumber = (rollNumber = "") => {
  const match = String(rollNumber).trim().toUpperCase().match(/^\d{2}([KLIFMP])/);
  return match ? CAMPUS_BY_ROLL_PREFIX[match[1]] || null : null;
};

