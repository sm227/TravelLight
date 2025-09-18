export enum SsoProviderType {
    GOOGLE = 'GOOGLE',
    KAKAO = 'KAKAO'
}

export interface SsoLoginRequest {
    providerType: SsoProviderType;
    authorizationCode: string;
    redirectUri: string;
}