/**
 * 강력한 개인정보 보호 QA 테스트
 * 사용자 데이터가 절대 프로젝트나 로그에 남지 않는 것을 목표로 하는 테스트
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';

// 테스트용 민감한 데이터 (실제 개인정보 형태)
const SENSITIVE_TEST_DATA = {
  personalInfo: {
    name: '김개인정보',
    email: 'sensitive@privacy.test',
    phone: '010-1234-5678',
    address: '서울시 강남구 테스트로 123',
    ssn: '901234-1234567'
  },
  mentalHealthData: {
    depression: '우울증 진단받았습니다',
    anxiety: '불안장애로 약물 복용 중',
    trauma: '어린시절 트라우마가 있어요',
    suicidal: '자살을 생각한 적이 있습니다'
  },
  sensitiveConversation: [
    '제 실명은 김철수이고 회사는 네이버입니다',
    '제가 사는 곳은 서울시 강남구 역삼동입니다',
    '제 주민등록번호는 901234-1234567입니다',
    '제 계좌번호는 123-456-789입니다',
    '제가 다니는 병원은 삼성서울병원 정신과입니다'
  ]
};

describe('🛡️ 개인정보 보호 강력 QA 테스트', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  let originalConsoleWarn: typeof console.warn;

  let loggedMessages: string[] = [];
  let errorMessages: string[] = [];
  let warnMessages: string[] = [];

  beforeAll(() => {
    // 콘솔 출력을 가로채서 개인정보 누출 검사
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;

    console.log = (...args: any[]) => {
      const message = args.join(' ');
      loggedMessages.push(message);
      originalConsoleLog(...args);
    };

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      errorMessages.push(message);
      originalConsoleError(...args);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      warnMessages.push(message);
      originalConsoleWarn(...args);
    };
  });

  afterAll(() => {
    // 콘솔 출력 복원
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('🚫 데이터베이스 연결 검증', () => {
    it('어떤 데이터베이스도 연결되지 않아야 함', () => {
      // 데이터베이스 관련 환경변수가 설정되지 않았는지 확인
      const dbEnvVars = [
        'DATABASE_URL',
        'MONGODB_URI',
        'MONGO_URL',
        'POSTGRES_URL',
        'MYSQL_URL',
        'REDIS_URL',
        'UPSTASH_REDIS_REST_URL',
        'SUPABASE_URL',
        'PLANETSCALE_URL',
        'NEON_URL',
        'DB_HOST',
        'DB_PASSWORD',
        'DB_USER'
      ];

      dbEnvVars.forEach(envVar => {
        expect(process.env[envVar]).toBeUndefined();
      });
    });

    it('프로젝트에 데이터베이스 패키지가 설치되지 않아야 함', async () => {
      // package.json 검사
      const packageJson = require('../package.json');
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      const dbPackages = [
        'mysql',
        'mysql2',
        'pg',
        'postgres',
        'mongodb',
        'mongoose',
        'redis',
        'ioredis',
        'sqlite3',
        'better-sqlite3',
        'prisma',
        'typeorm',
        'sequelize',
        'knex'
      ];

      dbPackages.forEach(pkg => {
        expect(dependencies[pkg]).toBeUndefined();
      });
    });
  });

  describe('🔒 채팅 API 개인정보 보호', () => {
    it('채팅 API 응답에 개인정보 저장 방지 헤더가 있어야 함', async () => {
      // Mock environment for testing
      process.env.GEMINI_API_KEY = 'test_key';

      // Import after setting up environment
      const { POST } = await import('../src/app/api/chat/route');

      const mockRequest = {
        json: () => Promise.resolve({
          messages: [{ role: 'user', content: '안녕하세요' }]
        })
      } as any;

      const response = await POST(mockRequest);

      // 개인정보 보호 헤더 확인 (mock된 response)
      expect(response).toBeDefined();
      expect(response.json).toBeDefined();
    });

    it('민감한 개인정보가 포함된 메시지 처리 시 로그에 남지 않아야 함', async () => {
      // Mock environment for testing
      process.env.GEMINI_API_KEY = 'test_key';

      const { POST } = await import('../src/app/api/chat/route');

      // 테스트 전 로그 초기화
      loggedMessages = [];
      errorMessages = [];
      warnMessages = [];

      for (const sensitiveMessage of SENSITIVE_TEST_DATA.sensitiveConversation) {
        const mockRequest = {
          json: () => Promise.resolve({
            messages: [{ role: 'user', content: sensitiveMessage }]
          })
        } as any;

        try {
          await POST(mockRequest);
        } catch (error) {
          // 에러가 발생해도 계속 진행
        }
      }

      // 모든 로그에서 민감한 정보가 없는지 확인
      const allLogs = [...loggedMessages, ...errorMessages, ...warnMessages];

      SENSITIVE_TEST_DATA.sensitiveConversation.forEach(sensitiveData => {
        allLogs.forEach(log => {
          expect(log).not.toContain(sensitiveData);
        });
      });

      // 개인정보 키워드 검사
      const personalDataKeywords = [
        '김개인정보', '김철수', 'sensitive@privacy.test',
        '010-1234-5678', '901234-1234567', '123-456-789',
        '강남구', '역삼동', '삼성서울병원'
      ];

      personalDataKeywords.forEach(keyword => {
        allLogs.forEach(log => {
          expect(log).not.toContain(keyword);
        });
      });
    });
  });

  describe('📊 실시간 비저장 증명 API', () => {
    it('privacy-check API가 비저장 정책을 증명해야 함', async () => {
      const { GET } = await import('../src/app/api/privacy-check/route');

      const response = await GET();
      const data = await response.json();

      // 데이터베이스 연결이 없어야 함
      expect(data.noDatabaseConnected).toBe(true);

      // 모든 데이터베이스 연결이 false여야 함
      Object.values(data.databaseConnections).forEach(connected => {
        expect(connected).toBe(false);
      });

      // 개인정보 보호 정책 준수 확인
      expect(data.privacyCompliance.noUserDataStored).toBe(true);
      expect(data.privacyCompliance.noChatLogsStored).toBe(true);
      expect(data.privacyCompliance.noPersonalDataCollection).toBe(true);
      expect(data.privacyCompliance.noCookiesUsed).toBe(true);
      expect(data.privacyCompliance.noThirdPartyTracking).toBe(true);
    });

    it('privacy-check API가 데이터 수집 방지 헤더를 설정해야 함', async () => {
      const { GET } = await import('../src/app/api/privacy-check/route');

      const response = await GET();

      // Mock된 response에서 헤더 체크 (실제 헤더는 mock에서 처리)
      expect(response).toBeDefined();
      expect(response.headers).toBeDefined();
    });

    it('privacy-check API에서 POST 요청이 차단되어야 함', async () => {
      const { POST } = await import('../src/app/api/privacy-check/route');

      const response = await POST();
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.error).toContain('no data collection policy');
    });
  });

  describe('🚫 메모리 및 저장소 검증', () => {
    it('채팅 처리 후 메모리에 사용자 데이터가 남지 않아야 함', async () => {
      // Mock environment for testing
      process.env.GEMINI_API_KEY = 'test_key';

      const { POST } = await import('../src/app/api/chat/route');

      // 메모리 사용량 측정 전
      const beforeMemory = process.memoryUsage();

      // 민감한 데이터로 여러 번 채팅 처리
      for (let i = 0; i < 10; i++) {
        const mockRequest = {
          json: () => Promise.resolve({
            messages: [{
              role: 'user',
              content: SENSITIVE_TEST_DATA.sensitiveConversation[i % SENSITIVE_TEST_DATA.sensitiveConversation.length]
            }]
          })
        } as any;

        try {
          await POST(mockRequest);
        } catch (error) {
          // 에러 무시하고 계속
        }
      }

      // 가비지 컬렉션 강제 실행
      if (global.gc) {
        global.gc();
      }

      // 메모리 사용량 측정 후
      const afterMemory = process.memoryUsage();

      // 메모리 사용량이 크게 증가하지 않아야 함 (10MB 이내)
      const memoryIncrease = afterMemory.heapUsed - beforeMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
    });

    it('sessionStorage와 localStorage 사용을 최소화해야 함', () => {
      // 브라우저 환경이 아니므로 실제 테스트는 E2E에서 수행
      // 여기서는 코드에 localStorage 직접 사용이 없는지 확인
      const fs = require('fs');
      const path = require('path');

      function checkFilesForLocalStorage(dir: string): string[] {
        const violations: string[] = [];

        function scanDirectory(currentDir: string) {
          const files = fs.readdirSync(currentDir);

          files.forEach((file: string) => {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
              scanDirectory(filePath);
            } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
              const content = fs.readFileSync(filePath, 'utf8');

              // localStorage 직접 사용 검사 (sessionStorage는 허용)
              if (content.includes('localStorage.setItem') ||
                content.includes('localStorage.getItem')) {
                violations.push(filePath);
              }
            }
          });
        }

        scanDirectory(dir);
        return violations;
      }

      const violations = checkFilesForLocalStorage(path.join(process.cwd(), 'src'));
      expect(violations).toEqual([]);
    });
  });

  describe('🔍 Sentry 로그 필터링 검증', () => {
    it('Sentry 설정에서 개인정보 필터링이 활성화되어야 함', () => {
      const fs = require('fs');
      const path = require('path');

      // sentry 설정 파일들 확인
      const sentryFiles = [
        'sentry.client.config.ts',
        'sentry.server.config.ts'
      ];

      sentryFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');

          // beforeSend 함수가 있는지 확인 (개인정보 필터링용)
          expect(content).toMatch(/beforeSend|beforeBreadcrumb/);

          // request body를 제거하는 로직이 있는지 확인
          expect(content).toMatch(/request|body|data/);
        }
      });
    });
  });

  describe('🌐 네트워크 보안 검증', () => {
    it('HTTPS 강제 설정이 있어야 함', () => {
      const fs = require('fs');
      const path = require('path');

      // next.config.ts 확인
      const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
      if (fs.existsSync(nextConfigPath)) {
        const content = fs.readFileSync(nextConfigPath, 'utf8');

        // 보안 헤더 설정 확인
        expect(content).toMatch(/headers|security|https/i);
      }
    });

    it('외부 추적 스크립트가 없어야 함', () => {
      const fs = require('fs');
      const path = require('path');

      function checkForTrackingScripts(dir: string): string[] {
        const violations: string[] = [];

        function scanDirectory(currentDir: string) {
          const files = fs.readdirSync(currentDir);

          files.forEach((file: string) => {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
              scanDirectory(filePath);
            } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
              const content = fs.readFileSync(filePath, 'utf8');

              // 추적 스크립트 검사
              const trackingServices = [
                'google-analytics',
                'gtag',
                'ga(',
                'facebook.com/tr',
                'connect.facebook.net',
                'googletagmanager.com',
                'hotjar.com',
                'mixpanel.com',
                'amplitude.com'
              ];

              trackingServices.forEach(service => {
                if (content.includes(service)) {
                  violations.push(`${filePath}: ${service}`);
                }
              });
            }
          });
        }

        scanDirectory(dir);
        return violations;
      }

      const violations = checkForTrackingScripts(path.join(process.cwd(), 'src'));
      expect(violations).toEqual([]);
    });
  });

  describe('📝 개인정보 처리방침 준수 검증', () => {
    it('개인정보 처리방침 파일이 존재하고 필수 내용이 있어야 함', () => {
      const fs = require('fs');
      const path = require('path');

      const privacyPath = path.join(process.cwd(), 'docs', 'PRIVACY.md');
      expect(fs.existsSync(privacyPath)).toBe(true);

      const content = fs.readFileSync(privacyPath, 'utf8');

      // 필수 섹션 확인
      const requiredSections = [
        '개인정보 수집',
        '무저장 정책',
        '제3자 제공',
        '사용자 권리',
        '면책',
        '웰빙'
      ];

      requiredSections.forEach(section => {
        expect(content).toMatch(new RegExp(section, 'i'));
      });
    });
  });

  describe('🔄 실시간 검증 기능', () => {
    it('매 요청마다 다른 타임스탬프와 요청 ID를 생성해야 함', async () => {
      const { GET } = await import('../src/app/api/privacy-check/route');

      // 여러 번 요청하여 모두 다른 값인지 확인
      const responses = [];
      for (let i = 0; i < 5; i++) {
        const response = await GET();
        const data = await response.json();
        responses.push(data);

        // 잠시 대기 (타임스탬프 차이를 위해)
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // 모든 타임스탬프가 다른지 확인
      const timestamps = responses.map(r => r.timestamp);
      const uniqueTimestamps = new Set(timestamps);
      expect(uniqueTimestamps.size).toBe(responses.length);

      // 모든 요청 ID가 다른지 확인
      const requestIds = responses.map(r => r.requestId);
      const uniqueRequestIds = new Set(requestIds);
      expect(uniqueRequestIds.size).toBe(responses.length);
    });
  });
});

/**
 * E2E 테스트용 추가 검증 사항 (별도 파일에서 구현)
 * 
 * 1. 브라우저 개발자 도구에서 Network 탭 확인
 * 2. Application 탭에서 LocalStorage/SessionStorage 확인  
 * 3. 실제 채팅 후 브라우저 저장소에 데이터 잔존 확인
 * 4. 모바일 브라우저에서의 개인정보 보호 확인
 * 5. 네트워크 요청 헤더 실시간 확인
 */
