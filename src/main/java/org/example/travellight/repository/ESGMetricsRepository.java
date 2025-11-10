package org.example.travellight.repository;

import org.example.travellight.entity.ESGMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ESGMetricsRepository extends JpaRepository<ESGMetrics, Long> {

    /**
     * 특정 날짜의 ESG 메트릭 조회
     */
    Optional<ESGMetrics> findByCalculationDate(LocalDate calculationDate);

    /**
     * 최근 N일 간의 ESG 메트릭 조회 (날짜 내림차순)
     */
    @Query("SELECT e FROM ESGMetrics e WHERE e.calculationDate >= :startDate ORDER BY e.calculationDate DESC")
    List<ESGMetrics> findRecentMetrics(@Param("startDate") LocalDate startDate);

    /**
     * 날짜 범위별 ESG 메트릭 조회 (날짜 오름차순)
     */
    @Query("SELECT e FROM ESGMetrics e WHERE e.calculationDate BETWEEN :startDate AND :endDate ORDER BY e.calculationDate ASC")
    List<ESGMetrics> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 가장 최근 ESG 메트릭 조회
     */
    Optional<ESGMetrics> findFirstByOrderByCalculationDateDesc();

    /**
     * 특정 날짜 이후의 평균 ESG 점수 계산
     */
    @Query("SELECT AVG(e.totalScore) FROM ESGMetrics e WHERE e.calculationDate >= :startDate")
    Double getAverageTotalScore(@Param("startDate") LocalDate startDate);
}
