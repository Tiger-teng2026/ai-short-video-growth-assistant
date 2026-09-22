export const FREE_DAILY_LIMIT = 3;
export const USAGE_STORAGE_KEY = "growth-assistant-free-usage";

export type FreeUsage = {
  generationDate: string;
  generationCount: number;
};

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function resolveUsage(
  stored: FreeUsage | null,
  today = todayDate(),
): FreeUsage {
  if (!stored || stored.generationDate !== today) {
    return {
      generationDate: today,
      generationCount: 0,
    };
  }

  return stored;
}

export function isAtFreeLimit(usage: FreeUsage): boolean {
  return usage.generationCount >= FREE_DAILY_LIMIT;
}

export function incrementUsage(usage: FreeUsage, today = todayDate()): FreeUsage {
  const current = resolveUsage(usage, today);
  return {
    generationDate: today,
    generationCount: current.generationCount + 1,
  };
}

export function readUsage(): FreeUsage {
  if (typeof window === "undefined") {
    return resolveUsage(null);
  }

  try {
    const raw = window.localStorage.getItem(USAGE_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as FreeUsage) : null;
    return resolveUsage(parsed);
  } catch {
    return resolveUsage(null);
  }
}

export function canGenerateFree(): boolean {
  return !isAtFreeLimit(readUsage());
}

export function recordGeneration(): FreeUsage {
  const next = incrementUsage(readUsage());

  if (typeof window !== "undefined") {
    window.localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}
