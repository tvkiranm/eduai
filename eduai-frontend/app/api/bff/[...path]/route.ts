import type { NextRequest } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4005";

function buildTargetUrl(req: NextRequest, path: string) {
  const base = API_BASE.replace(/\/+$/, "");
  const url = new URL(`${base}/${path.replace(/^\/+/, "")}`);
  url.search = req.nextUrl.search;
  return url;
}

async function proxy(req: NextRequest, path: string) {
  const target = buildTargetUrl(req, path);

  const headers = new Headers(req.headers);
  headers.delete("host");

  const hasBody = !["GET", "HEAD"].includes(req.method);

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    ...(hasBody ? { body: req.body, duplex: "half" as const } : {}),
    redirect: "manual",
    cache: "no-store",
  });

  const resHeaders = new Headers(upstream.headers);
  resHeaders.delete("content-encoding");
  resHeaders.delete("content-length");
  resHeaders.delete("transfer-encoding");
  resHeaders.delete("connection");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

type BffContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(req: NextRequest, ctx: BffContext) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function POST(req: NextRequest, ctx: BffContext) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function PUT(req: NextRequest, ctx: BffContext) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function PATCH(req: NextRequest, ctx: BffContext) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function DELETE(req: NextRequest, ctx: BffContext) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}
