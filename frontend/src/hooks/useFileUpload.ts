'use client';

import { useState, useCallback } from 'react';
import { fileService } from '@/services/api';
import { ALLOWED_MIME_TYPES } from '@/lib/utils';
import toast from 'react-hot-toast';

export function useFileUpload(conversationId: string) {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);

  const upload = useCallback(async (file: File): Promise<{ id: string; name: string } | null> => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error('File type not allowed. Use PDF, DOC, DOCX, JPG, or PNG.');
      return null;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 20MB.');
      return null;
    }

    setUploading(true);
    setProgress(0);
    try {
      const { data } = await fileService.upload(file, conversationId, pct => setProgress(pct));
      return { id: data.data.id, name: file.name };
    } catch {
      toast.error('Upload failed. Please try again.');
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [conversationId]);

  return { upload, uploading, progress };
}
