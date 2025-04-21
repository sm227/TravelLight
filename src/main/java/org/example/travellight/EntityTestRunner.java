package org.example.travellight;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.example.travellight.entity.Travel;  // Travel 엔티티 클래스 import
import org.example.travellight.service.TravelService;

@Component  // 이 애너테이션을 통해 스프링 부트가 이 클래스를 컴포넌트로 인식하고 실행합니다.
public class EntityTestRunner implements CommandLineRunner {

    private final TravelService travelService;

    // TravelService 주입
    public EntityTestRunner(TravelService travelService) {
        this.travelService = travelService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Travel 객체 생성 (destination 필드만 설정)
        Travel travel = new Travel();
        travel.setDestination("Paris");  // destination 필드만 설정

        // TravelService를 통해 데이터베이스에 저장
        Travel savedTravel = travelService.saveTravel(travel); // TravelService의 메서드 호출
        System.out.println("저장된 여행: " + savedTravel);
    }
}
