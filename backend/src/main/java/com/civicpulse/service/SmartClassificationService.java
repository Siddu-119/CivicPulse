package com.civicpulse.service;

import com.civicpulse.dto.ClassificationResponse;
import com.civicpulse.entity.ComplaintCategory;
import com.civicpulse.entity.ComplaintPriority;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SmartClassificationService {

    private record Rule(
            ComplaintCategory category,
            String department,
            List<String> keywords
    ) {}

    private static final List<Rule> CATEGORY_RULES = List.of(
            new Rule(
                    ComplaintCategory.ROADS_POTHOLES,
                    "Road Infrastructure & Highway Maintenance",
                    List.of("pothole", "potholes", "road", "roads", "asphalt", "crater", "pavement",
                            "crack", "tar", "speedbreaker", "speed breaker", "footpath", "sidewalk",
                            "divider", "highway", "lane", "surface", "cave-in")
            ),
            new Rule(
                    ComplaintCategory.GARBAGE_COLLECTION,
                    "Solid Waste Management & Sanitation",
                    List.of("garbage", "trash", "waste", "rubbish", "litter", "dump", "dustbin",
                            "bin", "refuse", "stink", "smell", "rotten", "debris", "plastic",
                            "overflowing bin", "dumpster", "compost", "uncollected")
            ),
            new Rule(
                    ComplaintCategory.STREETLIGHTS,
                    "Municipal Electrical Engineering",
                    List.of("streetlight", "street light", "streetlights", "light", "lamp", "pole",
                            "dark", "darkness", "bulb", "lighting", "flicker", "blackout",
                            "no light", "wiring", "short circuit", "fuse")
            ),
            new Rule(
                    ComplaintCategory.WATER_LEAKAGE,
                    "Water Supply & Hydro Works",
                    List.of("water leak", "pipeline", "pipe", "burst", "water supply", "drinking water",
                            "leakage", "water pressure", "contamination", "valve", "seepage",
                            "tanker", "main line", "tap", "dirty water")
            ),
            new Rule(
                    ComplaintCategory.DRAINAGE,
                    "Stormwater & Drainage Division",
                    List.of("drain", "drainage", "sewage", "gutter", "stormwater", "overflow",
                            "manhole", "clogged", "choked", "flooding", "waterlogging",
                            "culvert", "silt", "foul water", "sewer")
            ),
            new Rule(
                    ComplaintCategory.PUBLIC_SANITATION,
                    "Public Health & Sanitation Dept",
                    List.of("public toilet", "urinal", "washroom", "defecation", "hygiene",
                            "mosquito", "dengue", "fogging", "pest", "dead animal", "carcass",
                            "sanitary", "stagnant", "epidemic", "cleanliness")
            )
    );

    private static final List<String> URGENT_KEYWORDS = List.of(
            "accident", "fatal", "electrocution", "live wire", "sparking", "fire",
            "explosion", "collapse", "hospital", "school", "emergency", "severe flooding",
            "gas leak", "poison", "life threatening"
    );

    private static final List<String> HIGH_KEYWORDS = List.of(
            "danger", "dangerous", "major", "huge", "deep", "main road", "highway",
            "blocking traffic", "overflowing", "immediate", "urgent", "choked",
            "hazard", "risk", "injuries", "elderly", "children"
    );

    private static final List<String> LOW_KEYWORDS = List.of(
            "minor", "small", "paint", "cosmetic", "suggestion", "slight",
            "routine", "inconvenience", "delayed"
    );

    public ClassificationResponse classify(String title, String description) {
        String combined = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase(Locale.ROOT);

        Map<ComplaintCategory, Integer> categoryScores = new EnumMap<>(ComplaintCategory.class);
        Map<ComplaintCategory, List<String>> matchedTerms = new EnumMap<>(ComplaintCategory.class);

        for (Rule rule : CATEGORY_RULES) {
            int score = 0;
            List<String> hits = new ArrayList<>();
            for (String kw : rule.keywords()) {
                if (combined.contains(kw)) {
                    // Title matches carry extra weight
                    int weight = (title != null && title.toLowerCase(Locale.ROOT).contains(kw)) ? 3 : 1;
                    score += weight;
                    hits.add(kw);
                }
            }
            if (score > 0) {
                categoryScores.put(rule.category(), score);
                matchedTerms.put(rule.category(), hits);
            }
        }

        ComplaintCategory bestCategory = ComplaintCategory.OTHER;
        String bestDepartment = "General Municipal Administration";
        List<String> keywords = new ArrayList<>();
        int maxScore = 0;

        for (Map.Entry<ComplaintCategory, Integer> entry : categoryScores.entrySet()) {
            if (entry.getValue() > maxScore) {
                maxScore = entry.getValue();
                bestCategory = entry.getKey();
            }
        }

        if (bestCategory != ComplaintCategory.OTHER) {
            keywords = matchedTerms.getOrDefault(bestCategory, List.of());
            for (Rule rule : CATEGORY_RULES) {
                if (rule.category() == bestCategory) {
                    bestDepartment = rule.department();
                    break;
                }
            }
        }

        // Priority determination
        ComplaintPriority priority = ComplaintPriority.MEDIUM;
        List<String> priorityHits = new ArrayList<>();

        for (String kw : URGENT_KEYWORDS) {
            if (combined.contains(kw)) {
                priority = ComplaintPriority.URGENT;
                priorityHits.add(kw);
                break;
            }
        }

        if (priority != ComplaintPriority.URGENT) {
            for (String kw : HIGH_KEYWORDS) {
                if (combined.contains(kw)) {
                    priority = ComplaintPriority.HIGH;
                    priorityHits.add(kw);
                    break;
                }
            }
        }

        if (priority == ComplaintPriority.MEDIUM) {
            for (String kw : LOW_KEYWORDS) {
                if (combined.contains(kw)) {
                    priority = ComplaintPriority.LOW;
                    priorityHits.add(kw);
                    break;
                }
            }
        }

        double confidence = bestCategory == ComplaintCategory.OTHER
                ? 0.50
                : Math.min(0.98, 0.65 + (maxScore * 0.08));

        StringBuilder reasoning = new StringBuilder();
        if (!keywords.isEmpty()) {
            reasoning.append("Identified civic keywords [")
                    .append(String.join(", ", keywords))
                    .append("] mapping to ")
                    .append(bestCategory.name().replace('_', ' '))
                    .append(". ");
        } else {
            reasoning.append("No specific infrastructure category matched directly; categorized as OTHER. ");
        }

        if (!priorityHits.isEmpty()) {
            reasoning.append("Assessed priority as ")
                    .append(priority.name())
                    .append(" due to indicators [")
                    .append(String.join(", ", priorityHits))
                    .append("].");
        } else {
            reasoning.append("Assigned standard MEDIUM priority based on normal municipal triage protocol.");
        }

        List<String> allDetected = new ArrayList<>(keywords);
        allDetected.addAll(priorityHits);

        return new ClassificationResponse(
                bestCategory,
                priority,
                bestDepartment,
                Math.round(confidence * 100.0) / 100.0,
                allDetected,
                reasoning.toString()
        );
    }
}
