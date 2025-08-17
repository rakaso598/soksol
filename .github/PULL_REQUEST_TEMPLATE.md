# PR 템플릿

## 요약 (한 줄)
- 어떤 변경인지 간단히 적습니다. (예: feat(api): Gemini 호출 안정화)

## 변경 유형
- [ ] feat (기능)
- [ ] fix (버그수정)
- [ ] chore (빌드/리팩토링/문서)
- [ ] docs (문서)
- [ ] ci (CI/workflow)
- [ ] deps (의존성)

## 변경 상세
- 변경한 파일/주요 로직 요약
- 마이그레이션, 데이터 변환 필요 여부

## 테스트 및 검증 방법
- 로컬에서 검증하는 방법(명령어, 환경변수 필요 여부)
  - 예: npm install && npm run build && npm test
- 수동 체크(스모크 테스트) 항목
  - 예: /api/chat POST 요청(예시 payload)

## 의존성 변경 시 체크리스트
- [ ] package-lock.json / yarn.lock 업데이트 포함됨
- [ ] 로컬에서 npm install 후 빌드/테스트 통과
- [ ] 변경이 메이저 버전(호환성 영향)인지 여부 명시
- [ ] 필요 시 롤백 방법/설명 추가

## 시크릿/환경변수 영향
- 이 PR이 필요한 시크릿을 추가/변경하는지 여부 (예: GEMINI_API_KEY, GHCR_TOKEN)
- 프로덕션 환경에 secret 추가가 필요한 경우 환경(Production/Staging) 명시

## 리뷰어 / 라벨 추천
- 리뷰어: @rakaso598, @your-frontend-team
- 라벨: dependencies / breaking / ci / bug / enhancement

## 추가 메모 (옵션)
- Dependabot PR인 경우: (1) lockfile 일치 여부 확인, (2) 패치/마이너면 CI 통과 시 병합 가능, (3) 메이저는 로컬/스테이징 테스트 권장.
- 긴급 보안 패치면 빠른 머지 후 모니터링 계획 포함

---

자동 채우기: PR 제목은 `type(scope): 설명` 스타일을 권장합니다. 예: `chore(deps): bump react 19.1.0 -> 19.1.1`
