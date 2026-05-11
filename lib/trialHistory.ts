import { latestFormStorageKey } from "@/lib/constants";
import type {
  CareerFormData,
  GenerateResult,
  InputQualityAnalysis,
  TrialHistoryItem,
} from "@/lib/types";

export const trialHistoryStorageKey = "career-material-trial-history";

function createId() {
  return `history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readLatestForm() {
  const storedForm = window.localStorage.getItem(latestFormStorageKey);
  if (!storedForm) return null;

  try {
    return JSON.parse(storedForm) as CareerFormData;
  } catch {
    return null;
  }
}

export function saveLatestForm(formData: CareerFormData) {
  window.localStorage.setItem(latestFormStorageKey, JSON.stringify(formData));
}

export function readTrialHistory() {
  const storedHistory = window.localStorage.getItem(trialHistoryStorageKey);
  if (!storedHistory) return [];

  try {
    return JSON.parse(storedHistory) as TrialHistoryItem[];
  } catch {
    return [];
  }
}

export function writeTrialHistory(items: TrialHistoryItem[]) {
  window.localStorage.setItem(trialHistoryStorageKey, JSON.stringify(items));
}

export function addTrialHistoryItem({
  formData,
  result,
  completenessLevel,
}: {
  formData: CareerFormData;
  result: GenerateResult;
  completenessLevel: InputQualityAnalysis["completenessLevel"];
}) {
  const item: TrialHistoryItem = {
    id: createId(),
    formData,
    result,
    createdAt: new Date().toISOString(),
    source: result.source || "mock",
    completenessLevel,
  };

  writeTrialHistory([item, ...readTrialHistory()].slice(0, 30));
  return item;
}

export function updateTrialHistoryResult(id: string, result: GenerateResult) {
  const history = readTrialHistory();
  writeTrialHistory(
    history.map((item) =>
      item.id === id
        ? {
            ...item,
            result,
            source: result.source || item.source,
          }
        : item,
    ),
  );
}

export function deleteTrialHistoryItem(id: string) {
  writeTrialHistory(readTrialHistory().filter((item) => item.id !== id));
}
