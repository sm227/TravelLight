package org.example.travellight.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * spring.mail.enabled=false일 때 
 * 스프링 부트의 MailSenderAutoConfiguration을 비활성화합니다.
 */
@Configuration
@ConditionalOnProperty(name = "spring.mail.enabled", havingValue = "false")
@AutoConfigureBefore(MailSenderAutoConfiguration.class)
public class MailAutoConfiguration {
    
    private static final Logger logger = LoggerFactory.getLogger(MailAutoConfiguration.class);
    
    @PostConstruct
    public void init() {
        logger.info("MailAutoConfiguration activated: 이메일 기능이 비활성화되었습니다.");
    }
} 