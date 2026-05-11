import type { TrialEvent, TrialEventName } from "@/lib/types";

export const trialEventsStorageKey = "career-material-trial-events";
const trialSessionStorageKey = "career-material-session-id";

function createSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getTrialSessionId() {
  const currentSessionId = window.localStorage.getItem(trialSessionStorageKey);
  if (currentSessionId) return currentSessionId;

  const nextSessionId = createSessionId();
  window.localStorage.setItem(trialSessionStorageKey, nextSessionId);
  return nextSessionId;
}

export function readTrialEvents() {
  const storedEvents = window.localStorage.getItem(trialEventsStorageKey);
  if (!storedEvents) return [];

  try {
    return JSON.parse(storedEvents) as TrialEvent[];
  } catch {
    return [];
  }
}

export function recordTrialEvent({
  eventName,
  targetRole,
  projectType,
  source,
  completenessLevel,
}: Omit<TrialEvent, "timestamp" | "sessionId"> & { eventName: TrialEventName }) {
  const event: TrialEvent = {
    eventName,
    timestamp: new Date().toISOString(),
    sessionId: getTrialSessionId(),
    targetRole,
    projectType,
    source,
    completenessLevel,
  };

  window.localStorage.setItem(
    trialEventsStorageKey,
    JSON.stringify([...readTrialEvents(), event].slice(-300)),
  );

  void fetch("/api/trial-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch(() => undefined);
}
