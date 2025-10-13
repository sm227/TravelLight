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
    @Builder.Default
    private String status = "RESERVED"; // RESERVED, COMPLETED, CANCELLED
    
    @Column(name = "payment_id")
    private String paymentId; // 포트원 결제 ID
    
    @Column(name = "payment_method")
    private String paymentMethod; // 결제 방법 (card, paypal)
    
    @Column(name = "payment_amount")
    private Integer paymentAmount; // 결제 금액
    
    @Column(name = "payment_time")
    private LocalDateTime paymentTime; // 결제 시간
    
    @Column(name = "payment_status")
    private String paymentStatus; // 결제 상태 (PAID, FAILED, CANCELLED, REFUNDED)
    
    @Column(name = "payment_provider")
    private String paymentProvider; // 결제 제공자 (portone, paypal, tosspayments 등)
    
    @Column(name = "card_company")
    private String cardCompany; // 카드사명 (신한, 삼성, 현대 등)
    
    @Column(name = "card_type")
    private String cardType; // 카드 타입 (신용카드, 체크카드, 할부카드 등)
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Delivery> deliveries = new ArrayList<>();
    
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();
    
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

    public void addReview(Review review) {
        reviews.add(review);
        review.setReservation(this);
    }

    public void removeReview(Review review) {
        reviews.remove(review);
        review.setReservation(null);
    }

    public void addPayment(Payment payment) {
        payments.add(payment);
        payment.setReservation(this);
    }

    public void removePayment(Payment payment) {
        payments.remove(payment);
        payment.setReservation(null);
    }

    // 리뷰 작성 가능 여부 확인 (서비스 완료 상태일 때만 가능)
    public boolean canWriteReview() {
        return "COMPLETED".equals(this.status);
    }
} 