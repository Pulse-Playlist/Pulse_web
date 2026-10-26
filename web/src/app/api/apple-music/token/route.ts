import { NextResponse } from 'next/server';
import { importPKCS8, SignJWT } from 'jose';

// In-memory cache for developer token to avoid signing on every request
let cachedDeveloperToken: string | null = null;
let cachedExpiresAt = 0; // timestamp in ms

export async function GET() {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const rawPrivateKey = process.env.APPLE_PRIVATE_KEY;

  if (!teamId || !keyId || !rawPrivateKey) {
    return NextResponse.json(
      {
        configured: false,
        error:
          'Apple Music API credentials (APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY) not set in environment.',
      },
      { status: 200 }
    );
  }

  // Return cached token if still valid for more than 1 hour
  const now = Date.now();
  if (cachedDeveloperToken && now < cachedExpiresAt - 3600_000) {
    return NextResponse.json({
      token: cachedDeveloperToken,
      configured: true,
      expiresAt: new Date(cachedExpiresAt).toISOString(),
    });
  }

  try {
    // Strip surrounding quotes if present and normalize newlines in private key
    let privateKeyPem = rawPrivateKey.trim();
    if (
      (privateKeyPem.startsWith('"') && privateKeyPem.endsWith('"')) ||
      (privateKeyPem.startsWith("'") && privateKeyPem.endsWith("'"))
    ) {
      privateKeyPem = privateKeyPem.slice(1, -1);
    }
    privateKeyPem = privateKeyPem.replace(/\\n/g, '\n').trim();

    // Import ES256 PKCS#8 private key
    const privateKey = await importPKCS8(privateKeyPem, 'ES256');

    // Apple Music Developer token valid for up to 180 days (~15,552,000s)
    const expSeconds = Math.floor(now / 1000) + 180 * 24 * 60 * 60;

    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: keyId })
      .setIssuer(teamId)
      .setIssuedAt(Math.floor(now / 1000))
      .setExpirationTime(expSeconds)
      .sign(privateKey);

    cachedDeveloperToken = token;
    cachedExpiresAt = expSeconds * 1000;

    return NextResponse.json({
      token,
      configured: true,
      expiresAt: new Date(cachedExpiresAt).toISOString(),
    });
  } catch (err) {
    console.error('[Apple Music Token API] Error generating developer token:', err);
    return NextResponse.json(
      {
        configured: false,
        error: `Failed to generate Apple Music developer token: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 500 }
    );
  }
}
