import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not configured in environment variables.");
}

const secretKey = new TextEncoder().encode(secret);

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
}

export async function createSession(payload: SessionPayload) {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (
      typeof payload.userId !== "number" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}