import React, { useRef, useState } from 'react';
import { X, Upload, FileSpreadsheet, FileText, FileType } from 'lucide-react';

const ACCEPT =
  '.doc,.docx,.pdf,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AddRecordModal({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState('');

  if (!open) return null;

  function handlePick() {
    setSuccess(false);
    setFileName('');
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileName(file.name);
    setSuccess(true);
  }

  function handleClose() {
    setSuccess(false);
    setFileName('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="关闭"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-xl ambient-shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <h2 className="text-lg font-bold font-headline text-on-surface">新增记录</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            请通过导入方式添加记录，支持 Word 文档（.doc / .docx）、PDF（.pdf）与 Excel 表格（.xlsx）。
          </p>

          <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} />

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container border border-outline-variant/20 text-center">
              <FileText className="w-8 h-8 text-primary" />
              <span className="text-xs font-medium text-on-surface">Word</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container border border-outline-variant/20 text-center">
              <FileType className="w-8 h-8 text-primary" />
              <span className="text-xs font-medium text-on-surface">PDF</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container border border-outline-variant/20 text-center">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
              <span className="text-xs font-medium text-on-surface">Excel</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePick}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container transition-colors"
          >
            <Upload className="w-5 h-5" />
            选择文件导入
          </button>

          {success ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-600/30 px-4 py-3 text-sm text-emerald-900">
              <p className="font-semibold">导入成功</p>
              {fileName ? <p className="text-xs mt-1 opacity-90 truncate">已选择：{fileName}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
