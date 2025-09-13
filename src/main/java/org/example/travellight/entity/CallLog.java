package org.example.travellight.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "call_logs")
public class CallLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(nullable = false)
    private String customerPhoneNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CallType callType;

    @Column(nullable = false)
    private LocalDateTime callStartTime;

    @Column
    private LocalDateTime callEndTime;

    @Column
    private Integer duration; // 통화 시간 (초 단위)

    @Column
    private String notes; // 통화 메모

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CallStatus callStatus;

    @PrePersist
    protected void onCreate() {
        if (callStartTime == null) {
            callStartTime = LocalDateTime.now();
        }
        if (callStatus == null) {
            callStatus = CallStatus.INITIATED;
        }
    }

    // 통화 종료 처리
    public void endCall() {
        this.callEndTime = LocalDateTime.now();
        this.callStatus = CallStatus.COMPLETED;

        if (callStartTime != null && callEndTime != null) {
            this.duration = (int) java.time.Duration.between(callStartTime, callEndTime).getSeconds();
        }
    }
}