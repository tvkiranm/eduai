import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN_COOKIE = "eduai_token";

function getBackendBaseUrl(): string {
  const raw = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  return raw.replace(/\/$/, "");
}

function pickForwardHeaders(request: Request) {
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  return headers;
}

async function proxy(request: Request, pathParts: string[]) {
  const backendBase = getBackendBaseUrl();
  if (!backendBase) {
    return NextResponse.json(
      { message: "Missing backend base URL (set API_URL or NEXT_PUBLIC_API_URL)" },
      { status: 500 },
    );
  }

  const path = pathParts.join("/");
  const url = new URL(request.url);
  const upstreamUrl = `${backendBase}/${path}${url.search}`;

  const headers = pickForwardHeaders(request);

  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const isAuthLogin = path === "auth/login" && request.method === "POST";
  const isAuthRegister = path === "auth/register" && request.method === "POST";
  const isAuthLogout = path === "auth/logout";

  if (isAuthLogout) {
    const res = NextResponse.json({ message: "Logged out", data: null });
    res.cookies.set(TOKEN_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  if (token && !isAuthLogin && !isAuthRegister) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const upstreamRes = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const contentType = upstreamRes.headers.get("content-type") ?? "application/json";
  const text = await upstreamRes.text();

  // Special case: set httpOnly cookie on login.
  if (isAuthLogin) {
    try {
      const json = JSON.parse(text) as {
        message?: string;
        data?: { accessToken?: string; user?: unknown };
      };

      if (upstreamRes.ok && json?.data?.accessToken) {
        const res = NextResponse.json(
          { message: json.message ?? "Login successful", data: { user: json.data.user } },
          { status: upstreamRes.status },
        );

        res.cookies.set(TOKEN_COOKIE, json.data.accessToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });

        return res;
      }
    } catch {
      // Fall through and return upstream response
    }
  }

  return new NextResponse(text, {
    status: upstreamRes.status,
    headers: { "content-type": contentType },
  });
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
