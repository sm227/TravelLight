package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.RiderDto;
import org.example.travellight.dto.TokenResponse;
import org.example.travellight.entity.*;
import org.example.travellight.exception.CustomException;
import org.example.travellight.repository.DriverRepository;
import org.example.travellight.repository.RiderApplicationRepository;
import org.example.travellight.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiderServiceImpl implements RiderService {

    private final UserRepository userRepository;
    private final RiderApplicationRepository riderApplicationRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserJwtService userJwtService;

    @Override
    @Transactional
    public RiderDto.RiderApplicationResponse register(RiderDto.RiderRegisterRequest request) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("이미 사용 중인 이메일입니다.", HttpStatus.BAD_REQUEST);
        }

        // User 생성 (WAIT 상태)
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.WAIT)
                .build();
        user = userRepository.save(user);

        // RiderApplication 생성
        RiderApplication application = RiderApplication.builder()
                .user(user)
                .phoneNumber(request.getPhoneNumber())
                .vehicleNumber(request.getVehicleNumber())
                .licenseNumber(request.getLicenseNumber())
                .status(RiderApplicationStatus.PENDING)
                .build();
        application = riderApplicationRepository.save(application);

        log.info("라이더 회원가입 완료 - 사용자 ID: {}, 이메일: {}", user.getId(), user.getEmail());

        return convertToApplicationResponse(application);
    }

    @Override
    @Transactional
    public RiderDto.RiderLoginResponse login(RiderDto.RiderLoginRequest request) {
        // 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("이메일 또는 비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED));

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException("이메일 또는 비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED);
        }

        // Driver 레코드 확인 (승인된 라이더만 로그인 가능)
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException("승인되지 않은 라이더입니다. 관리자의 승인을 기다려주세요.", HttpStatus.FORBIDDEN));

        // JWT 토큰 생성
        TokenResponse tokens = userJwtService.generateTokens(user.getId());

        log.info("라이더 로그인 성공 - 사용자 ID: {}, 이메일: {}", user.getId(), user.getEmail());

        return RiderDto.RiderLoginResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .driverId(driver.getId())
                .vehicleNumber(driver.getVehicleNumber())
                .phoneNumber(driver.getPhoneNumber())
                .driverStatus(driver.getStatus())
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RiderDto.RiderApplicationResponse getApplicationStatus(Long userId) {
        RiderApplication application = riderApplicationRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("신청 내역을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        return convertToApplicationResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RiderDto.RiderApplicationResponse> getAllApplications() {
        return riderApplicationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RiderDto.RiderApplicationResponse> getApplicationsByStatus(RiderApplicationStatus status) {
        return riderApplicationRepository.findByStatus(status).stream()
                .map(this::convertToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RiderDto.RiderApplicationResponse approveApplication(Long applicationId) {
        RiderApplication application = riderApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException("신청 내역을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        // 이미 승인된 경우
        if (application.getStatus() == RiderApplicationStatus.APPROVED) {
            throw new CustomException("이미 승인된 신청입니다.", HttpStatus.BAD_REQUEST);
        }

        User user = application.getUser();

        // Driver 레코드가 이미 존재하는지 확인
        if (driverRepository.findByUserId(user.getId()).isPresent()) {
            throw new CustomException("이미 Driver 레코드가 존재합니다.", HttpStatus.BAD_REQUEST);
        }

        // Driver 생성
        Driver driver = new Driver();
        driver.setUser(user);
        driver.setLicenseNumber(application.getLicenseNumber() != null ? application.getLicenseNumber() : "미등록");
        driver.setVehicleType("자동차"); // 고정값
        driver.setVehicleNumber(application.getVehicleNumber());
        driver.setPhoneNumber(application.getPhoneNumber());
        driver.setStatus(DriverStatus.OFFLINE);
        driverRepository.save(driver);

        // User Role 변경 (WAIT -> USER)
        user.setRole(Role.USER);
        userRepository.save(user);

        // Application 상태 변경
        application.approve();
        application = riderApplicationRepository.save(application);

        log.info("라이더 신청 승인 완료 - 신청 ID: {}, 사용자 ID: {}", applicationId, user.getId());

        return convertToApplicationResponse(application);
    }

    @Override
    @Transactional
    public RiderDto.RiderApplicationResponse rejectApplication(Long applicationId, String rejectionReason) {
        RiderApplication application = riderApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException("신청 내역을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        // 이미 거절된 경우
        if (application.getStatus() == RiderApplicationStatus.REJECTED) {
            throw new CustomException("이미 거절된 신청입니다.", HttpStatus.BAD_REQUEST);
        }

        // Application 상태 변경
        application.reject(rejectionReason);
        application = riderApplicationRepository.save(application);

        log.info("라이더 신청 거절 완료 - 신청 ID: {}, 사유: {}", applicationId, rejectionReason);

        return convertToApplicationResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public RiderDto.RiderApplicationResponse getApplicationById(Long applicationId) {
        RiderApplication application = riderApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException("신청 내역을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        return convertToApplicationResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RiderDto.RiderResponse> getApprovedRiders() {
        List<Driver> drivers = driverRepository.findAll();

        return drivers.stream()
                .map(this::convertToRiderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RiderDto.RiderStats getRiderStats() {
        List<Driver> drivers = driverRepository.findAll();

        long totalRiders = drivers.size();
        long onlineRiders = drivers.stream()
                .filter(driver -> driver.getStatus() == DriverStatus.ONLINE && Boolean.TRUE.equals(driver.getIsActive()))
                .count();
        long offlineRiders = drivers.stream()
                .filter(driver -> driver.getStatus() == DriverStatus.OFFLINE && Boolean.TRUE.equals(driver.getIsActive()))
                .count();
        long inactiveRiders = drivers.stream()
                .filter(driver -> Boolean.FALSE.equals(driver.getIsActive()))
                .count();

        return RiderDto.RiderStats.builder()
                .totalRiders(totalRiders)
                .onlineRiders(onlineRiders)
                .offlineRiders(offlineRiders)
                .inactiveRiders(inactiveRiders)
                .build();
    }

    @Override
    @Transactional
    public RiderDto.RiderResponse updateDriverStatus(Long driverId, DriverStatus status) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new CustomException("라이더를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        // 비활성 라이더는 상태 변경 불가
        if (Boolean.FALSE.equals(driver.getIsActive())) {
            throw new CustomException("비활성화된 라이더는 출퇴근 상태를 변경할 수 없습니다.", HttpStatus.BAD_REQUEST);
        }

        driver.updateStatus(status);
        driver = driverRepository.save(driver);

        log.info("라이더 출퇴근 상태 변경 - 드라이버 ID: {}, 상태: {}", driverId, status);

        return convertToRiderResponse(driver);
    }

    @Override
    @Transactional
    public RiderDto.RiderResponse deactivateDriver(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new CustomException("라이더를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        // 이미 비활성화된 경우
        if (Boolean.FALSE.equals(driver.getIsActive())) {
            throw new CustomException("이미 비활성화된 라이더입니다.", HttpStatus.BAD_REQUEST);
        }

        driver.deactivate();
        driver = driverRepository.save(driver);

        log.info("라이더 비활성화 완료 - 드라이버 ID: {}", driverId);

        return convertToRiderResponse(driver);
    }

    @Override
    @Transactional
    public RiderDto.RiderResponse activateDriver(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new CustomException("라이더를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        // 이미 활성화된 경우
        if (Boolean.TRUE.equals(driver.getIsActive())) {
            throw new CustomException("이미 활성화된 라이더입니다.", HttpStatus.BAD_REQUEST);
        }

        driver.activate();
        driver = driverRepository.save(driver);

        log.info("라이더 활성화 완료 - 드라이버 ID: {}", driverId);

        return convertToRiderResponse(driver);
    }

    // DTO 변환 메서드
    private RiderDto.RiderApplicationResponse convertToApplicationResponse(RiderApplication application) {
        return RiderDto.RiderApplicationResponse.builder()
                .id(application.getId())
                .userId(application.getUser().getId())
                .userName(application.getUser().getName())
                .userEmail(application.getUser().getEmail())
                .phoneNumber(application.getPhoneNumber())
                .vehicleNumber(application.getVehicleNumber())
                .licenseNumber(application.getLicenseNumber())
                .status(application.getStatus())
                .rejectionReason(application.getRejectionReason())
                .approvedAt(application.getApprovedAt())
                .rejectedAt(application.getRejectedAt())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }

    private RiderDto.RiderResponse convertToRiderResponse(Driver driver) {
        return RiderDto.RiderResponse.builder()
                .id(driver.getId())
                .userId(driver.getUser().getId())
                .userName(driver.getUser().getName())
                .userEmail(driver.getUser().getEmail())
                .phoneNumber(driver.getPhoneNumber())
                .vehicleNumber(driver.getVehicleNumber())
                .licenseNumber(driver.getLicenseNumber())
                .status(driver.getStatus())
                .isActive(driver.getIsActive())
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }
}
