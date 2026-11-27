import fs from "node:fs/promises";
import path from "node:path";

/**
 * Returns the Cloudflare R2 bucket instance from the Cloudflare Workers runtime environment.
 * If running in a Node.js development environment or non-Workers runtime, returns null.
 */
export async function getR2Bucket(): Promise<any | null> {
  try {
    // Dynamic import to avoid module resolution errors in standard Node runtime
    // @ts-ignore
    const cf = await import("cloudflare:workers");
    if (cf?.env?.BUCKET) {
      return cf.env.BUCKET;
    }
  } catch {
    // Not running inside Cloudflare Workers / workerd runtime
  }
  return null;
}

/**
 * Returns the public URL configured for the R2 bucket (if any).
 * e.g., https://pub-xxxxxxxx.r2.dev or https://images.yourdomain.com
 */
export async function getR2PublicUrl(): Promise<string> {
  try {
    // @ts-ignore
    const cf = await import("cloudflare:workers");
    const env = (cf?.env || {}) as Record<string, any>;
    if (env.NEXT_PUBLIC_R2_PUBLIC_URL) return String(env.NEXT_PUBLIC_R2_PUBLIC_URL).trim();
    if (env.R2_PUBLIC_URL) return String(env.R2_PUBLIC_URL).trim();
  } catch {}
  if (typeof process !== "undefined" && process.env) {
    if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) return process.env.NEXT_PUBLIC_R2_PUBLIC_URL.trim();
    if (process.env.R2_PUBLIC_URL) return process.env.R2_PUBLIC_URL.trim();
  }
  return "";
}

/**
 * Uploads an image buffer/bytes to Cloudflare R2 or falls back to public/uploads
 */
export async function uploadImageToStorage(
  filename: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ url: string; storage: "r2" | "local" }> {
  const bucket = await getR2Bucket();

  if (bucket) {
    await bucket.put(filename, buffer, {
      httpMetadata: {
        contentType: mimeType,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    const publicUrl = await getR2PublicUrl();
    if (publicUrl) {
      return {
        url: `${publicUrl.replace(/\/$/, "")}/${filename}`,
        storage: "r2",
      };
    }

    // Default: internal image delivery route that streams from R2
    return {
      url: `/api/images/${filename}`,
      storage: "r2",
    };
  }

  // Fallback for local Node.js development without workerd
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const destination = path.join(uploadsDir, filename);
  await fs.writeFile(destination, buffer);

  return {
    url: `/uploads/${filename}`,
    storage: "local",
  };
}

/**
 * Retrieves an image from Cloudflare R2 or local filesystem
 */
export async function getImageFromStorage(filename: string): Promise<{
  streamOrBuffer: any;
  contentType: string;
  etag?: string;
  cacheControl?: string;
} | null> {
  const bucket = await getR2Bucket();

  if (bucket) {
    const object = await bucket.get(filename);
    if (object) {
      return {
        streamOrBuffer: object.body,
        contentType: object.httpMetadata?.contentType || "image/jpeg",
        etag: object.httpEtag,
        cacheControl: object.httpMetadata?.cacheControl || "public, max-age=31536000, immutable",
      };
    }
  }

  // Fallback to local public/uploads directory
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    const data = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };

    return {
      streamOrBuffer: data,
      contentType: mimeMap[ext] || "image/jpeg",
      cacheControl: "public, max-age=86400",
    };
  } catch {
    return null;
  }
}

/**
 * Deletes an image from Cloudflare R2 or local filesystem
 */
export async function deleteImageFromStorage(url: string): Promise<{ success: boolean; storage?: string }> {
  const cleanUrl = url.split("?")[0];
  const filename = path.basename(cleanUrl);
  const bucket = await getR2Bucket();

  if (bucket) {
    try {
      await bucket.delete(filename);
    } catch (err) {
      console.error("[R2 Delete Error]:", err);
    }
  }

  if (url.startsWith("/uploads/") || url.includes("/uploads/")) {
    try {
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        console.error("[Local File Delete Error]:", err);
      }
    }
  }

  return { success: true };
}
