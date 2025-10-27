package org.example.travellight.repository;

import org.example.travellight.entity.RiderApplication;
import org.example.travellight.entity.RiderApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiderApplicationRepository extends JpaRepository<RiderApplication, Long> {

    Optional<RiderApplication> findByUserId(Long userId);

    List<RiderApplication> findByStatus(RiderApplicationStatus status);

    List<RiderApplication> findAllByOrderByCreatedAtDesc();

    boolean existsByUserId(Long userId);

    @Query("SELECT COUNT(r) FROM RiderApplication r WHERE r.status = :status")
    Long countByStatus(@Param("status") RiderApplicationStatus status);

    @Query("SELECT r FROM RiderApplication r WHERE r.user.email = :email")
    Optional<RiderApplication> findByUserEmail(@Param("email") String email);
}
