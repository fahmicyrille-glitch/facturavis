'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, X, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ImportCSVProps {
  userId: string;
  onImportComplete: () => void;
}

export default function ImportCSV({ userId, onImportComplete }: ImportCSVProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number; duplicates: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());

      if (lines.length < 2) {
        setResult({ success: 0, errors: 0, duplicates: 0 });
        return;
      }

      // Parse header to find columns
      const header = lines[0].toLowerCase().split(/[;,\t]/);
      const nomIdx = header.findIndex(h => h.includes('nom'));
      const emailIdx = header.findIndex(h => h.includes('email') || h.includes('mail'));
      const telIdx = header.findIndex(h => h.includes('tel') || h.includes('phone'));
      const adresseIdx = header.findIndex(h => h.includes('adresse') || h.includes('address'));

      if (nomIdx === -1 || emailIdx === -1) {
        alert("Le fichier doit contenir au minimum les colonnes 'nom' et 'email'.");
        setImporting(false);
        return;
      }

      // Fetch existing patients to check duplicates
      const { data: existing } = await supabase
        .from('patients')
        .select('nom_complet, email')
        .eq('therapeute_id', userId);

      const existingSet = new Set(
        (existing || []).map(p => `${p.nom_complet.toLowerCase()}|${p.email.toLowerCase()}`)
      );

      let success = 0;
      let errors = 0;
      let duplicates = 0;
      const batch: { therapeute_id: string; nom_complet: string; email: string; telephone?: string; adresse?: string; notes_consultation: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[;,\t]/);
        const nom = cols[nomIdx]?.trim();
        const email = cols[emailIdx]?.trim().toLowerCase();

        if (!nom || !email) {
          errors++;
          continue;
        }

        const key = `${nom.toLowerCase()}|${email}`;
        if (existingSet.has(key)) {
          duplicates++;
          continue;
        }

        existingSet.add(key);
        batch.push({
          therapeute_id: userId,
          nom_complet: nom,
          email,
          telephone: telIdx >= 0 ? cols[telIdx]?.trim() || '' : '',
          adresse: adresseIdx >= 0 ? cols[adresseIdx]?.trim() || '' : '',
          notes_consultation: '',
        });
      }

      // Insert in batches of 50
      for (let i = 0; i < batch.length; i += 50) {
        const chunk = batch.slice(i, i + 50);
        const { error } = await supabase.from('patients').insert(chunk);
        if (error) {
          errors += chunk.length;
        } else {
          success += chunk.length;
        }
      }

      setResult({ success, errors, duplicates });
      if (success > 0) onImportComplete();

    } catch (err) {
      console.error('Import error:', err);
      setResult({ success: 0, errors: 1, duplicates: 0 });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm transition-colors"
      >
        <Upload size={16} /> Importer CSV
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-500" /> Importer des patients
          </h3>
          <button onClick={() => { setIsOpen(false); setResult(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-bold mb-2">Format attendu :</p>
          <p className="font-mono text-xs bg-white p-2 rounded border border-blue-200">
            nom;email;telephone;adresse
          </p>
          <p className="mt-2 text-xs">Separateur : virgule, point-virgule ou tabulation. La 1ere ligne doit contenir les en-tetes.</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            accept=".csv,.txt"
            ref={fileRef}
            onChange={handleImport}
            className="hidden"
            id="csv-import"
          />
          <label htmlFor="csv-import" className="cursor-pointer flex flex-col items-center">
            {importing ? (
              <Loader2 size={32} className="text-blue-500 animate-spin mb-2" />
            ) : (
              <Upload size={32} className="text-gray-400 mb-2" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {importing ? 'Import en cours...' : 'Selectionner un fichier CSV'}
            </span>
          </label>
        </div>

        {result && (
          <div className="space-y-2">
            {result.success > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                <CheckCircle size={16} /> {result.success} patient(s) importe(s)
              </div>
            )}
            {result.duplicates > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                <AlertCircle size={16} /> {result.duplicates} doublon(s) ignore(s)
              </div>
            )}
            {result.errors > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} /> {result.errors} erreur(s)
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => { setIsOpen(false); setResult(null); }}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-all"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
