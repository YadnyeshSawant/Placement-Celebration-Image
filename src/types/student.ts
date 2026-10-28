export interface StudentRecord {
  id: string; // generated unique id
  timestamp: string;
  email: string;
  fullName: string;
  prn: string;
  department: string; // MCA, MSC CS, MSC DSBSA, MSC BT, BSC CS, BSC DSBDA, BCA, etc.
  blazerPhotoUrl: string; // Creative Photo in Plain Background and Complete Uniform Including Blazer
  passportPhotoUrl: string; // Latest Passport Size Photo
  division: string; // A, B, C, D, E, NA
  currentYear: string; // FY, SY, TY, Honors, NA
}

export type DepartmentType =
  | 'ALL'
  | 'MCA'
  | 'MSC CS'
  | 'MSC DSBSA'
  | 'MSC BT'
  | 'BSC CC'
  | 'BSC CS'
  | 'BSC DSBDA'
  | 'BCA'
  | 'OTHER';

export const DEPARTMENTS: { id: DepartmentType; label: string; count?: number }[] = [
  { id: 'ALL', label: 'All Departments' },
  { id: 'MCA', label: 'MCA' },
  { id: 'MSC CS', label: 'MSC CS' },
  { id: 'MSC DSBSA', label: 'MSC DSBSA' },
  { id: 'MSC BT', label: 'MSC BT' },
  { id: 'BSC CC', label: 'BSC CC (Cloud Computing)' },
  { id: 'BSC CS', label: 'BSC CS' },
  { id: 'BSC DSBDA', label: 'BSC DSBDA' },
  { id: 'BCA', label: 'BCA' },
];

export function getDepartmentDisplayName(dept?: string | null): string {
  if (!dept) return '';
  const trimmed = dept.trim();
  const upper = trimmed.toUpperCase();
  if (
    upper === 'BSC CC' ||
    upper === 'BSC CC (CLOUD COMPUTING)' ||
    upper.includes('CLOUD COMPUTING') ||
    upper.includes('CLOUD')
  ) {
    return 'BSC CC (Cloud Computing)';
  }
  const match = DEPARTMENTS.find((d) => d.id === upper);
  if (match && match.id !== 'ALL') {
    return match.label;
  }
  return trimmed;
}

export type ViewMode = 'grid' | 'gallery' | 'table' | 'analytics';

export interface FilterState {
  searchQuery: string; // PRN or Name search
  department: string;
  division: string;
  currentYear: string;
  photoFilter: 'all' | 'both_available' | 'blazer_only' | 'passport_only' | 'missing_any';
  sortBy: 'prn_asc' | 'prn_desc' | 'name_asc' | 'timestamp_desc';
}
