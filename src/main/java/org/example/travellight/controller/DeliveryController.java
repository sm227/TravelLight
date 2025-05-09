package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.ApiResponse;
import org.example.travellight.dto.DeliveryDto;
import org.example.travellight.dto.UserDto;
import org.example.travellight.entity.Delivery;
import org.example.travellight.entity.DeliveryStatus;
import org.example.travellight.entity.User;
import org.example.travellight.service.DeliveryService;
import org.example.travellight.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Slf4j
@Tag(name = "배달 관리", description = "배달 신청 및 상태 관리 API")
@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final UserService userService;

    @Operation(summary = "배달 신청", description = "새로운 배달을 신청합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "배달 신청 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping
    public ResponseEntity<ApiResponse<DeliveryDto.DeliveryResponse>> createDelivery(
            @Parameter(description = "배달 신청 정보", required = true)
            @RequestBody DeliveryDto.DeliveryRequest request) {
        log.info("배달 신청 요청 - 사용자 ID: {}", request.getUserId());
        
        Delivery delivery = new Delivery();
        UserDto.UserResponse userResponse = userService.getUserById(request.getUserId());
        
        // User 엔티티 생성
        User user = new User();
        user.setId(userResponse.getId());
        user.setName(userResponse.getName());
        user.setEmail(userResponse.getEmail());
        user.setRole(userResponse.getRole());
        
        delivery.setUser(user);
        delivery.setPickupAddress(request.getPickupAddress());
        delivery.setDeliveryAddress(request.getDeliveryAddress());
        delivery.setItemDescription(request.getItemDescription());
        delivery.setWeight(request.getWeight());
        delivery.setRequestedAt(LocalDateTime.now());
        delivery.setStatus(DeliveryStatus.PENDING);

        Delivery savedDelivery = deliveryService.saveDelivery(delivery);
        DeliveryDto.DeliveryResponse response = convertToResponse(savedDelivery);

        log.info("배달 신청 완료 - 배달 ID: {}", savedDelivery.getId());
        return ResponseEntity.ok(ApiResponse.success("배달이 신청되었습니다.", response));
    }

    private DeliveryDto.DeliveryResponse convertToResponse(Delivery delivery) {
        DeliveryDto.DeliveryResponse response = new DeliveryDto.DeliveryResponse();
        response.setId(delivery.getId());
        response.setUserId(delivery.getUser().getId());
        response.setPickupAddress(delivery.getPickupAddress());
        response.setDeliveryAddress(delivery.getDeliveryAddress());
        response.setItemDescription(delivery.getItemDescription());
        response.setWeight(delivery.getWeight());
        response.setRequestedAt(delivery.getRequestedAt());
        response.setStatus(delivery.getStatus().name());
        response.setTrackingNumber(delivery.getTrackingNumber());
        response.setEstimatedDeliveryTime(delivery.getEstimatedDeliveryTime());
        return response;
    }
} 