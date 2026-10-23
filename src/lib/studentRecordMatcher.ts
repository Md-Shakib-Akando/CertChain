/**
 * Helper to match user-submitted student details against university official records
 * in the 'student-record' collection for ANY student.
 */

export interface StudentInputFields {
  name: string;
  studentId: string;
  department: string;
  batch: string;
  email: string;
}

export interface StudentRecordFields {
  name: string;
  studentId: string;
  department?: string;
  dept?: string;
  batch: string;
  email: string;
}

export interface MatchResult {
  isMatch: boolean;
}

function cleanString(str: string): string {
  return (str || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function cleanId(str: string): string {
  return (str || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function extractBatchNumber(str: string): string {
  const match = (str || '').match(/\d+/);
  return match ? match[0] : cleanString(str);
}

function normalizeDepartment(str: string): string {
  const cleaned = cleanString(str);
  if (cleaned.includes('computer') || cleaned.includes('cse') || cleaned === 'cse') return 'cse';
  if (cleaned.includes('electrical') || cleaned.includes('eee') || cleaned === 'eee') return 'eee';
  if (cleaned.includes('business') || cleaned.includes('bba') || cleaned === 'bba') return 'bba';
  if (cleaned.includes('english') || cleaned.includes('eng') || cleaned === 'english') return 'english';
  if (cleaned.includes('law') || cleaned.includes('llb') || cleaned === 'law') return 'law';
  return cleaned;
}

function normalizeFullName(str: string): string {
  return (str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Normalize punctuation like dots, e.g. "Md." -> "md"
    .replace(/\s+/g, ' ');
}

/**
 * Requires the FULL name to match the official record's full name.
 * Partial names (e.g. "Shakib" or "Md. Shakib") are rejected.
 */
function isFullNameMatch(inputName: string, recordName: string): boolean {
  const cleanInput = cleanString(inputName);
  const cleanRecord = cleanString(recordName);

  // 1. Direct exact match (case-insensitive & trimmed)
  if (cleanInput && cleanRecord && cleanInput === cleanRecord) {
    return true;
  }

  // 2. Normalized match (allows "Md." vs "Md" dot variations, but requires the FULL name)
  const normInput = normalizeFullName(inputName);
  const normRecord = normalizeFullName(recordName);

  if (normInput && normRecord && normInput === normRecord) {
    return true;
  }

  return false;
}

export function matchStudentRecord(
  input: StudentInputFields,
  record: StudentRecordFields
): MatchResult {
  // 1. Verify Student ID
  const cleanInputId = cleanId(input.studentId);
  const cleanRecordId = cleanId(record.studentId);
  if (!cleanInputId || !cleanRecordId || cleanInputId !== cleanRecordId) {
    return { isMatch: false };
  }

  // 2. Verify Email
  const cleanInputEmail = cleanString(input.email);
  const cleanRecordEmail = cleanString(record.email);
  if (!cleanInputEmail || !cleanRecordEmail || cleanInputEmail !== cleanRecordEmail) {
    return { isMatch: false };
  }

  // 3. Verify Batch
  const inputBatchNum = extractBatchNumber(input.batch);
  const recordBatchNum = extractBatchNumber(record.batch);
  if (!inputBatchNum || !recordBatchNum || inputBatchNum !== recordBatchNum) {
    return { isMatch: false };
  }

  // 4. Verify Department
  const inputDeptNorm = normalizeDepartment(input.department);
  const effectiveRecordDept = record.dept || record.department || '';
  const recordDeptNorm = normalizeDepartment(effectiveRecordDept);
  if (!inputDeptNorm || !recordDeptNorm || inputDeptNorm !== recordDeptNorm) {
    return { isMatch: false };
  }

  // 5. Verify Full Name (Must match the complete full name; partial names are rejected)
  if (!isFullNameMatch(input.name, record.name)) {
    return { isMatch: false };
  }

  return { isMatch: true };
}
