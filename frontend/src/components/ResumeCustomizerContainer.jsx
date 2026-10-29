import React, { useState, useMemo } from 'react';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useCustomizer } from './CustomizerContext';
import { useResumeParser } from './useResumeParser';
import { useGeminiCustomizer } from './useGeminiCustomizer';
import { usePromptHistory } from './usePromptHistory';
import { Wizard } from './Wizard';
import HologramDocumentScanner3D from './HologramDocumentScanner3D';
import KeywordDiffView from './KeywordDiffView';
import BulletRewriterView from './BulletRewriterView';
import CoverLetterView from './CoverLetterView';
import PromptRollbackDrawer from './PromptRollbackDrawer';

// Pattern: Container / Presentational Pattern
// Coordinates strictly sequential 4-step customization with locked future steps,
// streamlined minimalist step titles, full Light/Dark mode support, and session reset confirmation.
export default function ResumeCustomizerContainer() {
  const {
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
    resetWorkspace,
  } = useCustomizer();

  const { uploadAndParse, isUploading, uploadProgress, error: uploadError } = useResumeParser();
  const { runKeywordAnalysis, runBulletRewrite, runCoverLetterGeneration } = useGeminiCustomizer();

  const [activeStep, setActiveStep] = useState(1);
  const [bulletPromptDirective, setBulletPromptDirective] = useState('');
  const [coverLetterTone, setCoverLetterTone] = useState('Professional, persuasive, and confident');
  const [coverLetterNotes, setCoverLetterNotes] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeWorkflowType, setActiveWorkflowType] = useState('BULLET_REWRITE');
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const {
    revisions,
    currentRevisionId,
    rollback,
    erase,
    loading: historyLoading,
    refetchHistory,
  } = usePromptHistory(activeWorkflowType);

  // Step completion flags
  const isStep1Complete = Boolean(activeResume && jobDescription.trim().length > 0);
  const isStep2Complete = Boolean(keywordResult);
  // Step 3 is completed when suggestions are loaded and changes applied (or suggestions generated)
  const isStep3Complete = Boolean(tailoredResumeText || (bulletResult?.rewrittenBullets && bulletResult.rewrittenBullets.length > 0));
  const isStep4Complete = Boolean(coverLetterResult?.coverLetterMarkdown || coverLetterResult?.coverLetter);

  // Determine maximum unlocked step index strictly sequentially
  const maxUnlockedStep = useMemo(() => {
    let step = 1;
    if (isStep1Complete) step = 2;
    if (step >= 2 && isStep2Complete) step = 3;
    if (step >= 3 && isStep3Complete) step = 4;
    return step;
  }, [isStep1Complete, isStep2Complete, isStep3Complete]);

  // Dynamic step check helper for Wizard
  const checkStepComplete = (step) => {
    switch (step) {
      case 1:
        return isStep1Complete;
      case 2:
        return isStep2Complete;
      case 3:
        return isStep3Complete;
      case 4:
        return isStep4Complete;
      default:
        return false;
    }
  };

  const allStepsCompleted = isStep1Complete && isStep2Complete && isStep3Complete && isStep4Complete;

  const stepLabels = [
    'Upload Resume & Job Description',
    'ATS Skill Match',
    'Tailor Your Resume',
    'Generate Cover Letter',
  ];

  const stepRequirements = {
    1: 'Please upload a resume (.pdf or .docx) and enter a job description to continue.',
    2: 'Please click "Run ATS Skill Analysis" to evaluate keyword overlap and continue.',
    3: 'Please review suggestions and click "Apply Selected Changes" to tailor your resume and continue.',
    4: 'Click "Generate Tailored Cover Letter" to complete the customization.',
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedResume = await uploadAndParse(file);
      setActiveResume(parsedResume);
      // Invalidate downstream step results so Steps 2 and 3 do not use previous resume
      setKeywordResult(null);
      setBulletResult(null);
      setTailoredResumeText(null);
      setCoverLetterResult(null);
    } catch (err) {
      console.error('File parsing failed:', err);
    }
  };

  const handleJobTitleChange = (e) => {
    setJobTitle(e.target.value);
    if (keywordResult) setKeywordResult(null);
    if (bulletResult) setBulletResult(null);
    if (tailoredResumeText) setTailoredResumeText(null);
    if (coverLetterResult) setCoverLetterResult(null);
  };

  const handleCompanyNameChange = (e) => {
    setCompanyName(e.target.value);
    if (keywordResult) setKeywordResult(null);
    if (bulletResult) setBulletResult(null);
    if (tailoredResumeText) setTailoredResumeText(null);
    if (coverLetterResult) setCoverLetterResult(null);
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
    if (keywordResult) setKeywordResult(null);
    if (bulletResult) setBulletResult(null);
    if (tailoredResumeText) setTailoredResumeText(null);
    if (coverLetterResult) setCoverLetterResult(null);
  };

  const handleOpenDrawer = (workflowType) => {
    setActiveWorkflowType(workflowType);
    setDrawerOpen(true);
    refetchHistory();
  };

  const handleRollback = async (targetRevisionId) => {
    try {
      const restored = await rollback(targetRevisionId);
      if (activeWorkflowType === 'BULLET_REWRITE') {
        try {
          const parsed = JSON.parse(restored.outputText);
          setBulletResult(parsed);
        } catch {
          // Fallback
        }
      } else if (activeWorkflowType === 'COVER_LETTER') {
        setCoverLetterResult({
          coverLetterMarkdown: restored.outputText,
          subjectLine: `Application for ${jobTitle || 'Role'} - ${companyName || 'Company'}`,
          revisionNumber: restored.revisionNumber,
        });
      }
    } catch (err) {
      console.error('Rollback failed:', err);
    }
  };

  const handleErase = async (revisionId) => {
    try {
      await erase(revisionId);
    } catch (err) {
      console.error('Erase prompt failed:', err);
    }
  };

  const handleConfirmNewCustomization = () => {
    resetWorkspace();
    setActiveStep(1);
    setBulletPromptDirective('');
    setCoverLetterNotes('');
    setShowResetConfirmModal(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Global Error Notification */}
      {uploadError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs md:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Sequential Wizard Container */}
      <Wizard
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        maxUnlockedStep={maxUnlockedStep}
        stepRequirements={stepRequirements}
        isStepComplete={checkStepComplete}
        allStepsCompleted={allStepsCompleted}
        onNewCustomization={() => setShowResetConfirmModal(true)}
      >
        {/* Step 1: Upload Resume & Job Description */}
        <Wizard.Step
          stepNumber={1}
          simpleTitle="Upload Resume & Job Description"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Resume Upload Card */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-cyan-600 dark:text-cyan-400 font-bold">1. Master Resume</span>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Upload Your Resume Document</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Accepts PDF (.pdf) or Word (.docx). Text is extracted and sanitized automatically.
                </p>
              </div>

              {/* Document Scanner Animation */}
              <HologramDocumentScanner3D
                isScanning={isUploading}
                hasDocument={Boolean(activeResume)}
                className="h-44 w-full"
              />

              {activeResume ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {activeResume.fileName}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                        {activeResume.fileType} • {activeResume.extractedCharacterCount} characters extracted
                      </p>
                    </div>
                  </div>
                  <label className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 cursor-pointer underline font-mono shrink-0 ml-2">
                    Replace
                    <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-cyan-500 hover:bg-cyan-500/5 cursor-pointer transition-all">
                  <Upload className="w-7 h-7 text-cyan-600 dark:text-cyan-400 mb-1.5" />
                  <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Click or drag resume file here</span>
                  <span className="text-[11px] text-gray-500 mt-1 font-mono">Supports PDF and Word DOCX (Max 10MB)</span>
                  <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
              )}

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-cyan-600 dark:text-cyan-400">
                    <span>Extracting text content...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Target Job Description Card */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-cyan-600 dark:text-cyan-400 font-bold">2. Target Role</span>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Paste Target Job Description</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Enter the job title, company, and full job posting to benchmark your resume against.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Target Job Title (e.g. Senior Full-Stack Engineer)"
                  value={jobTitle}
                  onChange={handleJobTitleChange}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Company Name (e.g. Google, Stripe)"
                  value={companyName}
                  onChange={handleCompanyNameChange}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <textarea
                rows={7}
                placeholder="Paste the target job description, responsibilities, and skill requirements here..."
                value={jobDescription}
                onChange={handleJobDescriptionChange}
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none font-mono"
              />

              <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400 pt-1">
                <span>{jobDescription.trim().length} characters entered</span>
                {isStep1Complete && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    ✓ Step 1 Complete • Step 2 Unlocked
                  </span>
                )}
              </div>
            </div>
          </div>
        </Wizard.Step>

        {/* Step 2: ATS Skill Match */}
        <Wizard.Step
          stepNumber={2}
          simpleTitle="ATS Skill Match"
        >
          <KeywordDiffView
            activeResume={activeResume}
            jobDescription={jobDescription}
            jobTitle={jobTitle}
            companyName={companyName}
            keywordResult={keywordResult}
            onAnalyze={runKeywordAnalysis}
            isAnalyzing={isProcessing}
          />
        </Wizard.Step>

        {/* Step 3: Tailor Your Resume */}
        <Wizard.Step
          stepNumber={3}
          simpleTitle="Tailor Your Resume"
        >
          <BulletRewriterView
            activeResume={activeResume}
            jobDescription={jobDescription}
            jobTitle={jobTitle}
            companyName={companyName}
            bulletResult={bulletResult}
            setBulletResult={setBulletResult}
            tailoredResumeText={tailoredResumeText}
            setTailoredResumeText={setTailoredResumeText}
            onRewrite={(bullets, directive) => runBulletRewrite(bullets, directive)}
            isRewriting={isProcessing}
            promptDirective={bulletPromptDirective}
            setPromptDirective={setBulletPromptDirective}
          />
        </Wizard.Step>

        {/* Step 4: Generate Cover Letter */}
        <Wizard.Step
          stepNumber={4}
          simpleTitle="Generate Cover Letter"
        >
          <CoverLetterView
            activeResume={activeResume}
            tailoredResumeText={tailoredResumeText}
            jobTitle={jobTitle}
            companyName={companyName}
            jobDescription={jobDescription}
            coverLetterResult={coverLetterResult}
            setCoverLetterResult={setCoverLetterResult}
            onGenerate={(t, n) => runCoverLetterGeneration(t, n)}
            isGenerating={isProcessing}
            tone={coverLetterTone}
            setTone={setCoverLetterTone}
            notes={coverLetterNotes}
            setNotes={setCoverLetterNotes}
            onOpenHistory={() => handleOpenDrawer('COVER_LETTER')}
            onNewCustomization={() => setShowResetConfirmModal(true)}
          />
        </Wizard.Step>

        {/* Sequential Navigation Bar */}
        <Wizard.Navigation totalSteps={4} stepLabels={stepLabels} />
      </Wizard>

      {/* Confirmation Modal for "New Customization" */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 rounded-2xl border border-gray-300 dark:border-gray-700 max-w-md w-full space-y-4 shadow-2xl bg-white dark:bg-gray-950">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Start a New Customization?</h3>
              </div>
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                This will clear the current active session (job description, ATS match score, tailored resume, and cover letter) so you can customize a new job application.
              </p>
              <p className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px] bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                ✓ Note: Your previously saved master resumes in "My Resumes" and your prompt history will <strong>NOT</strong> be deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-all"
              >
                Keep Current Session
              </button>
              <button
                onClick={handleConfirmNewCustomization}
                className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-sm transition-all"
              >
                Yes, Start New Customization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Revision Rollback & Erase Drawer */}
      <PromptRollbackDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        targetType={activeWorkflowType}
        revisions={revisions}
        currentRevisionId={currentRevisionId}
        onRollback={handleRollback}
        onErase={handleErase}
        loading={historyLoading}
      />
    </div>
  );
}
