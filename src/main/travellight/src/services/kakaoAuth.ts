export class KakaoAuthService {
    private static readonly CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID || 'your_kakao_client_id';
    private static readonly SCOPE = 'profile_nickname account_email';

    static getAuthUrl(redirectUri: string): string {
        const state = this.generateState();

        // state를 로컬스토리지에 저장 (검증용)
        localStorage.setItem('oauth_state', state);

        const params = new URLSearchParams({
            client_id: this.CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: this.SCOPE,
            state: state
        });

        return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
    }

    static redirectToKakaoAuth(): void {
        const redirectUri = `${window.location.origin}/auth/callback/kakao`;
        const authUrl = this.getAuthUrl(redirectUri);

        // 카카오 인증 페이지로 리다이렉트
        window.location.href = authUrl;
    }

    static validateState(receivedState: string): boolean {
        const savedState = localStorage.getItem('oauth_state');

        if (savedState === receivedState) {
            localStorage.removeItem('oauth_state'); // 검증 성공 후에만 제거
            return true;
        }

        return false;
    }

    private static generateState(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}