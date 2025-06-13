// /app/api/agora-token/route.js (수정된 코드)

import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { NextResponse } from 'next/server';

// App Certificate는 NEXT_PUBLIC_ 없이 서버에서만 사용합니다.
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

export async function POST(request) {
  // App Router에서는 request.json()으로 body를 파싱합니다.
  const { channelName, uid } = await request.json();

  if (!APP_ID || !APP_CERTIFICATE) {
    return NextResponse.json(
      { error: 'Agora APP_ID or APP_CERTIFICATE is not configured on the server.' },
      { status: 500 }
    );
  }

  if (!channelName) {
    // App Router에서는 NextResponse.json()을 return합니다.
    return NextResponse.json(
      { error: 'channelName is required' },
      { status: 400 }
    );
  }

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid || 0,
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );

  return NextResponse.json({ token });
}