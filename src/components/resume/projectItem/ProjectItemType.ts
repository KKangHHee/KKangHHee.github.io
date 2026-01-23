type ProjectDetail = {
  title: string;
  problem: string;
  solution: string;
  result: string;
  domain?: string;
};

export type ProjectProps = {
  organization: string; // 진행한 곳
  title: string; // 프로젝트명
  role: string; // 핵심 역할
  period: string;
  stack: string;
  members: string;
  service: string;
  flows?: ProjectDetail[];
  extras?: string[]; // 인프라 / 협업 / 단순구현 등
};
