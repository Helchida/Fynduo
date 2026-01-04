import { LoginAttempt } from "@/types";

const STORAGE_KEY = "login_attempts";
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000;
const RESET_WINDOW = 30 * 60 * 1000;

const isWeb =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

class LoginRateLimiter {
  private getAttempts(email: string): LoginAttempt | null {
    try {
      if (!isWeb) return null;

      const stored = localStorage.getItem(`${STORAGE_KEY}_${email}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Erreur lecture tentatives:", error);
      return null;
    }
  }

  private saveAttempts(email: string, attempts: LoginAttempt): void {
    try {
      if (!isWeb) return;

      localStorage.setItem(`${STORAGE_KEY}_${email}`, JSON.stringify(attempts));
    } catch (error) {
      console.error("Erreur sauvegarde tentatives:", error);
    }
  }

  private clearAttempts(email: string): void {
    try {
      if (!isWeb) return;

      localStorage.removeItem(`${STORAGE_KEY}_${email}`);
    } catch (error) {
      console.error("Erreur suppression tentatives:", error);
    }
  }

  canAttemptLogin(email: string): {
    allowed: boolean;
    remainingAttempts?: number;
    blockedUntil?: Date;
    message?: string;
  } {
    if (!isWeb) {
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    const now = Date.now();
    const attempts = this.getAttempts(email);

    if (!attempts) {
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    if (attempts.blockedUntil && now < attempts.blockedUntil) {
      const remainingTime = Math.ceil(
        (attempts.blockedUntil - now) / 1000 / 60
      );
      return {
        allowed: false,
        blockedUntil: new Date(attempts.blockedUntil),
        message: `Trop de tentatives échouées. Réessayez dans ${remainingTime} minute${
          remainingTime > 1 ? "s" : ""
        }.`,
      };
    }

    if (attempts.blockedUntil && now >= attempts.blockedUntil) {
      this.clearAttempts(email);
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    if (now - attempts.firstAttempt > RESET_WINDOW) {
      this.clearAttempts(email);
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    const remainingAttempts = MAX_ATTEMPTS - attempts.count;

    if (remainingAttempts <= 0) {
      const blockedUntil = now + BLOCK_DURATION;
      this.saveAttempts(email, { ...attempts, blockedUntil });

      return {
        allowed: false,
        blockedUntil: new Date(blockedUntil),
        message: `Trop de tentatives échouées. Réessayez dans ${Math.ceil(
          BLOCK_DURATION / 1000 / 60
        )} minutes.`,
      };
    }

    return { allowed: true, remainingAttempts };
  }

  recordFailedAttempt(email: string): void {
    if (!isWeb) return;

    const now = Date.now();
    const attempts = this.getAttempts(email);

    if (!attempts || now - attempts.firstAttempt > RESET_WINDOW) {
      this.saveAttempts(email, {
        count: 1,
        firstAttempt: now,
      });
    } else {
      this.saveAttempts(email, {
        ...attempts,
        count: attempts.count + 1,
      });
    }
  }

  resetAttempts(email: string): void {
    if (!isWeb) return;
    this.clearAttempts(email);
  }

  getRemainingAttempts(email: string): number {
    if (!isWeb) return MAX_ATTEMPTS;

    const attempts = this.getAttempts(email);
    if (!attempts) return MAX_ATTEMPTS;

    const now = Date.now();
    if (now - attempts.firstAttempt > RESET_WINDOW) {
      return MAX_ATTEMPTS;
    }

    return Math.max(0, MAX_ATTEMPTS - attempts.count);
  }
}

export const loginRateLimiter = new LoginRateLimiter();
export { MAX_ATTEMPTS };
