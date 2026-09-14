import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Activity, 
  MapPin, 
  Home, 
  Compass, 
  AlertCircle,
  Building2,
  Sparkles
} from 'lucide-react';
import { Patient } from '../types';
import { COMMON_FIELD_DIAGNOSES, COMMON_CAMPS } from '../lib/db';

interface PatientFormProps {
  initialPatient?: Patient | null;
  onSave: (patientData: Omit<Patient, 'id' | 'createdAt'>, existingId?: string) => Promise<void>;
  onCancel: () => void;
  isHighContrast: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  initialPatient,
  onSave,
  onCancel,
  isHighContrast,
}) => {
  const isEditing = !!initialPatient;

  // Form State
  const [name, setName] = useState(initialPatient?.name || '');
  const [age, setAge] = useState<string>(
    initialPatient?.age !== undefined ? String(initialPatient.age) : ''
  );
  const [diagnosisSelection, setDiagnosisSelection] = useState<string>(() => {
    if (!initialPatient?.diagnosis) return '';
    const exists = (COMMON_FIELD_DIAGNOSES as readonly string[]).includes(initialPatient.diagnosis);
    return exists ? initialPatient.diagnosis : 'Other / Custom Diagnosis';
  });
  const [customDiagnosis, setCustomDiagnosis] = useState<string>(() => {
    if (!initialPatient?.diagnosis) return '';
    const exists = (COMMON_FIELD_DIAGNOSES as readonly string[]).includes(initialPatient.diagnosis);
    return exists ? '' : initialPatient.diagnosis;
  });

  const [camp, setCamp] = useState(initialPatient?.camp || '');
  const [block, setBlock] = useState(initialPatient?.block || '');
  const [household, setHousehold] = useState(initialPatient?.household || '');
  const [landmark, setLandmark] = useState(initialPatient?.landmark || '');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form inputs
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Patient name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Patient name must be at least 2 characters.';
    }

    const parsedAge = parseInt(age, 10);
    if (!age.trim()) {
      newErrors.age = 'Patient age is required.';
    } else if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
      newErrors.age = 'Enter a valid age between 0 and 130.';
    }

    const resolvedDiagnosis =
      diagnosisSelection === 'Other / Custom Diagnosis'
        ? customDiagnosis.trim()
        : diagnosisSelection.trim();

    if (!resolvedDiagnosis) {
      newErrors.diagnosis = 'Please select or enter a diagnosis.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const resolvedDiagnosis =
      diagnosisSelection === 'Other / Custom Diagnosis'
        ? customDiagnosis.trim()
        : diagnosisSelection.trim();

    const parsedAge = parseInt(age, 10);

    setIsSubmitting(true);
    try {
      await onSave(
        {
          name: name.trim(),
          age: parsedAge,
          diagnosis: resolvedDiagnosis,
          camp: camp.trim(),
          block: block.trim(),
          household: household.trim(),
          landmark: landmark.trim(),
        },
        initialPatient?.id
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          id="back-to-list-form-btn"
          onClick={onCancel}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition active:scale-95 ${
            isHighContrast
              ? 'bg-black text-yellow-300 border-2 border-black hover:bg-zinc-800'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient List</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-500">
          {isEditing ? `Editing: ${initialPatient.id}` : 'New Registration'}
        </span>
      </div>

      {/* Main Registration Card */}
      <div 
        className={`p-6 rounded-2xl border shadow-xs ${
          isHighContrast
            ? 'bg-white border-2 border-black'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <User className={`w-6 h-6 ${isHighContrast ? 'text-black' : 'text-emerald-700'}`} />
            <span>{isEditing ? 'Update Patient Record' : 'Register New Patient'}</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the field clinic details below. An official unique patient ID (PAT-XXXXXX) will be generated automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Core Clinical Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>1. Clinical Identification</span>
            </h3>

            {/* Patient Name */}
            <div>
              <label 
                htmlFor="patient-name-input" 
                className="block text-sm font-bold text-slate-800 mb-1.5"
              >
                Patient Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="patient-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Fatima Begum, Mohammad Karim"
                className={`w-full px-4 py-3 rounded-lg text-base outline-none transition font-medium ${
                  errors.name 
                    ? 'border-2 border-red-500 bg-red-50/50 focus:ring-2 focus:ring-red-200' 
                    : isHighContrast
                      ? 'border-2 border-black bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300'
                      : 'border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Age & Diagnosis Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Age */}
              <div className="sm:col-span-1">
                <label 
                  htmlFor="patient-age-input" 
                  className="block text-sm font-bold text-slate-800 mb-1.5"
                >
                  Age (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  id="patient-age-input"
                  type="number"
                  min="0"
                  max="130"
                  required
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (errors.age) setErrors(prev => ({ ...prev, age: '' }));
                  }}
                  placeholder="e.g. 28"
                  className={`w-full px-4 py-3 rounded-lg text-base outline-none transition font-medium ${
                    errors.age 
                      ? 'border-2 border-red-500 bg-red-50/50 focus:ring-2 focus:ring-red-200' 
                      : isHighContrast
                        ? 'border-2 border-black bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300'
                        : 'border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                  }`}
                />
                {errors.age && (
                  <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.age}
                  </p>
                )}
              </div>

              {/* Diagnosis Dropdown / Selector */}
              <div className="sm:col-span-2">
                <label 
                  htmlFor="patient-diagnosis-select" 
                  className="block text-sm font-bold text-slate-800 mb-1.5"
                >
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <select
                  id="patient-diagnosis-select"
                  required
                  value={diagnosisSelection}
                  onChange={(e) => {
                    setDiagnosisSelection(e.target.value);
                    if (errors.diagnosis) setErrors(prev => ({ ...prev, diagnosis: '' }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-base outline-none transition font-medium cursor-pointer ${
                    errors.diagnosis 
                      ? 'border-2 border-red-500 bg-red-50/50' 
                      : isHighContrast
                        ? 'border-2 border-black bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300'
                        : 'border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                  }`}
                >
                  <option value="" disabled>-- Select Diagnosis --</option>
                  {COMMON_FIELD_DIAGNOSES.map((diag) => (
                    <option key={diag} value={diag}>
                      {diag}
                    </option>
                  ))}
                </select>
                {errors.diagnosis && (
                  <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.diagnosis}
                  </p>
                )}
              </div>
            </div>

            {/* Custom Diagnosis Text Input (if Other selected) */}
            {diagnosisSelection === 'Other / Custom Diagnosis' && (
              <div className="pt-2 animate-fadeIn">
                <label 
                  htmlFor="custom-diagnosis-input" 
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Specify Custom Field Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  id="custom-diagnosis-input"
                  type="text"
                  required
                  value={customDiagnosis}
                  onChange={(e) => {
                    setCustomDiagnosis(e.target.value);
                    if (errors.diagnosis) setErrors(prev => ({ ...prev, diagnosis: '' }));
                  }}
                  placeholder="Type specific diagnosis or clinical observations..."
                  className={`w-full px-4 py-2.5 rounded-lg text-sm outline-none font-medium ${
                    isHighContrast
                      ? 'border-2 border-black bg-white'
                      : 'border border-slate-300 bg-white focus:border-emerald-600'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Section 2: Location & Household Information */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>2. Field Location & Household</span>
            </h3>

            {/* Camp Name (with suggestions) */}
            <div>
              <label 
                htmlFor="patient-camp-input" 
                className="block text-sm font-bold text-slate-800 mb-1.5"
              >
                Camp / Settlement
              </label>
              <input
                id="patient-camp-input"
                type="text"
                list="camp-suggestions"
                value={camp}
                onChange={(e) => setCamp(e.target.value)}
                placeholder="e.g. Camp 1 East, Camp 4 Extension, Sector B"
                className={`w-full px-4 py-3 rounded-lg text-base outline-none transition font-medium ${
                  isHighContrast
                    ? 'border-2 border-black bg-white focus:border-yellow-500'
                    : 'border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
              <datalist id="camp-suggestions">
                {COMMON_CAMPS.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>

              {/* Quick Camp Chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold self-center mr-1">Quick:</span>
                {COMMON_CAMPS.slice(0, 4).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCamp(c)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Block & Household Number Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Block */}
              <div>
                <label 
                  htmlFor="patient-block-input" 
                  className="block text-sm font-bold text-slate-800 mb-1.5"
                >
                  Block
                </label>
                <input
                  id="patient-block-input"
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="e.g. Block B-4, Sector 2"
                  className={`w-full px-4 py-3 rounded-lg text-base outline-none transition font-medium ${
                    isHighContrast
                      ? 'border-2 border-black bg-white focus:border-yellow-500'
                      : 'border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                  }`}
                />
              </div>

              {/* Household */}
              <div>
                <label 
                  htmlFor="patient-household-input" 
                  className="block text-sm font-bold text-slate-800 mb-1.5"
                >
                  Household Number
                </label>
                <input
                  id="patient-household-input"
                  type="text"
                  value={household}
                  onChange={(e) => setHousehold(e.target.value)}
                  placeholder="e.g. HH-082, Shelter 419"
                  className={`w-full px-4 py-3 rounded-lg text-base outline-none transition font-medium ${
                    isHighContrast
                      ? 'border-2 border-black bg-white focus:border-yellow-500'
                      : 'border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                  }`}
                />
              </div>
            </div>

            {/* Nearby Landmark */}
            <div>
              <label 
                htmlFor="patient-landmark-input" 
                className="block text-sm font-bold text-slate-800 mb-1.5"
              >
                Nearby Landmark
              </label>
              <input
                id="patient-landmark-input"
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Water Point 3, Behind Red Cross Tent, Near Mosque"
                className={`w-full px-4 py-3 rounded-lg text-base outline-none transition font-medium ${
                  isHighContrast
                    ? 'border-2 border-black bg-white focus:border-yellow-500'
                    : 'border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              id="cancel-patient-form-btn"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="save-patient-btn"
              disabled={isSubmitting}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-bold text-base shadow-md active:scale-98 transition ${
                isHighContrast
                  ? 'bg-black text-yellow-300 hover:bg-zinc-800 border-2 border-black'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Patient' : 'Save Patient'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
