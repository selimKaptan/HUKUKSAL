"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-2xl mx-auto mb-10">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
                index < currentStep
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                  : index === currentStep
                  ? "bg-white border-blue-600 text-blue-600 shadow-lg shadow-blue-100"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              )}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </motion.div>
            <span
              className={cn(
                "text-xs font-medium text-center whitespace-nowrap",
                index <= currentStep ? "text-blue-700" : "text-slate-400"
              )}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 mx-3 mt-[-20px]">
              <div className="h-0.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: "0%" }}
                  animate={{
                    width: index < currentStep ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
