import { posttestService } from "@/src/services/posttest.service";

type StatusSnapshot = {
  completed: boolean;
  reminderShown: boolean;
};

const STATUS_CACHE_TTL_MS = 10_000;
const statusCache = new Map<
  string,
  {
    value: StatusSnapshot;
    fetchedAt: number;
  }
>();
const inFlightStatus = new Map<string, Promise<StatusSnapshot>>();

function getLocalCompletionKey(algoType?: string, algorithm?: string) {
  if (!algoType || !algorithm) return null;
  return `posttest-completed:${algoType}:${algorithm}`;
}

function getLocalReminderKey(algoType?: string, algorithm?: string) {
  if (!algoType || !algorithm) return null;
  return `posttest-reminder-shown:${algoType}:${algorithm}`;
}

function getStatusCacheKey(algoType?: string, algorithm?: string) {
  return `${algoType || ""}:${algorithm || ""}`;
}

function getLocalCompletionValue(algoType?: string, algorithm?: string) {
  if (typeof window === "undefined") return false;
  const key = getLocalCompletionKey(algoType, algorithm);
  return key ? window.localStorage.getItem(key) === "true" : false;
}

function getLocalReminderValue(algoType?: string, algorithm?: string) {
  if (typeof window === "undefined") return false;
  const key = getLocalReminderKey(algoType, algorithm);
  return key ? window.localStorage.getItem(key) === "true" : false;
}

function setLocalFlag(key: string | null, value: boolean) {
  if (typeof window === "undefined" || !key) return;
  if (value) {
    window.localStorage.setItem(key, "true");
    return;
  }
  window.localStorage.removeItem(key);
}

function syncLocalStatus(
  algoType?: string,
  algorithm?: string,
  snapshot?: Partial<StatusSnapshot>,
) {
  if (typeof window === "undefined") return;

  if (typeof snapshot?.completed === "boolean") {
    setLocalFlag(
      getLocalCompletionKey(algoType, algorithm),
      snapshot.completed,
    );
  }

  if (typeof snapshot?.reminderShown === "boolean") {
    setLocalFlag(
      getLocalReminderKey(algoType, algorithm),
      snapshot.reminderShown,
    );
  }
}

function persistLocalStatus(
  algoType?: string,
  algorithm?: string,
  snapshot?: Partial<StatusSnapshot>,
) {
  syncLocalStatus(algoType, algorithm, snapshot);
}

async function loadStatusSnapshot(
  algoType?: string,
  algorithm?: string,
): Promise<StatusSnapshot> {
  if (!algorithm) {
    return { completed: false, reminderShown: false };
  }

  const cacheKey = getStatusCacheKey(algoType, algorithm);
  const cached = statusCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.fetchedAt <= STATUS_CACHE_TTL_MS) {
    return cached.value;
  }

  const pending = inFlightStatus.get(cacheKey);
  if (pending) {
    return pending;
  }

  const request = (async () => {
    try {
      const response = await posttestService.checkPosttestStatus(algorithm);
      const completed = response.data?.data?.completed === true;
      const reminderShown =
        completed || response.data?.data?.reminderShown === true;
      const snapshot = { completed, reminderShown };

      statusCache.set(cacheKey, {
        value: snapshot,
        fetchedAt: Date.now(),
      });

      persistLocalStatus(algoType, algorithm, snapshot);
      return snapshot;
    } catch {
      const localCompleted = getLocalCompletionValue(algoType, algorithm);
      const localReminder = getLocalReminderValue(algoType, algorithm);
      return {
        completed: localCompleted,
        reminderShown: localCompleted || localReminder,
      };
    } finally {
      inFlightStatus.delete(cacheKey);
    }
  })();

  inFlightStatus.set(cacheKey, request);
  return request;
}

export async function hasCompletedPosttest(
  algoType?: string,
  algorithm?: string,
) {
  const snapshot = await loadStatusSnapshot(algoType, algorithm);
  return snapshot.completed;
}

export async function markPosttestCompleted(
  algoType?: string,
  algorithm?: string,
) {
  const cacheKey = getStatusCacheKey(algoType, algorithm);
  const value = { completed: true, reminderShown: true };

  statusCache.set(cacheKey, {
    value,
    fetchedAt: Date.now(),
  });

  persistLocalStatus(algoType, algorithm, value);

  if (!algorithm) return;

  try {
    await posttestService.markReminderSeen(algorithm, {
      seen: true,
      source: "posttest-completed",
    });
  } catch {
    // Keep local/cache value and rely on next status sync.
  }
}

export async function hasSeenPosttestReminder(
  algoType?: string,
  algorithm?: string,
) {
  const snapshot = await loadStatusSnapshot(algoType, algorithm);
  return snapshot.reminderShown;
}

export async function markPosttestReminderSeen(
  algoType?: string,
  algorithm?: string,
) {
  const cacheKey = getStatusCacheKey(algoType, algorithm);
  const current = statusCache.get(cacheKey)?.value;
  const value = {
    completed: current?.completed === true,
    reminderShown: true,
  };

  statusCache.set(cacheKey, {
    value,
    fetchedAt: Date.now(),
  });

  persistLocalStatus(algoType, algorithm, value);

  if (!algorithm) return;

  try {
    await posttestService.markReminderSeen(algorithm, {
      seen: true,
      source: "maybe-later",
    });
  } catch {
    // Local fallback is already persisted above.
  }
}
