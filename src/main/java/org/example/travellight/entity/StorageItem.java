package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "storage_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorageItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(name = "storage_code", nullable = false, unique = true, length = 50)
    private String storageCode; // QR코드용 고유 식별코드

    @ElementCollection
    @CollectionTable(name = "storage_item_photos",
                    joinColumns = @JoinColumn(name = "storage_item_id"))
    @Column(name = "photo_path")
    @Builder.Default
    private List<String> bagPhotos = new ArrayList<>(); // 짐 사진 경로들

    @Column(name = "actual_small_bags")
    private Integer actualSmallBags; // 실제 맡긴 소형 가방 수

    @Column(name = "actual_medium_bags")
    private Integer actualMediumBags; // 실제 맡긴 중형 가방 수

    @Column(name = "actual_large_bags")
    private Integer actualLargeBags; // 실제 맡긴 대형 가방 수

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime; // 입고 시간

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime; // 출고 시간

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "STORED"; // STORED, RETRIEVED

    @Column(name = "staff_notes", length = 500)
    private String staffNotes; // 직원 메모

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (checkInTime == null) {
            checkInTime = LocalDateTime.now();
        }
        if (status == null) {
            status = "STORED";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 연관관계 편의 메서드
    public void addBagPhoto(String photoPath) {
        if (bagPhotos == null) {
            bagPhotos = new ArrayList<>();
        }
        bagPhotos.add(photoPath);
    }

    // 출고 처리
    public void checkOut() {
        this.status = "RETRIEVED";
        this.checkOutTime = LocalDateTime.now();
    }

    // 총 가방 수 계산
    public int getTotalBags() {
        int small = actualSmallBags != null ? actualSmallBags : 0;
        int medium = actualMediumBags != null ? actualMediumBags : 0;
        int large = actualLargeBags != null ? actualLargeBags : 0;
        return small + medium + large;
    }

    // 보관 중인지 확인
    public boolean isStored() {
        return "STORED".equals(this.status);
    }

    // 출고 완료된지 확인
    public boolean isRetrieved() {
        return "RETRIEVED".equals(this.status);
    }
}