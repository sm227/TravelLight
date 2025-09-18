package org.example.travellight.repository;

import org.example.travellight.entity.SsoProviderType;
import org.example.travellight.entity.UserSsoAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSsoAttributeRepository extends JpaRepository<UserSsoAttribute, Long> {

    Optional<UserSsoAttribute> findByUserIdAndProviderType(Long userId, SsoProviderType providerType);

}