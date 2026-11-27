import { neon } from "@neondatabase/serverless";

function readStaticProcessEnv(key: string): string {
  if (typeof process === "undefined" || !process.env) return "";
  switch (key) {
    case "DATABASE_URL":
      return process.env.DATABASE_URL || "";
    case "ADMIN_USERNAME":
      return process.env.ADMIN_USERNAME || "";
    case "ADMIN_PASSWORD":
      return process.env.ADMIN_PASSWORD || "";
    case "R2_BUCKET_NAME":
      return process.env.R2_BUCKET_NAME || "";
    case "NEXT_PUBLIC_R2_PUBLIC_URL":
      return process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
    default:
      return process.env[key] || "";
  }
}

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
  return readStaticProcessEnv(key).trim();
}

export async function getDatabaseUrl(): Promise<string> {
  const raw = await getEnvVar("DATABASE_URL");
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
