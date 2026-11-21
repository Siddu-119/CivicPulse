package com.civicpulse.repository;

import com.civicpulse.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Optional<Assignment> findByComplaintId(Long complaintId);

    @Query("SELECT a.department, COUNT(a) FROM Assignment a GROUP BY a.department")
    List<Object[]> countComplaintsByDepartment();
}
