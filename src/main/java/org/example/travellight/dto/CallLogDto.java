package org.example.travellight.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.travellight.entity.CallStatus;
import org.example.travellight.entity.CallType;
import java.time.LocalDateTime;
import java.util.List;

public class CallLogDto {

    @Getter
    @Setter
    public static class CallLogCreateRequest {
        private Long deliveryId;
        private CallType callType;
        private String notes;
    }

    @Getter
    @Setter
    public static class CallLogResponse {
        private Long id;
        private Long deliveryId;
        private String trackingNumber;
        private Long driverId;
        private String driverName;
        private String customerPhoneNumber;
        private CallType callType;
        private CallStatus callStatus;
        private LocalDateTime callStartTime;
        private LocalDateTime callEndTime;
        private Integer duration; // seconds
        private String notes;
    }

    @Getter
    @Setter
    public static class CallLogEndRequest {
        private CallStatus callStatus;
        private String notes;
    }

    @Getter
    @Setter
    public static class CallLogListResponse {
        private List<CallLogResponse> callLogs;
        private Integer totalCount;
        private Integer page;
        private Integer pageSize;
        private Boolean hasNext;
    }

    @Getter
    @Setter
    public static class CallLogStatsResponse {
        private Integer totalCalls;
        private Integer successfulCalls;
        private Integer failedCalls;
        private Double averageCallDuration; // seconds
        private Double successRate; // percentage
        private Integer callsToday;
    }
}