import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  Chip,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { QueryResultDisplay } from './QueryResultDisplay';

const COLORS = {
  backgroundDark: '#0f0f11',
  backgroundLight: '#18181b',
  backgroundCard: '#1f1f23',
  backgroundSurface: '#27272a',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  borderPrimary: '#27272a',
  borderSecondary: '#3f3f46',
  accentPrimary: '#3b82f6',
  accentSecondary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
};

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  queryResult?: any;
}

interface AdminChatInterfaceProps {
  onClose: () => void;
}

export const AdminChatInterface: React.FC<AdminChatInterfaceProps> = ({ onClose }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [examples] = useState([
    "이번달 총 매출은 얼마인가요?",
    "오늘 예약 건수는 몇 건인가요?",
    "지역별 예약 현황을 보여주세요",
    "파트너십 승인 대기 중인 매장은 몇 개인가요?",
    "최근 7일간 일별 매출 추이를 보여주세요"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 초기 환영 메시지 추가
    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      type: 'assistant',
      content: '안녕하세요! 저는 트래비입니다. TravelLight 데이터 분석을 도와드릴게요. 궁금한 점을 자연어로 물어보세요.',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/query/natural', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ query })
      });

      const result = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: result.success
          ? `${result.explanation}\n\n**실행된 쿼리:**\n\`\`\`sql\n${result.sql}\n\`\`\``
          : `죄송합니다. 오류가 발생했습니다: ${result.error}`,
        timestamp: new Date(),
        queryResult: result.success ? result : null
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Query request failed:', error);

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: '죄송합니다. 서버와의 통신 중 오류가 발생했습니다.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      type: 'assistant',
      content: '채팅이 초기화되었습니다. 새로운 질문을 해보세요!',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: '500px',
        height: '700px',
        bgcolor: COLORS.backgroundCard,
        border: `1px solid ${COLORS.borderSecondary}`,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1300,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${COLORS.borderPrimary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: COLORS.backgroundSurface
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon sx={{ color: COLORS.accentPrimary, fontSize: '1.5rem' }} />
          <Typography variant="h6" sx={{
            color: COLORS.textPrimary,
            fontWeight: 600,
            fontSize: '1rem'
          }}>
            트래비 - 데이터 분석 어시스턴트
          </Typography>
        </Box>
        <Box>
          <Tooltip title="대화 초기화">
            <IconButton
              size="small"
              onClick={clearChat}
              sx={{ color: COLORS.textSecondary, mr: 1 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="닫기">
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: COLORS.textSecondary }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box sx={{
        flexGrow: 1,
        overflow: 'auto',
        p: 1,
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: COLORS.borderPrimary,
          borderRadius: '2px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: COLORS.accentPrimary,
          borderRadius: '2px'
        }
      }}>
        {messages.length === 1 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{
              color: COLORS.textMuted,
              fontSize: '0.75rem',
              mb: 1,
              display: 'block'
            }}>
              예시 질문들:
            </Typography>
            <Grid container spacing={1}>
              {examples.map((example, index) => (
                <Grid item xs={12} key={index}>
                  <Chip
                    label={example}
                    size="small"
                    onClick={() => handleExampleClick(example)}
                    sx={{
                      fontSize: '0.6875rem',
                      height: 'auto',
                      py: 0.5,
                      px: 1,
                      bgcolor: alpha(COLORS.accentPrimary, 0.1),
                      color: COLORS.accentPrimary,
                      border: `1px solid ${alpha(COLORS.accentPrimary, 0.3)}`,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(COLORS.accentPrimary, 0.2),
                      },
                      '& .MuiChip-label': {
                        whiteSpace: 'normal',
                        textAlign: 'left'
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <List sx={{ p: 0 }}>
          {messages.map((message, index) => (
            <ListItem key={message.id} sx={{
              display: 'flex',
              alignItems: 'flex-start',
              py: 1,
              px: 1,
              flexDirection: 'column'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                width: '100%',
                mb: message.queryResult ? 1 : 0
              }}>
                <Box sx={{
                  p: 0.5,
                  borderRadius: '50%',
                  bgcolor: message.type === 'user'
                    ? alpha(COLORS.success, 0.2)
                    : alpha(COLORS.accentPrimary, 0.2),
                  mt: 0.5
                }}>
                  {message.type === 'user' ? (
                    <PersonIcon sx={{ fontSize: '1rem', color: COLORS.success }} />
                  ) : (
                    <AIIcon sx={{ fontSize: '1rem', color: COLORS.accentPrimary }} />
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{
                    color: COLORS.textMuted,
                    fontSize: '0.625rem',
                    display: 'block',
                    mb: 0.5
                  }}>
                    {message.type === 'user' ? '사용자' : '트래비'} • {message.timestamp.toLocaleTimeString()}
                  </Typography>

                  <Paper sx={{
                    p: 1.5,
                    bgcolor: message.type === 'user'
                      ? alpha(COLORS.success, 0.1)
                      : alpha(COLORS.backgroundSurface, 0.8),
                    border: `1px solid ${message.type === 'user'
                      ? alpha(COLORS.success, 0.3)
                      : COLORS.borderSecondary}`,
                    borderRadius: 1
                  }}>
                    <Typography variant="body2" sx={{
                      color: COLORS.textPrimary,
                      fontSize: '0.8125rem',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {message.content}
                    </Typography>

                    {message.type === 'assistant' && message.queryResult?.sql && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                        <Tooltip title="SQL 복사">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(message.queryResult.sql)}
                            sx={{ color: COLORS.textMuted }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Paper>
                </Box>
              </Box>

              {message.queryResult && (
                <Box sx={{ width: '100%', mt: 1 }}>
                  <QueryResultDisplay data={message.queryResult} />
                </Box>
              )}
            </ListItem>
          ))}
        </List>

        {isLoading && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            color: COLORS.textSecondary
          }}>
            <CircularProgress size={16} />
            <Typography variant="caption">분석 중...</Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{
        p: 2,
        borderTop: `1px solid ${COLORS.borderPrimary}`,
        bgcolor: COLORS.backgroundSurface
      }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="데이터에 대해 궁금한 점을 물어보세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: COLORS.textPrimary,
                fontSize: '0.875rem',
                bgcolor: COLORS.backgroundCard,
                '& fieldset': {
                  borderColor: COLORS.borderSecondary,
                },
                '&:hover fieldset': {
                  borderColor: COLORS.accentPrimary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.accentPrimary,
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: COLORS.textMuted,
                opacity: 1,
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            sx={{
              bgcolor: COLORS.accentPrimary,
              color: 'white',
              '&:hover': {
                bgcolor: COLORS.accentSecondary,
              },
              '&:disabled': {
                bgcolor: COLORS.borderPrimary,
                color: COLORS.textMuted,
              }
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};