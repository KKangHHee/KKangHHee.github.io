type ProjectDetail = {
  title: string;
  problem: string;
  solution: string;
  result: string;
  domain?: string;
};

export interface ProjectHighlight {
  title?: string;
  description: string;
}
export interface ProjectProps {
  organization: string;
  title: string;
  period: string;
  service: string;
  role: string;
  members: string;
  stack: string[];
  highlights: ProjectHighlight[];
}
