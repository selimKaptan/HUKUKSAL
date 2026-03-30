export * from "./database";

export interface WizardFormData {
  step1: {
    title: string;
    category: import("./database").CaseCategory;
  };
  step2: {
    eventSummary: string;
    eventDate: string;
    opposingParty: string;
  };
  step3: {
    evidences: File[];
    additionalNotes: string;
  };
}

export interface StepProps {
  formData: WizardFormData;
  updateFormData: (step: keyof WizardFormData, data: Partial<WizardFormData[keyof WizardFormData]>) => void;
  onNext: () => void;
  onBack: () => void;
}
