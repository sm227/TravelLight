package org.example.travellight.repository;

import org.example.travellight.entity.SsoProviderType;
import org.example.travellight.entity.UserSsoProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSsoProviderRepository extends JpaRepository<UserSsoProvider, Long> {

    Optional<UserSsoProvider> findByProviderTypeAndProviderUserId(SsoProviderType providerType, String providerUserId);

}