package org.example.travellight.service;

import org.example.travellight.dto.UserDto;
import org.example.travellight.entity.User;

public interface UserService {
    UserDto.UserResponse register(UserDto.RegisterRequest request);
    UserDto.UserResponse login(UserDto.LoginRequest request);
    void changePassword(Long userId, UserDto.PasswordChangeRequest request);
    UserDto.UserResponse getUserById(Long userId);
    boolean isEmailExists(String email);
    void updateUserRoleByEmail(String email, String roleName);
    User getUserByEmail(String email); // 리뷰 시스템을 위해 추가
    User getUserByIdEntity(Long userId); // 리뷰 시스템을 위해 추가
} 