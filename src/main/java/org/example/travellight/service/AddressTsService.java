package org.example.travellight.service;

import org.example.travellight.dto.PartnershipDto;
import org.example.travellight.entity.Partnership;
import org.example.travellight.repository.PartnershipRepository;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

@Service
public class AddressTsService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final PartnershipRepository partnershipRepository;

    @Value("${kakao.rest.api.key}")
    private String kakaoApiKey;

    public AddressTsService(PartnershipRepository partnershipRepository) {
        this.partnershipRepository = partnershipRepository;
    }

    // 주소 → 위도/경도 변환
    public double[] getCoordinatesFromAddress(String address) {
        System.out.println("주소 변환 시작: " + address);
        String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + UriUtils.encode(address, StandardCharsets.UTF_8);
        System.out.println("API URL: " + url);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoApiKey);
        System.out.println("API 키: " + kakaoApiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            System.out.println("API 응답 상태: " + response.getStatusCode());
            System.out.println("API 응답 본문: " + response.getBody());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JSONObject body = new JSONObject(response.getBody());
                JSONArray documents = body.getJSONArray("documents");

                System.out.println("검색 결과 수: " + documents.length());

                if (documents.length() > 0) {
                    JSONObject location = documents.getJSONObject(0);
                    double x = location.getDouble("x"); // 경도
                    double y = location.getDouble("y"); // 위도
                    System.out.println("좌표 변환 완료: [위도=" + y + ", 경도=" + x + "]");
                    return new double[]{y, x};
                } else {
                    System.out.println("주소에 해당하는 좌표를 찾을 수 없습니다: " + address);
                    throw new RuntimeException("주소에 해당하는 좌표를 찾을 수 없습니다: " + address);
                }
            } else {
                throw new RuntimeException("카카오 API 응답이 유효하지 않습니다: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.out.println("카카오 API 호출 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("좌표 변환 중 오류가 발생했습니다: " + e.getMessage());
        }
    }


    // 파트너 등록 + 좌표 저장
    public Partnership registerPartnership(PartnershipDto dto) {
        double[] latLng = getCoordinatesFromAddress(dto.getAddress());

        Partnership partnership = new Partnership();
        partnership.setAddress(dto.getAddress());
        partnership.setLatitude(latLng[0]);
        partnership.setLongitude(latLng[1]);

        return partnershipRepository.save(partnership);
    }
}
