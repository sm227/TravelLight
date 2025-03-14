package org.example.travellight.service;

import org.example.travellight.dto.UserDto;

public interface UserService {
    UserDto.UserResponse register(UserDto.RegisterRequest request);
    UserDto.UserResponse login(UserDto.LoginRequest request);
} 