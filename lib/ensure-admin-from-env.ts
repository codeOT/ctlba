import bcrypt from "bcryptjs";
import User from "@/models/User";

const globalForAdmin = globalThis as unknown as {
  /** Last email|password we synced; skip if unchanged */
  __lbaAdminEnvFingerprint?: string;
};

/** Trim and remove one pair of surrounding quotes (common in .env mistakes). */
function normalizeEnvPassword(raw: string): string {
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/**
 * If ADMIN_EMAIL and ADMIN_PASSWORD are set:
 * - Creates the admin user if missing
 * - If the user exists with role admin, updates password hash to match .env (so .env stays source of truth)
 * Skips when email+password unchanged since last sync (per process).
 */
export async function ensureAdminFromEnv(): Promise<void> {
  const rawEmail = process.env.ADMIN_EMAIL?.trim();
  const rawPassword = process.env.ADMIN_PASSWORD;
  if (!rawEmail || rawPassword == null || String(rawPassword).length === 0) {
    return;
  }

  const email = rawEmail.toLowerCase();
  const password = normalizeEnvPassword(String(rawPassword));
  if (!password) {
    return;
  }

  const fingerprint = `${email}|${password}`;
  if (globalForAdmin.__lbaAdminEnvFingerprint === fingerprint) {
    return;
  }

  const existing = await User.findOne({ email });
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";

  if (existing) {
    if (existing.role !== "admin") {
      console.warn(
        `[ensure-admin] ${email} already exists as role "${existing.role}". Use a different ADMIN_EMAIL or change that account in the database.`
      );
      globalForAdmin.__lbaAdminEnvFingerprint = fingerprint;
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.updateOne({ _id: existing._id }, { $set: { passwordHash } });
    globalForAdmin.__lbaAdminEnvFingerprint = fingerprint;
    console.info(`[ensure-admin] Synced admin password for ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    email,
    passwordHash,
    name,
    role: "admin",
  });

  globalForAdmin.__lbaAdminEnvFingerprint = fingerprint;
  console.info(`[ensure-admin] Created admin account for ${email}`);
}
