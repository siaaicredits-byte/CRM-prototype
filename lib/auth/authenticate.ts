
import "server-only";

import type { NextRequest } from "next/server";
import { db } from "@/src/prisma/db";
import { verifySession } from "@/lib/auth/session";
import { getSessionCookie } from "@/lib/auth/session-cookie";

export async function getCurrentUser(request?: NextRequest) {
  const token = await getSessionCookie(request);

  if (!token) {
    return null;
  }

  const session = await verifySession(token);

  if (!session) {
    return null;
  }

  const user = await db.orm.public.User
    .where({ id: session.userId })
    .first();

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: Number(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
