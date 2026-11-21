package com.civicpulse.service;

import com.civicpulse.dto.*;
import com.civicpulse.entity.*;
import com.civicpulse.repository.AssignmentRepository;
import com.civicpulse.repository.ComplaintRepository;
import com.civicpulse.repository.FeedbackRepository;
import com.civicpulse.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Year;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final FeedbackRepository feedbackRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            AssignmentRepository assignmentRepository,
            FeedbackRepository feedbackRepository,
            FileStorageService fileStorageService,
            NotificationService notificationService
    ) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.feedbackRepository = feedbackRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ComplaintResponse createComplaint(
            String userEmail,
            String title,
            String description,
            ComplaintCategory category,
            ComplaintPriority priority,
            String address,
            String landmark,
            String ward,
            Double latitude,
            Double longitude,
            MultipartFile image
    ) {
        if (title == null || title.isBlank() || description == null || description.isBlank() || address == null || address.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title, description, and address are required");
        }

        User citizen = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Citizen account not found"));

        Complaint complaint = new Complaint();
        complaint.setTrackingCode(generateTrackingCode());
        complaint.setTitle(title.trim());
        complaint.setDescription(description.trim());
        complaint.setCategory(category);
        complaint.setPriority(priority != null ? priority : ComplaintPriority.MEDIUM);
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setAddress(address.trim());
        complaint.setLandmark(landmark != null && !landmark.isBlank() ? landmark.trim() : null);
        complaint.setWard(ward != null && !ward.isBlank() ? ward.trim() : citizen.getWard());
        complaint.setLatitude(latitude);
        complaint.setLongitude(longitude);
        complaint.setCitizen(citizen);

        if (image != null && !image.isEmpty()) {
            complaint.setImagePath(fileStorageService.storeImage(image));
        }

        ComplaintUpdate initialUpdate = new ComplaintUpdate();
        initialUpdate.setComplaint(complaint);
        initialUpdate.setStatus(ComplaintStatus.SUBMITTED);
        initialUpdate.setRemark("Complaint logged by citizen and queued for municipal review.");
        initialUpdate.setUpdatedBy(citizen);
        initialUpdate.setUpdatedByName(citizen.getFullName());
        complaint.getUpdates().add(initialUpdate);

        Complaint saved = complaintRepository.save(complaint);
        notificationService.notifyUser(
                citizen,
                saved,
                "Complaint Registered",
                "Your complaint " + saved.getTrackingCode() + " ('" + saved.getTitle() + "') was successfully registered and queued for municipal review.",
                "SUBMITTED"
        );
        return toResponse(saved, false);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ComplaintResponse> getCitizenComplaints(
            String userEmail,
            ComplaintStatus status,
            int page,
            int size
    ) {
        User citizen = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50));
        Page<Complaint> result = status == null
                ? complaintRepository.findByCitizenIdOrderByCreatedAtDesc(citizen.getId(), pageable)
                : complaintRepository.findByCitizenIdAndStatusOrderByCreatedAtDesc(citizen.getId(), status, pageable);

        return new PagedResponse<>(
                result.getContent().stream().map(c -> toResponse(c, false)).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintForAdmin(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
        return toResponse(complaint, false);
    }

    @Transactional(readOnly = true)
    public ComplaintResponse trackByCode(String trackingCode) {
        Complaint complaint = complaintRepository.findByTrackingCodeIgnoreCase(trackingCode.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No complaint found for tracking code: " + trackingCode
                ));
        return toResponse(complaint, true);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getPublicRecentComplaints() {
        return complaintRepository.findTop8ByOrderByCreatedAtDesc()
                .stream()
                .map(c -> toResponse(c, true))
                .toList();
    }

    @Transactional(readOnly = true)
    public PublicStatsResponse getPublicStats() {
        long total = complaintRepository.count();
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long rejected = complaintRepository.countByStatus(ComplaintStatus.REJECTED);
        long active = Math.max(0, total - resolved - rejected);
        Double avg = feedbackRepository.findAverageRating();
        return new PublicStatsResponse(
                total,
                resolved,
                active,
                avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0
        );
    }

    @Transactional(readOnly = true)
    public PagedResponse<ComplaintResponse> getAdminComplaints(
            ComplaintStatus status,
            ComplaintCategory category,
            String search,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50));
        Page<Complaint> result = complaintRepository.searchAdminComplaints(
                status,
                category,
                search != null ? search.trim() : "",
                pageable
        );

        return new PagedResponse<>(
                result.getContent().stream().map(c -> toResponse(c, false)).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long id, String adminEmail, StatusUpdateRequest request) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));

        complaint.setStatus(request.status());

        ComplaintUpdate update = new ComplaintUpdate();
        update.setComplaint(complaint);
        update.setStatus(request.status());
        update.setRemark(request.remark().trim());
        update.setUpdatedBy(admin);
        update.setUpdatedByName(admin.getFullName());
        complaint.getUpdates().add(update);

        Complaint saved = complaintRepository.save(complaint);
        notificationService.notifyUser(
                saved.getCitizen(),
                saved,
                "Status Updated: " + saved.getStatus().name(),
                "Complaint " + saved.getTrackingCode() + " status updated to " + saved.getStatus().name() + ". Remark: " + request.remark().trim(),
                "STATUS_UPDATE"
        );
        return toResponse(saved, false);
    }

    @Transactional
    public ComplaintResponse assignComplaint(Long id, String adminEmail, AssignComplaintRequest request) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));

        Assignment assignment = assignmentRepository.findByComplaintId(id).orElseGet(Assignment::new);
        assignment.setComplaint(complaint);
        assignment.setDepartment(request.department().trim());
        assignment.setTeamName(request.teamName().trim());
        assignment.setOfficerName(request.officerName() != null && !request.officerName().isBlank() ? request.officerName().trim() : null);
        assignment.setOfficerContact(request.officerContact() != null && !request.officerContact().isBlank() ? request.officerContact().trim() : null);
        assignment.setNotes(request.notes() != null && !request.notes().isBlank() ? request.notes().trim() : null);
        assignment.setAssignedBy(admin);
        assignmentRepository.save(assignment);
        complaint.setAssignment(assignment);

        if (complaint.getStatus() == ComplaintStatus.SUBMITTED || complaint.getStatus() == ComplaintStatus.UNDER_REVIEW) {
            complaint.setStatus(ComplaintStatus.ASSIGNED);
        }

        ComplaintUpdate update = new ComplaintUpdate();
        update.setComplaint(complaint);
        update.setStatus(complaint.getStatus());
        update.setRemark("Assigned to " + assignment.getDepartment() + " (" + assignment.getTeamName() + ")."
                + (assignment.getNotes() != null ? " " + assignment.getNotes() : ""));
        update.setUpdatedBy(admin);
        update.setUpdatedByName(admin.getFullName());
        complaint.getUpdates().add(update);

        Complaint saved = complaintRepository.save(complaint);
        notificationService.notifyUser(
                saved.getCitizen(),
                saved,
                "Field Team Assigned",
                "Complaint " + saved.getTrackingCode() + " has been assigned to " + assignment.getDepartment() + " (" + assignment.getTeamName() + ").",
                "ASSIGNED"
        );
        return toResponse(saved, false);
    }

    @Transactional
    public FeedbackResponse submitFeedback(Long complaintId, String userEmail, FeedbackRequest request) {
        User citizen = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));

        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only rate your own complaints");
        }
        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Feedback is enabled once the complaint is resolved");
        }
        if (feedbackRepository.existsByComplaintId(complaintId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Feedback has already been submitted for this complaint");
        }

        Feedback feedback = new Feedback();
        feedback.setComplaint(complaint);
        feedback.setCitizen(citizen);
        feedback.setRating(request.rating());
        feedback.setComment(request.comment() != null && !request.comment().isBlank() ? request.comment().trim() : null);

        Feedback saved = feedbackRepository.save(feedback);
        notificationService.notifyUser(
                citizen,
                complaint,
                "Feedback Recorded",
                "Thank you for rating the resolution of complaint " + complaint.getTrackingCode() + " (" + saved.getRating() + "/5 stars).",
                "FEEDBACK"
        );
        return new FeedbackResponse(
                saved.getId(),
                saved.getRating(),
                saved.getComment(),
                citizen.getFullName(),
                complaint.getTrackingCode(),
                complaint.getTitle(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        long total = complaintRepository.count();
        long submitted = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long underReview = complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW);
        long assigned = complaintRepository.countByStatus(ComplaintStatus.ASSIGNED);
        long inProgress = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long rejected = complaintRepository.countByStatus(ComplaintStatus.REJECTED);

        Map<String, Long> categoryMap = new LinkedHashMap<>();
        for (ComplaintCategory cat : ComplaintCategory.values()) {
            categoryMap.put(cat.name(), complaintRepository.countByCategory(cat));
        }

        Double avg = feedbackRepository.findAverageRating();
        List<FeedbackResponse> recentFeedback = feedbackRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(f -> new FeedbackResponse(
                        f.getId(),
                        f.getRating(),
                        f.getComment(),
                        f.getCitizen().getFullName(),
                        f.getComplaint().getTrackingCode(),
                        f.getComplaint().getTitle(),
                        f.getCreatedAt()
                ))
                .toList();

        return new AdminDashboardResponse(
                total,
                submitted + underReview,
                assigned,
                inProgress,
                resolved,
                rejected,
                avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                categoryMap,
                recentFeedback
        );
    }

    @Transactional(readOnly = true)
    public AdminAnalyticsResponse getAdminAnalytics() {
        long total = complaintRepository.count();
        long submitted = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long underReview = complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW);
        long assigned = complaintRepository.countByStatus(ComplaintStatus.ASSIGNED);
        long inProgress = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long rejected = complaintRepository.countByStatus(ComplaintStatus.REJECTED);

        double resolutionRate = total > 0 ? Math.round(((double) resolved / total) * 1000.0) / 10.0 : 0.0;
        Double avgRating = feedbackRepository.findAverageRating();

        List<Complaint> resolvedList = complaintRepository.findByStatus(ComplaintStatus.RESOLVED);
        double avgResolutionHours = 0.0;
        if (!resolvedList.isEmpty()) {
            double totalHours = 0;
            for (Complaint c : resolvedList) {
                if (c.getCreatedAt() != null && c.getUpdatedAt() != null) {
                    totalHours += Math.max(0.5, Duration.between(c.getCreatedAt(), c.getUpdatedAt()).toMinutes() / 60.0);
                }
            }
            avgResolutionHours = Math.round((totalHours / resolvedList.size()) * 10.0) / 10.0;
        }

        Map<String, Long> categoryMap = new LinkedHashMap<>();
        for (ComplaintCategory cat : ComplaintCategory.values()) {
            categoryMap.put(cat.name(), complaintRepository.countByCategory(cat));
        }

        Map<String, Long> priorityMap = new LinkedHashMap<>();
        for (ComplaintPriority p : ComplaintPriority.values()) {
            priorityMap.put(p.name(), complaintRepository.countByPriority(p));
        }

        Map<String, Long> departmentWorkload = new LinkedHashMap<>();
        List<Object[]> deptRows = assignmentRepository.countComplaintsByDepartment();
        for (Object[] row : deptRows) {
            if (row != null && row.length >= 2 && row[0] != null) {
                departmentWorkload.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
            }
        }

        Map<String, Long> statusMap = new LinkedHashMap<>();
        statusMap.put("SUBMITTED", submitted);
        statusMap.put("UNDER_REVIEW", underReview);
        statusMap.put("ASSIGNED", assigned);
        statusMap.put("IN_PROGRESS", inProgress);
        statusMap.put("RESOLVED", resolved);
        statusMap.put("REJECTED", rejected);

        Map<String, long[]> monthCounts = new LinkedHashMap<>();
        java.time.YearMonth currentYm = java.time.YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            java.time.YearMonth ym = currentYm.minusMonths(i);
            String monthLabel = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            monthCounts.put(monthLabel, new long[]{0, 0});
        }
        for (Complaint c : complaintRepository.findAll()) {
            if (c.getCreatedAt() != null) {
                String m = c.getCreatedAt().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                if (monthCounts.containsKey(m)) {
                    monthCounts.get(m)[0]++;
                }
            }
            if (c.getStatus() == ComplaintStatus.RESOLVED && c.getUpdatedAt() != null) {
                String m = c.getUpdatedAt().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                if (monthCounts.containsKey(m)) {
                    monthCounts.get(m)[1]++;
                }
            }
        }
        List<MonthlyTrendDto> monthlyTrends = monthCounts.entrySet().stream()
                .map(e -> new MonthlyTrendDto(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .toList();

        return new AdminAnalyticsResponse(
                total,
                resolved,
                submitted + underReview,
                assigned,
                inProgress,
                rejected,
                resolutionRate,
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                avgResolutionHours,
                categoryMap,
                priorityMap,
                departmentWorkload,
                statusMap,
                monthlyTrends
        );
    }

    @Transactional(readOnly = true)
    public List<MapComplaintResponse> getMapComplaints(
            ComplaintStatus status,
            ComplaintCategory category,
            ComplaintPriority priority
    ) {
        return complaintRepository.findMapComplaints(status, category, priority)
                .stream()
                .map(c -> new MapComplaintResponse(
                        c.getId(),
                        c.getTrackingCode(),
                        c.getTitle(),
                        c.getCategory(),
                        c.getPriority(),
                        c.getStatus(),
                        c.getAddress(),
                        c.getWard(),
                        c.getLatitude(),
                        c.getLongitude(),
                        c.getImagePath(),
                        c.getCreatedAt()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getCitizenComplaintById(Long id, String citizenEmail) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));

        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this complaint");
        }
        return toResponse(complaint, false);
    }

    private String generateTrackingCode() {
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "CP-" + Year.now().getValue() + "-" + suffix;
    }

    private ComplaintResponse toResponse(Complaint c, boolean anonymizeCitizen) {
        AssignmentResponse assignmentDto = null;
        if (c.getAssignment() != null) {
            Assignment a = c.getAssignment();
            assignmentDto = new AssignmentResponse(
                    a.getId(),
                    a.getDepartment(),
                    a.getTeamName(),
                    a.getOfficerName(),
                    anonymizeCitizen ? null : a.getOfficerContact(),
                    a.getNotes(),
                    a.getAssignedBy() != null ? a.getAssignedBy().getFullName() : "Municipal Admin",
                    a.getAssignedAt(),
                    a.getUpdatedAt()
            );
        }

        List<ComplaintUpdateResponse> updateDtos = c.getUpdates().stream()
                .map(u -> new ComplaintUpdateResponse(
                        u.getId(),
                        u.getStatus(),
                        u.getRemark(),
                        u.getUpdatedByName(),
                        u.getCreatedAt()
                ))
                .toList();

        FeedbackResponse feedbackDto = null;
        if (c.getFeedback() != null) {
            Feedback f = c.getFeedback();
            feedbackDto = new FeedbackResponse(
                    f.getId(),
                    f.getRating(),
                    f.getComment(),
                    anonymizeCitizen ? "Verified Citizen" : f.getCitizen().getFullName(),
                    c.getTrackingCode(),
                    c.getTitle(),
                    f.getCreatedAt()
            );
        }

        return new ComplaintResponse(
                c.getId(),
                c.getTrackingCode(),
                c.getTitle(),
                c.getDescription(),
                c.getCategory(),
                c.getPriority(),
                c.getStatus(),
                c.getAddress(),
                c.getLandmark(),
                c.getWard(),
                c.getLatitude(),
                c.getLongitude(),
                c.getImagePath(),
                anonymizeCitizen ? "Verified Citizen" : c.getCitizen().getFullName(),
                anonymizeCitizen ? null : c.getCitizen().getEmail(),
                anonymizeCitizen ? null : c.getCitizen().getPhone(),
                c.getCreatedAt(),
                c.getUpdatedAt(),
                assignmentDto,
                updateDtos,
                feedbackDto
        );
    }
}
