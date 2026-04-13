import { auth, db } from "@/src/config/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

type PosttestStateDoc = {
  completed?: boolean;
  reminderShown?: boolean;
};

function getLocalCompletionKey(algoType?: string, algorithm?: string) {
  if (!algoType || !algorithm) return null;
  return `posttest-completed:${algoType}:${algorithm}`;
}

function getLocalReminderKey(algoType?: string, algorithm?: string) {
  if (!algoType || !algorithm) return null;
  return `posttest-reminder-shown:${algoType}:${algorithm}`;
}

function getPosttestStateDocId(algoType?: string, algorithm?: string) {
  if (!algoType || !algorithm) return null;
  return `${algoType}_${algorithm}`;
}

function getPosttestStateDocRef(algoType?: string, algorithm?: string) {
  const uid = auth.currentUser?.uid;
  const docId = getPosttestStateDocId(algoType, algorithm);
  if (!uid || !docId) return null;

  return doc(db, "users", uid, "posttestState", docId);
}

async function readPosttestState(
  algoType?: string,
  algorithm?: string,
): Promise<PosttestStateDoc> {
  const ref = getPosttestStateDocRef(algoType, algorithm);
  if (!ref) return {};

  const snap = await getDoc(ref);
  if (!snap.exists()) return {};

  return (snap.data() as PosttestStateDoc) ?? {};
}

export async function hasCompletedPosttest(
  algoType?: string,
  algorithm?: string,
) {
  try {
    const data = await readPosttestState(algoType, algorithm);
    return data.completed === true;
  } catch {
    if (typeof window === "undefined") return false;
    const key = getLocalCompletionKey(algoType, algorithm);
    return key ? window.localStorage.getItem(key) === "true" : false;
  }
}

export async function markPosttestCompleted(
  algoType?: string,
  algorithm?: string,
) {
  try {
    const ref = getPosttestStateDocRef(algoType, algorithm);
    if (!ref) return;

    await setDoc(
      ref,
      {
        completed: true,
        reminderShown: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    if (typeof window === "undefined") return;
    const completionKey = getLocalCompletionKey(algoType, algorithm);
    const reminderKey = getLocalReminderKey(algoType, algorithm);
    if (completionKey) window.localStorage.setItem(completionKey, "true");
    if (reminderKey) window.localStorage.setItem(reminderKey, "true");
  }
}

export async function hasSeenPosttestReminder(
  algoType?: string,
  algorithm?: string,
) {
  try {
    const data = await readPosttestState(algoType, algorithm);
    return data.reminderShown === true;
  } catch {
    if (typeof window === "undefined") return false;
    const key = getLocalReminderKey(algoType, algorithm);
    return key ? window.localStorage.getItem(key) === "true" : false;
  }
}

export async function markPosttestReminderSeen(
  algoType?: string,
  algorithm?: string,
) {
  try {
    const ref = getPosttestStateDocRef(algoType, algorithm);
    if (!ref) return;

    await setDoc(
      ref,
      {
        reminderShown: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    if (typeof window === "undefined") return;
    const key = getLocalReminderKey(algoType, algorithm);
    if (key) window.localStorage.setItem(key, "true");
  }
}
