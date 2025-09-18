package org.example.travellight.service.sso;

import org.example.travellight.dto.SsoUserInfoDto;

public interface AbstractSsoProviderService {

    String getAccessToken(String authorizationCode, String redirectUri);

    SsoUserInfoDto getUserInfo(String accessToken);

}