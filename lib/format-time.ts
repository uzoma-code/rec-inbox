const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export function formatTimeAgo(
  isoDate: string,
  now = new Date(),
): string {
  const then = new Date(isoDate);
  const diffMs = now.getTime() - then.getTime();

  if (Number.isNaN(then.getTime()) || diffMs < 0) {
    return "just now";
  }

  if (diffMs < MINUTE_MS) {
    return "just now";
  }

  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS);
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }

  if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  const days = Math.floor(diffMs / DAY_MS);
  if (days < 30) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function formatRecMeta(
  recommenderName: string,
  createdAt: string,
  now = new Date(),
): string {
  return `${recommenderName} · ${formatTimeAgo(createdAt, now)}`;
}
