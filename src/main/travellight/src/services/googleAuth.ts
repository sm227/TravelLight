export class GoogleAuthService {
    private static readonly CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '735762277920-tg4beceni06gador3r06mhr9e0hmdm7m.apps.googleusercontent.com';
    private static readonly SCOPE = 'openid email profile';

    static getAuthUrl(redirectUri: string): string {
        const state = this.generateState();

        // state를 로컬스토리지에 저장 (검증용)
        localStorage.setItem('oauth_state', state);

        const params = new URLSearchParams({
            client_id: this.CLIENT_ID,
            redirect_uri: redirectUri,
            scope: this.SCOPE,
            response_type: 'code',
            access_type: 'offline',
            state: state
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    static redirectToGoogleAuth(): void {
        const redirectUri = `${window.location.origin}/auth/callback/google`;
        const authUrl = this.getAuthUrl(redirectUri);

        // 구글 인증 페이지로 리다이렉트
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