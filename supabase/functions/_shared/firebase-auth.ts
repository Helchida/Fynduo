type FirebaseClaims = { sub: string; aud: string; iss: string; exp: number; iat: number };

const FIREBASE_JWKS =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const base64UrlToBytes = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const raw = atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

export async function requireFirebaseUser(request: Request): Promise<string> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
  if (!token || !projectId) throw new Error("unauthorized");

  const [encodedHeader, encodedClaims, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedClaims || !encodedSignature) throw new Error("unauthorized");
  const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedHeader)));
  const claims = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedClaims))) as FirebaseClaims;
  if (header.alg !== "RS256" || !header.kid || claims.aud !== projectId ||
      claims.iss !== `https://securetoken.google.com/${projectId}` ||
      !claims.sub || claims.exp * 1000 <= Date.now()) throw new Error("unauthorized");

  const keys = await (await fetch(FIREBASE_JWKS)).json();
  const jwk = keys.keys?.find((key: JsonWebKey) => key.kid === header.kid);
  if (!jwk) throw new Error("unauthorized");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, base64UrlToBytes(encodedSignature), new TextEncoder().encode(`${encodedHeader}.${encodedClaims}`));
  if (!valid) throw new Error("unauthorized");
  return claims.sub;
}

