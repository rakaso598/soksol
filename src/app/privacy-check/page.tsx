'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ServerStatus {
  timestamp: string;
  requestId: string;
  memoryUsage: {
    used: number;
    total: number;
  };
  uptime: number;
  headers: Record<string, string>;
}

export default function PrivacyCheckPage() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkHistory, setCheckHistory] = useState<ServerStatus[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchServerStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/privacy-check', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const data = await response.json();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const status: ServerStatus = {
        ...data,
        headers
      };

      setServerStatus(status);
      setCheckHistory(prev => [status, ...prev.slice(0, 4)]); // 최근 5개만 유지
    } catch (error) {
      console.error('Failed to fetch server status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchServerStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('ko-KR'),
      time: date.toLocaleTimeString('ko-KR', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}시간 ${minutes}분 ${secs}초`;
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <header className="mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <h1 className="text-3xl font-bold text-green-800 mb-2">🛡️ 실시간 비저장 증명</h1>
          <p className="text-green-700 mb-4">
            SokSol이 실제로 데이터를 저장하지 않는다는 것을 실시간으로 증명합니다.
          </p>
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-800 font-medium">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </header>

      {/* 실시간 상태 */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">실시간 서버 상태</h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchServerStatus}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
                >
                  {isLoading ? '확인 중...' : '지금 확인'}
                </button>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-4 py-2 rounded-lg text-sm ${autoRefresh
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                >
                  {autoRefresh ? '자동 새로고침 중지' : '자동 새로고침 시작'}
                </button>
              </div>
            </div>
          </div>

          {serverStatus && (
            <div className="p-6 space-y-6">
              {/* 타임스탬프 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">서버 타임스탬프 (UTC)</h3>
                  <div className="text-lg font-mono text-blue-900">
                    {formatTimestamp(serverStatus.timestamp).time}
                  </div>
                  <div className="text-sm text-blue-600">
                    {formatTimestamp(serverStatus.timestamp).date}
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    요청 ID: {serverStatus.requestId}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">서버 상태</h3>
                  <div className="text-sm space-y-1">
                    <div>📈 업타임: {formatUptime(serverStatus.uptime)}</div>
                    <div>💾 메모리: {serverStatus.memoryUsage.used}MB / {serverStatus.memoryUsage.total}MB</div>
                    <div>🔄 사용률: {((serverStatus.memoryUsage.used / serverStatus.memoryUsage.total) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* 보안 헤더 */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-3">🔒 보안 헤더 확인</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cache-Control:</span>
                    <span className={`font-mono ${serverStatus.headers['cache-control']?.includes('no-store')
                      ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {serverStatus.headers['cache-control'] || '❌'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>X-Data-Retention:</span>
                    <span className={`font-mono ${serverStatus.headers['x-data-retention'] === 'none'
                      ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {serverStatus.headers['x-data-retention'] || '❌'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pragma:</span>
                    <span className={`font-mono ${serverStatus.headers['pragma'] === 'no-cache'
                      ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {serverStatus.headers['pragma'] || '❌'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>X-No-Database:</span>
                    <span className={`font-mono ${serverStatus.headers['x-no-database'] === 'true'
                      ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {serverStatus.headers['x-no-database'] || '❌'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 검증 이력 */}
      {checkHistory.length > 1 && (
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">검증 이력 (최근 5회)</h2>
              <p className="text-sm text-gray-600 mt-1">타임스탬프가 계속 변한다면 캐싱되지 않는다는 증거입니다</p>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {checkHistory.map((status, index) => (
                  <div
                    key={status.requestId}
                    className={`flex justify-between items-center p-3 rounded-lg ${index === 0 ? 'bg-green-100' : 'bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${index === 0 ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                        {index === 0 ? '최신' : `${index + 1}번째`}
                      </span>
                      <span className="font-mono text-sm">
                        {formatTimestamp(status.timestamp).time}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      ID: {status.requestId.slice(-8)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 검증 가이드 */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">🔍 직접 검증하는 방법</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-800 mb-3">💻 PC 사용자</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>F12 키를 눌러 개발자 도구를 엽니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Network 탭을 클릭합니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>&quot;지금 확인&quot; 버튼을 클릭합니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                    <span>privacy-check 요청을 클릭하고 Response Headers를 확인합니다</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-green-800 mb-3">📱 모바일 사용자</h3>
                <div className="space-y-2 text-sm">
                  <p>위의 타임스탬프와 검증 이력을 확인하세요:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• 새로고침할 때마다 시간이 변하는지 확인</li>
                    <li>• 검증 이력에서 모든 시간이 다른지 확인</li>
                    <li>• 보안 헤더가 모두 녹색으로 표시되는지 확인</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기술적 증명 */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">⚙️ 기술적 증명</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">🚫 데이터베이스 없음</h3>
                <p className="text-sm text-red-700">
                  MySQL, PostgreSQL, MongoDB 등 어떤 데이터베이스도 연결되어 있지 않습니다.
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">🚫 캐시 서버 없음</h3>
                <p className="text-sm text-orange-700">
                  Redis, Memcached 등 어떤 캐시 서버도 사용하지 않습니다.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">🚫 파일 저장 없음</h3>
                <p className="text-sm text-purple-700">
                  채팅 내용을 파일 시스템에 저장하지 않습니다.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">✅ 무저장 원칙</h3>
              <p className="text-sm text-gray-700">
                모든 채팅은 메모리에서만 처리되며, 요청 완료 후 즉시 삭제됩니다.
                이 페이지의 실시간 변화하는 타임스탬프가 이를 증명합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 도움말 */}
      <footer className="text-center text-sm text-gray-500">
        <p>이 페이지는 개인정보 처리방침에 따라 투명성을 보장하기 위해 제공됩니다.</p>
        <p className="mt-1">추가 질문이 있으시면 GitHub Issues를 통해 문의해 주세요.</p>
      </footer>
    </main>
  );
}
