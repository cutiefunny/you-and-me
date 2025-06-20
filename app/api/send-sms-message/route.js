// /app/api/send-sms-message/route.js
import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

// NCP SENS API 시그니처 생성 함수
// 이 함수는 NCP SENS API 요청에 필요한 인증 시그니처를 생성합니다.
// 요청 메소드, URL, 타임스탬프, Access Key를 사용하여 HMAC-SHA256 해시를 계산합니다.
function makeSignature(url, timestamp, accessKey, secretKey) {
  const space = ' ';
  const newLine = '\n';
  const method = 'POST'; // SMS 발송은 POST 메소드를 사용합니다.

  // HMAC SHA256 암호화 객체 생성
  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

  // 시그니처 생성에 필요한 문자열들을 업데이트합니다.
  // 이 순서는 NCP SENS API 문서에 명시된 규칙을 따릅니다.
  hmac.update(method); // HTTP 메소드 (POST)
  hmac.update(space);  // 공백
  hmac.update(url);    // 요청 URL (path)
  hmac.update(newLine); // 줄 바꿈
  hmac.update(timestamp); // 현재 타임스탬프
  hmac.update(newLine); // 줄 바꿈
  hmac.update(accessKey); // NCP API Gateway Access Key

  // 최종 해시 값 계산 및 Base64 인코딩
  const hash = hmac.finalize();
  return hash.toString(CryptoJS.enc.Base64);
}

// POST 요청 핸들러
// 클라이언트로부터 SMS 발송 요청을 받아 NCP SENS API를 통해 메시지를 발송합니다.
export async function POST(req) {
  // 1. 필요한 환경 변수를 확인합니다.
  // 이 변수들은 .env.local 파일 등에 설정되어 있어야 합니다.
  const accessKey = process.env.NEXT_PUBLIC_SMS_ACCESS_KEY;
  const secretKey = process.env.NEXT_PUBLIC_SMS_SECRET_KEY;
  const serviceId = process.env.NEXT_PUBLIC_SMS_SERVICE_ID;
  // [수정] NCP SENS에 등록된 발신 번호 (실제로 SMS를 보낼 번호)
  const registeredSendingNumber = "01083151379";

  // 환경 변수가 하나라도 누락되면 500 에러를 반환합니다.
  if (!accessKey || !secretKey || !serviceId || !registeredSendingNumber) {
    console.error('Environment variables for NCP SENS API are not configured correctly.');
    return NextResponse.json(
      { success: false, message: '서버 환경 변수 설정에 오류가 있습니다. (ACCESS_KEY, SECRET_KEY, SERVICE_ID, REGISTERED_SENDING_NUMBER 확인 필요)' },
      { status: 500 }
    );
  }

  try {
    // `userPhoneNumber`는 상담을 신청한 사용자의 전화번호입니다. (클라이언트에서 'from'으로 넘어옴)
    // `receiverConsultantNumber`는 상담사(서비스의 고정된 수신 번호)의 전화번호입니다. (클라이언트에서 'to'로 넘어옴)
    // `baseMessageContent`는 클라이언트에서 보낸 기본 메시지 내용입니다.
    const { from: userPhoneNumber, to: receiverConsultantNumber, message: baseMessageContent } = await req.json();

    // 필수 파라미터 유효성 검사
    if (!userPhoneNumber || !receiverConsultantNumber || !baseMessageContent) {
      return NextResponse.json(
        { success: false, message: '발신자 번호(from), 수신자 번호(to), 메시지 내용(message)이 모두 필요합니다.' },
        { status: 400 }
      );
    }

    // NCP SENS API에 전송할 최종 메시지 내용.
    // 사용자의 번호를 메시지 내용에 포함시킵니다.
    const finalMessageContent = `${baseMessageContent}`;

    // NCP SENS API에 전송될 'from' 번호는 NCP에 등록된 번호여야 합니다.
    const cleanRegisteredSendingNumber = registeredSendingNumber.replace(/-/g, '');
    const cleanReceiverConsultantNumber = receiverConsultantNumber.replace(/-/g, '');

    // 3. NCP SENS API 요청을 위한 파라미터들을 준비합니다.
    const url = `/sms/v2/services/${serviceId}/messages`;
    const timestamp = Date.now().toString(); // 현재 시간을 밀리초 단위의 문자열로 변환
    const signature = makeSignature(url, timestamp, accessKey, secretKey); // NCP 시그니처 생성

    // 4. NCP SENS API 호출을 수행합니다.
    const response = await fetch(`https://sens.apigw.ntruss.com${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8', // JSON 형식과 UTF-8 인코딩 지정
        'x-ncp-apigw-timestamp': timestamp,               // 생성된 타임스탬프
        'x-ncp-iam-access-key': accessKey,                // NCP Access Key
        'x-ncp-apigw-signature-v2': signature,            // 생성된 시그니처
      },
      body: JSON.stringify({
        type: 'SMS',       // 메시지 타입 (SMS, LMS, MMS 등)
        contentType: 'COMM', // 메시지 내용 타입 (COMM: 일반 메시지)
        countryCode: '82',   // 국가 코드 (대한민국)
        from: cleanRegisteredSendingNumber, // [수정] NCP에 등록된 발신 번호 사용
        content: finalMessageContent,       // [수정] 사용자의 번호가 포함된 메시지 내용
        messages: [{ to: cleanReceiverConsultantNumber }], // 상담사 번호로 발송
      }),
    });

    // 5. NCP SENS API 응답을 처리합니다.
    const result = await response.json();

    if (response.ok) {
      // 요청이 성공적으로 처리된 경우
      console.log('SMS sent successfully:', result);
      return NextResponse.json({ success: true, message: 'SMS 발송 성공', result }, { status: 200 });
    } else {
      // NCP SENS API에서 에러 응답을 보낸 경우
      console.error('NCP SENS API Error:', result);
      return NextResponse.json(
        { success: false, message: result.statusName || 'SMS 발송에 실패했습니다.', details: result },
        { status: response.status }
      );
    }
  } catch (error) {
    // 요청 처리 중 서버 내부에서 예상치 못한 오류가 발생한 경우
    console.error('Server side SMS sending error:', error);
    return NextResponse.json(
      { success: false, message: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}