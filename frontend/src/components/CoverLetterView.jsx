import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  FileText,
  History,
  Edit3,
  CheckCircle2,
  Briefcase,
  Building2,
  FileCheck2,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';
import HolographicLetter3D from './HolographicLetter3D';
import { downloadAsPdf, downloadAsDoc } from './documentExportUtils';

// Pattern: Container / Presentational Pattern
// Step 4 Component: "Generate Cover Letter"
// Features: Pre-generation summary (resume + job context), clean tone selector,
// 3D animation loading state, post-generation completion message,
// actions (edit, regenerate, copy, download PDF/DOC), and a New Customization option.
export default function CoverLetterView({
  activeResume,
  tailoredResumeText,
  jobTitle,
  companyName,
  jobDescription,
  coverLetterResult,
  setCoverLetterResult,
  onGenerate,
  isGenerating,
  tone,
  setTone,
  notes,
  setNotes,
  onOpenHistory,
  onNewCustomization,
}) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableMarkdown, setEditableMarkdown] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const tones = [
    { label: 'Professional & Confident', val: 'Professional, persuasive, and confident' },
    { label: 'Executive Leadership', val: 'Executive and leadership-focused' },
    { label: 'Technical Specialist', val: 'Technical specialist' },
    { label: 'Startup & Enthusiastic', val: 'Startup and enthusiastic' },
  ];

  const handleStartEdit = () => {
    setEditableMarkdown(coverLetterResult?.coverLetterMarkdown || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!coverLetterResult) return;
    setCoverLetterResult({
      ...coverLetterResult,
      coverLetterMarkdown: editableMarkdown,
      isUserEdited: true,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableMarkdown('');
  };

  const handleCopy = () => {
    const textToCopy = coverLetterResult?.coverLetterMarkdown;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    const textToDownload = coverLetterResult?.coverLetterMarkdown;
    if (!textToDownload) return;
    const sanitizedTitle = (jobTitle || 'Cover_Letter').replace(/[^a-zA-Z0-9_-]/g, '_');
    const displayTitle = coverLetterResult?.subjectLine || `${jobTitle || 'Tailored'} Cover Letter`;
    downloadAsPdf(`${sanitizedTitle}_Tailored_Letter`, displayTitle, textToDownload);
  };

  const handleDownloadDoc = () => {
    const textToDownload = coverLetterResult?.coverLetterMarkdown;
    if (!textToDownload) return;
    const sanitizedTitle = (jobTitle || 'Cover_Letter').replace(/[^a-zA-Z0-9_-]/g, '_');
    const displayTitle = coverLetterResult?.subjectLine || `${jobTitle || 'Tailored'} Cover Letter`;
    downloadAsDoc(`${sanitizedTitle}_Tailored_Letter`, displayTitle, textToDownload);
  };

  const handleResetClick = () => {
    if (onNewCustomization) {
      onNewCustomization();
    }
  };

  const isTailoredResumeInUse = Boolean(tailoredResumeText);

  return (
    <div className="space-y-6">
      {/* 1. Context Summary Card: Selected Resume & Target Job Before Generating */}
      <div className="glass-panel p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Generation Benchmark Summary
          </span>
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 underline font-mono flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              Letter Revisions
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Resume Summary */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Source Resume
              </span>
              {isTailoredResumeInUse ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Tailored Resume (Enhanced in Step 3)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
                  Master Resume
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white truncate">
              {activeResume?.fileName || 'Resume Document'}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
              {isTailoredResumeInUse
                ? 'Your accepted improvements and action verbs will be reflected in the cover letter.'
                : 'Using your baseline uploaded resume content.'}
            </p>
          </div>

          {/* Target Job Summary */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Target Opportunity
              </span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                ATS Targeted
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-gray-900 dark:text-white truncate">
              <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="truncate">{jobTitle || 'Target Role'}</span>
              {companyName && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="truncate font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    {companyName}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {jobDescription
                ? `Job requirements benchmarked (${jobDescription.trim().length} characters)`
                : 'Job requirements entered in Step 1'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls & 3D Animation Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <HolographicLetter3D isGenerating={isGenerating} className="h-44 md:h-52 w-full" />
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
          {/* Tone Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase font-semibold">
              Select Desired Tone
            </span>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => setTone(t.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                    tone === t.val
                      ? 'bg-purple-100 dark:bg-purple-500/20 border border-purple-400 text-purple-800 dark:text-purple-300 font-semibold ring-1 ring-purple-400'
                      : 'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Instructions */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase font-semibold">
              Special Highlights or Notes (Optional)
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 'Highlight my cloud migration work', 'Mention I am available to start immediately'"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={() => onGenerate(tone, notes)}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm text-black bg-gradient-to-r from-purple-400 via-cyan-300 to-cyan-400 hover:from-purple-300 hover:to-cyan-300 shadow-md shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Bespoke Cover Letter...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {coverLetterResult ? 'Regenerate Cover Letter' : 'Generate Tailored Cover Letter'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Loading State with Clear Animation & Progress */}
      {isGenerating && (
        <div className="p-8 text-center glass-panel rounded-2xl border border-purple-300 dark:border-purple-500/40 space-y-3 animate-fadeIn">
          <RefreshCw className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin mx-auto" />
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            Crafting Your Tailored Cover Letter...
          </h4>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Aligning your resume experiences with {jobTitle || 'the target position'} at {companyName || 'the target company'} using professional communications strategy.
          </p>
        </div>
      )}

      {/* 4. Generated Cover Letter Output with Completion Message & Action Toolbar */}
      {!isGenerating && coverLetterResult && (
        <div className="space-y-4 animate-fadeIn">
          {/* Clear Completion Message Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/50 flex items-start gap-3 text-emerald-900 dark:text-emerald-200 text-xs md:text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-sm">
                Cover Letter Successfully Generated & Tailored!
              </p>
              <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Synthesized from your {isTailoredResumeInUse ? 'tailored resume' : 'master resume'} and targeted specifically for {jobTitle || 'the target role'}{companyName ? ` at ${companyName}` : ''}. You can edit, copy, or download it as a PDF or Word document below.
              </p>
            </div>
          </div>

          {/* Letter Container & Actions */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            {/* Header with Title and 4 Actions: Edit, Regenerate, Copy, Download */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold">
                    {coverLetterResult.subjectLine || 'Tailored Cover Letter'}
                  </span>
                  {coverLetterResult.isUserEdited && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-semibold">
                      User Edited
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                  Your Bespoke Cover Letter
                </h3>
              </div>

              {/* Action Buttons: Edit, Regenerate, Copy, Download PDF, Download Word */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Option 1: Edit */}
                {!isEditing ? (
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 transition-all shadow-sm"
                    title="Edit cover letter text directly"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Edit Letter</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-sm"
                    >
                      Save Edits
                    </button>
                  </div>
                )}

                {/* Option 2: Regenerate */}
                <button
                  onClick={() => onGenerate(tone, notes)}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/15 hover:bg-purple-100 dark:hover:bg-purple-500/25 border border-purple-300 dark:border-purple-500/40 text-xs font-medium text-purple-700 dark:text-purple-300 transition-all disabled:opacity-50"
                  title="Regenerate with current tone and notes"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                {/* Option 3: Copy */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 transition-all shadow-sm"
                  title="Copy cover letter to clipboard"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                {/* Option 4: Download PDF */}
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-400 hover:to-rose-400 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all"
                  title="Download as PDF document"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF (.pdf)</span>
                </button>

                {/* Option 5: Download Word (.doc) */}
                <button
                  onClick={handleDownloadDoc}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                  title="Download as Word document"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Word (.doc)</span>
                </button>
              </div>
            </div>

            {/* Actual Letter Body / Editable Area */}
            {isEditing ? (
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  You can edit any paragraph, greetings, or sign-off below:
                </span>
                <textarea
                  rows={16}
                  value={editableMarkdown}
                  onChange={(e) => setEditableMarkdown(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 p-4 rounded-xl border border-cyan-500 font-mono text-xs md:text-sm text-gray-900 dark:text-gray-200 leading-relaxed focus:outline-none resize-y select-text"
                />
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-950/70 p-6 rounded-xl border border-gray-200 dark:border-gray-800/80 font-mono text-xs md:text-sm text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap select-text">
                {coverLetterResult.coverLetterMarkdown}
              </div>
            )}
          </div>

          {/* 5. Start New Customization Card */}
          <div className="p-6 rounded-2xl glass-panel border border-cyan-300 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Finished with this application?
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                You have tailored your resume and generated your cover letter. Start a fresh customization for another target job.
              </p>
            </div>

            <button
              onClick={handleResetClick}
              className="px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm text-black bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all shrink-0 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Customization</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State before first generation */}
      {!isGenerating && !coverLetterResult && (
        <div className="p-8 text-center glass-panel rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs md:text-sm space-y-2">
          <p>
            Click <strong className="text-purple-600 dark:text-purple-400">"Generate Tailored Cover Letter"</strong> above to produce your customized cover letter based on your {isTailoredResumeInUse ? 'tailored resume' : 'master resume'} and target job requirements.
          </p>
        </div>
      )}
    </div>
  );
}
