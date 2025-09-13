package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.DriverDto;
import org.example.travellight.entity.*;
import org.example.travellight.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final DeliveryRepository deliveryRepository;
    private final DriverLocationRepository driverLocationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public DriverDto.DriverResponse login(DriverDto.DriverLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("배달원 정보를 찾을 수 없습니다."));

        return convertToDriverResponse(driver);
    }

    @Override
    @Transactional(readOnly = true)
    public DriverDto.DriverResponse getDriverProfile(Long driverId) {
        Driver driver = getDriverById(driverId);
        return convertToDriverResponse(driver);
    }

    @Override
    @Transactional(readOnly = true)
    public DriverDto.DriverResponse getDriverByUserId(Long userId) {
        Driver driver = getDriverByUserIdEntity(userId);
        return convertToDriverResponse(driver);
    }

    @Override
    public void updateDriverStatus(Long driverId, DriverStatus status) {
        Driver driver = getDriverById(driverId);
        driver.setStatus(status);
        driverRepository.save(driver);
    }

    @Override
    public void updateDriverLocation(Long driverId, DriverDto.DriverLocationUpdateRequest request) {
        Driver driver = getDriverById(driverId);
        driver.updateLocation(request.getLatitude(), request.getLongitude());
        driverRepository.save(driver);

        // 위치 히스토리 저장
        DriverLocation location = new DriverLocation();
        location.setDriver(driver);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setSpeed(request.getSpeed());
        location.setBearing(request.getBearing());
        location.setAccuracy(request.getAccuracy());
        location.setRecordedAt(LocalDateTime.now());
        driverLocationRepository.save(location);
    }

    @Override
    @Transactional(readOnly = true)
    public DriverDto.DriverStatsResponse getDriverStats(Long driverId) {
        Driver driver = getDriverById(driverId);

        Long totalDeliveries = deliveryRepository.countByDriverIdAndStatus(driverId, DeliveryStatus.DELIVERED);
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        Long todayDeliveries = deliveryRepository.countTodayDeliveriesByDriverId(driverId, startOfDay, endOfDay);

        DriverDto.DriverStatsResponse stats = new DriverDto.DriverStatsResponse();
        stats.setDriverId(driverId);
        stats.setDriverName(driver.getUser().getName());
        stats.setTotalDeliveries(totalDeliveries.intValue());
        stats.setCompletedDeliveries(totalDeliveries.intValue());
        stats.setTodayDeliveries(todayDeliveries.intValue());
        stats.setTotalEarnings(0.0); // 수익 계산 로직 추가 필요
        stats.setTodayEarnings(0.0);
        stats.setAverageRating(0.0); // 평점 시스템 연동 필요
        stats.setOnlineHours(0); // 온라인 시간 계산 로직 추가 필요
        stats.setLastActiveAt(driver.getLastLocationUpdate());

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverDto.DriverListResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::convertToDriverListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverDto.DriverListResponse> getDriversByStatus(DriverStatus status) {
        return driverRepository.findByStatus(status).stream()
                .map(this::convertToDriverListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverDto.DriverListResponse> getOnlineDrivers() {
        return driverRepository.findByStatus(DriverStatus.ONLINE).stream()
                .map(this::convertToDriverListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverDto.DriverListResponse> getNearbyDrivers(Double latitude, Double longitude, Double radiusKm) {
        double radiusSquared = radiusKm * radiusKm;
        return driverRepository.findNearbyDrivers(latitude, longitude, radiusSquared, DriverStatus.ONLINE)
                .stream()
                .map(this::convertToDriverListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Driver createDriver(Long userId, String licenseNumber, String vehicleType,
                              String vehicleNumber, String phoneNumber) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (driverRepository.existsByLicenseNumber(licenseNumber)) {
            throw new RuntimeException("이미 등록된 면허번호입니다.");
        }

        if (driverRepository.existsByVehicleNumber(vehicleNumber)) {
            throw new RuntimeException("이미 등록된 차량번호입니다.");
        }

        Driver driver = new Driver();
        driver.setUser(user);
        driver.setLicenseNumber(licenseNumber);
        driver.setVehicleType(vehicleType);
        driver.setVehicleNumber(vehicleNumber);
        driver.setPhoneNumber(phoneNumber);
        driver.setStatus(DriverStatus.OFFLINE);

        return driverRepository.save(driver);
    }

    @Override
    @Transactional(readOnly = true)
    public Driver getDriverById(Long driverId) {
        return driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("배달원을 찾을 수 없습니다."));
    }

    @Override
    @Transactional(readOnly = true)
    public Driver getDriverByUserIdEntity(Long userId) {
        return driverRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("해당 사용자의 배달원 정보를 찾을 수 없습니다."));
    }

    @Override
    @Transactional(readOnly = true)
    public Long getDriverCountByStatus(DriverStatus status) {
        return driverRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Driver> getActiveDrivers() {
        LocalDateTime since = LocalDateTime.now().minusHours(1);
        return driverRepository.findActiveDriversSince(
                List.of(DriverStatus.ONLINE, DriverStatus.BUSY), since);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Driver> getDriversWithActiveDeliveries() {
        return driverRepository.findDriversWithActiveDeliveries();
    }

    private DriverDto.DriverResponse convertToDriverResponse(Driver driver) {
        DriverDto.DriverResponse response = new DriverDto.DriverResponse();
        response.setId(driver.getId());
        response.setUserId(driver.getUser().getId());
        response.setName(driver.getUser().getName());
        response.setEmail(driver.getUser().getEmail());
        response.setLicenseNumber(driver.getLicenseNumber());
        response.setVehicleType(driver.getVehicleType());
        response.setVehicleNumber(driver.getVehicleNumber());
        response.setStatus(driver.getStatus());
        response.setCurrentLatitude(driver.getCurrentLatitude());
        response.setCurrentLongitude(driver.getCurrentLongitude());
        response.setPhoneNumber(driver.getPhoneNumber());
        response.setLastLocationUpdate(driver.getLastLocationUpdate());
        response.setCreatedAt(driver.getCreatedAt());
        return response;
    }

    private DriverDto.DriverListResponse convertToDriverListResponse(Driver driver) {
        DriverDto.DriverListResponse response = new DriverDto.DriverListResponse();
        response.setId(driver.getId());
        response.setName(driver.getUser().getName());
        response.setVehicleType(driver.getVehicleType());
        response.setVehicleNumber(driver.getVehicleNumber());
        response.setStatus(driver.getStatus());
        response.setCurrentLatitude(driver.getCurrentLatitude());
        response.setCurrentLongitude(driver.getCurrentLongitude());
        response.setLastLocationUpdate(driver.getLastLocationUpdate());

        // 활성 배달 건수 계산
        long activeDeliveries = deliveryRepository.countByDriverIdAndStatus(driver.getId(), DeliveryStatus.IN_PROGRESS);
        response.setActiveDeliveries((int) activeDeliveries);

        return response;
    }
}