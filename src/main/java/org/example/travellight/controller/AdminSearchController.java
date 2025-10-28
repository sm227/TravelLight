package org.example.travellight.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.travellight.dto.CommonApiResponse;
import org.example.travellight.dto.SearchResultDto;
import org.example.travellight.entity.SearchType;
import org.example.travellight.service.AdminSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자 통합 검색 컨트롤러
 */
@Slf4j
@Tag(name = "관리자 통합 검색", description = "관리자 대시보드 통합 검색 API")
@RestController
@RequestMapping("/api/admin/search")
@RequiredArgsConstructor
public class AdminSearchController {

    private final AdminSearchService adminSearchService;

    @Operation(
        summary = "통합 검색",
        description = "예약, 사용자, 제휴점, 이벤트, 문의, 리뷰, FAQ 등을 통합 검색합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "검색 성공",
            content = @Content(schema = @Schema(implementation = CommonApiResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "서버 오류"
        )
    })
    @GetMapping
    public ResponseEntity<CommonApiResponse<SearchResultDto.SearchResponse>> search(
        @Parameter(description = "검색어", required = true)
        @RequestParam(name = "query") String query,

        @Parameter(description = "검색할 타입 목록. 미지정시 전체 검색")
        @RequestParam(name = "types", required = false) List<SearchType> types
    ) {
        log.info("통합 검색 요청 - 검색어: {}, 타입: {}", query, types);

        try {
            // 검색 실행
            SearchResultDto.SearchResponse response = adminSearchService.search(query, types);

            log.info("통합 검색 완료 - 총 결과: {}", response.getTotalCount());

            return ResponseEntity.ok(
                CommonApiResponse.success("검색이 완료되었습니다.", response)
            );

        } catch (Exception e) {
            log.error("통합 검색 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                .body(CommonApiResponse.error("검색 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
