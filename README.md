# 신강희 백엔드 포트폴리오

Java/Spring 기반 백엔드 개발 경험과 프로젝트별 문제 해결 과정을 정리한 Docusaurus 포트폴리오입니다.

- 사이트: [kkanghhee.github.io](https://kkanghhee.github.io)
- 이력서: [`/resume`](https://kkanghhee.github.io/resume)
- GitHub: [github.com/KKangHHee](https://github.com/KKangHHee)
- Email: [skh8609@gmail.com](mailto:skh8609@gmail.com)

## 주요 콘텐츠

- `src/pages/portfolio/`: 프로젝트별 요약과 핵심 성과
- `docs/projects/`: 프로젝트 상세 문서와 트러블슈팅
- `blog/posts/`: 기술 문제 해결 과정을 정리한 글
- `src/pages/resume.tsx`: 웹 이력서

## 프로젝트 구조

```text
.
├── blog/
│   └── posts/                 # 기술 블로그 글
├── docs/
│   └── projects/              # 프로젝트 상세 문서
│       ├── bargain-hunter/
│       ├── msg-manage/
│       ├── readyberry/
│       └── security-ticket/
├── src/
│   ├── components/            # 포트폴리오·이력서 공통 컴포넌트
│   ├── data/                  # 프로젝트 데이터
│   └── pages/                 # 홈·이력서·프로젝트 페이지
├── static/                    # 이미지 등 정적 자산
├── docusaurus.config.ts
└── sidebars.ts
```

## 기술 스택

- Docusaurus 3
- React 19
- TypeScript
- CSS Modules
- GitHub Pages

## 로컬 실행

```bash
npm install
npm start
```

프로덕션 빌드는 `npm run build`로 확인할 수 있습니다.
