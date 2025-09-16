package org.example.travellight.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class RequestUtils {

    /**
     * 현재 HTTP 요청에서 클라이언트 IP 주소를 추출
     */
    public static String getClientIp() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        if (attributes == null) {
            return "unknown";
        }

        HttpServletRequest request = attributes.getRequest();
        return getClientIp(request);
    }

    /**
     * HttpServletRequest에서 클라이언트 IP 주소를 추출
     */
    public static String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

        String clientIP = null;

        // 프록시를 통해 전달된 경우 확인
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            clientIP = xForwardedFor.split(",")[0].trim();
        }

        // Proxy-Client-IP 헤더 확인
        if (clientIP == null || clientIP.isEmpty() || "unknown".equalsIgnoreCase(clientIP)) {
            clientIP = request.getHeader("Proxy-Client-IP");
        }

        // WL-Proxy-Client-IP 헤더 확인
        if (clientIP == null || clientIP.isEmpty() || "unknown".equalsIgnoreCase(clientIP)) {
            clientIP = request.getHeader("WL-Proxy-Client-IP");
        }

        // HTTP_CLIENT_IP 헤더 확인
        if (clientIP == null || clientIP.isEmpty() || "unknown".equalsIgnoreCase(clientIP)) {
            clientIP = request.getHeader("HTTP_CLIENT_IP");
        }

        // HTTP_X_FORWARDED_FOR 헤더 확인
        if (clientIP == null || clientIP.isEmpty() || "unknown".equalsIgnoreCase(clientIP)) {
            clientIP = request.getHeader("HTTP_X_FORWARDED_FOR");
        }

        // 마지막으로 직접 연결된 IP 확인
        if (clientIP == null || clientIP.isEmpty() || "unknown".equalsIgnoreCase(clientIP)) {
            clientIP = request.getRemoteAddr();
        }

        return clientIP != null ? clientIP : "unknown";
    }
}