const SESSION_SUBJECT = "team";

function getSessionSecret() {
  return process.env.SESSION_SECRET || "dev-session-secret-change-me";
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function sign(value: string): Promise<string> {
  const keyData = new TextEncoder().encode(getSessionSecret());
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return toHex(new Uint8Array(signature));
}

/** Edge-runtime compatible token verification for middleware. */
export async function verifySessionTokenEdge(token?: string): Promise<boolean> {
  if (!token) return false;

  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [subject, expiresAt, signature] = parts;
  const payload = `${subject}:${expiresAt}`;
  const expected = await sign(payload);

  const isValidSignature = safeEqual(signature, expected);
  const isFresh = Number(expiresAt) > Date.now();
  const isTeam = subject === SESSION_SUBJECT;

  return isValidSignature && isFresh && isTeam;
}
