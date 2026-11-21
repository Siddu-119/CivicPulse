package com.civicpulse.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService("c3VwZXJzZWNyZXRqd3R0b2tlbnByb3Zpc2lvbmVkZm9yY2l2aWNwdWxzZXBsYXRmb3JtdjI=", 86400000L);
    }

    @Test
    @DisplayName("Should generate valid token and extract email")
    void testGenerateAndExtractEmail() {
        UserDetails userDetails = new User("citizen@civicpulse.org", "pass", Collections.emptyList());
        String token = jwtService.generateToken("citizen@civicpulse.org", "ROLE_CITIZEN");

        assertNotNull(token);
        assertFalse(token.isEmpty());

        String email = jwtService.extractEmail(token);
        assertEquals("citizen@civicpulse.org", email);
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    @DisplayName("Should fail token validation for mismatched user")
    void testMismatchedUserValidation() {
        UserDetails userDetails1 = new User("citizen@civicpulse.org", "pass", Collections.emptyList());
        UserDetails userDetails2 = new User("admin@civicpulse.gov", "pass", Collections.emptyList());

        String token = jwtService.generateToken("citizen@civicpulse.org", "ROLE_CITIZEN");
        assertFalse(jwtService.isTokenValid(token, userDetails2));
    }

    public static void main(String[] args) {
        System.out.println("Running JwtServiceTest directly...");
        JwtServiceTest test = new JwtServiceTest();
        test.setUp();
        test.testGenerateAndExtractEmail();
        System.out.println("  [PASS] testGenerateAndExtractEmail");

        test.setUp();
        test.testMismatchedUserValidation();
        System.out.println("  [PASS] testMismatchedUserValidation");

        System.out.println("All JwtService tests passed successfully!");
    }
}
