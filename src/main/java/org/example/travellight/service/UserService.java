package org.example.travellight.service;

import org.example.travellight.dto.UserDto;
import org.example.travellight.entity.User;
import java.util.List;

public interface UserService {
    UserDto.UserResponse register(UserDto.RegisterRequest request);
    UserDto.UserResponse login(UserDto.LoginRequest request);
    void changePassword(Long userId, UserDto.PasswordChangeRequest request);
    UserDto.UserResponse getUserById(Long userId);
    boolean isEmailExists(String email);
    void updateUserRoleByEmail(String email, String roleName);
    User getUserByEmail(String email); // 리뷰 시스템을 위해 추가
    User getUserByIdEntity(Long userId); // 리뷰 시스템을 위해 추가
    List<UserDto.AdminUserResponse> getAllUsers(); // 관리자용 사용자 목록 조회
    void deleteUser(Long userId); // 사용자 삭제
} 