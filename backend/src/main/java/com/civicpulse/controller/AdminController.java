package com.civicpulse.controller;

import com.civicpulse.dto.*;
import com.civicpulse.entity.ComplaintCategory;
import com.civicpulse.entity.ComplaintStatus;
import com.civicpulse.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ComplaintService complaintService;

    public AdminController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard() {
        return ResponseEntity.ok(complaintService.getAdminDashboard());
    }

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> analytics() {
        return ResponseEntity.ok(complaintService.getAdminAnalytics());
    }

    @GetMapping("/complaints")
    public ResponseEntity<PagedResponse<ComplaintResponse>> complaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintCategory category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(complaintService.getAdminComplaints(status, category, search, page, size));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> complaintDetail(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintForAdmin(id));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, authentication.getName(), request));
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignComplaint(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody AssignComplaintRequest request
    ) {
        return ResponseEntity.ok(complaintService.assignComplaint(id, authentication.getName(), request));
    }
}
