package org.example.travellight.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SsoProviderType {
    GOOGLE("구글"),
    KAKAO("카카오");

    private final String description;
}