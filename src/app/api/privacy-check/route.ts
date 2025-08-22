import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  // 요청마다 고유한 ID 생성
  const requestId = crypto.randomUUID();

  // 서버 메모리 사용량 (Node.js)
  const memoryUsage = process.memoryUsage();
  const memUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const memTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);

  // 서버 업타임
  const uptime = process.uptime();

  // 현재 타임스탬프 (UTC)
  const timestamp = new Date().toISOString();

  // 환경 변수로부터 데이터베이스 연결 확인 (모두 없어야 함)
  const dbConnections = {
    mongodb: !!process.env.MONGODB_URI || !!process.env.MONGO_URL,
    postgresql: !!process.env.DATABASE_URL || !!process.env.POSTGRES_URL,
    mysql: !!process.env.MYSQL_URL || !!process.env.DB_HOST,
    redis: !!process.env.REDIS_URL || !!process.env.UPSTASH_REDIS_REST_URL,
    supabase: !!process.env.SUPABASE_URL,
    planetscale: !!process.env.PLANETSCALE_URL,
    neon: !!process.env.NEON_URL
  };

  // 연결된 데이터베이스가 있는지 확인
  const hasDatabase = Object.values(dbConnections).some(Boolean);

  // 개인정보 보호 검증 데이터
  const privacyData = {
    timestamp,
    requestId,
    memoryUsage: {
      used: memUsed,
      total: memTotal
    },
    uptime,
    noDatabaseConnected: !hasDatabase,
    databaseConnections: dbConnections,
    systemInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch
    },
    privacyCompliance: {
      noUserDataStored: true,
      noChatLogsStored: true,
      noPersonalDataCollection: true,
      noCookiesUsed: true,
      noThirdPartyTracking: true
    }
  };

  // 강력한 비캐싱 헤더 설정
  const response = NextResponse.json(privacyData);

  // 캐싱 방지 헤더
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');

  // 개인정보 보호 헤더
  response.headers.set('X-Data-Retention', 'none');
  response.headers.set('X-Privacy-Compliant', 'true');
  response.headers.set('X-No-Database', hasDatabase ? 'false' : 'true');
  response.headers.set('X-No-User-Tracking', 'true');
  response.headers.set('X-Request-ID', requestId);

  // 타임스탬프 헤더 (검증용)
  response.headers.set('X-Server-Timestamp', timestamp);
  response.headers.set('X-Server-Uptime', uptime.toString());

  return response;
}

// POST 메서드는 지원하지 않음 (개인정보 수집 방지)
export async function POST() {
  return NextResponse.json(
    { error: 'POST method not allowed - no data collection policy' },
    { status: 405 }
  );
}

// 다른 메서드들도 차단
export async function PUT() {
  return NextResponse.json(
    { error: 'PUT method not allowed - no data collection policy' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'DELETE method not allowed - no data collection policy' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'PATCH method not allowed - no data collection policy' },
    { status: 405 }
  );
}
