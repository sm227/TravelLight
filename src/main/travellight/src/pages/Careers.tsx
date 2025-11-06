import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Divider,
  Alert,
  Stack,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { styled } from "@mui/material/styles";
import {
  LocationOn,
  Schedule,
  Send,
  Speed,
  Security,
  People,
  PersonAdd,
  Email,
  TrendingUp,
  DesignServices
} from "@mui/icons-material";
import { jobPositions } from "../data/jobPositions";

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

const Careers: React.FC = () => {
  const navigate = useNavigate();
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

  const getJobIcon = (iconName: string) => {
    const iconProps = { fontSize: 36, color: "#2E7DF1" };
    switch (iconName) {
      case "TrendingUp":
        return <TrendingUp sx={iconProps} />;
      case "DesignServices":
        return <DesignServices sx={iconProps} />;
      default:
        return <TrendingUp sx={iconProps} />;
    }
  };

  const handleJobClick = (jobId: number) => {
    navigate(`/careers/${jobId}`);
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

  const handleSubmitTalentPool = async () => {
    try {
      const response = await fetch('/api/hr/talent-pool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(talentPoolForm)
      });

      if (response.ok) {
        setTalentPoolSubmitted(true);
        setTimeout(() => {
          handleCloseTalentPoolForm();
          setTalentPoolForm({
            name: "",
            email: "",
            phone: "",
            field: "",
            experience: "",
            introduction: "",
          });
        }, 3000);
      } else {
        console.error('인재풀 등록 실패');
      }
    } catch (error) {
      console.error('인재풀 등록 중 오류:', error);
    }
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
                fontSize: { xs: "2rem", md: "2.75rem" },
              }}
            >
              함께 성장할 팀원을 찾습니다
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mb: 8,
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontWeight: 400,
                fontSize: { xs: "1rem", md: "1.1rem" },
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
                <Speed sx={{ fontSize: 28, color: "#2E7DF1", mb: 1 }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "#1a1a1a" }}
                >
                  Early Stage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  창업 초기 단계
                </Typography>
              </StatCard>
              <StatCard>
                <Security sx={{ fontSize: 28, color: "#2E7DF1", mb: 1 }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "#1a1a1a" }}
                >
                  Big Dream
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  큰 비전과 목표
                </Typography>
              </StatCard>
              <StatCard>
                <People sx={{ fontSize: 28, color: "#2E7DF1", mb: 1 }} />
                <Typography
                  variant="subtitle1"
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
              variant="h5"
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
              variant="body1"
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
                  <JobCard onClick={() => handleJobClick(job.id)}>
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
                          {getJobIcon(job.iconName)}
                          <Box sx={{ ml: 2 }}>
                            <Typography
                              variant="subtitle1"
                              component="h3"
                              sx={{
                                fontWeight: 600,
                                color: "#1a1a1a",
                                mb: 0.5,
                                fontSize: "1.1rem",
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
                            fontSize: { xs: "0.875rem", md: "0.95rem" },
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
                      <PersonAdd sx={{ fontSize: 50, color: "#2E7DF1", mb: 2 }} />
                      <Typography variant="subtitle1" component="h3" gutterBottom sx={{
                        fontWeight: 600,
                        color: "#1a1a1a",
                        mb: 2,
                        fontSize: "1.1rem"
                      }}>
                        인재풀 등록
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        mb: 3,
                        lineHeight: 1.5,
                        fontSize: { xs: "0.875rem", md: "0.95rem" },
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
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              Travelight에서 누릴 수 있는 혜택
            </Typography>
            <Typography
              variant="body1"
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
                      variant="subtitle1"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: "#1a1a1a",
                        fontSize: "1.1rem",
                      }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography
                      variant="body2"
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
              variant="h5"
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
              variant="body1"
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
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1a1a",
                    mb: 1,
                  }}
                >
                  이메일
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  hamsm3184@gmail.com
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: "#1a1a1a",
                    mb: 1,
                  }}
                >
                  전화
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
            <PersonAdd sx={{ fontSize: 28, color: '#2E7DF1', mr: 2 }} />
            <Typography variant="h6" component="h2" sx={{
              fontWeight: 600,
              color: '#1a1a1a'
            }}>
              인재풀 등록
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
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
