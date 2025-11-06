import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Chip,
  Paper,
} from "@mui/material";
import {
  ArrowBack,
  LocationOn,
  Schedule,
  Work,
  CheckCircle,
  Send,
} from "@mui/icons-material";
import { jobPositions, JobPosition } from "../data/jobPositions";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CareerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosition | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showFixedButton, setShowFixedButton] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
  });

  // 채용공고 데이터 로드
  useEffect(() => {
    const jobId = parseInt(id || "0");
    const foundJob = jobPositions.find((j) => j.id === jobId);
    if (foundJob) {
      setJob(foundJob);
    } else {
      // 채용공고를 찾지 못한 경우 목록으로 리다이렉트
      navigate("/careers");
    }
  }, [id, navigate]);

  // 스크롤 감지 - 하단 고정 버튼 표시/숨김
  useEffect(() => {
    const handleScroll = () => {
      // 페이지 하단에 가까워지면 고정 버튼 숨김
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 스크롤이 300px 이상이고, 하단에서 200px 이상 떨어져 있으면 고정 버튼 표시
      if (scrollTop > 300 && documentHeight - (scrollTop + windowHeight) > 200) {
        setShowFixedButton(true);
      } else {
        setShowFixedButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleApplicationFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setApplicationForm({
      ...applicationForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitApplication = async () => {
    if (!job) return;

    try {
      const applicationData = {
        positionTitle: job.title,
        department: job.department,
        applicantName: applicationForm.name,
        email: applicationForm.email,
        phone: applicationForm.phone,
        coverLetter: applicationForm.coverLetter,
      };

      const response = await fetch("/api/hr/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        setSubmitted(true);
        setApplicationForm({
          name: "",
          email: "",
          phone: "",
          coverLetter: "",
        });
        // 3초 후 폼 닫기 및 상태 초기화
        setTimeout(() => {
          setSubmitted(false);
          setShowApplicationForm(false);
          // 페이지 상단으로 스크롤
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 3000);
      } else {
        alert("지원서 제출에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("지원서 제출 중 오류가 발생했습니다.");
    }
  };

  const scrollToApplicationForm = () => {
    setShowApplicationForm(true);
    // 폼이 렌더링된 후 스크롤
    setTimeout(() => {
      const formElement = document.getElementById("application-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  if (!job) {
    return null; // 로딩 중이거나 리다이렉트 중
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* 뒤로가기 버튼 */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/careers")}
          sx={{
            mb: 4,
            color: "#666",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          채용 공고 목록으로
        </Button>

        {/* 헤더 섹션 */}
        <Box
          sx={{
            mb: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 4,
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                mb: 2,
                fontSize: { xs: "1.75rem", md: "2rem" }
              }}
            >
              {job.title}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ gap: 1 }}
            >
              <Chip
                icon={<Work />}
                label={job.department}
                size="small"
                sx={{ backgroundColor: "#f0f7ff", color: "#2E7DF1" }}
              />
              <Chip
                icon={<LocationOn />}
                label={job.location}
                size="small"
                sx={{ backgroundColor: "#f0f7ff", color: "#2E7DF1" }}
              />
              <Chip
                icon={<Schedule />}
                label={job.type}
                size="small"
                sx={{ backgroundColor: "#f0f7ff", color: "#2E7DF1" }}
              />
            </Stack>
          </Box>

          {/* 오른쪽 지원하기 버튼 */}
          {!showApplicationForm && (
            <Button
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={scrollToApplicationForm}
              sx={{
                backgroundColor: "#2E7DF1",
                color: "white",
                px: 4,
                py: 1.5,
                fontSize: { xs: "0.9rem", md: "1rem" },
                fontWeight: 600,
                minWidth: "140px",
                whiteSpace: "nowrap",
                "&:hover": {
                  backgroundColor: "#1e6bd8",
                },
              }}
            >
              지원하기
            </Button>
          )}
        </Box>

        {/* 포지션 설명 */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
          >
            포지션 소개
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              lineHeight: 1.8,
              color: "#666",
              fontSize: { xs: "0.875rem", md: "1rem" }
            }}
          >
            {job.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* 주요 업무 */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
          >
            주요 업무
          </Typography>
          <List>
            {job.responsibilities.map((responsibility, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon>
                  <CheckCircle sx={{ color: "#2E7DF1", fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={responsibility}
                  primaryTypographyProps={{
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    color: "#666",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* 지원 자격 */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
          >
            지원 자격
          </Typography>
          <List>
            {job.requirements.map((requirement, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon>
                  <CheckCircle sx={{ color: "#2E7DF1", fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={requirement}
                  primaryTypographyProps={{
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    color: "#666",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* 혜택 */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
          >
            혜택
          </Typography>
          <List>
            {job.benefits.map((benefit, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon>
                  <CheckCircle sx={{ color: "#2E7DF1", fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={benefit}
                  primaryTypographyProps={{
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    color: "#666",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>


        {/* 지원서 폼 */}
        {showApplicationForm && (
          <Box
            id="application-form"
            sx={{
              opacity: showApplicationForm ? 1 : 0,
              transform: showApplicationForm ? "translateY(0)" : "translateY(-20px)",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                border: "2px solid #2E7DF1",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
              >
                지원서 작성
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {job.title} 포지션에 지원합니다
              </Typography>

              {submitted ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  지원서가 성공적으로 제출되었습니다! 빠른 시일 내에 연락드리겠습니다.
                </Alert>
              ) : (
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="이름"
                    name="name"
                    value={applicationForm.name}
                    onChange={handleApplicationFormChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="이메일"
                    name="email"
                    type="email"
                    value={applicationForm.email}
                    onChange={handleApplicationFormChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="연락처"
                    name="phone"
                    value={applicationForm.phone}
                    onChange={handleApplicationFormChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="자기소개서"
                    name="coverLetter"
                    multiline
                    rows={8}
                    value={applicationForm.coverLetter}
                    onChange={handleApplicationFormChange}
                    placeholder="지원 동기와 본인의 강점을 자유롭게 작성해주세요."
                  />
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => setShowApplicationForm(false)}
                      sx={{
                        borderColor: "#e0e0e0",
                        color: "#666",
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmitApplication}
                      disabled={
                        !applicationForm.name ||
                        !applicationForm.email ||
                        !applicationForm.phone
                      }
                      sx={{
                        backgroundColor: "#2E7DF1",
                        "&:hover": {
                          backgroundColor: "#1e6bd8",
                        },
                      }}
                    >
                      제출하기
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Paper>
          </Box>
        )}
      </Container>

      {/* 하단 고정 버튼 */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          py: 2,
          px: 3,
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: showFixedButton && !showApplicationForm ? "translateY(0)" : "translateY(100%)",
          opacity: showFixedButton && !showApplicationForm ? 1 : 0,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Container maxWidth="md">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
              >
                {job.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                {job.department} · {job.location}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={scrollToApplicationForm}
              sx={{
                backgroundColor: "#2E7DF1",
                color: "white",
                px: 4,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#1e6bd8",
                },
              }}
            >
              지원하기
            </Button>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default CareerDetail;
