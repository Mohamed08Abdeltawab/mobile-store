import { neon } from "@neondatabase/serverless";

export async function getEnvVar(key: string): Promise<string> {
  try {
    // @ts-ignore
    const cf = await import("cloudflare:workers");
    if (cf?.env && cf.env[key]) {
      return String(cf.env[key]).trim();
    }
  } catch {
    // Not running in Cloudflare Workers / workerd runtime
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return String(process.env[key]).trim();
  }
  return "";
}

export async function getDatabaseUrl(): Promise<string> {
  let raw = "";
  try {
    // @ts-ignore
    const cf = await import("cloudflare:workers");
    if (cf?.env?.DATABASE_URL) {
      raw = String(cf.env.DATABASE_URL);
    }
  } catch {
    // Not running in Cloudflare Workers / workerd runtime
  }
  // Static property access so Vite `define` replaces process.env.DATABASE_URL in local preview
  if (!raw && typeof process !== "undefined" && process.env && process.env.DATABASE_URL) {
    raw = process.env.DATABASE_URL;
  }
  return raw.replace(/^["']|["']$/g, "").trim();
}

export async function isNeonConfigured(): Promise<boolean> {
  const url = await getDatabaseUrl();
  return Boolean(url && (url.startsWith("postgres://") || url.startsWith("postgresql://")));
}

/**
 * Returns a Neon serverless HTTP SQL client bound to DATABASE_URL (pooled).
 */
export async function getNeonSql() {
  const url = await getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not configured for Neon.");
  }
  return neon(url);
}
