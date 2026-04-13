import { auth, db } from "@/src/config/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

type PosttestStateDoc = {
  completed?: boolean;
  reminderShown?: boolean;
};

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
  const data = await readPosttestState(algoType, algorithm);
  return data.completed === true;
}

export async function markPosttestCompleted(
  algoType?: string,
  algorithm?: string,
) {
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
}

export async function hasSeenPosttestReminder(
  algoType?: string,
  algorithm?: string,
) {
  const data = await readPosttestState(algoType, algorithm);
  return data.reminderShown === true;
}

export async function markPosttestReminderSeen(
  algoType?: string,
  algorithm?: string,
) {
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
}
