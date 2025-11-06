import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import hsmImage from "../assets/images/hsm.jpg";
import kbhImage from "../assets/images/kbh.png";
import kshImage from "../assets/images/ksh.jpg";
import yswImage from "../assets/images/ysw.jpg";
import hymImage from "../assets/images/hym.jpg";
import logo1Image from "../assets/images/achievements/logo1.jpg";
import logo2Image from "../assets/images/achievements/logo2.png";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { styled } from "@mui/material/styles";
import {
  Security,
  Speed,
  EmojiObjects,
  TrendingUp,
  People,
  Public,
  EmojiEvents,
} from "@mui/icons-material";

const SimpleCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  border: "1px solid #f0f0f0",
  boxShadow: "none",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
}));

const TeamCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  border: "1px solid #f0f0f0",
  boxShadow: "none",
  height: "100%",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
}));

const StatCard = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  border: "1px solid #e0e0e0",
}));

const AchievementItem = styled(Box)(({ theme }) => ({
  position: "relative",
  paddingLeft: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  "&::before": {
    content: '""',
    position: "absolute",
    left: "15px",
    top: "24px",
    bottom: 0,
    width: "2px",
    backgroundColor: "#e0e0e0",
  },
  "&:last-child::before": {
    display: "none",
  },
}));

const AchievementDot = styled(Box)({
  position: "absolute",
  left: "7px",
  top: "8px",
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  backgroundColor: "#2E7DF1",
  border: "3px solid #fff",
  boxShadow: "0 0 0 2px #2E7DF1",
  zIndex: 1,
});

const AchievementCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  border: "1px solid #f0f0f0",
  boxShadow: "none",
}));

const About: React.FC = () => {
  const achievements = [
    {
      date: "2025.08",
      title: "학생창업유망팀 300 성장트랙 최종선정",
      logo: logo1Image,
    },
    {
      date: "2025.05",
      title: "북부권역 지역연계 강화 창업경진대회 최종 선발",
      logo: logo2Image,
    },
  ];

  const features = [
    {
      icon: <Security sx={{ fontSize: 48, color: "#2E7DF1" }} />,
      title: "안전한 보관",
      description: "24시간 CCTV 모니터링과 보험 가입으로 안전하게 보관합니다.",
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: "#2E7DF1" }} />,
      title: "빠른 서비스",
      description:
        "15분 이내 픽업/드롭오프로 빠르고 편리한 서비스를 제공합니다.",
    },
    {
      icon: <EmojiObjects sx={{ fontSize: 48, color: "#2E7DF1" }} />,
      title: "스마트 플랫폼",
      description: "AI 기반 최적화된 경로와 실시간 추적 시스템을 제공합니다.",
    },
  ];

  const ceo = {
    name: "함승민",
    position: "CEO & Founder",
    description:
      "여행과 기술을 결합한 혁신적인 서비스를 통해 사람들의 여행 경험을 개선하고자 합니다. Travelight의 비전을 현실로 만들어가고 있습니다.",
    skills: ["Strategy", "Product", "Leadership"],
  };

  const teamMembers = [
    {
      name: "김병훈",
      position: "Backend Developer",
      description:
        "API 설계와 데이터베이스 구조를 담당하며, 사용자 인증 및 예약 시스템의 핵심 로직을 개발합니다.",
      skills: ["Spring Boot", "PostgreSQL", "REST API"],
      image: kbhImage,
    },
    {
      name: "김성훈",
      position: "Backend Developer",
      description:
        "결제 시스템과 파트너십 관리 기능을 담당하며, 안전하고 신뢰할 수 있는 거래 환경을 구축합니다.",
      skills: ["Payment Gateway", "Security", "Microservices"],
      image: kshImage,
    },
    {
      name: "윤상우",
      position: "Backend Developer",
      description:
        "물류 시스템과 실시간 추적 기능을 개발하며, 배송 최적화 알고리즘을 구현합니다.",
      skills: ["Algorithm", "Real-time Processing", "Optimization"],
      image: yswImage,
    },
    {
      name: "한유민",
      position: "Backend Developer",
      description:
        "서버 인프라와 배포 자동화를 담당하며, 안정적인 서비스 운영을 위한 모니터링 시스템을 구축합니다.",
      skills: ["DevOps", "AWS", "CI/CD"],
      image: hymImage,
    },
  ];

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
              여행을 더 가볍게, 경험을 더 풍부하게
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
              Travelight는 여행자들의 짐 보관과 배송을 혁신하는 스타트업입니다
            </Typography>

            {/* Stats */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={4}
              justifyContent="center"
            >
              <StatCard>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "#2E7DF1" }}
                >
                  10K+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  만족한 고객
                </Typography>
              </StatCard>
              <StatCard>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "#2E7DF1" }}
                >
                  500+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  파트너 지점
                </Typography>
              </StatCard>
              <StatCard>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "#2E7DF1" }}
                >
                  99%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  안전 보관율
                </Typography>
              </StatCard>
            </Stack>
          </Container>
        </Box>

        <Container sx={{ py: 8 }}>
          {/* Mission Section */}
          <Box sx={{ textAlign: "center", mb: 12 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 3,
              }}
            >
              우리의 미션
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: 800,
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              여행자들이 무거운 짐에 구애받지 않고 자유롭게 여행할 수 있도록,
              안전하고 편리한 짐 보관 및 배송 서비스를 제공합니다.
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              flexWrap="wrap"
            >
              <Chip
                icon={<TrendingUp />}
                label="혁신"
                sx={{
                  bgcolor: "#f8f9ff",
                  color: "#2E7DF1",
                  border: "1px solid #e8ecff",
                }}
              />
              <Chip
                icon={<People />}
                label="고객 중심"
                sx={{
                  bgcolor: "#f8f9ff",
                  color: "#2E7DF1",
                  border: "1px solid #e8ecff",
                }}
              />
              <Chip
                icon={<Public />}
                label="지속 성장"
                sx={{
                  bgcolor: "#f8f9ff",
                  color: "#2E7DF1",
                  border: "1px solid #e8ecff",
                }}
              />
            </Stack>
          </Box>

          {/* Achievements Section */}
          <Box sx={{ mb: 12 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                textAlign: "center",
                mb: 6,
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              주요 성과
            </Typography>
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              {achievements.map((achievement, index) => (
                <AchievementItem key={index}>
                  <AchievementDot />
                  <AchievementCard>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      {achievement.logo ? (
                        <img
                          src={achievement.logo}
                          alt={`Achievement ${index + 1}`}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "contain",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <EmojiEvents sx={{ color: "#2E7DF1", fontSize: 80 }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "#2E7DF1",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          {achievement.date}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#1a1a1a",
                            fontWeight: 500,
                            lineHeight: 1.6,
                          }}
                        >
                          {achievement.title}
                        </Typography>
                      </Box>
                    </Box>
                  </AchievementCard>
                </AchievementItem>
              ))}
            </Box>
          </Box>

          {/* Features Section */}
          <Box sx={{ mb: 12 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                textAlign: "center",
                mb: 6,
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              왜 Travelight를 선택해야 할까요?
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <SimpleCard>
                    <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </SimpleCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* Team Section */}
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
              우리 팀을 소개합니다
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
              각 분야의 전문가들이 모여 최고의 서비스를 만들어갑니다
            </Typography>

            {/* CEO Section */}
            <Box sx={{ mb: 8 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <Avatar
                      src={hsmImage}
                      alt={ceo.name}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: "auto",
                        mb: 3,
                        bgcolor: "#2E7DF1",
                        fontSize: "2rem",
                        fontWeight: 700,
                      }}
                    >
                      {ceo.name[0]}
                    </Avatar>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: "#1a1a1a",
                        mb: 1,
                      }}
                    >
                      {ceo.name}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#2E7DF1",
                        mb: 3,
                        fontWeight: 600,
                      }}
                    >
                      {ceo.position}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      flexWrap="wrap"
                    >
                      {ceo.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          sx={{
                            bgcolor: "#f8f9ff",
                            color: "#2E7DF1",
                            border: "1px solid #e8ecff",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ pl: { md: 4 } }}>
                    <Typography
                      variant="h4"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: "#1a1a1a",
                        mb: 3,
                      }}
                    >
                      우리가 꿈꾸는 여행
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        lineHeight: 1.8,
                        fontSize: "1.1rem",
                      }}
                    >
                      {ceo.description}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        lineHeight: 1.7,
                        fontStyle: "italic",
                      }}
                    >
                      "여행은 단순히 목적지에 도착하는 것이 아닙니다. 그
                      과정에서 얻는 자유로움과 새로운 경험이 진짜 여행의
                      가치라고 생각합니다."
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.7,
                      }}
                    >
                      Travelight를 통해 모든 여행자들이 짐에 대한 걱정 없이
                      순수하게 여행 자체를 즐길 수 있는 세상을 만들어가고
                      싶습니다.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Team Members */}
            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              sx={{
                textAlign: "center",
                mb: 6,
                fontWeight: 600,
                color: "#1a1a1a",
              }}
            >
              핵심 팀원
            </Typography>

            <Grid container spacing={4}>
              {teamMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <TeamCard>
                    <Avatar
                      src={member.image}
                      alt={member.name}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: "auto",
                        mb: 3,
                        bgcolor: "#FFFFFF",
                        fontSize: "1.5rem",
                        fontWeight: 600,
                      }}
                    >
                      {member.name[0]}
                    </Avatar>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      {member.name}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#2E7DF1",
                        mb: 2,
                        fontWeight: 500,
                      }}
                    >
                      {member.position}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        minHeight: 60,
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {member.description}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                      flexWrap="wrap"
                    >
                      {member.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            bgcolor: "#f8f9ff",
                            color: "#2E7DF1",
                            border: "1px solid #e8ecff",
                            fontSize: "0.75rem",
                          }}
                        />
                      ))}
                    </Stack>
                  </TeamCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* CTA Section */}
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
              함께 성장할 팀원을 찾고 있습니다
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
              여행 산업의 혁신을 함께 만들어갈 인재를 모집합니다
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="/careers"
              sx={{
                bgcolor: "#2E7DF1",
                color: "white",
                fontWeight: 600,
                px: 6,
                py: 2,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: "#1e6bd8",
                },
              }}
            >
              채용 정보 보기
            </Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default About;
