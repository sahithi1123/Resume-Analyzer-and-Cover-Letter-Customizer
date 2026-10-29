import { useState, useCallback } from 'react';
import { resumeApi } from './resumeApi';

// Pattern: Custom Hooks Pattern
// Encapsulates file validation, upload mechanics, and parsing lifecycle.
export function useResumeParser() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    if (!file) {
      throw new Error('No file provided');
    }
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      throw new Error('Invalid file format. Please upload a PDF (.pdf) or Word document (.docx).');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds the 10MB limit.');
    }
  };

  const uploadAndParse = useCallback(async (file) => {
    setError(null);
    try {
      validateFile(file);
      setIsUploading(true);
      setUploadProgress(20);

      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 200);

      const parsedResume = await resumeApi.uploadResume(file);

      clearInterval(progressTimer);
      setUploadProgress(100);
      return parsedResume;
    } catch (err) {
      const errMsg = err.message || 'Failed to upload and parse resume document.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  return {
    uploadAndParse,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null),
  };
}
