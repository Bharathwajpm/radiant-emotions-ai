import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import type { Request } from "express";
import { UserModel } from "./models/User.js";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type JwtClaims = {
  sub: string;
  email: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  const trimmed = secret?.trim();
  if (trimmed && trimmed.length >= 16) return trimmed;

  // Dev-friendly default so the API works out of the box.
  if (process.env.NODE_ENV !== "production") {
    return "dev_secret_change_me_please";
  }

  throw new Error("JWT_SECRET is missing or too short (min 16 chars).");
}

export function issueAccessToken(user: User) {
  const secret: Secret = getJwtSecret();
  const expiresIn = (process.env.JWT_EXPIRES_IN?.trim() || "7d") as SignOptions["expiresIn"];
  const claims: JwtClaims = { sub: user.id, email: user.email };
  return jwt.sign(claims, secret, { expiresIn });
}

export async function createUser(emailRaw: string, passwordRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Invalid email." };
  }
  if (passwordRaw.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters." };
  }
  const existing = await UserModel.findOne({ email }).lean();
  if (existing) return { ok: false as const, error: "Email already registered." };

  const passwordHash = await bcrypt.hash(passwordRaw, 10);
  const created = await UserModel.create({ email, passwordHash });
  const user: User = {
    id: String(created._id),
    email: created.email,
    passwordHash: created.passwordHash,
    createdAt: created.createdAt.toISOString(),
  };
  return { ok: true as const, user };
}

export async function verifyUser(emailRaw: string, passwordRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  const userDoc = await UserModel.findOne({ email }).lean();
  if (!userDoc) return { ok: false as const, error: "Invalid email or password." };

  const valid = await bcrypt.compare(passwordRaw, userDoc.passwordHash);
  if (!valid) return { ok: false as const, error: "Invalid email or password." };

  const user: User = {
    id: String(userDoc._id),
    email: userDoc.email,
    passwordHash: userDoc.passwordHash,
    createdAt: new Date(userDoc.createdAt).toISOString(),
  };
  return { ok: true as const, user };
}

export function getBearerToken(req: Request) {
  const h = req.header("authorization") || req.header("Authorization");
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/.exec(h);
  return m?.[1] ?? null;
}

export function verifyAccessToken(token: string): JwtClaims {
  const secret: Secret = getJwtSecret();
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== "object" || decoded === null) throw new Error("Invalid token.");
  const sub = (decoded as any).sub;
  const email = (decoded as any).email;
  if (typeof sub !== "string" || typeof email !== "string") throw new Error("Invalid token claims.");
  return { sub, email };
}

export function getUserByEmail(email: string) {
  return UserModel.findOne({ email: email.trim().toLowerCase() }).lean();
}

