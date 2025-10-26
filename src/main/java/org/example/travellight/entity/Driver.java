package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "drivers")
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String licenseNumber;

    @Column(nullable = false)
    private String vehicleType;

    @Column(nullable = false)
    private String vehicleNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DriverStatus status;

    @Column
    private Double currentLatitude;

    @Column
    private Double currentLongitude;

    @Column
    private String phoneNumber;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column
    private LocalDateTime lastLocationUpdate;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    // 배달 내역과의 연관관계
    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Delivery> deliveries = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = DriverStatus.OFFLINE;
        }
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 현재 위치 업데이트
    public void updateLocation(Double latitude, Double longitude) {
        this.currentLatitude = latitude;
        this.currentLongitude = longitude;
        this.lastLocationUpdate = LocalDateTime.now();
    }

    // 출퇴근 상태 변경
    public void updateStatus(DriverStatus status) {
        this.status = status;
    }

    // 비활성화
    public void deactivate() {
        this.isActive = false;
        this.status = DriverStatus.OFFLINE; // 비활성화 시 오프라인으로 변경
    }

    // 활성화
    public void activate() {
        this.isActive = true;
    }
}