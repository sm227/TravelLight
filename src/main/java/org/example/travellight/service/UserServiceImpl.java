package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import org.example.travellight.dto.UserDto;
import org.example.travellight.entity.User;
import org.example.travellight.exception.CustomException;
import org.example.travellight.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDto.UserResponse register(UserDto.RegisterRequest request) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("이미 사용 중인 이메일입니다.", HttpStatus.BAD_REQUEST);
        }

        // 비밀번호 암호화
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(user);

        return UserDto.UserResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto.UserResponse login(UserDto.LoginRequest request) {
        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("이메일 또는 비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED));

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException("이메일 또는 비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED);
        }

        return UserDto.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
} 