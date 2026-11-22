package com.civicpulse.config;

import com.civicpulse.entity.*;
import com.civicpulse.repository.AssignmentRepository;
import com.civicpulse.repository.ComplaintRepository;
import com.civicpulse.repository.FeedbackRepository;
import com.civicpulse.repository.UserRepository;
import com.civicpulse.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String DEFAULT_DEV_ADMIN_PASS = "Admin@12345";
    private static final String DEFAULT_DEV_ADMIN_EMAIL = "admin@civicpulse.gov";
    private static final int MIN_PROD_PASSWORD_LENGTH = 16;

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final AssignmentRepository assignmentRepository;
    private final FeedbackRepository feedbackRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;
    private final String adminEmail;
    private final String adminPassword;
    private final boolean requireSecurePassword;
    private final boolean seedSampleData;

    public DataInitializer(
            UserRepository userRepository,
            ComplaintRepository complaintRepository,
            AssignmentRepository assignmentRepository,
            FeedbackRepository feedbackRepository,
            NotificationService notificationService,
            PasswordEncoder passwordEncoder,
            Environment environment,
            @Value("${app.admin.email:}") String adminEmail,
            @Value("${app.admin.password:}") String adminPassword,
            @Value("${app.admin.require-secure-password:false}") boolean requireSecurePassword,
            @Value("${app.seed.sample-data:true}") boolean seedSampleData
    ) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.assignmentRepository = assignmentRepository;
        this.feedbackRepository = feedbackRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.requireSecurePassword = requireSecurePassword;
        this.seedSampleData = seedSampleData;
    }

    @Override
    public void run(String... args) {
        boolean isProduction = isProductionEnvironment();
        String effectiveAdminPass = resolveAdminPassword(isProduction);
        String adminNormalized = (adminEmail != null && !adminEmail.isBlank())
                ? adminEmail.trim().toLowerCase(Locale.ROOT)
                : DEFAULT_DEV_ADMIN_EMAIL;

        // 1. Idempotent Admin Initialization
        // Note: If an admin already exists in the database, existing credentials are not overwritten.
        User admin = userRepository.findByEmail(adminNormalized).orElseGet(() -> {
            User u = new User();
            u.setFullName("Municipal Operations Director");
            u.setEmail(adminNormalized);
            u.setPassword(passwordEncoder.encode(effectiveAdminPass));
            u.setWard("Central Municipal HQ");
            u.setRole(Role.ADMIN);
            log.info("Initialized default municipal administrator account for: {}", adminNormalized);
            return userRepository.save(u);
        });

        // 2. Demo & Sample Data Seeding Guard
        if (!seedSampleData) {
            log.info("Sample demo data seeding is disabled (SEED_SAMPLE_DATA=false). Clean database state maintained.");
            return;
        }

        log.warn("[SECURITY NOTICE] Demo data seeding is enabled (SEED_SAMPLE_DATA=true). A demo citizen account (citizen@civicpulse.org) will be accessible for demonstration.");

        // 3. Demo Citizen Seeding (Only when seedSampleData == true)
        String citizenEmail = "citizen@civicpulse.org";
        User citizen = userRepository.findByEmail(citizenEmail).orElseGet(() -> {
            User c = new User();
            c.setFullName("Aarav Sharma");
            c.setEmail(citizenEmail);
            c.setPassword(passwordEncoder.encode("Citizen@12345"));
            c.setPhone("+91 98765 43210");
            c.setWard("Ward 14 - MG Road Central");
            c.setRole(Role.CITIZEN);
            return userRepository.save(c);
        });

        // 4. Sample Complaints Seeding (Only when table is empty)
        if (complaintRepository.count() == 0) {
            seedSampleComplaints(admin, citizen);
            log.info("Seeded 5 sample complaints for demonstration/evaluation experience.");
        }
    }

    private boolean isProductionEnvironment() {
        return requireSecurePassword || environment.matchesProfiles("prod", "production");
    }

    private String resolveAdminPassword(boolean isProduction) {
        boolean hasCustomPass = (adminPassword != null && !adminPassword.isBlank());
        boolean isDefaultPass = hasCustomPass && DEFAULT_DEV_ADMIN_PASS.equals(adminPassword.trim());

        if (isProduction) {
            if (!hasCustomPass || isDefaultPass) {
                throw new IllegalStateException(
                    "CRITICAL SECURITY CONFIGURATION ERROR: In production mode, an explicit, secure ADMIN_PASSWORD must be configured. " +
                    "Using a blank password or the default development password is strictly prohibited. Application startup aborted."
                );
            }
            if (adminPassword.trim().length() < MIN_PROD_PASSWORD_LENGTH) {
                throw new IllegalStateException(
                    "CRITICAL SECURITY CONFIGURATION ERROR: The configured production ADMIN_PASSWORD is too short. " +
                    "It must be at least " + MIN_PROD_PASSWORD_LENGTH + " characters long. Application startup aborted."
                );
            }
            return adminPassword.trim();
        }

        // Local Development Mode
        if (hasCustomPass && !isDefaultPass) {
            return adminPassword.trim();
        }

        log.warn("[SECURITY NOTICE] Local development mode active: Using default administrator credentials. For production deployment, set SPRING_PROFILES_ACTIVE=prod and configure a secure ADMIN_PASSWORD (min 16 chars).");
        return DEFAULT_DEV_ADMIN_PASS;
    }

    private void seedSampleComplaints(User admin, User citizen) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Deep Pothole on Main Arterial Road (In Progress)
        Complaint c1 = new Complaint();
        c1.setTrackingCode("CP-2026-A109B4");
        c1.setTitle("Severe multi-meter crater on MG Road Junction");
        c1.setDescription("Deep pothole causing vehicular congestion and two-wheeler accidents during evening peak hours.");
        c1.setCategory(ComplaintCategory.ROADS_POTHOLES);
        c1.setPriority(ComplaintPriority.HIGH);
        c1.setStatus(ComplaintStatus.IN_PROGRESS);
        c1.setAddress("MG Road near Metro Pillar 142, Ward 14");
        c1.setLandmark("Opposite City Center Mall");
        c1.setWard("Ward 14 - MG Road Central");
        c1.setLatitude(12.971598);
        c1.setLongitude(77.594566);
        c1.setCitizen(citizen);

        ComplaintUpdate u1 = new ComplaintUpdate();
        u1.setComplaint(c1);
        u1.setStatus(ComplaintStatus.SUBMITTED);
        u1.setRemark("Complaint logged by citizen and queued for triage.");
        u1.setUpdatedBy(citizen);
        u1.setUpdatedByName(citizen.getFullName());
        c1.getUpdates().add(u1);

        ComplaintUpdate u2 = new ComplaintUpdate();
        u2.setComplaint(c1);
        u2.setStatus(ComplaintStatus.ASSIGNED);
        u2.setRemark("Assigned to Road Infrastructure & Highway Maintenance (Asphalt Quick Response Crew 3).");
        u2.setUpdatedBy(admin);
        u2.setUpdatedByName(admin.getFullName());
        c1.getUpdates().add(u2);

        ComplaintUpdate u3 = new ComplaintUpdate();
        u3.setComplaint(c1);
        u3.setStatus(ComplaintStatus.IN_PROGRESS);
        u3.setRemark("Road roller and cold mix asphalt crew deployed on site.");
        u3.setUpdatedBy(admin);
        u3.setUpdatedByName(admin.getFullName());
        c1.getUpdates().add(u3);

        complaintRepository.save(c1);

        Assignment a1 = new Assignment();
        a1.setComplaint(c1);
        a1.setDepartment("Road Infrastructure & Highway Maintenance");
        a1.setTeamName("Asphalt Quick Response Crew 3");
        a1.setOfficerName("Engineer R. Deshmukh");
        a1.setOfficerContact("+91 94480 11223");
        a1.setNotes("Night-shift resurfacing scheduled between 11 PM and 4 AM.");
        a1.setAssignedBy(admin);
        assignmentRepository.save(a1);
        c1.setAssignment(a1);
        complaintRepository.save(c1);

        // 2. High Voltage Streetlight Failure (Resolved)
        Complaint c2 = new Complaint();
        c2.setTrackingCode("CP-2026-B882E1");
        c2.setTitle("Series of 5 streetlights dark on Brigade Crossway");
        c2.setDescription("Continuous dark stretch posing severe pedestrian safety hazards after 7 PM.");
        c2.setCategory(ComplaintCategory.STREETLIGHTS);
        c2.setPriority(ComplaintPriority.MEDIUM);
        c2.setStatus(ComplaintStatus.RESOLVED);
        c2.setAddress("4th Cross, Brigade Road Avenue");
        c2.setLandmark("Near Public Library");
        c2.setWard("Ward 12 - Brigade Quarter");
        c2.setLatitude(12.973400);
        c2.setLongitude(77.607500);
        c2.setCitizen(citizen);

        ComplaintUpdate u21 = new ComplaintUpdate();
        u21.setComplaint(c2);
        u21.setStatus(ComplaintStatus.SUBMITTED);
        u21.setRemark("Complaint logged by citizen.");
        u21.setUpdatedBy(citizen);
        u21.setUpdatedByName(citizen.getFullName());
        c2.getUpdates().add(u21);

        ComplaintUpdate u22 = new ComplaintUpdate();
        u22.setComplaint(c2);
        u22.setStatus(ComplaintStatus.RESOLVED);
        u22.setRemark("Burnt junction fuse replaced and new LED modular luminaire installed.");
        u22.setUpdatedBy(admin);
        u22.setUpdatedByName(admin.getFullName());
        c2.getUpdates().add(u22);

        complaintRepository.save(c2);

        Assignment a2 = new Assignment();
        a2.setComplaint(c2);
        a2.setDepartment("Municipal Electrical Engineering");
        a2.setTeamName("Lighting Rapid Squad East");
        a2.setOfficerName("Technician K. Nair");
        a2.setOfficerContact("+91 94480 33445");
        a2.setNotes("Tested line voltage; all luminaires verified operational.");
        a2.setAssignedBy(admin);
        assignmentRepository.save(a2);
        c2.setAssignment(a2);

        Feedback fb2 = new Feedback();
        fb2.setComplaint(c2);
        fb2.setCitizen(citizen);
        fb2.setRating(5);
        fb2.setComment("Fixed within 24 hours. The street is safe and well lit again. Excellent municipal support!");
        feedbackRepository.save(fb2);
        c2.setFeedback(fb2);
        complaintRepository.save(c2);

        // 3. Overflowing Garbage Bin (Assigned)
        Complaint c3 = new Complaint();
        c3.setTrackingCode("CP-2026-C339F2");
        c3.setTitle("Overflowing community dump and foul odor");
        c3.setDescription("Solid waste accumulated over 3 days, blocking the sidewalk and attracting stray dogs.");
        c3.setCategory(ComplaintCategory.GARBAGE_COLLECTION);
        c3.setPriority(ComplaintPriority.HIGH);
        c3.setStatus(ComplaintStatus.ASSIGNED);
        c3.setAddress("Residency Road, Corner of 2nd Cross");
        c3.setLandmark("Beside Government Boys High School");
        c3.setWard("Ward 14 - MG Road Central");
        c3.setLatitude(12.968200);
        c3.setLongitude(77.601400);
        c3.setCitizen(citizen);

        ComplaintUpdate u31 = new ComplaintUpdate();
        u31.setComplaint(c3);
        u31.setStatus(ComplaintStatus.SUBMITTED);
        u31.setRemark("Complaint logged by citizen.");
        u31.setUpdatedBy(citizen);
        u31.setUpdatedByName(citizen.getFullName());
        c3.getUpdates().add(u31);

        complaintRepository.save(c3);

        Assignment a3 = new Assignment();
        a3.setComplaint(c3);
        a3.setDepartment("Solid Waste Management & Sanitation");
        a3.setTeamName("Sanitation Compactor Truck Fleet 7");
        a3.setOfficerName("Supervisor M. Khan");
        a3.setOfficerContact("+91 94480 55667");
        a3.setNotes("Compactor dispatched for priority morning clearance.");
        a3.setAssignedBy(admin);
        assignmentRepository.save(a3);
        c3.setAssignment(a3);
        complaintRepository.save(c3);

        // 4. Main Pipeline Burst (Under Review)
        Complaint c4 = new Complaint();
        c4.setTrackingCode("CP-2026-D441A9");
        c4.setTitle("Drinking water pipeline leakage wasting thousands of liters");
        c4.setDescription("Pressurized clean water leaking onto the street from an underground joint rupture.");
        c4.setCategory(ComplaintCategory.WATER_LEAKAGE);
        c4.setPriority(ComplaintPriority.URGENT);
        c4.setStatus(ComplaintStatus.UNDER_REVIEW);
        c4.setAddress("Lavelle Road, Near Gate 3");
        c4.setLandmark("Near Richmond Park");
        c4.setWard("Ward 15 - Richmond Town");
        c4.setLatitude(12.965800);
        c4.setLongitude(77.599200);
        c4.setCitizen(citizen);

        ComplaintUpdate u41 = new ComplaintUpdate();
        u41.setComplaint(c4);
        u41.setStatus(ComplaintStatus.SUBMITTED);
        u41.setRemark("Emergency water pipeline report submitted.");
        u41.setUpdatedBy(citizen);
        u41.setUpdatedByName(citizen.getFullName());
        c4.getUpdates().add(u41);

        complaintRepository.save(c4);

        // 5. Blocked Stormwater Drain (Resolved)
        Complaint c5 = new Complaint();
        c5.setTrackingCode("CP-2026-E552D8");
        c5.setTitle("Stormwater drain clogged with silt causing local waterlogging");
        c5.setDescription("Monsoon drain clogged with construction debris, causing water accumulation during rains.");
        c5.setCategory(ComplaintCategory.DRAINAGE);
        c5.setPriority(ComplaintPriority.MEDIUM);
        c5.setStatus(ComplaintStatus.RESOLVED);
        c5.setAddress("Koramangala 80ft Road, 4th Block");
        c5.setLandmark("Near Regional Passport Office");
        c5.setWard("Ward 18 - Koramangala South");
        c5.setLatitude(12.935200);
        c5.setLongitude(77.624500);
        c5.setCitizen(citizen);

        ComplaintUpdate u51 = new ComplaintUpdate();
        u51.setComplaint(c5);
        u51.setStatus(ComplaintStatus.RESOLVED);
        u51.setRemark("Suction desilting machine cleared 120m of stormwater conduits.");
        u51.setUpdatedBy(admin);
        u51.setUpdatedByName(admin.getFullName());
        c5.getUpdates().add(u51);

        complaintRepository.save(c5);

        Feedback fb5 = new Feedback();
        fb5.setComplaint(c5);
        fb5.setCitizen(citizen);
        fb5.setRating(4);
        fb5.setComment("Desilting was thorough. Street no longer floods during heavy rain.");
        feedbackRepository.save(fb5);
        c5.setFeedback(fb5);
        complaintRepository.save(c5);

        // Seed notifications for citizen
        notificationService.notifyUser(
                citizen,
                c1,
                "Crew Dispatched: MG Road Junction",
                "Asphalt Quick Response Crew 3 is currently on site repairing the road crater.",
                "IN_PROGRESS"
        );
        notificationService.notifyUser(
                citizen,
                c2,
                "Complaint Resolved: Brigade Crossway",
                "Your streetlight report CP-2026-B882E1 has been resolved by Municipal Electrical Engineering.",
                "RESOLVED"
        );
        notificationService.notifyUser(
                citizen,
                c3,
                "Field Team Assigned: Residency Road",
                "Assigned to Sanitation Compactor Truck Fleet 7 for scheduled pickup.",
                "ASSIGNED"
        );
    }
}
