package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "deliveries")
public class Delivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(nullable = false)
    private String pickupAddress;

    @Column(nullable = false)
    private String deliveryAddress;

    @Column(nullable = false)
    private String itemDescription;

    @Column(nullable = false)
    private Double weight;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    @Column
    private String trackingNumber;

    @Column
    private LocalDateTime estimatedDeliveryTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Column
    private LocalDateTime assignedAt;

    @Column
    private LocalDateTime pickedUpAt;

    @Column
    private LocalDateTime deliveredAt;

    @Column
    private String deliveryNotes;

    @Column
    private String customerPhoneNumber;

    @Column
    private Double deliveryLatitude;

    @Column
    private Double deliveryLongitude;

    @Column
    private Double pickupLatitude;

    @Column
    private Double pickupLongitude;

    // 연관관계 편의 메서드
    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
        if (reservation != null && !reservation.getDeliveries().contains(this)) {
            reservation.getDeliveries().add(this);
        }
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
        if (driver != null && !driver.getDeliveries().contains(this)) {
            driver.getDeliveries().add(this);
        }
    }

    // 배달원 배정
    public void assignToDriver(Driver driver) {
        this.driver = driver;
        this.assignedAt = LocalDateTime.now();
        this.status = DeliveryStatus.ACCEPTED;
    }

    // 픽업 완료
    public void markAsPickedUp() {
        this.pickedUpAt = LocalDateTime.now();
        this.status = DeliveryStatus.PICKED_UP;
    }

    // 배달 완료
    public void markAsDelivered() {
        this.deliveredAt = LocalDateTime.now();
        this.status = DeliveryStatus.DELIVERED;
    }
} 