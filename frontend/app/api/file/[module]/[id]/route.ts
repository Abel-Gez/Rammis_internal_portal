import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Django file downloads.
 *
 * Why this exists:
 *   Django listens on 127.0.0.1:8000. On Linux, "localhost" often resolves
 *   to ::1 (IPv6) so a browser iframe pointed at http://localhost:8000 gets
 *   "connection refused". This route keeps the iframe URL on the same
 *   Next.js origin (localhost:3000), fetches the file from Django server-side
 *   using 127.0.0.1, and streams it back — so the browser never needs to
 *   reach Django directly.
 *
 * URL shape:  /api/file/<module>/<id>?inline=true|false
 * Examples:
 *   /api/file/documents/10?inline=true   → preview (Content-Disposition: inline)
 *   /api/file/documents/10               → force download (Content-Disposition: attachment)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ module: string; id: string }> }
) {
  // Next.js 15+ makes params a Promise — must be awaited before use
  const { module, id } = await context.params;
  const inline = req.nextUrl.searchParams.get("inline") === "true";

  // Forward the browser's session cookie to Django so auth is preserved.
  // Cookies are not port-specific, so the Django sessionid set on localhost:8000
  // is included in browser requests to localhost:3000 and forwarded here.
  const cookie = req.headers.get("cookie") ?? "";

  const djangoUrl =
    `http://127.0.0.1:8000/api/files/download/${module}/${id}/` +
    (inline ? "?inline=true" : "");

  let upstream: Response;
  try {
    upstream = await fetch(djangoUrl, {
      headers: { Cookie: cookie },
      cache: "no-store",
    });
  } catch {
    return new NextResponse("Backend unreachable", { status: 502 });
  }

  if (!upstream.ok) {
    return new NextResponse("Access denied or file not found", {
      status: upstream.status,
    });
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  const disposition =
    upstream.headers.get("content-disposition") ??
    (inline ? "inline" : "attachment");

  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      "Cache-Control": "private, no-cache",
    },
  });
}
