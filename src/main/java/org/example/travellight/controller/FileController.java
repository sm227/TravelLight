package org.example.travellight.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @GetMapping("/**")
    public ResponseEntity<Resource> getFile(HttpServletRequest request) {
        try {
            // 요청 URI에서 파일 경로 추출
            String requestURI = request.getRequestURI();
            String filePath = requestURI.substring("/api/files/".length());

            logger.info("파일 요청: {}", filePath);

            // 파일 시스템에서 파일 찾기
            Path file = Paths.get(filePath).normalize().toAbsolutePath();

            // 보안을 위해 파일이 uploads 디렉토리 내에 있는지 확인
            if (!file.toString().contains("uploads")) {
                logger.error("허용되지 않은 파일 경로: {}", file);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Resource resource = new FileSystemResource(file);

            if (!resource.exists() || !resource.isReadable()) {
                logger.error("파일을 찾을 수 없음: {}", file);
                return ResponseEntity.notFound().build();
            }

            // 파일의 MIME 타입 결정
            String contentType;
            try {
                contentType = Files.probeContentType(file);
            } catch (IOException e) {
                contentType = null;
            }

            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            logger.info("파일 서빙 성공: {} ({})", filePath, contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFileName() + "\"")
                    .body(resource);

        } catch (Exception e) {
            logger.error("파일 읽기 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}