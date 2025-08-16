# SokSol (속솔)

익명 AI 멘탈 케어 웹 서비스.

## 개발 실행
```bash
npm install
npm run dev
```

## 환경 변수
루트에 `.env.local` 파일 생성 후 아래 키 설정:
```
GEMINI_API_KEY=YOUR_KEY_HERE
```
(배포 시 Vercel 프로젝트 환경 변수에도 동일하게 추가)

## 기능 (Phase 2)
- `/` 랜딩: 철학 3가지 소개, 시작하기 버튼
- `/chat`: Gemini API 연동 실시간 대화 (대화 저장 없음)
- `/api/chat`: 시스템 프롬프트 기반 Gemini 호출

## 철학 키워드
비움 · 판단 없는 경청 · 마음의 성장

개인정보/대화 내용은 서버에 저장하지 않습니다.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
