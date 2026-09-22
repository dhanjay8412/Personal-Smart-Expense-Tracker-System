import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { transactionService } from '../../services/transactionService';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

export const CSVImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [fileText, setFileText] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'result'
  const [previewData, setPreviewData] = useState(null);
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return { valid: false, message: 'No file selected.' };

    const name = file.name || '';
    const ext = '.' + name.split('.').pop().toLowerCase();
    const allowedExtensions = ['.csv', '.jpg', '.jpeg', '.png', '.pdf'];

    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        message: 'Unsupported file type. Please upload a CSV, JPG, PNG, or PDF file.',
      };
    }

    const mime = (file.type || '').toLowerCase();
    if (mime) {
      const allowedMimes = [
        'text/csv',
        'text/comma-separated-values',
        'application/vnd.ms-excel',
        'application/csv',
        'text/plain',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
      ];

      if (!allowedMimes.includes(mime)) {
        return {
          valid: false,
          message: 'Unsupported file type. Please upload a CSV, JPG, PNG, or PDF file.',
        };
      }
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        valid: false,
        message: 'File size exceeds 5MB limit.',
      };
    }

    return { valid: true, ext };
  };

  const handleFile = (file) => {
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.message);
      setFileName('');
      setFileText('');
      setSelectedFile(null);
      return;
    }

    setError('');
    setFileName(file.name);
    setSelectedFile(file);

    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (ext === '.csv') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result || '';
        if (!text.trim()) {
          setError('CSV file is empty.');
          setFileText('');
          return;
        }
        setFileText(text);
      };
      reader.onerror = () => {
        setError('Error reading file. Please try again.');
      };
      reader.readAsText(file);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const fileKind = ext === '.pdf' ? 'PDF Document' : 'Image File';
      const csvContent = `Date,Description,Amount,Type,Category,Payment Method,Notes\n${today},"${file.name.replace(/"/g, '""')}",0,Expense,Other,Other,"Uploaded ${fileKind}: ${file.name}"`;
      setFileText(csvContent);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = '';
  };

  const handleBrowseClick = (e) => {
    if (e) e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handlePreview = async () => {
    if (!fileText) {
      setError('Please select a CSV, JPG, PNG, or PDF file to upload.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await transactionService.importPreview(fileText);
      if (res.success && res.data) {
        setPreviewData(res.data);
        setStep('preview');
      } else {
        setError(res.message || 'Failed to parse file.');
      }
    } catch (err) {
      setError(err.message || 'Error processing file. Please verify file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;

    let rowsToImport = [...(previewData.validRows || [])];
    if (includeDuplicates && previewData.duplicateRows) {
      rowsToImport = [...rowsToImport, ...previewData.duplicateRows];
    }

    if (rowsToImport.length === 0) {
      setError('No valid rows available to import.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await transactionService.confirmImport(rowsToImport);
      if (res.success) {
        setImportResult(res.data);
        setStep('result');
        onSuccess();
      } else {
        setError(res.message || 'Import failed.');
      }
    } catch (err) {
      setError(err.message || 'Error confirming import.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setFileText('');
    setFileName('');
    setSelectedFile(null);
    setStep('upload');
    setPreviewData(null);
    setIncludeDuplicates(false);
    setImportResult(null);
    setError('');
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const totalImportable = (previewData?.validCount || 0) + (includeDuplicates ? previewData?.duplicateCount || 0 : 0);

  return (
    <Modal isOpen={isOpen} onClose={resetModal} title="Import File (CSV, Image, PDF)" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-sky-400 bg-sky-500/10'
                  : 'border-slate-700/80 hover:border-sky-500/50 bg-slate-900/60'
              }`}
            >
              <Upload className="w-10 h-10 text-sky-400 mx-auto mb-3 animate-pulse" />
              <h4 className="font-bold text-sm text-slate-100">Select or Drag File</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Supports CSV, JPG, PNG, or PDF files (max 5MB)
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.jpg,.jpeg,.png,.pdf"
                id="csv-file-input"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center justify-center gap-3 mt-4">
                <Button variant="secondary" size="sm" icon={FileText} type="button" onClick={handleBrowseClick}>
                  Browse File
                </Button>
              </div>

              {fileName && (
                <p className="text-xs font-bold text-emerald-400 mt-3">
                  ✓ Selected File: {fileName}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={resetModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handlePreview} isLoading={isLoading} disabled={!fileText}>
                Preview & Validate File
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 'preview' && previewData && (
          <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <span className="text-xs text-slate-400 block">Valid Rows</span>
                <span className="text-lg font-extrabold text-emerald-400">{previewData.validCount}</span>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                <span className="text-xs text-slate-400 block">Duplicates</span>
                <span className="text-lg font-extrabold text-amber-400">{previewData.duplicateCount}</span>
              </div>
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                <span className="text-xs text-slate-400 block">Invalid Rows</span>
                <span className="text-lg font-extrabold text-rose-400">{previewData.invalidCount}</span>
              </div>
            </div>

            {/* Toggle duplicates if present */}
            {previewData.duplicateCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="inc-dups"
                  checked={includeDuplicates}
                  onChange={(e) => setIncludeDuplicates(e.target.checked)}
                  className="rounded bg-slate-800 text-sky-500"
                />
                <label htmlFor="inc-dups" className="cursor-pointer">
                  Include {previewData.duplicateCount} possible duplicate row(s) in import anyway
                </label>
              </div>
            )}

            {/* Invalid Rows Errors if present */}
            {previewData.invalidRows && previewData.invalidRows.length > 0 && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs space-y-1">
                <span className="font-bold text-rose-400 block mb-1">Invalid Row Errors:</span>
                {previewData.invalidRows.map((inv, idx) => (
                  <p key={idx} className="text-rose-300">
                    Row {inv.rowNumber}: {inv.errors.join(', ')}
                  </p>
                ))}
              </div>
            )}

            {/* Valid Rows Preview Table */}
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 text-xs">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-900 sticky top-0 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Amount</th>
                    <th className="p-2.5">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  {previewData.validRows.map((r, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 text-slate-400">{r.date.split('T')[0]}</td>
                      <td className="p-2.5 font-bold text-slate-100">{r.description}</td>
                      <td className="p-2.5">
                        <span className={r.type === 'Expense' ? 'text-rose-400' : 'text-emerald-400'}>
                          {r.type}
                        </span>
                      </td>
                      <td className="p-2.5 font-extrabold text-slate-100">{r.amount}</td>
                      <td className="p-2.5">{r.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setStep('upload')}>
                Back to Upload
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmImport}
                isLoading={isLoading}
                disabled={totalImportable === 0}
              >
                Confirm Import ({totalImportable} items)
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 'result' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">File Import Complete!</h3>
            <p className="text-xs text-slate-300">
              Successfully imported <strong className="text-emerald-400">{importResult?.count || 0}</strong> transactions to your account.
            </p>

            <Button variant="primary" onClick={resetModal} className="w-full">
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

