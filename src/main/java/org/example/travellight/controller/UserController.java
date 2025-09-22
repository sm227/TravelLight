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
import org.example.travellight.dto.UserDto;
import org.example.travellight.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@Tag(name = "사용자 관리", description = "사용자 회원가입, 로그인, 정보 조회 및 비밀번호 변경 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "회원가입 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "이미 존재하는 사용자", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> register(
            @Parameter(description = "회원가입 정보", required = true)
            @RequestBody UserDto.RegisterRequest request) {
        UserDto.UserResponse response = userService.register(request);
        return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", response));
    }

    @Operation(summary = "로그인", description = "사용자 로그인을 처리합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그인 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> login(
            @Parameter(description = "로그인 정보", required = true)
            @RequestBody UserDto.LoginRequest request) {
        UserDto.UserResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success("로그인이 완료되었습니다.", response));
    }
    
    @Operation(summary = "사용자 정보 조회", description = "사용자 ID로 사용자 정보를 조회합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> getUserInfo(
            @Parameter(description = "사용자 ID", required = true)
            @PathVariable(name = "userId") Long userId) {
        log.info("사용자 정보 조회 요청 - 사용자 ID: {}", userId);
        UserDto.UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 조회했습니다.", response));
    }
    
    @Operation(summary = "비밀번호 변경", description = "사용자의 비밀번호를 변경합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "비밀번호 변경 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 비밀번호", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/{userId}/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Parameter(description = "사용자 ID", required = true)
            @PathVariable(name = "userId") Long userId,
            @Parameter(description = "비밀번호 변경 정보", required = true)
            @RequestBody UserDto.PasswordChangeRequest request) {
        log.info("비밀번호 변경 요청 수신 - 사용자 ID: {}", userId);
        log.info("요청 데이터: 현재 비밀번호 존재={}, 새 비밀번호 존재={}", 
                request.getCurrentPassword() != null, request.getNewPassword() != null);
        
        try {
            userService.changePassword(userId, request);
            log.info("비밀번호 변경 성공 - 사용자 ID: {}", userId);
            return ResponseEntity.ok(ApiResponse.success("비밀번호가 변경되었습니다.", null));
        } catch (Exception e) {
            log.error("비밀번호 변경 중 오류 발생", e);
            throw e;
        }
    }
    
    @Operation(summary = "모든 사용자 목록 조회", description = "관리자가 모든 사용자 목록을 조회합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @GetMapping("/admin/all")
    // TODO: 추후 인증 시스템 구현 후 @PreAuthorize("hasRole('ADMIN')") 재적용
    public ResponseEntity<ApiResponse<List<UserDto.AdminUserResponse>>> getAllUsers() {
        log.info("관리자용 모든 사용자 목록 조회 요청");
        List<UserDto.AdminUserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("사용자 목록을 조회했습니다.", users));
    }
    
    @Operation(summary = "사용자 삭제", description = "관리자가 사용자를 삭제합니다.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "삭제 성공", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class))),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음", 
            content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    @DeleteMapping("/admin/{userId}")
    // TODO: 추후 인증 시스템 구현 후 @PreAuthorize("hasRole('ADMIN')") 재적용
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Parameter(description = "사용자 ID", required = true)
            @PathVariable Long userId) {
        log.info("사용자 삭제 요청 - 사용자 ID: {}", userId);
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 삭제되었습니다.", null));
    }
} 