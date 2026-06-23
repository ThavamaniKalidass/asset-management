import { useRef, useState, type ChangeEvent } from 'react';
import { Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { assetsApi } from '@/lib/api';

interface ImportExportProps {
  onImportSuccess?: () => void;
  disabled?: boolean;
}

export interface ImportSummary {
  totalRows: number;
  imported: number;
  duplicateRows: number;
  failedRows: number;
  errors: string[];
  duplicates: string[];
  message?: string;
}

export default function ImportExport({ onImportSuccess, disabled }: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [showAllDuplicates, setShowAllDuplicates] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setErrorMessage('');
    setSummary(null);
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls'].includes(extension || '')) {
      setErrorMessage('Please upload a valid .xlsx or .xls file.');
      event.target.value = '';
      return;
    }

    try {
      setLoading(true);
      setProgress(10);
      const result = await assetsApi.importExcel(file);
      setProgress(100);
      setSummary(result);
      if (result.imported > 0) {
        onImportSuccess?.();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Import failed.');
    } finally {
      setTimeout(() => setProgress(0), 300);
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xls,.xlsx"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || loading}
          className={`btn-secondary h-12 min-w-[160px] w-full sm:w-auto flex items-center justify-center gap-2 text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="w-4 h-4" />
          Import Excel
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{progress < 100 ? 'Processing file...' : 'Finalizing...'}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {summary && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm max-h-[350px] overflow-hidden">
          <div className="flex items-center gap-2 text-slate-900 font-medium mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Import summary</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Total rows</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{summary.totalRows}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Imported</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{summary.imported}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Duplicates</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{summary.duplicateRows}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Failed</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{summary.failedRows}</p>
            </div>
          </div>

          {(summary.errors.length > 0 || summary.duplicates.length > 0) && (
            <div className="mt-4 space-y-4 overflow-hidden">
              {summary.errors.length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-800">Errors</p>
                    {summary.errors.length > 10 && (
                      <button
                        type="button"
                        onClick={() => setShowAllErrors((prev) => !prev)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        {showAllErrors ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                  <ul className="mt-2 max-h-[180px] overflow-y-auto text-[12px] leading-5 text-slate-600 space-y-1">
                    {(showAllErrors ? summary.errors : summary.errors.slice(0, 10)).map((item, index) => (
                      <li key={`err-${index}`} className="list-disc list-inside">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {summary.duplicates.length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-800">Duplicates</p>
                    {summary.duplicates.length > 10 && (
                      <button
                        type="button"
                        onClick={() => setShowAllDuplicates((prev) => !prev)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        {showAllDuplicates ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                  <ul className="mt-2 max-h-[180px] overflow-y-auto text-[12px] leading-5 text-slate-600 space-y-1">
                    {(showAllDuplicates ? summary.duplicates : summary.duplicates.slice(0, 10)).map((item, index) => (
                      <li key={`dup-${index}`} className="list-disc list-inside">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
