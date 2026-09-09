import { clerkFapiDest, clerkFapiHeaders, clerkFapiResponseHeaders } from "../../clerkFapi.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
  const secret = process.env.CLERK_SECRET_KEY || "";
  if (!secret.startsWith("sk_")) {
    return new Response("Clerk proxy yok.", { status: 500 });
  }

  let dest;
  try {
    dest = clerkFapiDest(request.url);
  } catch {
    return new Response("Clerk dest yok.", { status: 400 });
  }
  const headers = clerkFapiHeaders(request, secret);
  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  const up = await fetch(dest, init);
  return new Response(up.body, {
    status: up.status,
    headers: clerkFapiResponseHeaders(up.headers, request),
  });
}
