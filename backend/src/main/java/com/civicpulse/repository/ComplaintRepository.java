package com.civicpulse.repository;

import com.civicpulse.entity.Complaint;
import com.civicpulse.entity.ComplaintCategory;
import com.civicpulse.entity.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByTrackingCodeIgnoreCase(String trackingCode);

    Page<Complaint> findByCitizenIdOrderByCreatedAtDesc(Long citizenId, Pageable pageable);

    Page<Complaint> findByCitizenIdAndStatusOrderByCreatedAtDesc(
            Long citizenId,
            ComplaintStatus status,
            Pageable pageable
    );

    List<Complaint> findTop8ByOrderByCreatedAtDesc();

    long countByStatus(ComplaintStatus status);

    long countByCategory(ComplaintCategory category);

    long countByPriority(com.civicpulse.entity.ComplaintPriority priority);

    List<Complaint> findByStatus(ComplaintStatus status);

    @Query("""
            SELECT c FROM Complaint c
            WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL
              AND (:status IS NULL OR c.status = :status)
              AND (:category IS NULL OR c.category = :category)
              AND (:priority IS NULL OR c.priority = :priority)
            ORDER BY c.createdAt DESC
            """)
    List<Complaint> findMapComplaints(
            @Param("status") ComplaintStatus status,
            @Param("category") ComplaintCategory category,
            @Param("priority") com.civicpulse.entity.ComplaintPriority priority
    );

    @Query("""
            SELECT c FROM Complaint c
            JOIN c.citizen u
            WHERE (:status IS NULL OR c.status = :status)
              AND (:category IS NULL OR c.category = :category)
              AND (:search IS NULL OR :search = ''
                   OR LOWER(c.trackingCode) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(c.address) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(COALESCE(c.ward, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY c.createdAt DESC
            """)
    Page<Complaint> searchAdminComplaints(
            @Param("status") ComplaintStatus status,
            @Param("category") ComplaintCategory category,
            @Param("search") String search,
            Pageable pageable
    );
}
