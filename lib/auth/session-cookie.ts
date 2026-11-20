import "server-only";
import { cookies } from "next/headers";

const SESSION_COOKIE = "pulsecrm_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSessionCookie() {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}