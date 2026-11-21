package com.civicpulse.controller;

import com.civicpulse.dto.*;
import com.civicpulse.entity.ComplaintCategory;
import com.civicpulse.entity.ComplaintPriority;
import com.civicpulse.entity.ComplaintStatus;
import com.civicpulse.service.ComplaintService;
import com.civicpulse.service.SmartClassificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final SmartClassificationService classificationService;

    public ComplaintController(
            ComplaintService complaintService,
            SmartClassificationService classificationService
    ) {
        this.complaintService = complaintService;
        this.classificationService = classificationService;
    }

    @PostMapping(value = "/complaints", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ComplaintResponse> createComplaint(
            Authentication authentication,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") ComplaintCategory category,
            @RequestParam(value = "priority", required = false) ComplaintPriority priority,
            @RequestParam("address") String address,
            @RequestParam(value = "landmark", required = false) String landmark,
            @RequestParam(value = "ward", required = false) String ward,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        ComplaintResponse created = complaintService.createComplaint(
                authentication.getName(),
                title,
                description,
                category,
                priority,
                address,
                landmark,
                ward,
                latitude,
                longitude,
                image
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/complaints/track/{trackingCode}")
    public ResponseEntity<ComplaintResponse> trackByCode(@PathVariable String trackingCode) {
        return ResponseEntity.ok(complaintService.trackByCode(trackingCode));
    }

    @GetMapping("/complaints/public")
    public ResponseEntity<List<ComplaintResponse>> publicFeed() {
        return ResponseEntity.ok(complaintService.getPublicRecentComplaints());
    }

    @GetMapping("/complaints/map")
    public ResponseEntity<List<MapComplaintResponse>> mapComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintCategory category,
            @RequestParam(required = false) ComplaintPriority priority
    ) {
        return ResponseEntity.ok(complaintService.getMapComplaints(status, category, priority));
    }

    @PostMapping("/complaints/classify")
    public ResponseEntity<ClassificationResponse> classifyComplaint(@Valid @RequestBody ClassifyRequest request) {
        return ResponseEntity.ok(classificationService.classify(request.title(), request.description()));
    }

    @GetMapping("/public/stats")
    public ResponseEntity<PublicStatsResponse> publicStats() {
        return ResponseEntity.ok(complaintService.getPublicStats());
    }

    @PostMapping("/complaints/{id}/feedback")
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody FeedbackRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(complaintService.submitFeedback(id, authentication.getName(), request));
    }
}
