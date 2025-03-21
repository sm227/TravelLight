package org.example.travellight.controller;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.ApiResponse;
import org.example.travellight.dto.UserDto;
import org.example.travellight.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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
} 