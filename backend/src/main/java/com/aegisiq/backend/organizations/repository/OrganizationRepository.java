package com.aegisiq.backend.organizations.repository;

import com.aegisiq.backend.organizations.domain.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {}
