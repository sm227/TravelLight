package org.example.travellight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommonApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    
    public static <T> CommonApiResponse<T> success(T data) {
        return CommonApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> CommonApiResponse<T> success(String message, T data) {
        return CommonApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }
    
    public static <T> CommonApiResponse<T> error(String message) {
        return CommonApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
} 