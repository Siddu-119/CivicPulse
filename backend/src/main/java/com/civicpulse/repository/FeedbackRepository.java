package com.civicpulse.repository;

import com.civicpulse.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    boolean existsByComplaintId(Long complaintId);

    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double findAverageRating();

    List<Feedback> findTop10ByOrderByCreatedAtDesc();
}
