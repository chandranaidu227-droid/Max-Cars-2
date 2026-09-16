// Keep personal browser caches separate when accounts change. Old MongoDB/demo
// records remain archived locally; they are never silently uploaded as a new user.
const privateKeys = ["max-favs", "max-bookings", "max-booking", "max-book-car", "max-orders", "max-order", "max-listings", "max-tickets", "max-api-sync", "max-profile", "max-avatar", "max-address"];
export function switchAccountCache(userId: string | null) {
  const previous = localStorage.getItem("max-data-owner");
  if (previous === userId && previous !== null) return;
  const saved: Record<string, string> = {};
  for (const key of privateKeys) {
    const value = localStorage.getItem(key);
    if (value !== null) saved[key] = value;
  }
  if (Object.keys(saved).length) localStorage.setItem(`max-account-cache:${previous || "legacy"}`, JSON.stringify(saved));
  for (const key of privateKeys) localStorage.removeItem(key);
  localStorage.removeItem("max-data-owner");
  if (userId) {
    try {
      const stored = JSON.parse(localStorage.getItem(`max-account-cache:${userId}`) || "{}");
      for (const key of privateKeys) if (typeof stored[key] === "string") localStorage.setItem(key, stored[key]);
    } catch { /* A corrupt cache must not prevent authenticated access. */ }
    localStorage.setItem("max-data-owner", userId);
  }
}
