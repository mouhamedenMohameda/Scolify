/**
 * CSV parser utilities
 */

export interface CSVRow {
  [key: string]: string;
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const rows: CSVRow[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue; // Skip malformed rows

    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || "";
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

/**
 * Map CSV row to student input
 */
export function mapCSVRowToStudent(
  row: CSVRow,
  mapping: Record<string, string>,
  defaultClassId?: string,
  defaultAcademicYearId?: string
): any {
  const student: any = {};

  // Map fields
  if (mapping.firstName && row[mapping.firstName]) {
    student.firstName = row[mapping.firstName];
  }
  if (mapping.lastName && row[mapping.lastName]) {
    student.lastName = row[mapping.lastName];
  }
  if (mapping.dateOfBirth && row[mapping.dateOfBirth]) {
    student.dateOfBirth = row[mapping.dateOfBirth];
  }
  if (mapping.gender && row[mapping.gender]) {
    student.gender = row[mapping.gender];
  }
  if (mapping.email && row[mapping.email]) {
    student.email = row[mapping.email];
  }
  if (mapping.phone && row[mapping.phone]) {
    student.phone = row[mapping.phone];
  }
  if (mapping.address && row[mapping.address]) {
    student.address = row[mapping.address];
  }
  if (mapping.city && row[mapping.city]) {
    student.city = row[mapping.city];
  }
  if (mapping.postalCode && row[mapping.postalCode]) {
    student.postalCode = row[mapping.postalCode];
  }
  if (mapping.classId && row[mapping.classId]) {
    student.classId = row[mapping.classId];
  } else if (defaultClassId) {
    student.classId = defaultClassId;
  }
  if (mapping.academicYearId && row[mapping.academicYearId]) {
    student.academicYearId = row[mapping.academicYearId];
  } else if (defaultAcademicYearId) {
    student.academicYearId = defaultAcademicYearId;
  }

  return student;
}

/**
 * Common CSV column mappings
 */
export const COMMON_CSV_MAPPINGS = {
  firstName: ["prénom", "firstname", "prenom", "first_name", "nom"],
  lastName: ["nom", "lastname", "name", "last_name", "nom de famille"],
  dateOfBirth: [
    "date de naissance",
    "date_naissance",
    "birthdate",
    "date of birth",
    "dob",
  ],
  email: ["email", "e-mail", "courriel"],
  phone: ["téléphone", "telephone", "phone", "tel", "mobile"],
};

/**
 * Auto-detect column mapping
 */
export function detectColumnMapping(
  headers: string[]
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

  Object.entries(COMMON_CSV_MAPPINGS).forEach(([field, possibleNames]) => {
    const foundIndex = lowerHeaders.findIndex((h) =>
      possibleNames.some((name) => h.includes(name))
    );
    if (foundIndex !== -1) {
      mapping[field] = headers[foundIndex];
    }
  });

  return mapping;
}
