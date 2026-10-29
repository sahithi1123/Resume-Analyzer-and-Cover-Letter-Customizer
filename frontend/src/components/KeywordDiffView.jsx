import React from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, Sparkles, RefreshCw, Briefcase, FileText } from 'lucide-react';
import KeywordParticleCloud3D from './KeywordParticleCloud3D';

// Pattern: Container / Presentational Pattern
// Step 2 Component: "ATS Skill Match"
// Pure Presentational Component: renders ATS match score, skill breakdown, and embedded skill radar.
// Always uses the current active resume, job title, company name, and job description.
export default function KeywordDiffView({
  keywordResult,
  onAnalyze,
  isAnalyzing,
  jobTitle,
  companyName,
  jobDescription,
  activeResume,
}) {
  return (
    <div className="space-y-6">
      {/* Skill Match Radar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <KeywordParticleCloud3D className="h-48 md:h-56 w-full" />
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-cyan-600 dark:text-cyan-400 font-bold">
                ATS Skill Analyzer
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300">
                Fresh Benchmark
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              Scan & Compare Skills with Job Requirements
            </h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              Analyzes your current uploaded resume against the target job requirements. Click below to calculate your compatibility score and identify missing technical skills.
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

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="self-start flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm text-black bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/25 disabled:opacity-50 transition-all active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Scanning ATS Keywords...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {keywordResult ? 'Re-Run ATS Skill Analysis' : 'Run ATS Skill Analysis'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View - Appears as soon as analysis is ready */}
      {keywordResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Executive Match Score Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gray-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold shadow-sm">
                {companyName ? `${companyName} • ${jobTitle || 'Role'}` : (jobTitle || 'Target Job Match')}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">ATS Compatibility Assessment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">{keywordResult.summary}</p>
            </div>

            {/* Score Ring */}
            <div
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border min-w-[130px] ${
                keywordResult.matchScore >= 80
                  ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                  : keywordResult.matchScore >= 60
                  ? 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'
                  : 'text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10'
              }`}
            >
              <span className="text-3xl font-extrabold tracking-tight">{keywordResult.matchScore}%</span>
              <span className="text-xs uppercase font-mono tracking-wider mt-1">Match Score</span>
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle className="w-4 h-4" />
                <h4>Matched Skills ({keywordResult.matchedKeywords?.length || 0})</h4>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                These skills were found in both your resume and the target job description:
              </p>
              <div className="flex flex-wrap gap-2">
                {keywordResult.matchedKeywords?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <h4>Missing / Recommended Skills ({keywordResult.missingKeywords?.length || 0})</h4>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Critical keywords required by the job that your resume currently lacks:
              </p>
              <div className="flex flex-wrap gap-2">
                {keywordResult.missingKeywords?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations Box */}
          {keywordResult.recommendedAdditions?.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold text-sm">
                <Lightbulb className="w-4 h-4" />
                <h4>How to Close the Keyword Gap</h4>
              </div>
              <ul className="space-y-2">
                {keywordResult.recommendedAdditions.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
