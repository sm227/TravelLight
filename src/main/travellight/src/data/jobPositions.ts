export interface JobPosition {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  iconName: string; // 아이콘 컴포넌트 대신 이름 저장
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
}

export const jobPositions: JobPosition[] = [
  {
    id: 1,
    title: "경영관리 팀원",
    department: "Business",
    location: "재택근무",
    type: "정규직",
    iconName: "TrendingUp",
    description:
      "스타트업의 전반적인 경영 업무를 담당할 경영관리 팀원을 찾습니다. 사업 전략 수립, 운영 관리, 파트너십 등 다양한 경영 업무를 경험할 수 있습니다.",
    requirements: [
      "경영학, 경제학 전공 또는 관련 업무 경험",
      "사업 계획서 작성 및 전략 수립 능력",
      "스타트업 환경에 대한 이해와 적응력",
      "데이터 분석 및 보고서 작성 능력",
      "원활한 커뮤니케이션 및 협상 능력",
    ],
    responsibilities: [
      "사업 전략 및 계획 수립 참여",
      "운영 프로세스 개선 및 관리",
      "파트너십 발굴 및 관리",
      "재무 관리 및 투자 유치 지원",
      "법무 업무 및 컴플라이언스 관리",
    ],
    benefits: [
      "사업 성과에 따른 보상 시스템",
      "스타트업 경영 전반의 경험",
      "창업과 사업 운영의 실무 학습",
      "수평적 조직문화",
      "성공 시 보상 논의 가능",
    ],
  },
  {
    id: 2,
    title: "디자인 팀원",
    department: "Design",
    location: "재택근무",
    type: "정규직",
    iconName: "DesignServices",
    description:
      "사용자 경험을 중심으로 한 프로덕트 디자인을 담당할 디자인 팀원을 찾습니다. 함께 세상을 바꿀 서비스를 만들어보세요.",
    requirements: [
      "UI/UX 디자인 기본기",
      "사용자 중심 사고",
      "스타트업 환경에서의 업무 의욕",
      "빠른 실행력과 피드백 수용",
      "제약 조건에서 창의적 해결책 도출",
    ],
    responsibilities: [
      "프로덕트 디자인 방향 기여",
      "사용자 경험(UX) 설계",
      "디자인 시스템 구축 참여",
      "프로토타입 제작 및 테스트",
      "개발팀과 긴밀한 협업",
    ],
    benefits: [
      "사업 성과에 따른 보상 시스템",
      "디자인 업무에 대한 자율성",
      "프로덕트 전체 디자인 참여",
      "다양한 분야 경험 가능",
      "성공 시 보상 논의 가능",
    ],
  },
];
