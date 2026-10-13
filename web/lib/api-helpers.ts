import { NextResponse } from "next/server";

export function json<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function badRequest(fields: Record<string, string>): NextResponse {
  return NextResponse.json({ ok: false, error: "validation_error", fields }, { status: 422 });
}

export function serverError(message = "Erro interno"): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

/** Honeypot + tempo mínimo de preenchimento (anti-bot leve). */
export function looksLikeSpam(body: { _gotcha?: unknown; _elapsed?: unknown }): boolean {
  if (typeof body._gotcha === "string" && body._gotcha.length > 0) return true;
  const elapsed = Number(body._elapsed);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 1200) return true;
  return false;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/** Rate limit em memória (por instância). Suficiente para o MVP. */
export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return ip;
}
