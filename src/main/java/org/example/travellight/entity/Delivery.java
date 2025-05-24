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

    // 연관관계 편의 메서드
    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
        if (reservation != null && !reservation.getDeliveries().contains(this)) {
            reservation.getDeliveries().add(this);
        }
    }
} 