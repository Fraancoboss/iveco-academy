import type { Context, Next } from "hono";

interface SlidingWindow {
  timestamps: number[];
}

const windows = new Map<string, SlidingWindow>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 60;

export async function rateLimit(c: Context, next: Next) {
  const ip = c.req.header("x-forwarded-for") ?? "127.0.0.1";
  const now = Date.now();

  let window = windows.get(ip);
  if (!window) {
    window = { timestamps: [] };
    windows.set(ip, window);
  }

  // Remove timestamps outside the window
  window.timestamps = window.timestamps.filter((t) => now - t < WINDOW_MS);

  if (window.timestamps.length >= MAX_REQUESTS) {
    return c.json({ error: "Too many requests" }, 429);
  }

  window.timestamps.push(now);
  await next();
}
