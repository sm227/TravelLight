import React, {useEffect, useState} from 'react';
import {Alert, Box, CircularProgress, Typography} from '@mui/material';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../services/AuthContext';
import {SsoProviderType} from '../types/auth';
import {GoogleAuthService} from '../services/googleAuth';
import {KakaoAuthService} from '../services/kakaoAuth';

const AuthCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {ssoLogin} = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const urlParams = new URLSearchParams(location.search);
                const code = urlParams.get('code');
                const state = urlParams.get('state');
                const error = urlParams.get('error');
                const currentPath = location.pathname;

                if (error) {
                    const provider = currentPath.includes('google') ? '구글' : '카카오';
                    setError(`${provider} 로그인 오류: ${error}`);
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                if (!code) {
                    setError('인증 코드를 받을 수 없습니다.');
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                let providerType: SsoProviderType;
                let redirectUri: string;
                let isValidState: boolean;

                if (currentPath.includes('google')) {
                    providerType = SsoProviderType.GOOGLE;
                    redirectUri = `${window.location.origin}/auth/callback/google`;
                    isValidState = GoogleAuthService.validateState(state || '');
                } else if (currentPath.includes('kakao')) {
                    providerType = SsoProviderType.KAKAO;
                    redirectUri = `${window.location.origin}/auth/callback/kakao`;
                    isValidState = KakaoAuthService.validateState(state || '');
                } else {
                    setError('지원하지 않는 로그인 방식입니다.');
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                if (!state || !isValidState) {
                    setError('유효하지 않은 요청입니다.');
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }

                // 백엔드에 SSO 로그인 요청
                await ssoLogin(providerType, code, redirectUri);

                // 로그인 성공 - 메인 페이지로 이동
                navigate('/');

            } catch (error) {
                console.error('소셜 로그인 처리 중 오류:', error);
                setError('로그인 처리 중 오류가 발생했습니다.');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleAuthCallback();
    }, [location]);

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