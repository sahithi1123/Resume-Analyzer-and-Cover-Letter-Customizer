import React, { createContext, useContext, useState } from 'react';

// Pattern: Provider / Context Pattern
// Centralizes active customizer workspace state across all sub-components and wizard steps.
const CustomizerContext = createContext(null);

export const CustomizerProvider = ({ children }) => {
  const [activeResume, setActiveResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Results State
  const [keywordResult, setKeywordResult] = useState(null);
  const [bulletResult, setBulletResult] = useState(null);
  const [tailoredResumeText, setTailoredResumeText] = useState(null);
  const [coverLetterResult, setCoverLetterResult] = useState(null);

  // Status flags
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');

  const resetWorkspace = () => {
    setActiveResume(null);
    setJobDescription('');
    setJobTitle('');
    setCompanyName('');
    setKeywordResult(null);
    setBulletResult(null);
    setTailoredResumeText(null);
    setCoverLetterResult(null);
    setProcessingStage('');
  };

  const value = {
    activeResume,
    setActiveResume,
    jobDescription,
    setJobDescription,
    jobTitle,
    setJobTitle,
    companyName,
    setCompanyName,
    keywordResult,
    setKeywordResult,
    bulletResult,
    setBulletResult,
    tailoredResumeText,
    setTailoredResumeText,
    coverLetterResult,
    setCoverLetterResult,
    isProcessing,
    setIsProcessing,
    processingStage,
    setProcessingStage,
    resetWorkspace,
  };

  return <CustomizerContext.Provider value={value}>{children}</CustomizerContext.Provider>;
};

export const useCustomizer = () => {
  const context = useContext(CustomizerContext);
  if (!context) {
    throw new Error('useCustomizer must be used within a CustomizerProvider');
  }
  return context;
};
