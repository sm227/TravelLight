import React, {useEffect, useState, useRef} from 'react';
import {Box, CircularProgress, Typography, Alert} from '@mui/material';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../services/AuthContext';
import {SsoProviderType} from '../types/auth';
import {GoogleAuthService} from '../services/googleAuth';

const AuthCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {ssoLogin} = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleGoogleCallback = async () => {
            try {
                const urlParams = new URLSearchParams(location.search);
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                const error = urlParams.get('error');

                if (error) {
                    setError(`구글 로그인 오류: ${error}`);
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                if (!code) {
                    setError('인증 코드를 받을 수 없습니다.');
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                if (!state || !GoogleAuthService.validateState(state)) {
                    setError('유효하지 않은 요청입니다.');
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                // 백엔드에 SSO 로그인 요청
                const redirectUri = `${window.location.origin}/auth/callback/google`;
                await ssoLogin(SsoProviderType.GOOGLE, code, redirectUri);

                // 로그인 성공 - 메인 페이지로 이동
                navigate('/');

            } catch (error) {
                console.error('구글 로그인 처리 중 오류:', error);
                setError('로그인 처리 중 오류가 발생했습니다.');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleGoogleCallback();
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#F8FAFC',
                p: 4
            }}
        >
            {error ? (
                <Alert severity="error" sx={{mb: 2, maxWidth: 400}}>
                    {error}
                </Alert>
            ) : (
                <>
                    <CircularProgress size={40}/>
                    <Typography sx={{mt: 2, color: '#6B7280'}}>
                        로그인 처리 중...
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default AuthCallback;