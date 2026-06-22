import { useRef, useState, type ChangeEvent } from 'react';
import { Download, Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { assetsApi } from '@/lib/api';

interface ImportExportProps {
  onImportSuccess?: () => void;
  disabled?: boolean;
}

export interface ImportSummary {
  imported: number;
  processed: number;
  skipped: number;
  errors: string[];
  duplicates: string[];
  message?: string;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ImportExport({ onImportSuccess, disabled }: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

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
      const formData = new FormData();
      formData.append('file', file);
      setProgress(35);
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

  async function handleDownloadTemplate() {
    try {
      setErrorMessage('');
      setLoading(true);
      setProgress(20);
      const blob = await assetsApi.downloadTemplate();
      setProgress(80);
      saveBlob(blob, 'Asset_Import_Template.xlsx');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not download template.');
    } finally {
      setTimeout(() => setProgress(0), 300);
      setLoading(false);
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
          className={`btn-secondary flex items-center gap-2 text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="w-4 h-4" />
          Import Excel
        </button>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={disabled || loading}
          className={`btn-primary flex items-center gap-2 text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Download className="w-4 h-4" />
          Download Template
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
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-medium mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Import summary</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Imported</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{summary.imported}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Processed</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{summary.processed}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Skipped</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{summary.skipped}</p>
            </div>
          </div>
          {(summary.errors.length > 0 || summary.duplicates.length > 0) && (
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              {summary.errors.length > 0 && (
                <div>
                  <p className="font-medium text-slate-800">Errors</p>
                  <ul className="list-disc list-inside">
                    {summary.errors.map((item, index) => (
                      <li key={`err-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {summary.duplicates.length > 0 && (
                <div>
                  <p className="font-medium text-slate-800">Duplicates</p>
                  <ul className="list-disc list-inside">
                    {summary.duplicates.map((item, index) => (
                      <li key={`dup-${index}`}>{item}</li>
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
