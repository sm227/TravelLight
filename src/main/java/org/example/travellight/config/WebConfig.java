package org.example.travellight.config;

import lombok.RequiredArgsConstructor;
import org.example.travellight.interceptor.UserActivityInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final UserActivityInterceptor userActivityInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(userActivityInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/login",  // 로그인은 컨트롤러에서 직접 처리
                        "/api/auth/register",
                        "/swagger-ui/**",
                        "/api-docs/**"
                );
    }

//     @Override
//     public void addCorsMappings(CorsRegistry registry) {
//         registry.addMapping("/**")
//                 .allowedOrigins("http://localhost:5173","http://52.79.53.239:5173","https://travelight.co.kr","http://1.236.13.63:5173")
//                 .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//                 .allowedHeaders("*")
//                 .allowCredentials(true)
//                 .maxAge(3600);
//     }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // API 경로가 static resource로 처리되지 않도록 명시적으로 설정
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        
        // 기본 static resource 처리 (API 경로 제외)
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
                
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
    }
} 