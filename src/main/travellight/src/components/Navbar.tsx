import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import LuggageIcon from "@mui/icons-material/Luggage";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import TranslateIcon from "@mui/icons-material/Translate";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LanguageIcon from "@mui/icons-material/Language";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useTranslation } from "react-i18next";

interface MenuItem {
  text: string;
  href?: string;
  onClick?: () => void;
}

// 메뉴 스타일 정의
const menuStyles = {
  "& .MuiPaper-root": {
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f3f4f6",
    minWidth: "160px",
    marginTop: "8px",
  },
  "& .MuiMenuItem-root": {
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a1a1a",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    "&:hover": {
      backgroundColor: "#f9fafb",
      color: "#2563eb",
    },
    "&:first-of-type": {
      marginTop: "4px",
    },
    "&:last-of-type": {
      marginBottom: "4px",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "18px",
    },
  },
  "& .MuiDivider-root": {
    margin: "6px 0",
    borderColor: "#f3f4f6",
  },
};

// 로그아웃 메뉴 아이템 스타일
const logoutMenuItemStyles = {
  color: "#dc2626 !important",
  "&:hover": {
    backgroundColor: "#fee2e2 !important",
    color: "#dc2626 !important",
  },
};

const Navbar: React.FC = () => {
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [partnerMenuAnchorEl, setPartnerMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [langMenuAnchorEl, setLangMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [menuStep, setMenuStep] = useState<'main' | string>('main');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, isAuthenticated, isPartner, isWaiting, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // 파트너 관련 페이지인지 확인
  const isPartnerPage =
    location.pathname.includes("/partner") ||
    location.pathname.includes("/StoragePartnership") ||
    location.pathname.includes("/EventStorage") ||
    location.pathname.includes("/Inquiry");

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const handlePartnerMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPartnerMenuAnchorEl(event.currentTarget);
  };

  const handlePartnerMenuClose = () => {
    setPartnerMenuAnchorEl(null);
  };

  const partnerMenuOpen = Boolean(partnerMenuAnchorEl);

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchorEl(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangMenuAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    localStorage.setItem("preferredLanguage", lng);
    handleLangMenuClose();
    // React Router를 사용하여 현재 페이지를 새로고침 (로그인 상태 유지)
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Navigation to Partnership Pages
  const navigateToStoragePartnership = () => {
    handlePartnerMenuClose();
    navigate("/StoragePartnership");
    setHamburgerMenuOpen(false);
  };

  const navigateToEventStorage = () => {
    handlePartnerMenuClose();
    navigate("/EventStorage");
    setHamburgerMenuOpen(false);
  };

  const navigateToInquiry = () => {
    handlePartnerMenuClose();
    navigate("/Inquiry");
    setHamburgerMenuOpen(false);
  };

  const navigateToFAQ = () => {
    handlePartnerMenuClose();
    navigate("/FAQ");
    setHamburgerMenuOpen(false);
  };

  const navigateToPartner = () => {
    handlePartnerMenuClose();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/partner" } });
      setHamburgerMenuOpen(false);
      return;
    }

    if (isPartner) {
      navigate("/partner-dashboard");
    } else if (isWaiting) {
      navigate("/partner-dashboard");
    } else {
      navigate("/partner");
    }
    setHamburgerMenuOpen(false);
  };

  const handleHamburgerToggle = () => {
    if (!hasBeenClicked) {
      setHasBeenClicked(true);
    }
    setHamburgerMenuOpen(!hamburgerMenuOpen);
    if (!hamburgerMenuOpen) {
      setMenuStep('main'); // 메뉴 열 때 메인 화면으로 초기화
    }
  };

  const handleSectionClick = (sectionKey: string) => {
    setMenuStep(sectionKey);
  };

  const handleBackToMain = () => {
    setMenuStep('main');
  };

  const handleMenuItemClick = (href?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else if (href) {
      if (href.startsWith("/#")) {
        window.location.href = href;
      } else {
        navigate(href);
      }
    }
    setHamburgerMenuOpen(false);
  };

  const isMenuOpen = Boolean(anchorEl);
  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen && isAuthenticated}
      onClose={handleMenuClose}
      sx={menuStyles}
    >
      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/map", { state: { showReservations: true } });
        }}
      >
        <BookmarkIcon />내 예약
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/profile");
        }}
      >
        <PersonIcon />
        내 프로필
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/settings");
        }}
      >
        <SettingsIcon />
        {t("settings")}
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={logoutMenuItemStyles}>
        <LogoutIcon />
        {t("logout")}
      </MenuItem>
    </Menu>
  );

  const isLangMenuOpen = Boolean(langMenuAnchorEl);

  const menuItems: MenuItem[] = [
    { text: t("home"), href: "/" },
    { text: t("about"), href: "/about" },
    { text: t("services"), href: "/services" },
    { text: "채용", href: "/careers" },
    { text: t("contact"), href: "/contact" },
  ];

  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          background: isPartnerPage ? "#2E7DF1" : "white",
          transition: "background 0.3s ease",
          borderRadius: 0,
          boxShadow: isPartnerPage ? "none" : undefined,
          border: "none",
          borderBottom: "none",
          // iOS Safe Area 대응
          paddingTop: 'var(--safe-area-inset-top)',
          paddingLeft: 'var(--safe-area-inset-left)',
          paddingRight: 'var(--safe-area-inset-right)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="div"
              onClick={() => navigate("/")}
              sx={{
                mr: 2,
                display: "flex",
                alignItems: "center",
                fontWeight: 700,
                color: isPartnerPage ? "white" : "primary.main",
                textDecoration: "none",
                flexGrow: 1,
                transition: "color 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              <LuggageIcon sx={{ mr: 1 }} />
              Travelight
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* 번역 아이콘 버튼 */}
              <IconButton
                aria-label={t("language")}
                aria-controls={isLangMenuOpen ? "language-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={isLangMenuOpen ? "true" : undefined}
                onClick={handleLangMenuOpen}
                size="small"
                sx={{
                  mx: 1,
                  fontSize: "1.5rem",
                  "&:hover": {
                    backgroundColor: "rgba(37, 99, 235, 0.04)", // 호버 효과
                  },
                  color: isPartnerPage ? "white" : "primary.main",
                  transition: "color 0.3s ease",
                }}
              >
                <TranslateIcon />
              </IconButton>

              {/* 사용자 아이콘 버튼 또는 사용자 이름 */}
              {isAuthenticated ? (
                <Button
                  onClick={handleProfileMenuOpen}
                  sx={{
                    ml: 1,
                    textTransform: "none",
                    fontWeight: "medium",
                    display: "flex",
                    alignItems: "center",
                    color: isPartnerPage ? "white" : "primary.main",
                    transition: "color 0.3s ease",
                    "&:hover": {
                      backgroundColor: isPartnerPage
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(46, 125, 241, 0.1)",
                    },
                  }}
                  endIcon={<ArrowDropDownIcon />}
                >
                  {user?.name}님
                </Button>
              ) : (
                <IconButton
                  aria-label="user menu"
                  onClick={handleProfileMenuOpen}
                  size="small"
                  sx={{
                    mx: 1,
                    color: isPartnerPage ? "white" : "primary.main",
                    transition: "color 0.3s ease",
                  }}
                >
                  <AccountCircleIcon />
                </IconButton>
              )}

              {/* 햄버거 메뉴 버튼 */}
              <Box
                sx={{
                  mx: 1,
                  width: "30px",
                  height: "30px",
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& span": {
                    display: "block",
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "20px",
                    height: "2px",
                    backgroundColor: isPartnerPage ? "white" : "primary.main",
                    borderRadius: "4px",
                    transition: "all .25s",
                  },
                  "& span:nth-of-type(1)": {
                    top: "8px",
                    animation: hasBeenClicked
                      ? hamburgerMenuOpen
                        ? "active-menu-bar07-01 .4s forwards"
                        : "menu-bar07-01 .4s forwards"
                      : "none",
                  },
                  "& span:nth-of-type(2)": {
                    top: "14px",
                    transition: "all .2s .1s",
                    opacity: hamburgerMenuOpen ? 0 : 1,
                  },
                  "& span:nth-of-type(3)": {
                    top: "20px",
                    animation: hasBeenClicked
                      ? hamburgerMenuOpen
                        ? "active-menu-bar07-02 .4s forwards"
                        : "menu-bar07-02 .4s forwards"
                      : "none",
                  },
                  "@keyframes menu-bar07-01": {
                    "0%": {
                      transform:
                        "translateX(-50%) translateY(6px) rotate(45deg)",
                    },
                    "50%": {
                      transform: "translateX(-50%) translateY(6px) rotate(0)",
                    },
                    "100%": {
                      transform: "translateX(-50%) translateY(0) rotate(0)",
                    },
                  },
                  "@keyframes menu-bar07-02": {
                    "0%": {
                      transform:
                        "translateX(-50%) translateY(-6px) rotate(-45deg)",
                    },
                    "50%": {
                      transform: "translateX(-50%) translateY(-6px) rotate(0)",
                    },
                    "100%": {
                      transform: "translateX(-50%) translateY(0) rotate(0)",
                    },
                  },
                  "@keyframes active-menu-bar07-01": {
                    "0%": {
                      transform: "translateX(-50%) translateY(0) rotate(0)",
                    },
                    "50%": {
                      transform: "translateX(-50%) translateY(6px) rotate(0)",
                    },
                    "100%": {
                      transform:
                        "translateX(-50%) translateY(6px) rotate(45deg)",
                    },
                  },
                  "@keyframes active-menu-bar07-02": {
                    "0%": {
                      transform: "translateX(-50%) translateY(0) rotate(0)",
                    },
                    "50%": {
                      transform: "translateX(-50%) translateY(-6px) rotate(0)",
                    },
                    "100%": {
                      transform:
                        "translateX(-50%) translateY(-6px) rotate(-45deg)",
                    },
                  },
                }}
                onClick={handleHamburgerToggle}
              >
                <span />
                <span />
                <span />
              </Box>
            </Box>
          </Toolbar>
        </Container>
        {renderMenu}

        <Menu
          id="language-menu"
          anchorEl={langMenuAnchorEl}
          open={isLangMenuOpen}
          onClose={handleLangMenuClose}
          MenuListProps={{
            "aria-labelledby": "language-button",
          }}
          sx={menuStyles}
        >
          <MenuItem onClick={() => changeLanguage("ko")}>
            <LanguageIcon />
            {t("korean")}
          </MenuItem>
          <MenuItem onClick={() => changeLanguage("en")}>
            <LanguageIcon />
            {t("english")}
          </MenuItem>
        </Menu>

        {/* 로그인하지 않은 사용자를 위한 계정 메뉴 */}
        <Menu
          id="user-account-menu"
          anchorEl={anchorEl}
          open={isMenuOpen && !isAuthenticated}
          onClose={handleMenuClose}
          MenuListProps={{
            "aria-labelledby": "user-account-button",
          }}
          sx={menuStyles}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/login");
            }}
          >
            <LoginIcon />
            {t("login")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/register");
            }}
          >
            <PersonAddIcon />
            {t("register")}
          </MenuItem>
        </Menu>
      </AppBar>
      {/* 햄버거 드롭다운 메뉴 */}
      <>
        {/* 블러 배경 */}
        <Box
          sx={{
            position: "fixed",
            top: "calc(64px + var(--safe-area-inset-top))",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(8px)",
            opacity: hamburgerMenuOpen ? 1 : 0,
            visibility: hamburgerMenuOpen ? "visible" : "hidden",
            transition: "all 0.3s ease-in-out",
            zIndex: 1200,
          }}
          onClick={() => setHamburgerMenuOpen(false)}
        />

        <Box
          sx={{
            position: "fixed",
            top: "calc(64px + var(--safe-area-inset-top))",
            left: 0,
            right: 0,
            backgroundColor: isPartnerPage ? "#2E7DF1" : "white",
            border: "none",
            borderBottom: "none",
            zIndex: 1300,
            maxHeight: hamburgerMenuOpen ? { xs: "400px", md: "300px" } : 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease-in-out",
            paddingLeft: 'var(--safe-area-inset-left)',
            paddingRight: 'var(--safe-area-inset-right)',
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 3, md: 2 },
              transform: hamburgerMenuOpen
                ? "translateY(0)"
                : "translateY(-10px)",
              opacity: hamburgerMenuOpen ? 1 : 0,
              transition: "all 0.3s ease-in-out",
            }}
          >
            {/* 데스크톱: 기존 레이아웃, 모바일: 아코디언 */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 4,
              }}
            >
              {/* 데스크톱용 기존 레이아웃 (간소화) */}
              {[
                {
                  title: "서비스 이용",
                  items: [
                    { text: t("services"), href: "/#services" },
                    { text: t("pricing"), href: "/#pricing" },
                  ],
                },
                {
                  title: "고객 지원",
                  items: [
                    { text: t("howItWorks"), onClick: navigateToFAQ },
                    { text: "자주 묻는 질문", href: "/faq" },
                    { text: "고객센터", href: "/support" },
                  ],
                },
                {
                  title: "파트너쉽",
                  items: [
                    { text: t("partner"), onClick: navigateToPartner },
                    { text: t("eventStorage"), onClick: navigateToEventStorage },
                    { text: "1:1 문의", onClick: navigateToInquiry },
                  ],
                },
                {
                  title: "트래블라이트",
                  items: [
                    { text: "회사소개", href: "/about" },
                    { text: "채용", href: "/careers" },
                    { text: "뉴스", href: "/news" },
                  ],
                },
              ].map((section, index) => (
                <Box
                  key={section.title}
                  sx={{
                    flex: 1,
                    opacity: 0,
                    animation: hamburgerMenuOpen
                      ? `fadeIn 0.3s ease-out forwards ${0.1 + index * 0.1}s`
                      : "none",
                    "@keyframes fadeIn": {
                      from: {
                        opacity: 0,
                        transform: "translateY(-5px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: isPartnerPage
                        ? "rgba(255, 255, 255, 0.8)"
                        : "text.secondary",
                      fontWeight: 600,
                      mb: 1.5,
                      fontSize: "0.95rem",
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {section.items.map((item) => (
                      <Button
                        key={item.text}
                        onClick={() =>
                          handleMenuItemClick(item.href, item.onClick)
                        }
                        disableRipple
                        sx={{
                          justifyContent: "flex-start",
                          color: isPartnerPage ? "white" : "text.primary",
                          fontSize: "1rem",
                          fontWeight: 400,
                          textTransform: "none",
                          py: 1,
                          px: 0,
                          borderRadius: "8px",
                          width: "100%",
                          "&:hover": {
                            backgroundColor: "transparent",
                            opacity: 0.7,
                          },
                          transition: "opacity 0.2s",
                        }}
                      >
                        {item.text}
                      </Button>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* 모바일용 페이지 네비게이션 */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                flexDirection: "column",
                gap: 0,
                minHeight: "300px",
              }}
            >
              {menuStep === 'main' ? (
                // 메인 화면: 4개 카테고리
                <>
                  {[
                    { key: "service", title: "서비스 이용" },
                    { key: "support", title: "고객 지원" },
                    { key: "partner", title: "파트너쉽" },
                    { key: "company", title: "트래블라이트" },
                  ].map((section, index) => (
                    <Button
                      key={section.key}
                      onClick={() => handleSectionClick(section.key)}
                      disableRipple
                      sx={{
                        width: "100%",
                        justifyContent: "space-between",
                        color: isPartnerPage ? "white" : "text.primary",
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        textTransform: "none",
                        py: 3,
                        px: 0,
                        "&:hover": {
                          opacity: 0.7,
                        },
                        transition: "opacity 0.2s ease",
                        opacity: 0,
                        animation: hamburgerMenuOpen
                          ? `fadeIn 0.3s ease-out forwards ${0.1 + index * 0.1}s`
                          : "none",
                        "@keyframes fadeIn": {
                          from: {
                            opacity: 0,
                            transform: "translateX(-10px)",
                          },
                          to: {
                            opacity: 1,
                            transform: "translateX(0)",
                          },
                        },
                      }}
                      endIcon={
                        <Box sx={{ color: isPartnerPage ? "white" : "text.secondary" }}>
                          →
                        </Box>
                      }
                    >
                      {section.title}
                    </Button>
                  ))}
                </>
              ) : (
                // 세부 메뉴 화면
                <>
                  {/* 뒤로가기 버튼 */}
                  <Button
                    onClick={handleBackToMain}
                    disableRipple
                    sx={{
                      width: "100%",
                      justifyContent: "flex-start",
                      color: isPartnerPage ? "white" : "text.primary",
                      fontSize: "1rem",
                      fontWeight: 500,
                      textTransform: "none",
                      py: 2,
                      px: 0,
                      mb: 2,
                      "&:hover": {
                        opacity: 0.7,
                      },
                    }}
                    startIcon={
                      <Box sx={{ color: isPartnerPage ? "white" : "text.secondary" }}>
                        ←
                      </Box>
                    }
                  >
                    뒤로
                  </Button>

                  {/* 현재 섹션의 세부 항목들 */}
                  {(() => {
                    const sections = {
                      service: {
                        title: "서비스 이용",
                        items: [
                          { text: t("services"), href: "/#services" },
                          { text: t("pricing"), href: "/#pricing" },
                        ],
                      },
                      support: {
                        title: "고객 지원",
                        items: [
                          { text: t("howItWorks"), onClick: navigateToFAQ },
                          { text: "자주 묻는 질문", href: "/faq" },
                          { text: "고객센터", href: "/support" },
                        ],
                      },
                      partner: {
                        title: "파트너쉽",
                        items: [
                          { text: t("partner"), onClick: navigateToPartner },
                          { text: t("eventStorage"), onClick: navigateToEventStorage },
                          { text: "1:1 문의", onClick: navigateToInquiry },
                        ],
                      },
                      company: {
                        title: "트래블라이트",
                        items: [
                          { text: "회사소개", href: "/about" },
                          { text: "채용", href: "/careers" },
                          { text: "뉴스", href: "/news" },
                        ],
                      },
                    };

                    const currentSection = sections[menuStep as keyof typeof sections];
                    if (!currentSection) return null;

                    return currentSection.items.map((item, index) => (
                      <Button
                        key={item.text}
                        onClick={() => handleMenuItemClick(item.href, item.onClick)}
                        disableRipple
                        sx={{
                          width: "100%",
                          justifyContent: "flex-start",
                          color: isPartnerPage ? "white" : "text.primary",
                          fontSize: "1.1rem",
                          fontWeight: 400,
                          textTransform: "none",
                          py: 2.5,
                          px: 0,
                          "&:hover": {
                            opacity: 0.7,
                          },
                          transition: "opacity 0.2s ease",
                          opacity: 0,
                          animation: `fadeIn 0.3s ease-out forwards ${0.1 + index * 0.05}s`,
                          "@keyframes fadeIn": {
                            from: {
                              opacity: 0,
                              transform: "translateX(10px)",
                            },
                            to: {
                              opacity: 1,
                              transform: "translateX(0)",
                            },
                          },
                        }}
                      >
                        {item.text}
                      </Button>
                    ));
                  })()}
                </>
              )}
            </Box>
          </Container>
        </Box>
      </>
      <Box sx={{
        height: "calc(64px + var(--safe-area-inset-top))"
      }} /> {/* AppBar 높이 + safe area만큼의 여백 추가 */}
    </>
  );
};

export default Navbar;
