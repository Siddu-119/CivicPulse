package com.civicpulse.service;

import com.civicpulse.dto.ClassificationResponse;
import com.civicpulse.entity.ComplaintCategory;
import com.civicpulse.entity.ComplaintPriority;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SmartClassificationServiceTest {

    private SmartClassificationService service;

    @BeforeEach
    void setUp() {
        service = new SmartClassificationService();
    }

    @Test
    @DisplayName("Should accurately classify road pothole incident with high priority")
    void testClassifyPothole() {
        ClassificationResponse res = service.classify(
                "Large pothole near the main road causing accidents",
                "Deep crater on the asphalt causing dangerous skids for two-wheelers."
        );

        assertNotNull(res);
        assertEquals(ComplaintCategory.ROADS_POTHOLES, res.category());
        assertTrue(res.priority() == ComplaintPriority.HIGH || res.priority() == ComplaintPriority.URGENT);
        assertTrue(res.department().toLowerCase().contains("road") || res.department().toLowerCase().contains("highway"));
        assertTrue(res.confidenceScore() > 0.7);
        assertTrue(res.detectedKeywords().contains("pothole"));
    }

    @Test
    @DisplayName("Should classify dark streetlight failure accurately")
    void testClassifyStreetlight() {
        ClassificationResponse res = service.classify(
                "Streetlight near the bus stop is not working",
                "Complete darkness along the walkway due to a broken bulb and pole."
        );

        assertNotNull(res);
        assertEquals(ComplaintCategory.STREETLIGHTS, res.category());
        assertEquals(ComplaintPriority.MEDIUM, res.priority());
        assertTrue(res.department().toLowerCase().contains("electrical") || res.department().toLowerCase().contains("light"));
        assertTrue(res.detectedKeywords().contains("streetlight") || res.detectedKeywords().contains("light"));
    }

    @Test
    @DisplayName("Should detect urgent priority when live wire hazard is reported")
    void testClassifyUrgentHazard() {
        ClassificationResponse res = service.classify(
                "Live wire sparking near primary school",
                "Fallen electrical wire emitting sparks after heavy rain; urgent danger to children."
        );

        assertNotNull(res);
        assertEquals(ComplaintPriority.URGENT, res.priority());
        assertTrue(res.reason().contains("URGENT") || res.reason().contains("indicators"));
    }

    @Test
    @DisplayName("Should classify garbage accumulation into Solid Waste department")
    void testClassifyGarbage() {
        ClassificationResponse res = service.classify(
                "Overflowing trash bin and stinking waste",
                "Garbage hasn't been picked up for 4 days, causing foul smell."
        );

        assertNotNull(res);
        assertEquals(ComplaintCategory.GARBAGE_COLLECTION, res.category());
        assertTrue(res.department().toLowerCase().contains("waste") || res.department().toLowerCase().contains("sanitation"));
    }

    @Test
    @DisplayName("Should classify water supply leak")
    void testClassifyWaterLeak() {
        ClassificationResponse res = service.classify(
                "Drinking water pipe burst on 3rd main",
                "Clean pipeline burst wasting gallons of water onto the road."
        );

        assertNotNull(res);
        assertEquals(ComplaintCategory.WATER_LEAKAGE, res.category());
        assertTrue(res.department().toLowerCase().contains("water"));
    }

    public static void main(String[] args) {
        System.out.println("Running SmartClassificationServiceTest directly...");
        SmartClassificationServiceTest test = new SmartClassificationServiceTest();
        test.setUp();
        test.testClassifyPothole();
        System.out.println("  [PASS] testClassifyPothole");

        test.setUp();
        test.testClassifyStreetlight();
        System.out.println("  [PASS] testClassifyStreetlight");

        test.setUp();
        test.testClassifyUrgentHazard();
        System.out.println("  [PASS] testClassifyUrgentHazard");

        test.setUp();
        test.testClassifyGarbage();
        System.out.println("  [PASS] testClassifyGarbage");

        test.setUp();
        test.testClassifyWaterLeak();
        System.out.println("  [PASS] testClassifyWaterLeak");

        System.out.println("All 5 SmartClassificationService tests passed successfully!");
    }
}
