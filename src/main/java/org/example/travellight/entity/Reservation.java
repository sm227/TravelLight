package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String placeName;
    
    @Column(nullable = false)
    private String placeAddress;
    
    @Column(name = "reservation_number", nullable = false, unique = true)
    private String reservationNumber;
    
    @Column(name = "storage_date", nullable = false)
    private LocalDate storageDate;
    
    @Column(name = "storage_end_date")
    private LocalDate storageEndDate;
    
    @Column(name = "storage_start_time", nullable = false)
    private LocalTime storageStartTime;
    
    @Column(name = "storage_end_time", nullable = false)
    private LocalTime storageEndTime;
    
    @Column(name = "small_bags")
    private Integer smallBags;
    
    @Column(name = "medium_bags")
    private Integer mediumBags;
    
    @Column(name = "large_bags")
    private Integer largeBags;
    
    @Column(name = "total_price", nullable = false)
    private Integer totalPrice;
    
    @Column(name = "storage_type", nullable = false)
    private String storageType; // "day" 또는 "period"
    
    @Column(name = "status", nullable = false)
    private String status = "RESERVED"; // RESERVED, COMPLETED, CANCELLED
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Delivery> deliveries = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "RESERVED";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 연관관계 편의 메서드
    public void addDelivery(Delivery delivery) {
        deliveries.add(delivery);
        delivery.setReservation(this);
    }

    public void removeDelivery(Delivery delivery) {
        deliveries.remove(delivery);
        delivery.setReservation(null);
    }
} 