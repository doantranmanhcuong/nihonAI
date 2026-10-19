import React, { useState } from 'react';
import { XCircle, UploadCloud, FileDown, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/context/AuthContext';

export default function BulkImportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('kanji');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return alert('Vui lòng chọn file Excel');
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await authApi.post(`/admin/content/import?type=${importType.toUpperCase()}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult({ success: true, message: res.data.message });
      setFile(null);
    } catch (err: any) {
      setResult({ success: false, message: err.response?.data?.message || err.message });
    }
    setLoading(false);
  };

  const downloadTemplate = () => {
    let csv = '';
    if (importType === 'kanji') {
      csv = 'kanji,meaning,onyomi,kunyomi,level,examples\n日,Mặt trời,にち,ひ,N5,Nhật Bản|Nhật ký';
    } else {
      csv = 'word,meaning,reading,level,examples\n教師,Giáo viên,きょうし,N5,Thầy giáo|Cô giáo';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${importType}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-slate-900">Nhập dữ liệu hàng loạt (Excel/CSV)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Loại dữ liệu</label>
            <select 
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 outline-none focus:border-indigo-600"
            >
              <option value="kanji">Kanji (Hán tự)</option>
              <option value="vocabulary">Vocabulary (Từ vựng)</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <UploadCloud className="w-8 h-8 text-indigo-500" />
              <p className="text-sm font-medium text-slate-700">{file ? file.name : 'Kéo thả hoặc nhấn để chọn file'}</p>
              <p className="text-xs text-slate-500 mt-1">Hỗ trợ .xlsx, .csv</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800"
            >
              <FileDown size={16} /> Tải file mẫu ({importType})
            </button>
          </div>

          {result && (
            <div className={`p-4 rounded-xl flex items-start gap-3 ${result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {result.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
              <p className="text-sm font-medium leading-tight">{result.message}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={handleImport}
              disabled={loading || !file}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang xử lý...' : 'Bắt đầu Nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}