package com.civicpulse.controller;

import com.civicpulse.dto.ComplaintResponse;
import com.civicpulse.dto.PagedResponse;
import com.civicpulse.dto.UserResponse;
import com.civicpulse.entity.ComplaintStatus;
import com.civicpulse.service.AuthService;
import com.civicpulse.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/citizen")
public class CitizenController {

    private final AuthService authService;
    private final ComplaintService complaintService;

    public CitizenController(AuthService authService, ComplaintService complaintService) {
        this.authService = authService;
        this.complaintService = complaintService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(authService.getProfile(authentication.getName()));
    }

    @GetMapping("/complaints")
    public ResponseEntity<PagedResponse<ComplaintResponse>> getMyComplaints(
            Authentication authentication,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(complaintService.getCitizenComplaints(authentication.getName(), status, page, size));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintDetail(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(complaintService.getCitizenComplaintById(id, authentication.getName()));
    }
}
