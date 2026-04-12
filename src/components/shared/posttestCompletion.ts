/**
 * Migration note: localStorage -> Firebase (Firestore)
 *
 * Current file is intentionally localStorage-based for fast client-side checks.
 * If you already have Firebase connected, this is the place to swap reads/writes.
 *
 * Suggested Firestore document shape:
 * users/{uid}/posttestState/{algoType}_{algorithm}
 * {
 *   completed: boolean,
 *   reminderShown: boolean,
 *   updatedAt: serverTimestamp()
 * }
 *
 * Mapping from current functions to Firebase:
 * - hasCompletedPosttest(...)   -> getDoc(...).data()?.completed === true
 * - markPosttestCompleted(...)  -> setDoc(..., { completed: true }, { merge: true })
 * - hasSeenPosttestReminder(...) -> getDoc(...).data()?.reminderShown === true
 * - markPosttestReminderSeen(...) -> setDoc(..., { reminderShown: true }, { merge: true })
 *
 * Implementation tips:
 * 1) Keep this file as a single data-access layer so UI components stay unchanged.
 * 2) Add async Firebase versions first (e.g. hasCompletedPosttestRemote) and migrate callers gradually.
 * 3) Keep localStorage as fallback cache only if needed for offline/first paint.
 */
export function getPosttestCompletionKey(
  algoType?: string,
  algorithm?: string,
) {
  if (!algoType || !algorithm) return null;
  return `posttest-completed:${algoType}:${algorithm}`;
}

export function hasCompletedPosttest(algoType?: string, algorithm?: string) {
  // Firebase replacement point:
  // return (await getDoc(posttestStateRef(uid, algoType, algorithm))).data()?.completed === true;
  const key = getPosttestCompletionKey(algoType, algorithm);
  if (!key || typeof window === "undefined") return false;

  return window.localStorage.getItem(key) === "true";
}

export function markPosttestCompleted(algoType?: string, algorithm?: string) {
  // Firebase replacement point:
  // await setDoc(posttestStateRef(uid, algoType, algorithm), { completed: true, updatedAt: serverTimestamp() }, { merge: true });
  const key = getPosttestCompletionKey(algoType, algorithm);
  if (!key || typeof window === "undefined") return;

  window.localStorage.setItem(key, "true");
}

export function getPosttestReminderShownKey(
  algoType?: string,
  algorithm?: string,
) {
  if (algoType && algorithm) {
    return `posttest-reminder-shown:${algoType}:${algorithm}`;
  }

  // Fallback key for unexpected routes without algo identifiers.
  return "posttest-reminder-shown:global";
}

export function hasSeenPosttestReminder(algoType?: string, algorithm?: string) {
  // Firebase replacement point:
  // return (await getDoc(posttestStateRef(uid, algoType, algorithm))).data()?.reminderShown === true;
  if (typeof window === "undefined") return false;

  const key = getPosttestReminderShownKey(algoType, algorithm);
  return window.localStorage.getItem(key) === "true";
}

export function markPosttestReminderSeen(
  algoType?: string,
  algorithm?: string,
) {
  // Firebase replacement point:
  // await setDoc(posttestStateRef(uid, algoType, algorithm), { reminderShown: true, updatedAt: serverTimestamp() }, { merge: true });
  if (typeof window === "undefined") return;

  const key = getPosttestReminderShownKey(algoType, algorithm);
  window.localStorage.setItem(key, "true");
}
