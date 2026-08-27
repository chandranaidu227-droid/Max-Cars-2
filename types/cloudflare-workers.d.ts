declare module "cloudflare:workers" {
  // Runtime bindings are supplied by Cloudflare in the existing Sites build.
  // Keep this ambient declaration permissive for the separate Netlify build,
  // where the unused worker files are still discovered by TypeScript.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const env: any;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface D1Database {
  prepare(query: string): unknown;
}
