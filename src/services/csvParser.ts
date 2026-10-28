import Papa from 'papaparse';
import { StudentRecord } from '../types/student';

export function parseCSVToStudentRecords(csvContent: string): StudentRecord[] {
  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const records: StudentRecord[] = [];

  result.data.forEach((row, index) => {
    // Fuzzy field extraction
    const keys = Object.keys(row);

    const findValue = (possibleNames: string[]): string => {
      for (const name of possibleNames) {
        const foundKey = keys.find(
          (k) => k.toLowerCase().trim() === name.toLowerCase().trim() || k.toLowerCase().includes(name.toLowerCase())
        );
        if (foundKey && row[foundKey] !== undefined) {
          return row[foundKey].trim();
        }
      }
      return '';
    };

    const timestamp = findValue(['Timestamp', 'Time']);
    const email = findValue(['Email Address', 'Email', 'Mail']);
    const fullName = findValue(['Full Name', 'Name', 'Student Name']);
    const prn = findValue(['PRN', 'PRN No', 'PRN Number', 'Roll No']);
    const department = findValue(['Department and Branch', 'Department', 'Branch', 'Course']);
    
    const blazerPhotoUrl = findValue([
      'Creative Photo in Plain Background and Complete Uniform Including Blazer',
      'Plain Background and Complete Uniform Including Blazer',
      'Blazer Photo',
      'Creative Photo',
      'Uniform Photo'
    ]);
    
    const passportPhotoUrl = findValue([
      'Latest Passport Size Photo',
      'Passport Size Photo',
      'Passport Photo',
      'Photo'
    ]);

    const division = findValue(['Division', 'Div']);
    const currentYear = findValue(['Current Year', 'Year']);

    // Only include if PRN or Name is present
    if (fullName || prn || email) {
      records.push({
        id: `student-${prn || index}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: timestamp || new Date().toLocaleString(),
        email: email || 'N/A',
        fullName: fullName || 'Unnamed Student',
        prn: prn || `PRN-${1000000000 + index}`,
        department: sanitizeDepartment(department),
        blazerPhotoUrl: blazerPhotoUrl || '',
        passportPhotoUrl: passportPhotoUrl || '',
        division: division || 'NA',
        currentYear: sanitizeYear(currentYear),
      });
    }
  });

  return records;
}

function sanitizeYear(yearRaw: string): string {
  if (!yearRaw) return 'NA';
  const clean = yearRaw.trim();
  const upper = clean.toUpperCase();

  if (upper.includes('HONOR') || upper.includes('HONOUR')) return 'Honors';
  if (upper === 'FY' || upper.includes('FIRST') || upper.includes('1ST')) return 'FY';
  if (upper === 'SY' || upper.includes('SECOND') || upper.includes('2ND')) return 'SY';
  if (upper === 'TY' || upper.includes('THIRD') || upper.includes('3RD')) return 'TY';

  return clean || 'NA';
}

function sanitizeDepartment(deptRaw: string): string {
  if (!deptRaw) return 'MCA';
  const clean = deptRaw.trim().toUpperCase();

  if (clean.includes('MCA')) return 'MCA';
  if (clean.includes('MSC CS') || clean.includes('M.SC. CS') || clean.includes('MSC COMPUTER SCIENCE')) return 'MSC CS';
  if (clean.includes('DSBSA') || clean.includes('BUSINESS ANALYTICS')) return 'MSC DSBSA';
  if (clean.includes('MSC BT') || clean.includes('BIOTECH')) return 'MSC BT';
  if (clean.includes('BSC CC') || clean.includes('CLOUD COMPUTING') || clean.includes('CLOUD')) return 'BSC CC';
  if (clean.includes('BSC CS') || clean.includes('B.SC. CS')) return 'BSC CS';
  if (clean.includes('DSBDA') || clean.includes('DATA SCIENCE')) return 'BSC DSBDA';
  if (clean.includes('BCA')) return 'BCA';

  return clean || 'MCA';
}
