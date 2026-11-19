import { getImageFromStorage } from "../../../../lib/r2";

interface RouteContext {
  params: Promise<{ filename: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { filename } = await context.params;

    // Basic sanitization
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "");
    if (!sanitizedFilename || sanitizedFilename.includes("..")) {
      return new Response("Invalid image filename", { status: 400 });
    }

    const image = await getImageFromStorage(sanitizedFilename);
    if (!image) {
      return new Response("Image Not Found", { status: 404 });
    }

    // Check ETag caching
    const ifNoneMatch = req.headers.get("if-none-match");
    if (image.etag && ifNoneMatch === image.etag) {
      return new Response(null, {
        status: 304,
        headers: {
          "ETag": image.etag,
          "Cache-Control": image.cacheControl || "public, max-age=31536000, immutable",
        },
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", image.contentType);
    headers.set("Cache-Control", image.cacheControl || "public, max-age=31536000, immutable");
    if (image.etag) {
      headers.set("ETag", image.etag);
    }

    return new Response(image.streamOrBuffer, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("[GET /api/images error]:", err);
    return new Response("Error retrieving image", { status: 500 });
  }
}

export async function HEAD(req: Request, context: RouteContext) {
  const res = await GET(req, context);
  return new Response(null, {
    status: res.status,
    headers: res.headers,
  });
}
