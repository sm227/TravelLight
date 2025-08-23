import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Stack,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { styled } from "@mui/material/styles";
import {
  Work,
  LocationOn,
  Schedule,
  CheckCircle,
  Code,
  DesignServices,
  TrendingUp,
  Engineering,
  Psychology,
  Send,
  Speed,
  Security,
  People,
  PersonAdd,
  Email
} from "@mui/icons-material";

const JobCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #f0f0f0",
  boxShadow: "none",
  cursor: "pointer",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
}));

const BenefitCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  border: "1px solid #f0f0f0",
  boxShadow: "none",
}));

const StatCard = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  border: "1px solid #e0e0e0",
  bgcolor: "#fafafa",
}));

const TalentPoolCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  border: "2px dashed #2E7DF1",
  backgroundColor: "#f8f9ff",
  boxShadow: "none",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#f0f4ff",
    borderColor: "#1e6bd8",
    boxShadow: "0 4px 12px rgba(46, 125, 241, 0.1)",
  },
}));

interface JobPosition {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  icon: React.ReactElement;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
}

const Careers: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
  });
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showTalentPoolForm, setShowTalentPoolForm] = useState(false);
  const [talentPoolForm, setTalentPoolForm] = useState({
    name: "",
    email: "",
    phone: "",
    field: "",
    experience: "",
    introduction: "",
  });
  const [talentPoolSubmitted, setTalentPoolSubmitted] = useState(false);

  const jobPositions: JobPosition[] = [
    {
      id: 1,
      title: "마케팅 팀원",
      department: "Marketing",
      location: "재택근무",
      type: "정규직",
      icon: <TrendingUp sx={{ fontSize: 40, color: "#2E7DF1" }} />,
      description:
        "우리와 함께 성장할 마케팅 팀원을 찾습니다. 스타트업의 초기 단계부터 브랜드를 구축하고 시장을 개척해나갈 열정적인 분을 기다립니다.",
      requirements: [
        "마케팅 관련 경험 또는 강한 학습 의지",
        "디지털 마케팅 기초 지식",
        "스타트업 환경에 대한 이해와 적응력",
        "도전적이고 능동적인 업무 태도",
        "팀워크와 소통을 중시하는 성향",
      ],
      responsibilities: [
        "브랜드 아이덴티티 구축 참여",
        "고객 발굴 및 관계 구축",
        "마케팅 전략 실행",
        "시장 조사 및 데이터 분석",
        "마케팅 캠페인 기획 및 운영",
      ],
      benefits: [
        "사업 성과에 따른 보상 시스템",
        "스타트업 환경에서의 빠른 성장",
        "다양한 업무 경험 기회",
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
      icon: <DesignServices sx={{ fontSize: 40, color: "#2E7DF1" }} />,
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

  const companyBenefits = [
    {
      title: "함께 만들어가는 보람",
      description: "초기엔 힘들지만 함께 성취해나가는 특별한 경험",
    },
    {
      title: "0→1의 경험",
      description: "아무것도 없던 것을 세상에 내놓는 특별한 경험",
    },
    {
      title: "빠른 성장",
      description: "스타트업 환경에서 빠르게 성장하는 기회",
    },
    {
      title: "자유로운 환경",
      description: "수평적 관계에서 아이디어를 자유롭게 실현",
    },
    {
      title: "성공 시 보상",
      description: "사업이 성공하면 그에 맞는 보상을 함께 나누어 가짐",
    },
    {
      title: "성장 가능성",
      description: "함께 꿈꾸고 도전하는 무한한 성장 가능성",
    },
  ];

  const handleJobClick = (job: JobPosition) => {
    setSelectedJob(job);
  };

  const handleCloseDialog = () => {
    setSelectedJob(null);
    setShowApplicationForm(false);
    setSubmitted(false);
  };

  const handleApplyClick = () => {
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = () => {
    setSubmitted(true);
    setTimeout(() => {
      handleCloseDialog();
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setApplicationForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTalentPoolClick = () => {
    setShowTalentPoolForm(true);
  };

  const handleCloseTalentPoolForm = () => {
    setShowTalentPoolForm(false);
    setTalentPoolSubmitted(false);
  };

  const handleTalentPoolInputChange = (field: string, value: string) => {
    setTalentPoolForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitTalentPool = () => {
    setTalentPoolSubmitted(true);
    setTimeout(() => {
      handleCloseTalentPoolForm();
    }, 3000);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
        background: "#FFFFFF",
      }}
    >
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <Box sx={{ pt: 16, pb: 12, textAlign: "center" }}>
          <Container>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                color: "#1a1a1a",
                mb: 3,
                fontSize: { xs: "2.5rem", md: "3.75rem" },
              }}
            >
              함께 성장할 팀원을 찾습니다
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                mb: 8,
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              여행 산업의 혁신을 함께 만들어갈 열정적인 팀원을 기다립니다
            </Typography>

            {/* Company Stats */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={4}
              justifyContent="center"
            >
              <StatCard>
                <Speed sx={{ fontSize: 32, color: "#2E7DF1", mb: 1 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#1a1a1a" }}
                >
                  Early Stage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  창업 초기 단계
                </Typography>
              </StatCard>
              <StatCard>
                <Security sx={{ fontSize: 32, color: "#2E7DF1", mb: 1 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#1a1a1a" }}
                >
                  Big Dream
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  큰 비전과 목표
                </Typography>
              </StatCard>
              <StatCard>
                <People sx={{ fontSize: 32, color: "#2E7DF1", mb: 1 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#1a1a1a" }}
                >
                  Together
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  함께하는 동반자
                </Typography>
              </StatCard>
            </Stack>
          </Container>
        </Box>

        <Container sx={{ py: 8 }}>
          {/* Job Positions */}
          <Box sx={{ mb: 12 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              현재 모집중인 포지션
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                textAlign: "center",
                mb: 8,
                lineHeight: 1.6,
              }}
            >
              당신의 전문성을 발휘할 수 있는 포지션을 찾아보세요
            </Typography>
            <Grid container spacing={4}>
              {jobPositions.map((job) => (
                <Grid item xs={12} md={6} lg={4} key={job.id}>
                  <JobCard onClick={() => handleJobClick(job)}>
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 3 }}
                        >
                          {job.icon}
                          <Box sx={{ ml: 2 }}>
                            <Typography
                              variant="h6"
                              component="h3"
                              sx={{
                                fontWeight: 600,
                                color: "#1a1a1a",
                                mb: 0.5,
                              }}
                            >
                              {job.title}
                            </Typography>
                            <Chip
                              label={job.department}
                              size="small"
                              sx={{
                                bgcolor: "#f8f9ff",
                                color: "#2E7DF1",
                                border: "1px solid #e8ecff",
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 3,
                            lineHeight: 1.5,
                          }}
                        >
                          {job.description}
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <LocationOn
                              fontSize="small"
                              sx={{ color: "#666", mr: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {job.location}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 3,
                            }}
                          >
                            <Schedule
                              fontSize="small"
                              sx={{ color: "#666", mr: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {job.type}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          bgcolor: "#2E7DF1",
                          color: "white",
                          fontWeight: 500,
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: "#1e6bd8",
                          },
                        }}
                      >
                        지원하기
                      </Button>
                    </CardContent>
                  </JobCard>
                </Grid>
              ))}
              {/* Talent Pool Card */}
              <Grid item xs={12} md={6} lg={4}>
                <TalentPoolCard onClick={handleTalentPoolClick}>
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 4, 
                    display: 'flex', 
                    flexDirection: 'column',
                    textAlign: 'center'
                  }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <PersonAdd sx={{ fontSize: 60, color: "#2E7DF1", mb: 2 }} />
                      <Typography variant="h6" component="h3" gutterBottom sx={{ 
                        fontWeight: 600,
                        color: "#1a1a1a",
                        mb: 2
                      }}>
                        인재풀 등록
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 3,
                        lineHeight: 1.5
                      }}>
                        원하시는 포지션이 없나요? 인재풀에 등록하시면 향후 적합한 기회가 생겼을 때 연락드리겠습니다.
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      fullWidth
                      startIcon={<Email />}
                      sx={{
                        bgcolor: '#2E7DF1',
                        color: 'white',
                        fontWeight: 500,
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: '#1e6bd8'
                        }
                      }}
                    >
                      인재풀 신청하기
                    </Button>
                  </CardContent>
                </TalentPoolCard>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* Company Benefits */}
          <Box sx={{ mb: 12 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              TravelLight에서 누릴 수 있는 혜택
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                textAlign: "center",
                mb: 8,
                lineHeight: 1.6,
              }}
            >
              최고의 인재에게는 최고의 환경을 제공합니다
            </Typography>
            <Grid container spacing={4}>
              {companyBenefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <BenefitCard>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.5 }}
                    >
                      {benefit.description}
                    </Typography>
                  </BenefitCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Contact Section */}
          <Box sx={{ textAlign: "center", py: 12 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 3,
              }}
            >
              함께할 준비가 되셨나요?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mb: 6,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              지원서를 보내주시거나 궁금한 점이 있으시면 언제든 연락주세요
            </Typography>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 6 }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1a1a",
                    mb: 1,
                  }}
                >
                  이메일
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  hamsm3184@gmail.com
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1a1a",
                    mb: 1,
                  }}
                >
                  전화
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  010-3373-9651
                </Typography>
              </Box>
            </Stack>

            {/* <Button 
            variant="contained" 
            size="large"
            sx={{ 
              bgcolor: '#2E7DF1',
              color: 'white',
              fontWeight: 600,
              px: 6,
              py: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: '#1e6bd8'
              }
            }}
          >
            지원서 보내기
          </Button> */}
          </Box>
        </Container>
      </Box>
      <Footer />

      {/* Job Detail Dialog */}
      <Dialog
        open={!!selectedJob}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: "90vh",
            border: "1px solid #f0f0f0",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        {selectedJob && (
          <>
            <DialogTitle sx={{ pb: 2, borderBottom: "1px solid #f0f0f0" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {selectedJob.icon}
                <Box sx={{ ml: 2 }}>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                    }}
                  >
                    {selectedJob.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {selectedJob.department} • {selectedJob.location} •{" "}
                    {selectedJob.type}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              {!showApplicationForm ? (
                <>
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{ lineHeight: 1.6 }}
                  >
                    {selectedJob.description}
                  </Typography>

                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mt: 4,
                      color: "#1a1a1a",
                    }}
                  >
                    주요 업무
                  </Typography>
                  <List dense>
                    {selectedJob.responsibilities.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "#2E7DF1", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{
                            fontSize: "0.95rem",
                            color: "#1a1a1a",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mt: 4,
                      color: "#1a1a1a",
                    }}
                  >
                    지원 자격
                  </Typography>
                  <List dense>
                    {selectedJob.requirements.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "#2E7DF1", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{
                            fontSize: "0.95rem",
                            color: "#1a1a1a",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mt: 4,
                      color: "#1a1a1a",
                    }}
                  >
                    혜택 및 복리후생
                  </Typography>
                  <List dense>
                    {selectedJob.benefits.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle
                            sx={{ color: "#2E7DF1", fontSize: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{
                            fontSize: "0.95rem",
                            color: "#1a1a1a",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Box>
                  {submitted ? (
                    <Alert
                      severity="success"
                      sx={{
                        mb: 2,
                        border: "1px solid #4caf50",
                        borderRadius: 1,
                      }}
                    >
                      지원서가 성공적으로 제출되었습니다! 빠른 시일 내에
                      연락드리겠습니다.
                    </Alert>
                  ) : (
                    <>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          mb: 3,
                          color: "#1a1a1a",
                        }}
                      >
                        {selectedJob.title} 지원하기
                      </Typography>
                      <TextField
                        fullWidth
                        label="이름"
                        value={applicationForm.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        sx={{ mb: 3 }}
                        required
                      />
                      <TextField
                        fullWidth
                        label="이메일"
                        type="email"
                        value={applicationForm.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        sx={{ mb: 3 }}
                        required
                      />
                      <TextField
                        fullWidth
                        label="연락처"
                        value={applicationForm.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        sx={{ mb: 3 }}
                        required
                      />
                      <TextField
                        fullWidth
                        label="자기소개서"
                        multiline
                        rows={6}
                        value={applicationForm.coverLetter}
                        onChange={(e) =>
                          handleInputChange("coverLetter", e.target.value)
                        }
                        placeholder="지원 동기와 본인의 강점을 자유롭게 작성해주세요..."
                        required
                      />
                    </>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions
              sx={{ px: 3, pb: 3, borderTop: "1px solid #f0f0f0" }}
            >
              <Button
                onClick={handleCloseDialog}
                sx={{
                  color: "#666",
                  textTransform: "none",
                }}
              >
                {submitted ? "닫기" : "취소"}
              </Button>
              {!showApplicationForm && (
                <Button
                  onClick={handleApplyClick}
                  variant="contained"
                  startIcon={<Work />}
                  sx={{
                    bgcolor: "#2E7DF1",
                    color: "white",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#1e6bd8",
                    },
                  }}
                >
                  지원하기
                </Button>
              )}
              {showApplicationForm && !submitted && (
                <Button
                  onClick={handleSubmitApplication}
                  variant="contained"
                  startIcon={<Send />}
                  disabled={
                    !applicationForm.name ||
                    !applicationForm.email ||
                    !applicationForm.phone ||
                    !applicationForm.coverLetter
                  }
                  sx={{
                    bgcolor: "#2E7DF1",
                    color: "white",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#1e6bd8",
                    },
                  }}
                >
                  지원서 제출
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Talent Pool Dialog */}
      <Dialog 
        open={showTalentPoolForm} 
        onClose={handleCloseTalentPoolForm} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { 
            maxHeight: '90vh',
            border: '1px solid #f0f0f0',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonAdd sx={{ fontSize: 32, color: '#2E7DF1', mr: 2 }} />
            <Typography variant="h5" component="h2" sx={{ 
              fontWeight: 600,
              color: '#1a1a1a'
            }}>
              인재풀 등록
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            TravelLight에 관심을 가져주셔서 감사합니다. 향후 적합한 포지션이 생기면 연락드리겠습니다.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {talentPoolSubmitted ? (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                border: '1px solid #4caf50',
                borderRadius: 1
              }}
            >
              인재풀 등록이 완료되었습니다! 적합한 기회가 생기면 연락드리겠습니다.
            </Alert>
          ) : (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="이름"
                    value={talentPoolForm.name}
                    onChange={(e) => handleTalentPoolInputChange('name', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="이메일"
                    type="email"
                    value={talentPoolForm.email}
                    onChange={(e) => handleTalentPoolInputChange('email', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="연락처"
                    value={talentPoolForm.phone}
                    onChange={(e) => handleTalentPoolInputChange('phone', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="관심 분야"
                    value={talentPoolForm.field}
                    onChange={(e) => handleTalentPoolInputChange('field', e.target.value)}
                    placeholder="예: 개발, 디자인, 마케팅, 기획 등"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="경력 사항"
                    multiline
                    rows={3}
                    value={talentPoolForm.experience}
                    onChange={(e) => handleTalentPoolInputChange('experience', e.target.value)}
                    placeholder="관련 경력이나 프로젝트 경험을 간단히 작성해주세요"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="자기소개"
                    multiline
                    rows={4}
                    value={talentPoolForm.introduction}
                    onChange={(e) => handleTalentPoolInputChange('introduction', e.target.value)}
                    placeholder="본인을 소개하고 TravelLight에 관심을 갖게 된 이유를 알려주세요"
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid #f0f0f0' }}>
          <Button 
            onClick={handleCloseTalentPoolForm} 
            sx={{ 
              color: '#666',
              textTransform: 'none'
            }}
          >
            {talentPoolSubmitted ? '닫기' : '취소'}
          </Button>
          {!talentPoolSubmitted && (
            <Button 
              onClick={handleSubmitTalentPool} 
              variant="contained" 
              startIcon={<Send />}
              disabled={
                !talentPoolForm.name ||
                !talentPoolForm.email ||
                !talentPoolForm.phone ||
                !talentPoolForm.field ||
                !talentPoolForm.introduction
              }
              sx={{
                bgcolor: '#2E7DF1',
                color: 'white',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#1e6bd8'
                }
              }}
            >
              등록하기
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Careers;
