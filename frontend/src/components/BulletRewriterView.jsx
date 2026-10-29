import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  Check,
  RotateCcw,
  Edit3,
  Download,
  Copy,
  RefreshCw,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Briefcase,
} from 'lucide-react';
import StarReactor3D from './StarReactor3D';
import { downloadAsPdf, downloadAsDoc } from './documentExportUtils';

/**
 * Robust multi-strategy bullet point replacer.
 */
function replaceBulletInResume(resumeText, originalBullet, replacementBullet) {
  if (!resumeText || !originalBullet || !replacementBullet) {
    return { updatedText: resumeText || '', replaced: false };
  }

  const rawOrig = originalBullet.trim();
  const rawRepl = replacementBullet.trim();

  // Strategy 1: Direct exact substring match
  if (resumeText.includes(rawOrig)) {
    return {
      updatedText: resumeText.replace(rawOrig, rawRepl),
      replaced: true,
    };
  }

  // Strip leading bullet characters and list numbers
  const cleanOrig = rawOrig.replace(/^[•\*\-\u2022\u25cf\u25aa\d\.\)\s]+/, '').trim();
  const cleanRepl = rawRepl.replace(/^[•\*\-\u2022\u25cf\u25aa\d\.\)\s]+/, '').trim();

  // Strategy 2: Exact match on clean content (without bullet marker)
  if (cleanOrig && resumeText.includes(cleanOrig)) {
    return {
      updatedText: resumeText.replace(cleanOrig, cleanRepl),
      replaced: true,
    };
  }

  // Strategy 3: Flexible whitespace & newline regex match
  const words = cleanOrig.split(/\s+/).filter((w) => w.length > 0);
  if (words.length >= 2) {
    const escapedWords = words.map((w) =>
      w
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/['"’“”]/g, `['"’“”]`)
        .replace(/[-–—]/g, `[-–—]`)
    );
    const patternStr = escapedWords.join('[\\s\\r\\n\\u00a0]+');
    try {
      const flexRegex = new RegExp(patternStr, 'i');
      if (flexRegex.test(resumeText)) {
        return {
          updatedText: resumeText.replace(flexRegex, cleanRepl),
          replaced: true,
        };
      }
    } catch (e) {}

    // Strategy 4: Sub-phrase boundary match for long sentences (start words + end words)
    if (words.length >= 6) {
      const head = words.slice(0, 4).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s\\r\\n]+');
      const tail = words.slice(-3).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s\\r\\n]+');
      try {
        const spanRegex = new RegExp(head + '[\\s\\S]{1,250}?' + tail, 'i');
        if (spanRegex.test(resumeText)) {
          return {
            updatedText: resumeText.replace(spanRegex, cleanRepl),
            replaced: true,
          };
        }
      } catch (e) {}
    }
  }

  // Strategy 5: Line-by-line semantic token overlap match
  const lines = resumeText.split(/\r?\n/);
  const origTokens = new Set(
    cleanOrig
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 2)
  );

  if (origTokens.size > 2) {
    let bestLineIdx = -1;
    let maxOverlap = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineTokens = line
        .toLowerCase()
        .split(/\W+/)
        .filter((t) => t.length > 2);
      if (lineTokens.length === 0) continue;

      let overlap = 0;
      for (const t of lineTokens) {
        if (origTokens.has(t)) overlap++;
      }

      const score = overlap / Math.max(origTokens.size, lineTokens.length);
      if (score > maxOverlap && score >= 0.35) {
        maxOverlap = score;
        bestLineIdx = i;
      }
    }

    if (bestLineIdx !== -1) {
      const targetLine = lines[bestLineIdx];
      const bulletPrefixMatch = targetLine.match(/^([•\*\-\u2022\u25cf\u25aa\s\d\.\)]+)/);
      const prefix = bulletPrefixMatch ? bulletPrefixMatch[1] : '• ';
      lines[bestLineIdx] = prefix + cleanRepl;
      return {
        updatedText: lines.join('\n'),
        replaced: true,
      };
    }
  }

  // Strategy 6: Safe fallback append
  return {
    updatedText: resumeText + '\n• ' + cleanRepl,
    replaced: true,
  };
}

// Pattern: Container / Presentational Pattern
// Step 3 Component: "Tailor Your Resume"
// Revision History option removed as requested. Always analyzes the CURRENT uploaded resume and job.
export default function BulletRewriterView({
  activeResume,
  jobDescription,
  jobTitle,
  companyName,
  bulletResult,
  setBulletResult,
  tailoredResumeText,
  setTailoredResumeText,
  onRewrite,
  isRewriting,
  promptDirective,
  setPromptDirective,
}) {
  const [decisions, setDecisions] = useState({});
  const [customEdits, setCustomEdits] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempEditText, setTempEditText] = useState('');

  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedItemIndex, setCopiedItemIndex] = useState(null);
  const [appliedCount, setAppliedCount] = useState(0);
  const [keptCount, setKeptCount] = useState(0);

  const [successBanner, setSuccessBanner] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Context fingerprint to detect when job description or resume changes
  const contextFingerprint = `${activeResume?.id || 'raw'}_${activeResume?.extractedCharacterCount || 0}_${(jobDescription || '').trim()}_${(jobTitle || '').trim()}_${(companyName || '').trim()}`;
  const lastFingerprintRef = useRef(contextFingerprint);

  const suggestions = useMemo(() => {
    return bulletResult?.rewrittenBullets || [];
  }, [bulletResult]);

  const showToast = (type, text) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ type, text });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // If the target job or resume changed, automatically reset state and re-analyze fresh
  useEffect(() => {
    if (lastFingerprintRef.current !== contextFingerprint) {
      lastFingerprintRef.current = contextFingerprint;
      setDecisions({});
      setCustomEdits({});
      setTailoredResumeText(null);
      setSuccessBanner(null);
      if (activeResume && jobDescription?.trim() && !isRewriting) {
        onRewrite([], promptDirective);
      }
    }
  }, [contextFingerprint]);

  // Default all incoming suggestions to 'accept' for convenience
  useEffect(() => {
    if (suggestions.length > 0) {
      setDecisions((prev) => {
        const next = { ...prev };
        suggestions.forEach((_, idx) => {
          if (!next[idx]) {
            next[idx] = 'accept';
          }
        });
        return next;
      });
    }
  }, [suggestions]);

  // Auto-generate suggestions if not yet loaded for this resume and job
  useEffect(() => {
    if (!bulletResult && activeResume && jobDescription?.trim() && !isRewriting) {
      onRewrite([], promptDirective);
    }
  }, [bulletResult, activeResume, jobDescription]);

  const buildTailoredResume = (activeDecisions, activeEdits) => {
    if (!activeResume?.extractedText) return { text: '', applied: 0, kept: 0 };

    let currentText = activeResume.extractedText;
    let applied = 0;
    let kept = 0;

    suggestions.forEach((item, idx) => {
      const decision = activeDecisions[idx] || 'accept';
      if (decision === 'keep') {
        kept++;
        return;
      }

      const replacementText =
        decision === 'edit' && activeEdits[idx]
          ? activeEdits[idx].trim()
          : item.rewrittenBullet.trim();

      const origText = item.originalBullet.trim();

      const result = replaceBulletInResume(currentText, origText, replacementText);
      currentText = result.updatedText;
      applied++;
    });

    return {
      text: currentText,
      applied,
      kept,
    };
  };

  const handleDecision = (idx, decisionType) => {
    const nextDecisions = {
      ...decisions,
      [idx]: decisionType,
    };
    setDecisions(nextDecisions);

    if (decisionType === 'accept') {
      showToast('success', `✓ Suggestion #${idx + 1} accepted!`);
    } else if (decisionType === 'keep') {
      showToast('info', `↩️ Suggestion #${idx + 1} kept as original text.`);
    }

    if (tailoredResumeText) {
      const result = buildTailoredResume(nextDecisions, customEdits);
      setTailoredResumeText(result.text);
      setAppliedCount(result.applied);
      setKeptCount(result.kept);
      setSuccessBanner({
        message: `Tailored resume updated live: ${result.applied} improvement(s) incorporated, ${result.kept} original(s) retained.`,
        applied: result.applied,
        kept: result.kept,
      });
    }
  };

  const handleStartEdit = (idx, initialText) => {
    setEditingIndex(idx);
    setTempEditText(customEdits[idx] || initialText);
  };

  const handleSaveEdit = (idx) => {
    const nextEdits = {
      ...customEdits,
      [idx]: tempEditText,
    };
    const nextDecisions = {
      ...decisions,
      [idx]: 'edit',
    };
    setCustomEdits(nextEdits);
    setDecisions(nextDecisions);
    setEditingIndex(null);
    setTempEditText('');
    showToast('success', `✓ Custom edit saved for suggestion #${idx + 1}!`);

    if (tailoredResumeText) {
      const result = buildTailoredResume(nextDecisions, nextEdits);
      setTailoredResumeText(result.text);
      setAppliedCount(result.applied);
      setKeptCount(result.kept);
      setSuccessBanner({
        message: `Tailored resume updated live: custom edit applied for suggestion #${idx + 1}.`,
        applied: result.applied,
        kept: result.kept,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setTempEditText('');
  };

  const handleAcceptAll = () => {
    const next = {};
    suggestions.forEach((_, idx) => {
      next[idx] = 'accept';
    });
    setDecisions(next);
    showToast('success', '✓ All suggestions set to Accept.');

    if (tailoredResumeText) {
      const result = buildTailoredResume(next, customEdits);
      setTailoredResumeText(result.text);
      setAppliedCount(result.applied);
      setKeptCount(0);
      setSuccessBanner({
        message: `Tailored resume updated: all ${result.applied} suggestions applied.`,
        applied: result.applied,
        kept: 0,
      });
    }
  };

  const handleKeepAll = () => {
    const next = {};
    suggestions.forEach((_, idx) => {
      next[idx] = 'keep';
    });
    setDecisions(next);
    showToast('info', '↩️ All suggestions reverted to original text.');

    if (tailoredResumeText) {
      const result = buildTailoredResume(next, customEdits);
      setTailoredResumeText(result.text);
      setAppliedCount(0);
      setKeptCount(suggestions.length);
      setSuccessBanner({
        message: `Tailored resume updated: all original text preserved.`,
        applied: 0,
        kept: suggestions.length,
      });
    }
  };

  const handleCopyItem = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedItemIndex(idx);
    setTimeout(() => setCopiedItemIndex(null), 2000);
  };

  const handleApplyChanges = () => {
    if (!activeResume?.extractedText) return;

    const result = buildTailoredResume(decisions, customEdits);
    setTailoredResumeText(result.text);
    setAppliedCount(result.applied);
    setKeptCount(result.kept);

    setSuccessBanner({
      message: `✓ Success: Tailored resume generated with ${result.applied} improvement(s) applied (${result.kept} kept original). Your master resume remains completely untouched.`,
      applied: result.applied,
      kept: result.kept,
    });
    showToast('success', `✓ Tailored resume created with ${result.applied} improvement(s) applied!`);

    setTimeout(() => {
      const previewEl = document.getElementById('tailored-resume-preview');
      if (previewEl) {
        previewEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleDownloadPdf = () => {
    if (!tailoredResumeText) return;
    const baseName = (activeResume?.fileName || 'Resume').replace(/\.[^/.]+$/, '');
    downloadAsPdf(`${baseName}_Tailored`, `${baseName} - Tailored Resume`, tailoredResumeText);
    showToast('success', '✓ PDF download started.');
  };

  const handleDownloadDoc = () => {
    if (!tailoredResumeText) return;
    const baseName = (activeResume?.fileName || 'Resume').replace(/\.[^/.]+$/, '');
    downloadAsDoc(`${baseName}_Tailored`, `${baseName} - Tailored Resume`, tailoredResumeText);
    showToast('success', '✓ Word (.doc) download started.');
  };

  const handleCopyFullResume = () => {
    if (!tailoredResumeText) return;
    navigator.clipboard.writeText(tailoredResumeText);
    setCopiedResume(true);
    showToast('success', '✓ Full tailored resume copied to clipboard.');
    setTimeout(() => setCopiedResume(false), 2500);
  };

  const handleReAnalyzeFresh = () => {
    setDecisions({});
    setCustomEdits({});
    setTailoredResumeText(null);
    setSuccessBanner(null);
    onRewrite([], promptDirective);
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Action Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-fadeIn">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs md:text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/30'
                : 'bg-gray-900 text-gray-100 border-gray-700 shadow-black/40'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            ) : (
              <RotateCcw className="w-4 h-4 text-cyan-300 shrink-0" />
            )}
            <span>{toast.text}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Reactor Section & Benchmark Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <StarReactor3D isRewriting={isRewriting} className="h-44 md:h-52 w-full" />
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-cyan-600 dark:text-cyan-400 font-bold">
                Resume Alignment & Tailoring
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300">
                Fresh Analysis
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              We analyze your current uploaded resume against the current job requirements. Choose whether to accept, edit, or keep original statements.
            </p>
          </div>

          {/* Current Benchmark Context Display (High-contrast dark cards for 100% visibility) */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 shadow-md text-white">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <FileText className="w-4 h-4 shrink-0" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Resume Document</span>
                <span className="text-xs font-bold text-white truncate max-w-[220px]">{activeResume?.fileName || 'Uploaded Resume'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 shadow-md text-white">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Briefcase className="w-4 h-4 shrink-0" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Target Role & Company</span>
                <span className="text-xs font-bold text-white truncate max-w-[260px]">
                  {jobTitle || 'Target Role'}{companyName ? ` at ${companyName}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Custom Directive Input & Fresh Analyze Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <input
              type="text"
              value={promptDirective}
              onChange={(e) => setPromptDirective(e.target.value)}
              placeholder="Custom directive (optional): e.g. 'Emphasize leadership and systems design'"
              className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleReAnalyzeFresh}
              disabled={isRewriting}
              className="px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm text-black bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/25 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
            >
              {isRewriting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {suggestions.length > 0 ? 'Re-Analyze Improvements' : 'Analyze & Suggest Improvements'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Improvements List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono px-1">
          <span className="uppercase text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-2">
            Suggested Resume Improvements ({suggestions.length})
          </span>

          {suggestions.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-all font-semibold"
              >
                ✓ Accept All
              </button>
              <button
                onClick={handleKeepAll}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all font-semibold"
              >
                ↩️ Keep All Original
              </button>
            </div>
          )}
        </div>

        {isRewriting && suggestions.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Scanning your current uploaded resume against {jobTitle || 'the target position'}...
            </p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4 animate-fadeIn">
            {suggestions.map((item, idx) => {
              const currentDecision = decisions[idx] || 'accept';
              const isEditing = editingIndex === idx;
              const displayText =
                currentDecision === 'edit' && customEdits[idx]
                  ? customEdits[idx]
                  : item.rewrittenBullet;

              return (
                <div
                  key={idx}
                  className={`glass-panel p-5 rounded-2xl border transition-all space-y-4 ${
                    currentDecision === 'accept'
                      ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/10 shadow-sm'
                      : currentDecision === 'edit'
                      ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/10 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 opacity-85'
                  }`}
                >
                  {/* Status header with current choice badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">
                        SUGGESTION #{idx + 1}
                      </span>
                      {currentDecision === 'accept' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-semibold">
                          <Check className="w-3 h-3" />
                          Accept AI Suggestion
                        </span>
                      )}
                      {currentDecision === 'edit' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 flex items-center gap-1 font-semibold">
                          <Edit3 className="w-3 h-3" />
                          Custom Edited
                        </span>
                      )}
                      {currentDecision === 'keep' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold">
                          Keeping Original Text
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopyItem(displayText, idx)}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all text-xs flex items-center gap-1 font-mono"
                      title="Copy suggested text"
                    >
                      {copiedItemIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedItemIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Side-by-Side: Original vs AI Suggested */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Original in Resume */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider block mb-1">
                          Original (In Master Resume)
                        </span>
                        <p className="text-xs md:text-sm text-gray-900 dark:text-gray-100 font-medium leading-relaxed font-mono">
                          {item.originalBullet}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 italic pt-2">
                        Statement from your uploaded resume
                      </span>
                    </div>

                    {/* Right: AI Suggested */}
                    <div className="p-4 rounded-xl bg-cyan-50/50 dark:bg-gradient-to-br dark:from-cyan-950/40 dark:to-emerald-950/20 border border-cyan-300 dark:border-cyan-500/30 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-cyan-700 dark:text-cyan-300 font-semibold tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          AI Suggested (Tailored for {jobTitle || 'Job'})
                        </span>

                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              rows={4}
                              value={tempEditText}
                              onChange={(e) => setTempEditText(e.target.value)}
                              className="w-full bg-white dark:bg-gray-900 border border-cyan-500 rounded-lg p-2.5 text-xs md:text-sm text-gray-900 dark:text-white focus:outline-none resize-none font-mono"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(idx)}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300"
                              >
                                Save Edits
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                            {displayText}
                          </p>
                        )}
                      </div>

                      {/* Skills & Reason */}
                      <div className="space-y-1 pt-2 border-t border-cyan-200 dark:border-cyan-500/20">
                        {item.keySkillsHighlighted?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.keySkillsHighlighted.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.improvementReason && (
                          <p className="text-[11px] text-gray-600 dark:text-gray-400 italic">
                            Why: {item.improvementReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3 Options: Accept, Edit, Keep Original */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleDecision(idx, 'accept')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          currentDecision === 'accept'
                            ? 'bg-emerald-500 text-white dark:text-black font-bold shadow-sm ring-2 ring-emerald-400/50'
                            : 'bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/25'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>✓ Accept AI Suggestion</span>
                      </button>

                      <button
                        onClick={() => handleStartEdit(idx, displayText)}
                        disabled={isEditing}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          currentDecision === 'edit'
                            ? 'bg-amber-500 text-white dark:text-black font-bold shadow-sm ring-2 ring-amber-400/50'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>✏️ Edit</span>
                      </button>

                      <button
                        onClick={() => handleDecision(idx, 'keep')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          currentDecision === 'keep'
                            ? 'bg-gray-600 text-white font-bold shadow-sm ring-2 ring-gray-400/50'
                            : 'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>↩️ Keep Original</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-gray-500">
                      Selected: <strong className="text-gray-800 dark:text-gray-200">{currentDecision === 'accept' ? 'Accept AI' : currentDecision === 'edit' ? 'Custom Edit' : 'Keep Original'}</strong>
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Apply Selected Changes Button */}
            <div className="p-6 rounded-2xl glass-panel border border-cyan-300 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Ready to apply selected improvements?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Compiles a tailored version of your resume with all accepted suggestions while keeping your original master resume safe.
                </p>
              </div>

              <button
                onClick={handleApplyChanges}
                className="px-6 py-3 rounded-xl font-bold text-xs md:text-sm text-black bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/25 flex items-center gap-2 transition-all shrink-0 active:scale-95"
              >
                <FileCheck className="w-4 h-4" />
                <span>Apply Selected Changes</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center glass-panel rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No suggestions generated yet for this job description.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click <strong className="text-cyan-600 dark:text-cyan-400">"Analyze & Suggest Improvements"</strong> above to benchmark your resume against {jobTitle || 'the target job'}.
            </p>
          </div>
        )}
      </div>

      {/* Tailored Resume Preview and Download Section */}
      {tailoredResumeText && (
        <div
          id="tailored-resume-preview"
          className="glass-panel p-6 rounded-2xl border border-emerald-300 dark:border-emerald-500/40 space-y-4 animate-fadeIn"
        >
          {successBanner && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/50 flex items-start justify-between gap-3 text-emerald-900 dark:text-emerald-200 text-xs md:text-sm animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-sm">
                    Tailored Resume Successfully Synchronized
                  </p>
                  <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    {successBanner.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSuccessBanner(null)}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tailored Resume Ready ({appliedCount} Improvements Incorporated)
                </span>
                {keptCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                    {keptCount} Original Kept
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                Preview & Download Your Tailored Resume
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your original master resume remains intact. This tailored version incorporates your chosen improvements.
              </p>
            </div>

            {/* Action Buttons: Copy, PDF Download, Word Download */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyFullResume}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 transition-all shadow-sm"
              >
                {copiedResume ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedResume ? 'Copied Full Resume' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-400 hover:to-rose-400 text-white text-xs font-bold shadow-md shadow-red-500/25 transition-all"
                title="Download formatted PDF document"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF (.pdf)</span>
              </button>

              <button
                onClick={handleDownloadDoc}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
                title="Download formatted Word document"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Word (.doc)</span>
              </button>
            </div>
          </div>

          {/* Full Resume Document Preview */}
          <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800/80 font-mono text-xs md:text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto select-text">
            {tailoredResumeText}
          </div>
        </div>
      )}
    </div>
  );
}
