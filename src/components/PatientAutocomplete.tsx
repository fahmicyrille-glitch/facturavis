'use client';

import { useState } from 'react';

interface Patient {
  id: string;
  nom_complet: string;
  email: string;
}

interface PatientAutocompleteProps {
  patients: Patient[];
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (patient: Patient) => void;
  placeholder?: string;
  required?: boolean;
  showEmail?: boolean;
}

export default function PatientAutocomplete({
  patients,
  label,
  value,
  onChange,
  onSelect,
  placeholder = '',
  required = false,
  showEmail = false,
}: PatientAutocompleteProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = patients.filter(p => {
    if (!value) return false;
    return p.nom_complet.toLowerCase().includes(value.toLowerCase());
  });

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-gray-900 mb-1.5">{label}</label>
      <input
        type="text"
        required={required}
        className="w-full border border-black text-black rounded-md py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder={placeholder}
      />
      {showDropdown && value.length > 0 && filtered.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filtered.map(p => (
            <li
              key={p.id}
              onClick={() => { onSelect(p); setShowDropdown(false); }}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-black flex flex-col border-b border-gray-50 last:border-none"
            >
              <span className="font-bold">{p.nom_complet}</span>
              {showEmail && <span className="text-[10px] text-gray-600">{p.email}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
