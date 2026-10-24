import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { StudentRecord, FilterState, ViewMode } from './types/student';
import { parseCSVToStudentRecords } from './services/csvParser';
import { generateStudentPdf, prepareStudentPdfObject } from './services/pdfExporter';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { StatsOverview } from './components/StatsOverview';
import { StudentCard } from './components/StudentCard';
import { StudentGallery } from './components/StudentGallery';
import { StudentTable } from './components/StudentTable';
import { StudentModal } from './components/StudentModal';
import { SheetSyncModal } from './components/SheetSyncModal';
import { AddEditStudentModal } from './components/AddEditStudentModal';
import { BatchPdfModal } from './components/BatchPdfModal';
import { AiAssistant } from './components/AiAssistant';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { LoadingScreen } from './components/LoadingScreen';
import { GoogleFormModal } from './components/GoogleFormModal';
import { PdfExportLoadingModal } from './components/PdfExportLoadingModal';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  department: 'ALL',
  division: 'ALL',
  currentYear: 'ALL',
  photoFilter: 'all',
  sortBy: 'prn_asc',
};

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function App() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Splash Loading Screen & Screen Navigation State
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'portal' | 'login_page'>('login_page');

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [logoutReason, setLogoutReason] = useState<string | null>(null);

  // Google Form ENV URL State
  const [googleFormUrl, setGoogleFormUrl] = useState('https://docs.google.com/forms/d/e/1FAIpQLSc_ExampleForm/viewform');
  const [isGoogleFormOpen, setIsGoogleFormOpen] = useState(false);

  // PDF Export Loading Overlay State
  const [exportLoading, setExportLoading] = useState<{
    isExporting: boolean;
    studentName?: string;
    prn?: string;
    progress: number;
    isReady: boolean;
    downloadFn?: () => void;
  } | null>(null);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch configured GOOGLE_FORM_URL from environment API
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.formUrl) {
          setGoogleFormUrl(data.formUrl);
        }
      })
      .catch((err) => console.warn('Config fetch error:', err));
  }, []);

  const handleLogout = useCallback((reason?: string) => {
    sessionStorage.removeItem('app_auth_token');
    sessionStorage.removeItem('app_admin_user');
    localStorage.removeItem('app_auth_token');
    localStorage.removeItem('app_admin_user');
    
    setIsLoggedIn(false);
    setLoggedInUser('');
    setCurrentScreen('login_page');

    if (reason === 'inactivity') {
      setLogoutReason('Logged out automatically due to 5 minutes of inactivity.');
    }
  }, []);

  // Check saved session on mount & verify JWT token with server
  useEffect(() => {
    const savedUser = localStorage.getItem('app_admin_user') || sessionStorage.getItem('app_admin_user');
    const savedToken = localStorage.getItem('app_auth_token') || sessionStorage.getItem('app_auth_token');

    if (savedUser && savedToken) {
      fetch('/api/verify-token', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setIsLoggedIn(true);
            setLoggedInUser(savedUser);
            setCurrentScreen('portal');
          } else {
            handleLogout('inactivity');
          }
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [handleLogout]);

  // Inactivity Auto-Logout Timer (5 Minutes)
  useEffect(() => {
    if (!isLoggedIn) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout('inactivity');
      }, INACTIVITY_TIMEOUT_MS);
    };

    resetInactivityTimer();

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [isLoggedIn, handleLogout]);

  const handleFinishSplash = () => {
    setIsSplashLoading(false);
    const savedUser = localStorage.getItem('app_admin_user') || sessionStorage.getItem('app_admin_user');
    const savedToken = localStorage.getItem('app_auth_token') || sessionStorage.getItem('app_auth_token');
    if (savedUser && savedToken && isLoggedIn) {
      setCurrentScreen('portal');
    } else {
      setCurrentScreen('login_page');
    }
  };

  const handleLoginSuccess = (token: string, userAppId: string) => {
    sessionStorage.setItem('app_auth_token', token);
    sessionStorage.setItem('app_admin_user', userAppId);
    localStorage.setItem('app_auth_token', token);
    localStorage.setItem('app_admin_user', userAppId);
    
    setIsLoggedIn(true);
    setLoggedInUser(userAppId);
    setLogoutReason(null);
    setCurrentScreen('portal');
  };

  // Modal States
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [defaultPhotoTab, setDefaultPhotoTab] = useState<'passport' | 'blazer'>('passport');
  const [isSheetSyncOpen, setIsSheetSyncOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentRecord | null>(null);
  const [isBatchPdfOpen, setIsBatchPdfOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Export Individual Student PDF with Instant Loading Overlay & Download Confirmation
  const handleExportIndividualPdf = async (student: StudentRecord) => {
    // 1. Instantly trigger loading screen overlay
    setExportLoading({
      isExporting: true,
      studentName: student.fullName,
      prn: student.prn,
      progress: 10,
      isReady: false,
    });

    // 2. Yield UI thread so browser repaints DOM and renders loading screen immediately
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const prepared = await prepareStudentPdfObject(student, (percent: number) => {
        setExportLoading((prev) => (prev ? { ...prev, progress: percent } : null));
      });

      setExportLoading({
        isExporting: true,
        studentName: student.fullName,
        prn: student.prn,
        progress: 100,
        isReady: true,
        downloadFn: prepared.download,
      });
    } catch (err) {
      console.error('Export error:', err);
      setExportLoading(null);
    }
  };

  // Export Task with Instant Loading Overlay & Download Confirmation
  const handleStartExportWithLoading = async (
    titleName: string,
    prnCode: string,
    task: () => Promise<void>
  ) => {
    // 1. Instantly trigger loading screen overlay
    setExportLoading({
      isExporting: true,
      studentName: titleName,
      prn: prnCode,
      progress: 10,
      isReady: false,
    });

    // 2. Yield UI thread so browser repaints DOM and renders loading screen immediately
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      await task();
      setExportLoading({
        isExporting: true,
        studentName: titleName,
        prn: prnCode,
        progress: 100,
        isReady: true,
        downloadFn: undefined,
      });
    } catch (err) {
      console.error('Task export error:', err);
      setExportLoading(null);
    }
  };

  // Load default dataset on mount
  const loadDefaultDataset = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/default-dataset');
      if (!response.ok) {
        throw new Error(`Failed to load student dataset (Status: ${response.status})`);
      }
      const csvText = await response.text();
      const records = parseCSVToStudentRecords(csvText);
      setStudents(records);
    } catch (err: any) {
      console.error('Error loading default dataset:', err);
      setError(err.message || 'Failed to load dataset.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDefaultDataset();
  }, []);

  // Filter & Sort student records
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase().trim();
          const matchPrn = s.prn.toLowerCase().includes(query);
          const matchName = s.fullName.toLowerCase().includes(query);
          const matchEmail = s.email.toLowerCase().includes(query);
          if (!matchPrn && !matchName && !matchEmail) return false;
        }

        if (filters.department !== 'ALL') {
          if (s.department !== filters.department) return false;
        }

        if (filters.division !== 'ALL') {
          if (s.division !== filters.division) return false;
        }

        if (filters.currentYear !== 'ALL') {
          if (s.currentYear !== filters.currentYear) return false;
        }

        if (filters.photoFilter === 'both_available') {
          if (!s.blazerPhotoUrl || !s.passportPhotoUrl) return false;
        } else if (filters.photoFilter === 'blazer_only') {
          if (!s.blazerPhotoUrl || s.passportPhotoUrl) return false;
        } else if (filters.photoFilter === 'passport_only') {
          if (!s.passportPhotoUrl || s.blazerPhotoUrl) return false;
        } else if (filters.photoFilter === 'missing_any') {
          if (s.blazerPhotoUrl && s.passportPhotoUrl) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'prn_asc') {
          return a.prn.localeCompare(b.prn, undefined, { numeric: true });
        }
        if (filters.sortBy === 'prn_desc') {
          return b.prn.localeCompare(a.prn, undefined, { numeric: true });
        }
        if (filters.sortBy === 'name_asc') {
          return a.fullName.localeCompare(b.fullName);
        }
        if (filters.sortBy === 'timestamp_desc') {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return 0;
      });
  }, [students, filters]);

  // Sync Google Sheet by URL
  const handleSyncGoogleSheet = async (sheetUrl: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/fetch-google-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl }),
      });

      if (!response.ok) return false;
      const csvText = await response.text();
      const newRecords = parseCSVToStudentRecords(csvText);
      setStudents(newRecords);
      return true;
    } catch (err) {
      console.error('Sheet sync error:', err);
      return false;
    }
  };

  // Sync uploaded CSV file
  const handleUploadCsv = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const newRecords = parseCSVToStudentRecords(text);
      if (newRecords.length === 0) return false;
      setStudents(newRecords);
      return true;
    } catch (err) {
      console.error('CSV upload error:', err);
      return false;
    }
  };

  // Add / Edit Student Record
  const handleSaveStudent = (record: StudentRecord) => {
    setStudents((prev) => {
      const existsIdx = prev.findIndex((s) => s.id === record.id || s.prn === record.prn);
      if (existsIdx >= 0) {
        const updated = [...prev];
        updated[existsIdx] = record;
        return updated;
      }
      return [record, ...prev];
    });
  };

  // Export filtered list to CSV
  const handleExportCsv = () => {
    const headers = [
      'PRN',
      'Full Name',
      'Department',
      'Division',
      'Current Year',
      'Email Address',
      'Passport Photo URL',
      'Blazer Photo URL',
      'Timestamp',
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.prn}"`,
      `"${s.fullName}"`,
      `"${s.department}"`,
      `"${s.division}"`,
      `"${s.currentYear}"`,
      `"${s.email}"`,
      `"${s.passportPhotoUrl}"`,
      `"${s.blazerPhotoUrl}"`,
      `"${s.timestamp}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Student_Records_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Splash Loading Screen first
  if (isSplashLoading) {
    return <LoadingScreen onFinishLoading={handleFinishSplash} />;
  }

  // Render standalone Login Page (Mandatory login required)
  if (!isLoggedIn || currentScreen === 'login_page') {
    return (
      <div className="relative">
        {logoutReason && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-xl flex items-center gap-2 animate-bounce">
            <AlertCircle className="w-4 h-4" />
            <span>{logoutReason}</span>
          </div>
        )}
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        totalCount={students.length}
        filteredCount={filteredStudents.length}
        currentView={viewMode}
        onViewChange={setViewMode}
        onOpenSheetSync={() => setIsSheetSyncOpen(true)}
        onOpenAddModal={() => {
          if (googleFormUrl) {
            window.open(googleFormUrl, '_blank', 'noopener,noreferrer');
          }
        }}
        onOpenBatchPdf={() => setIsBatchPdfOpen(true)}
        onExportCsv={handleExportCsv}
        isLoading={isLoading}
        onRefreshData={loadDefaultDataset}
        isLoggedIn={isLoggedIn}
        loggedInUser={loggedInUser}
        onOpenLogin={() => setCurrentScreen('login_page')}
        onLogout={() => handleLogout()}
      />

      {/* Filter & Search Toolbar */}
      <FilterBar
        filters={filters}
        onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
        onResetFilters={() => setFilters(INITIAL_FILTERS)}
        activeCount={filteredStudents.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error State Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadDefaultDataset}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm font-extrabold text-slate-700">Loading Student Image & Document Data...</p>
            <p className="text-xs text-slate-400">Parsing Google Drive attachments & Form responses</p>
          </div>
        ) : (
          <>
            {/* Visual Overview Statistics Header */}
            <StatsOverview students={students} />

            {/* Active Filters Bar Indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                <span>Displaying <strong>{filteredStudents.length}</strong> Records</span>
                {filters.department !== 'ALL' && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                    Dept: {filters.department}
                  </span>
                )}
                {filters.division !== 'ALL' && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                    Div: {filters.division}
                  </span>
                )}
              </div>

              <button
                onClick={handleExportCsv}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <span>Export CSV</span>
              </button>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onPreview={(s, defaultPhoto) => {
                      setSelectedStudent(s);
                      setDefaultPhotoTab(defaultPhoto);
                    }}
                    onExportPdf={handleExportIndividualPdf}
                    onEdit={(s) => {
                      setStudentToEdit(s);
                      setIsAddModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Photo Comparison Gallery View */}
            {viewMode === 'gallery' && (
              <StudentGallery
                students={filteredStudents}
                onPreview={(s, defaultPhoto) => {
                  setSelectedStudent(s);
                  setDefaultPhotoTab(defaultPhoto);
                }}
              />
            )}

            {/* Spreadsheet Table View */}
            {viewMode === 'table' && (
              <StudentTable
                students={filteredStudents}
                onPreview={(s, defaultPhoto) => {
                  setSelectedStudent(s);
                  setDefaultPhotoTab(defaultPhoto);
                }}
                onExportPdf={handleExportIndividualPdf}
              />
            )}

            {/* Empty State */}
            {filteredStudents.length === 0 && !isLoading && (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm my-6">
                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Student Records Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Try searching for a different PRN (e.g. 1272250088), clearing filters, or syncing a Google Sheet.
                </p>
                <button
                  onClick={() => setFilters(INITIAL_FILTERS)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Placement Celebration Student Image Collection Portal</strong>
          </div>
          <div>
            Departments: MCA, MSC CS, MSC DSBSA, MSC BT, BSC CS, BSC DSBDA, BCA
          </div>
        </div>
      </footer>

      {/* Google Form Modal (Opened when clicking Add Student) */}
      {isGoogleFormOpen && (
        <GoogleFormModal
          formUrl={googleFormUrl}
          onClose={() => setIsGoogleFormOpen(false)}
        />
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Student Lightbox Modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          defaultPhoto={defaultPhotoTab}
          onClose={() => setSelectedStudent(null)}
          onExportPdf={handleExportIndividualPdf}
        />
      )}

      {/* Google Sheet Sync Modal */}
      {isSheetSyncOpen && (
        <SheetSyncModal
          onClose={() => setIsSheetSyncOpen(false)}
          onSyncGoogleSheetUrl={handleSyncGoogleSheet}
          onUploadCsvFile={handleUploadCsv}
        />
      )}

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <AddEditStudentModal
          studentToEdit={studentToEdit}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveStudent}
        />
      )}

      {/* Batch PDF Modal */}
      {isBatchPdfOpen && (
        <BatchPdfModal
          students={filteredStudents}
          activeFilterTitle={
            filters.department === 'ALL'
              ? 'All Departments'
              : `${filters.department} Branch`
          }
          onClose={() => setIsBatchPdfOpen(false)}
          onStartExportWithLoading={handleStartExportWithLoading}
        />
      )}

      {/* AI Assistant Modal */}
      {isAiAssistantOpen && (
        <AiAssistant
          students={students}
          onClose={() => setIsAiAssistantOpen(false)}
        />
      )}

      {/* PDF Export Loading Screen Overlay */}
      {exportLoading && exportLoading.isExporting && (
        <PdfExportLoadingModal
          studentName={exportLoading.studentName}
          prn={exportLoading.prn}
          progress={exportLoading.progress}
          isReady={exportLoading.isReady}
          onDownload={() => {
            if (exportLoading.downloadFn) {
              exportLoading.downloadFn();
            }
            setExportLoading(null);
          }}
          onCancel={() => setExportLoading(null)}
        />
      )}

    </div>
  );
}
