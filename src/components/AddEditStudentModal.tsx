import React, { useState } from 'react';
import { X, UserPlus, Save, CheckCircle2 } from 'lucide-react';
import { StudentRecord } from '../types/student';

interface AddEditStudentModalProps {
  studentToEdit?: StudentRecord | null;
  onClose: () => void;
  onSave: (student: StudentRecord) => void;
}

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  studentToEdit,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState(studentToEdit?.fullName || '');
  const [prn, setPrn] = useState(studentToEdit?.prn || '');
  const [email, setEmail] = useState(studentToEdit?.email || '');
  const [department, setDepartment] = useState(studentToEdit?.department || 'MCA');
  const [division, setDivision] = useState(studentToEdit?.division || 'A');
  const [currentYear, setCurrentYear] = useState(studentToEdit?.currentYear || 'SY');
  const [blazerPhotoUrl, setBlazerPhotoUrl] = useState(studentToEdit?.blazerPhotoUrl || '');
  const [passportPhotoUrl, setPassportPhotoUrl] = useState(studentToEdit?.passportPhotoUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !prn) return;

    const newRecord: StudentRecord = {
      id: studentToEdit?.id || `student-${Date.now()}`,
      timestamp: studentToEdit?.timestamp || new Date().toLocaleString(),
      fullName: fullName.trim(),
      prn: prn.trim(),
      email: email.trim() || `${prn}@mitwpu.edu.in`,
      department: department.trim(),
      division: division.trim(),
      currentYear: currentYear.trim(),
      blazerPhotoUrl: blazerPhotoUrl.trim(),
      passportPhotoUrl: passportPhotoUrl.trim(),
    };

    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600/30 rounded-xl border border-emerald-500/30 text-emerald-400">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {studentToEdit ? 'Edit Student Record' : 'Add New Student Record'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Fill in PRN, department, and photo links</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Yash Sunil Masne"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                PRN No. *
              </label>
              <input
                type="text"
                required
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                placeholder="e.g. 1272250088"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MCA">MCA</option>
                <option value="MSC CS">MSC CS</option>
                <option value="MSC DSBSA">MSC DSBSA</option>
                <option value="MSC BT">MSC BT</option>
                <option value="BSC CS">BSC CS</option>
                <option value="BSC DSBDA">BSC DSBDA</option>
                <option value="BCA">BCA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Division
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
                <option value="D">Division D</option>
                <option value="E">Division E</option>
                <option value="NA">NA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Year
              </label>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SY">SY</option>
                <option value="FY">FY</option>
                <option value="TY">TY</option>
                <option value="NA">NA</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. 1272250088@mitwpu.edu.in"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Passport Size Photo (Google Drive / Image URL)
            </label>
            <input
              type="url"
              value={passportPhotoUrl}
              onChange={(e) => setPassportPhotoUrl(e.target.value)}
              placeholder="https://drive.google.com/open?id=..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Blazer & Uniform Photo (Google Drive / Image URL)
            </label>
            <input
              type="url"
              value={blazerPhotoUrl}
              onChange={(e) => setBlazerPhotoUrl(e.target.value)}
              placeholder="https://drive.google.com/open?id=..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Student</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
