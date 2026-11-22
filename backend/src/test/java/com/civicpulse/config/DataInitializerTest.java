package com.civicpulse.config;

import com.civicpulse.entity.*;
import com.civicpulse.repository.AssignmentRepository;
import com.civicpulse.repository.ComplaintRepository;
import com.civicpulse.repository.FeedbackRepository;
import com.civicpulse.repository.UserRepository;
import com.civicpulse.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private Environment environment;

    private static final String VALID_PROD_PASSWORD = "SuperSecureMunicipal2026Password!";
    private static final String DEFAULT_DEV_PASSWORD = "Admin@12345";

    @BeforeEach
    void setUp() {
        lenient().when(passwordEncoder.encode(anyString())).thenAnswer(inv -> "BCRYPT_HASH_" + inv.getArgument(0));
        lenient().when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        lenient().when(complaintRepository.save(any(Complaint.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(assignmentRepository.save(any(Assignment.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(feedbackRepository.save(any(Feedback.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private DataInitializer createInitializer(
            String email,
            String password,
            boolean requireSecurePassword,
            boolean seedSampleData
    ) {
        return new DataInitializer(
                userRepository,
                complaintRepository,
                assignmentRepository,
                feedbackRepository,
                notificationService,
                passwordEncoder,
                environment,
                email,
                password,
                requireSecurePassword,
                seedSampleData
        );
    }

    @Test
    @DisplayName("1. Production startup must fail fast if ADMIN_PASSWORD is missing or blank")
    void testProductionStartupFailsWithMissingPassword() {
        when(environment.matchesProfiles("prod", "production")).thenReturn(true);
        DataInitializer initializer = createInitializer("admin@civicpulse.gov", "", false, false);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> initializer.run());
        assertTrue(ex.getMessage().contains("CRITICAL SECURITY CONFIGURATION ERROR"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("2. Production startup must fail if ADMIN_PASSWORD equals known development default")
    void testProductionStartupFailsWithKnownDefaultPassword() {
        DataInitializer initializer = createInitializer("admin@civicpulse.gov", DEFAULT_DEV_PASSWORD, true, false);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> initializer.run());
        assertTrue(ex.getMessage().contains("default development password is strictly prohibited"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("3. Production startup must reject passwords shorter than 16 characters")
    void testProductionStartupRejectsPasswordShorterThan16Chars() {
        DataInitializer initializer = createInitializer("admin@civicpulse.gov", "ShortPass12345!", true, false);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> initializer.run());
        assertTrue(ex.getMessage().contains("at least 16 characters long"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("4. Production startup must accept valid custom password (>= 16 characters)")
    void testProductionStartupAcceptsValidCustomPassword() {
        when(environment.matchesProfiles("prod", "production")).thenReturn(true);
        when(userRepository.findByEmail("admin@civicpulse.gov")).thenReturn(Optional.empty());

        DataInitializer initializer = createInitializer("admin@civicpulse.gov", VALID_PROD_PASSWORD, false, false);
        assertDoesNotThrow(() -> initializer.run());

        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("5. Initial admin password must be securely BCrypt hashed before persistence")
    void testAdminPasswordIsBcryptHashed() {
        when(userRepository.findByEmail("admin@civicpulse.gov")).thenReturn(Optional.empty());

        DataInitializer initializer = createInitializer("admin@civicpulse.gov", VALID_PROD_PASSWORD, true, false);
        initializer.run();

        verify(passwordEncoder).encode(VALID_PROD_PASSWORD);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedAdmin = userCaptor.getValue();

        assertEquals("admin@civicpulse.gov", savedAdmin.getEmail());
        assertEquals(Role.ADMIN, savedAdmin.getRole());
        assertEquals("BCRYPT_HASH_" + VALID_PROD_PASSWORD, savedAdmin.getPassword());
    }

    @Test
    @DisplayName("6. When SEED_SAMPLE_DATA=false, skip demo citizen, complaints, and all demo records")
    void testDemoSeedingDisabledCleanState() {
        when(userRepository.findByEmail("admin@civicpulse.gov")).thenReturn(Optional.empty());

        DataInitializer initializer = createInitializer("admin@civicpulse.gov", VALID_PROD_PASSWORD, true, false);
        initializer.run();

        // Admin was created
        verify(userRepository).save(argThat(u -> u.getEmail().equals("admin@civicpulse.gov")));

        // Demo citizen was NOT queried or created
        verify(userRepository, never()).findByEmail("citizen@civicpulse.org");
        verify(userRepository, never()).save(argThat(u -> u.getEmail().equals("citizen@civicpulse.org")));

        // Sample complaints, assignments, feedback, notifications were NOT created
        verify(complaintRepository, never()).count();
        verify(complaintRepository, never()).save(any(Complaint.class));
        verify(assignmentRepository, never()).save(any(Assignment.class));
        verify(feedbackRepository, never()).save(any(Feedback.class));
        verifyNoInteractions(notificationService);
    }

    @Test
    @DisplayName("7. When SEED_SAMPLE_DATA=true, create demo citizen and all 5 sample complaints with complete relationships")
    void testDemoSeedingEnabledCreatesCompleteSampleData() {
        when(userRepository.findByEmail("admin@civicpulse.gov")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("citizen@civicpulse.org")).thenReturn(Optional.empty());
        when(complaintRepository.count()).thenReturn(0L);

        DataInitializer initializer = createInitializer("admin@civicpulse.gov", DEFAULT_DEV_PASSWORD, false, true);
        initializer.run();

        // Demo citizen created with BCrypt
        verify(userRepository).save(argThat(u -> u.getEmail().equals("citizen@civicpulse.org") && u.getRole() == Role.CITIZEN));
        verify(passwordEncoder).encode("Citizen@12345");

        // 5 sample complaints saved
        verify(complaintRepository, atLeast(5)).save(any(Complaint.class));

        // Assignments and feedback saved
        verify(assignmentRepository, atLeast(3)).save(any(Assignment.class));
        verify(feedbackRepository, atLeast(2)).save(any(Feedback.class));

        // Notifications dispatched
        verify(notificationService, times(3)).notifyUser(any(User.class), any(Complaint.class), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("8. Repeated initialization with SEED_SAMPLE_DATA=true must not create duplicate complaints")
    void testRepeatedInitializationDoesNotCreateDuplicates() {
        User existingAdmin = new User();
        existingAdmin.setEmail("admin@civicpulse.gov");
        existingAdmin.setRole(Role.ADMIN);

        User existingCitizen = new User();
        existingCitizen.setEmail("citizen@civicpulse.org");
        existingCitizen.setRole(Role.CITIZEN);

        when(userRepository.findByEmail("admin@civicpulse.gov")).thenReturn(Optional.of(existingAdmin));
        when(userRepository.findByEmail("citizen@civicpulse.org")).thenReturn(Optional.of(existingCitizen));
        when(complaintRepository.count()).thenReturn(5L);

        DataInitializer initializer = createInitializer("admin@civicpulse.gov", DEFAULT_DEV_PASSWORD, false, true);
        initializer.run();

        // Zero saves performed because accounts and complaints already exist
        verify(userRepository, never()).save(any(User.class));
        verify(complaintRepository, never()).save(any(Complaint.class));
        verify(assignmentRepository, never()).save(any(Assignment.class));
        verify(feedbackRepository, never()).save(any(Feedback.class));
        verifyNoInteractions(notificationService);
    }

    @Test
    @DisplayName("9. Existing admin credentials and role must never be overwritten on startup")
    void testExistingAdminCredentialsAreNotOverwritten() {
        User existingAdmin = new User();
        existingAdmin.setId(99L);
        existingAdmin.setFullName("Existing Super Admin");
        existingAdmin.setEmail("admin@civicpulse.gov");
        existingAdmin.setPassword("$2a$12$EXISTING_BCRYPT_HASH_PRESERVED");
        existingAdmin.setRole(Role.ADMIN);

        when(userRepository.findByEmail("admin@civicpulse.gov")).thenReturn(Optional.of(existingAdmin));

        DataInitializer initializer = createInitializer("admin@civicpulse.gov", VALID_PROD_PASSWORD, true, false);
        initializer.run();

        // Existing admin was not saved or overwritten
        verify(userRepository, never()).save(existingAdmin);
        assertEquals("$2a$12$EXISTING_BCRYPT_HASH_PRESERVED", existingAdmin.getPassword());
        assertEquals("Existing Super Admin", existingAdmin.getFullName());
    }
}
