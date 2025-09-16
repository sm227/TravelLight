package org.example.travellight.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "portone.secret")
public class PortOneProperties {
    private String api;
    // private String webhook;  // 웹훅 비활성화
}