import React, { createContext, useContext, useState } from 'react';
import { Check, Lock, ArrowRight, ArrowLeft, Plus } from 'lucide-react';

// Pattern: Compound Component Pattern
// Provides an intuitive, strictly sequential multi-step workflow with locked future steps.

const WizardContext = createContext(null);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a <Wizard> compound component');
  }
  return context;
};

export function Wizard({
  children,
  defaultStep = 1,
  activeStep: controlledActiveStep,
  setActiveStep: controlledSetActiveStep,
  maxUnlockedStep = 1,
  onStepChange,
  isStepComplete,
  isCurrentStepComplete: fallbackStepComplete = false,
  stepRequirements = {},
  allStepsCompleted = false,
  onNewCustomization,
}) {
  const [internalStep, setInternalStep] = useState(defaultStep);

  const isControlled = controlledActiveStep !== undefined;
  const activeStep = isControlled ? controlledActiveStep : internalStep;

  const setActiveStep = (stepNumber) => {
    if (isControlled && controlledSetActiveStep) {
      controlledSetActiveStep(stepNumber);
    } else {
      setInternalStep(stepNumber);
    }
  };

  const checkStepComplete = (step) => {
    if (typeof isStepComplete === 'function') {
      return isStepComplete(step);
    }
    return fallbackStepComplete;
  };

  const isCurrentStepComplete = checkStepComplete(activeStep);

  const goToStep = (stepNumber) => {
    if (stepNumber <= maxUnlockedStep) {
      setActiveStep(stepNumber);
      if (onStepChange) onStepChange(stepNumber);
    }
  };

  const nextStep = () => {
    if (isCurrentStepComplete && activeStep < 4) {
      const next = activeStep + 1;
      setActiveStep(next);
      if (onStepChange) onStepChange(next);
    }
  };

  const prevStep = () => {
    const prev = Math.max(1, activeStep - 1);
    setActiveStep(prev);
    if (onStepChange) onStepChange(prev);
  };

  const value = {
    activeStep,
    maxUnlockedStep,
    goToStep,
    nextStep,
    prevStep,
    isCurrentStepComplete,
    checkStepComplete,
    stepRequirements,
    allStepsCompleted,
    onNewCustomization,
  };

  return (
    <WizardContext.Provider value={value}>
      <div className="w-full flex flex-col space-y-6">{children}</div>
    </WizardContext.Provider>
  );
}

// Sub-component: Wizard.Step
// Clean step container with only the step name at the top (no long explanations)
export function WizardStep({ stepNumber, children, simpleTitle }) {
  const { activeStep } = useWizard();

  if (activeStep !== stepNumber) return null;

  return (
    <div className="w-full animate-fadeIn transition-all duration-300 space-y-5">
      {/* Simple Step Name Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          Step {stepNumber}: {simpleTitle || `Step ${stepNumber}`}
        </h2>
      </div>

      {children}
    </div>
  );
}

// Sub-component: Wizard.Navigation
export function WizardNavigation({ totalSteps = 4, stepLabels = [] }) {
  const {
    activeStep,
    maxUnlockedStep,
    goToStep,
    nextStep,
    prevStep,
    isCurrentStepComplete,
    checkStepComplete,
    stepRequirements,
    allStepsCompleted,
    onNewCustomization,
  } = useWizard();

  const currentRequirementMsg = stepRequirements[activeStep] || 'Complete the current step to proceed';

  return (
    <div className="w-full flex flex-col gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
      {/* Visual Step Progress Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isActive = activeStep === step;
          const isCompleted = checkStepComplete(step);
          const isUnlocked = step <= maxUnlockedStep;
          const isLocked = !isUnlocked;

          return (
            <button
              key={step}
              type="button"
              onClick={() => goToStep(step)}
              disabled={isLocked}
              className={`p-3 rounded-xl border transition-all text-left flex items-start gap-2.5 relative ${
                isActive
                  ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 dark:border-cyan-400 shadow-md shadow-cyan-500/10'
                  : isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 cursor-pointer'
                  : isLocked
                  ? 'bg-gray-100/60 dark:bg-gray-950/40 border-gray-200 dark:border-gray-900 opacity-40 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              {/* Step Number or Icon */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                  isActive
                    ? 'bg-cyan-500 text-white dark:bg-cyan-400 dark:text-black shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black'
                    : isLocked
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : step}
              </div>

              {/* Label & Status */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Step {step}
                  </span>
                  {isLocked && <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 uppercase">Locked</span>}
                  {isCompleted && !isActive && <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Done</span>}
                  {isActive && <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">Active</span>}
                </div>
                <p className={`text-xs md:text-sm font-semibold truncate ${isActive ? 'text-gray-900 dark:text-white' : isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {stepLabels[step - 1] || `Step ${step}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons and Requirement Alert */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={prevStep}
          disabled={activeStep === 1}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Previous Step
        </button>

        {/* Guidance tip if Next is locked */}
        {!isCurrentStepComplete && activeStep < totalSteps && (
          <span className="text-xs text-amber-700 dark:text-amber-400 font-mono bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-lg text-center">
            ⚠️ {currentRequirementMsg}
          </span>
        )}

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {activeStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isCurrentStepComplete}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-cyan-400 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-2 rounded-xl">
              <Check className="w-4 h-4" />
              <span>All 4 Steps Complete!</span>
            </div>
          )}

          {allStepsCompleted && onNewCustomization && (
            <button
              type="button"
              onClick={onNewCustomization}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-400/40 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
              title="Start a new customization session"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Customization</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

Wizard.Step = WizardStep;
Wizard.Navigation = WizardNavigation;
