package com.grod.platform.repository;

import com.grod.platform.entity.AdminPasskeyCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminPasskeyCredentialRepository extends JpaRepository<AdminPasskeyCredential, Long> {

    List<AdminPasskeyCredential> findByEmailAndActiveTrue(String email);

    Optional<AdminPasskeyCredential> findByCredentialIdAndActiveTrue(String credentialId);
}
