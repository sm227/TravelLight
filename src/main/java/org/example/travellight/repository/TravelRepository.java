package org.example.travellight.repository;

import org.example.travellight.entity.Travel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelRepository extends JpaRepository<Travel, Long> {
    // 기본 CRUD 메소드는 JpaRepository에서 제공됨

}