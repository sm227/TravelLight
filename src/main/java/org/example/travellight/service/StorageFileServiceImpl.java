package org.example.travellight.service;

import org.example.travellight.dto.StorageItemDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class StorageFileServiceImpl implements StorageFileService {

    private static final Logger logger = LoggerFactory.getLogger(StorageFileServiceImpl.class);

    private static final String UPLOAD_DIR = "uploads/storage-photos";
    private static final String THUMBNAIL_DIR = "uploads/storage-photos/thumbnails";
    private static final int THUMBNAIL_WIDTH = 200;
    private static final int THUMBNAIL_HEIGHT = 200;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @Override
    public StorageItemDto.PhotoUploadResponse uploadPhoto(MultipartFile file, String reservationNumber) {
        logger.info("이미지 파일 업로드 시작: reservationNumber = {}, fileName = {}",
                   reservationNumber, file.getOriginalFilename());

        try {
            // 파일 검증
            validateFile(file);

            // 파일명 생성
            String fileName = generateFileName(file.getOriginalFilename(), reservationNumber);
            String filePath = saveFile(file, fileName);

            // 썸네일 생성
            String thumbnailPath = createThumbnail(filePath);

            logger.info("이미지 파일 업로드 성공: filePath = {}", filePath);

            return StorageItemDto.PhotoUploadResponse.builder()
                    .fileName(fileName)
                    .filePath(filePath)
                    .thumbnailPath(thumbnailPath)
                    .fileSize(file.getSize())
                    .build();

        } catch (Exception e) {
            logger.error("이미지 파일 업로드 실패: reservationNumber = {}", reservationNumber, e);
            throw new RuntimeException("이미지 업로드 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Override
    public void deletePhoto(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
                logger.info("이미지 파일 삭제 성공: {}", filePath);

                // 썸네일도 삭제
                String thumbnailPath = filePath.replace(UPLOAD_DIR, THUMBNAIL_DIR);
                Path thumbnailFilePath = Paths.get(thumbnailPath);
                if (Files.exists(thumbnailFilePath)) {
                    Files.delete(thumbnailFilePath);
                    logger.info("썸네일 파일 삭제 성공: {}", thumbnailPath);
                }
            }
        } catch (Exception e) {
            logger.error("이미지 파일 삭제 실패: {}", filePath, e);
        }
    }

    @Override
    public String createThumbnail(String originalPath) {
        try {
            // 원본 이미지 읽기
            BufferedImage originalImage = ImageIO.read(new File(originalPath));
            if (originalImage == null) {
                logger.warn("이미지를 읽을 수 없습니다: {}", originalPath);
                return null;
            }

            // 썸네일 크기 계산 (비율 유지)
            Dimension thumbnailSize = calculateThumbnailSize(originalImage.getWidth(), originalImage.getHeight());

            // 썸네일 이미지 생성
            BufferedImage thumbnailImage = new BufferedImage(
                    thumbnailSize.width, thumbnailSize.height, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = thumbnailImage.createGraphics();

            // 고품질 스케일링 설정
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            g2d.drawImage(originalImage, 0, 0, thumbnailSize.width, thumbnailSize.height, null);
            g2d.dispose();

            // 썸네일 파일 경로 생성
            String thumbnailPath = originalPath.replace(UPLOAD_DIR, THUMBNAIL_DIR);
            createDirectoryIfNotExists(THUMBNAIL_DIR);

            // 썸네일 저장
            File thumbnailFile = new File(thumbnailPath);
            ImageIO.write(thumbnailImage, "jpg", thumbnailFile);

            logger.info("썸네일 생성 성공: {}", thumbnailPath);
            return thumbnailPath;

        } catch (Exception e) {
            logger.error("썸네일 생성 실패: {}", originalPath, e);
            return null;
        }
    }

    @Override
    public void deleteAllPhotosOfReservation(String reservationNumber) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (Files.exists(uploadPath)) {
                Files.walk(uploadPath)
                        .filter(Files::isRegularFile)
                        .filter(path -> path.getFileName().toString().contains(reservationNumber))
                        .forEach(path -> {
                            try {
                                deletePhoto(path.toString());
                            } catch (Exception e) {
                                logger.error("파일 삭제 실패: {}", path, e);
                            }
                        });
            }
        } catch (Exception e) {
            logger.error("예약 관련 모든 사진 삭제 실패: reservationNumber = {}", reservationNumber, e);
        }
    }

    @Override
    public boolean isValidImagePath(String path) {
        if (path == null || path.trim().isEmpty()) {
            return false;
        }

        String lowerPath = path.toLowerCase();
        return lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg") ||
               lowerPath.endsWith(".png") || lowerPath.endsWith(".gif");
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }
    }

    private String generateFileName(String originalFileName, String reservationNumber) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String extension = getFileExtension(originalFileName);

        return String.format("%s_%s_%s%s", reservationNumber, timestamp, uuid, extension);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return ".jpg";
        }
        return fileName.substring(fileName.lastIndexOf('.'));
    }

    private String saveFile(MultipartFile file, String fileName) throws IOException {
        createDirectoryIfNotExists(UPLOAD_DIR);

        Path filePath = Paths.get(UPLOAD_DIR, fileName);
        Files.copy(file.getInputStream(), filePath);

        return filePath.toString();
    }

    private void createDirectoryIfNotExists(String directory) throws IOException {
        Path dirPath = Paths.get(directory);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }
    }

    private Dimension calculateThumbnailSize(int originalWidth, int originalHeight) {
        double aspectRatio = (double) originalWidth / originalHeight;

        int thumbnailWidth, thumbnailHeight;

        if (aspectRatio > 1) {
            // 가로가 더 긴 경우
            thumbnailWidth = THUMBNAIL_WIDTH;
            thumbnailHeight = (int) (THUMBNAIL_WIDTH / aspectRatio);
        } else {
            // 세로가 더 긴 경우
            thumbnailHeight = THUMBNAIL_HEIGHT;
            thumbnailWidth = (int) (THUMBNAIL_HEIGHT * aspectRatio);
        }

        return new Dimension(thumbnailWidth, thumbnailHeight);
    }
}