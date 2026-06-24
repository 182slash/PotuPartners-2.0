'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Paperclip, X, UploadCloud } from 'lucide-react';
import { fileService } from '@/services/api';
import { ALLOWED_MIME_TYPES, formatFileSize, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FileUploadProps {
  conversationId: string;
  onUploadComplete: (fileId: string, fileName: string) => void;
  onClose: () => void;
}

export default function FileUpload({ conversationId, onUploadComplete, onClose }: FileUploadProps) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]    = useState<File | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;

    setPreview(file);
    setUploading(true);
    setProgress(0);

    try {
      const { data } = await fileService.upload(file, conversationId, pct => setProgress(pct));
      onUploadComplete(data.data.id, file.name);
      toast.success('File attached');
    } catch {
      toast.error('Upload failed. Check file type and size.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [conversationId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_MIME_TYPES.reduce((acc, mime) => ({ ...acc, [mime]: [] }), {}),
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: false,
  });

  return (
    <div className="p-4 border border-divider bg-surface-2">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip size={13} className="text-gold" />
          <span className="text-xs text-text-secondary font-sans">Attach File</span>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-gold">
          <X size={13} />
        </button>
      </div>

      {/* Drop zone */}
      {!preview && (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-6 border border-dashed cursor-pointer transition-all duration-200',
            isDragActive ? 'border-gold bg-gold/5' : 'border-divider hover:border-gold-dim'
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud size={20} className={isDragActive ? 'text-gold' : 'text-text-muted'} />
          <p className="font-sans text-xs text-text-secondary text-center">
            {isDragActive ? 'Drop file here' : 'Drag & drop or click to select'}
          </p>
          <p className="font-sans text-[0.6rem] text-text-muted">
            PDF, DOC, DOCX, JPG, PNG — max 20MB
          </p>
        </div>
      )}

      {/* Upload progress */}
      {preview && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 border border-divider bg-surface-3">
            <Paperclip size={13} className="text-gold flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-primary font-sans truncate">{preview.name}</p>
              <p className="text-[0.6rem] text-text-muted font-sans">{formatFileSize(preview.size)}</p>
            </div>
          </div>
          {uploading && (
            <div className="space-y-1">
              <div className="h-0.5 bg-surface-3 overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[0.6rem] text-text-muted font-sans text-right">{progress}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
