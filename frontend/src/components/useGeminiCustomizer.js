import { useState, useCallback } from 'react';
import { customizerApi } from './customizerApi';
import { useCustomizer } from './CustomizerContext';

// Pattern: Custom Hooks Pattern
// Orchestrates AI operations with Google Gemini across all customization features.
export function useGeminiCustomizer() {
  const {
    activeResume,
    tailoredResumeText,
    jobDescription,
    jobTitle,
    companyName,
    setKeywordResult,
    setBulletResult,
    setCoverLetterResult,
    setIsProcessing,
    setProcessingStage,
  } = useCustomizer();

  const [error, setError] = useState(null);

  const runKeywordAnalysis = useCallback(async () => {
    if (!activeResume) throw new Error('Please upload a resume first.');
    if (!jobDescription.trim()) throw new Error('Please paste a target job description.');

    setError(null);
    setIsProcessing(true);
    setProcessingStage('keywords');

    try {
      const result = await customizerApi.analyzeKeywords({
        resumeId: activeResume.id,
        rawResumeText: activeResume.extractedText || undefined,
        jobDescription: jobDescription.trim(),
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
      });
      setKeywordResult(result);
      return result;
    } catch (err) {
      const msg = err.message || 'Failed to complete keyword gap analysis.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  }, [activeResume, jobDescription, jobTitle, companyName, setKeywordResult, setIsProcessing, setProcessingStage]);

  const runBulletRewrite = useCallback(
    async (bulletPointsToRewrite = [], promptInstruction = '', parentRevisionId = null) => {
      if (!activeResume) throw new Error('Please upload a resume first.');
      if (!jobDescription.trim()) throw new Error('Please paste a target job description.');

      setError(null);
      setIsProcessing(true);
      setProcessingStage('bullets');

      try {
        const bulletsList = Array.isArray(bulletPointsToRewrite)
          ? bulletPointsToRewrite
          : bulletPointsToRewrite
          ? [bulletPointsToRewrite]
          : [];

        const result = await customizerApi.rewriteBullets({
          resumeId: activeResume.id,
          rawResumeText: activeResume.extractedText || undefined,
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle.trim(),
          companyName: companyName.trim(),
          bulletPointsToRewrite: bulletsList,
          promptInstruction,
          parentRevisionId,
        });

        // Always replace with fresh analysis (do NOT merge with previous/stale bullets)
        setBulletResult(result);

        return result;
      } catch (err) {
        const msg = err.message || 'Failed to rewrite bullet points.';
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsProcessing(false);
        setProcessingStage('');
      }
    },
    [activeResume, jobDescription, jobTitle, companyName, setBulletResult, setIsProcessing, setProcessingStage]
  );

  const runCoverLetterGeneration = useCallback(
    async (tone = 'Professional, persuasive, and confident', notes = '', parentRevisionId = null) => {
      if (!activeResume) throw new Error('Please upload a resume first.');
      if (!jobDescription.trim()) throw new Error('Please paste a target job description.');

      setError(null);
      setIsProcessing(true);
      setProcessingStage('coverLetter');

      try {
        const result = await customizerApi.generateCoverLetter({
          resumeId: activeResume.id,
          rawResumeText: tailoredResumeText || undefined,
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle.trim(),
          companyName: companyName.trim(),
          tone,
          additionalPromptNotes: notes,
          parentRevisionId,
        });
        setCoverLetterResult(result);
        return result;
      } catch (err) {
        const msg = err.message || 'Failed to generate tailored cover letter.';
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsProcessing(false);
        setProcessingStage('');
      }
    },
    [activeResume, tailoredResumeText, jobDescription, jobTitle, companyName, setCoverLetterResult, setIsProcessing, setProcessingStage]
  );

  return {
    runKeywordAnalysis,
    runBulletRewrite,
    runCoverLetterGeneration,
    error,
    clearError: () => setError(null),
  };
}
