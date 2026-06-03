import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "hlh_admin_session";
const SESSION_SUBJECT = "team";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSessionSecret() {
  return process.env.SESSION_SECRET || "dev-session-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Team login: password only (set ADMIN_PASSWORD in .env). */
export function validateAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "change-this-password";
  return safeEqual(password, expected);
}

export function createSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `${SESSION_SUBJECT}:${expiresAt}`;
  return `${payload}:${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return false;

  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [subject, expiresAt, signature] = parts;
  const payload = `${subject}:${expiresAt}`;
  const isValidSignature = safeEqual(signature, sign(payload));
  const isFresh = Number(expiresAt) > Date.now();
  const isTeam = subject === SESSION_SUBJECT;

  return isValidSignature && isFresh && isTeam;
}

export async function isAdminSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
