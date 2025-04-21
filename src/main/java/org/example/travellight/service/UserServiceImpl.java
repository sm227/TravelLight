package org.example.travellight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.UserDto;
import org.example.travellight.entity.User;
import org.example.travellight.entity.Role;
import org.example.travellight.exception.CustomException;
import org.example.travellight.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
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
                .role(request.getRole() != null ? request.getRole() : org.example.travellight.entity.Role.USER)
                .build();

        User savedUser = userRepository.save(user);

        return UserDto.UserResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
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
                .role(user.getRole())
                .build();
    }
    
    @Override
    @Transactional
    public void changePassword(Long userId, UserDto.PasswordChangeRequest request) {
        log.info("비밀번호 변경 요청 - 사용자 ID: {}", userId);
        log.info("현재 비밀번호 입력됨: {}", request.getCurrentPassword() != null);
        log.info("새 비밀번호 입력됨: {}", request.getNewPassword() != null);
        
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
            
            log.info("사용자 이메일: {}", user.getEmail());
            
            // 현재 비밀번호 확인
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                log.error("현재 비밀번호 불일치");
                throw new CustomException("현재 비밀번호가 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
            }
            
            // 새 비밀번호 암호화 및 저장
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            log.info("비밀번호 변경 성공");
        } catch (Exception e) {
            log.error("비밀번호 변경 중 오류 발생", e);
            throw e;
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserDto.UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        return UserDto.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Override
    public boolean isEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
    
    @Override
    @Transactional
    public void updateUserRoleByEmail(String email, String roleName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + email));
        
        try {
            Role role = Role.valueOf(roleName);
            user.setRole(role);
            userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("유효하지 않은 역할입니다: " + roleName);
        }
    }
} 