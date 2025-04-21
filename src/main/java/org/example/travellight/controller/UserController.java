package org.example.travellight.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.ApiResponse;
import org.example.travellight.dto.UserDto;
import org.example.travellight.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> register(@RequestBody UserDto.RegisterRequest request) {
        UserDto.UserResponse response = userService.register(request);
        return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> login(@RequestBody UserDto.LoginRequest request) {
        UserDto.UserResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success("로그인이 완료되었습니다.", response));
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> getUserInfo(@PathVariable(name = "userId") Long userId) {
        log.info("사용자 정보 조회 요청 - 사용자 ID: {}", userId);
        UserDto.UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 조회했습니다.", response));
    }
    
    @PostMapping("/{userId}/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable(name = "userId") Long userId,
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
} 