# CivicPulse V2 — Official Hackathon Demonstration Guide & Pitch Script

> **Project Name:** CivicPulse V2  
> **Tagline:** Report. Track. Resolve. Empowering Responsive Urban Governance.  
> **Evaluation Round:** Round 2 Hackathon Final Submission  
> **Live Web Application:** [https://civicpulse-governance.vercel.app/](https://civicpulse-governance.vercel.app/)  
> **Live API Backend:** [https://civicpulse-backend-pill.onrender.com](https://civicpulse-backend-pill.onrender.com)  
> **Source Repository:** [https://github.com/Siddu-119/CivicPulse](https://github.com/Siddu-119/CivicPulse)  
> **Evidence Directory:** `evidence/`

---

## 1. Hackathon Executive Summary

CivicPulse V2 bridges the communication breakdown between urban citizens and municipal departments. Built with **React 19**, **TypeScript**, **Spring Boot 4.0.9 (Java 25)**, and **TiDB Cloud Serverless**, the platform delivers an end-to-end civic management pipeline:
1. **Citizens** submit geo-tagged infrastructure issues with instant, rule-based NLP classification, track tickets via public tracking codes without logins, and evaluate completed work with 1-to-5 star ratings.
2. **Municipal Administrators** triage complaints using an operational command center with geospatial mapping, multi-department team assignment, status audit histories, and operational trend analytics with one-click CSV export.

---

## 2. 3–4 Minute Live Pitch Script

*Pacing: Natural, confident, conversational delivery. Total duration: ~3 minutes 30 seconds.*

```text
[Opening — 0:00]
"Cities face everyday challenges: damaged roads, overflowing waste, waterlogging, and public
infrastructure problems. But reporting these issues and ensuring they reach the right authorities
can be difficult.

Introducing CivicPulse V2 — a smart civic complaint and resolution platform designed to connect
citizens with municipal authorities."

[Platform overview — 0:15]
"CivicPulse provides a centralized digital platform where citizens can report civic problems,
follow complaint progress, and view reported issues through an interactive map.

Its goal is simple: make civic issue reporting more accessible, transparent, and organized."

[Citizen experience — 0:40]
"Citizens can access the platform through its authentication system and their personal dashboard.

The dashboard provides an overview of reported complaints and their statuses, helping citizens
keep track of the issues they have raised."

[Smart classification — 1:10]
"One of CivicPulse's key features is its rule-based smart classification system.

When a civic issue is described, the system analyzes relevant keywords and patterns to identify
its category, estimate priority, and recommend the appropriate department.

For example, a report describing a hazardous pothole can be classified under roads and potholes,
with high priority and a suggested department.

This helps organize incoming complaints and supports more consistent routing."

[Interactive map — 1:50]
"CivicPulse also includes an interactive map powered by Leaflet and OpenStreetMap.

Citizens and administrators can explore the geographic distribution of civic issues and view
complaint markers and categories.

This location-based view helps make reported problems easier to understand."

[Complaint tracking — 2:20]
"Transparency is another important part of the platform.

Through the public tracking portal, users can check complaint progress using a tracking code
without needing to navigate the entire dashboard.

The platform also supports complaint updates, notifications, and citizen feedback."

[Administration — 2:50]
"On the administrative side, CivicPulse provides tools for reviewing complaints, assigning them
to the appropriate workflow, monitoring resolution status, and viewing analytics.

These capabilities are part of the implemented application. This demonstration presents the
administrative workflow using verified project evidence."

[Technology and closing — 3:15]
"CivicPulse V2 is built using React, TypeScript, Java, Spring Boot, Spring Security, JWT
authentication, and TiDB Cloud Serverless.

The frontend is deployed on Vercel, while the backend runs on Render.

CivicPulse brings together technology, transparency, and civic participation to support smarter
urban governance.

CivicPulse V2 — making every civic issue count.

Thank you."
```

---

## 3. Step-by-Step Presenter Execution Guide

Follow this exact choreography during your live demo.

### Stage 1: Public Landing Page & City Stats
- **URL:** [https://civicpulse-governance.vercel.app/](https://civicpulse-governance.vercel.app/)
- **Screenshot Reference:** `evidence/01-landing-page.png`
- **Action:** Open browser. Scroll gently from Hero section down to City KPI counters.
- **What to Point Out:**
  - Hero headline: *"Report. Track. Resolve. Build Better Cities."*
  - Key City Stats cards: *Total Logged (140+), Resolved Cases (112), Active Ops (28), Citizen Rating (4.8/5.0)*.
  - Interactive issue map preview banner and quick tracking lookup bar.
- **Presenter Spoken Cue:**  
  *"We start on the public landing page. Any resident can immediately see overall municipal velocity, verify that reports are actively being resolved, or track a ticket without creating an account."*

---

### Stage 2: Authentication & Reviewer Quick-Fill
- **URL:** [https://civicpulse-governance.vercel.app/auth](https://civicpulse-governance.vercel.app/auth)
- **Screenshot Reference:** `evidence/02-authentication.png`
- **Action:** Click **"Sign In"** in the top navigation bar.
- **What to Point Out:**
  - Dual-mode card: Tab toggle between *Sign In* and *Create Citizen Account*.
  - Notice the **"Round 2 Reviewer Quick-Fill Credentials"** ribbon at the bottom of the card.
  - Point to the **"Demo Citizen"** button (`citizen@civicpulse.org`).
- **Presenter Spoken Cue:**  
  *"For hackathon evaluators, we integrated a one-click Quick-Fill ribbon. Clicking 'Demo Citizen' instantly populates pre-seeded credentials for Ward 14."*
- **Click Action:** Click the **"Demo Citizen"** button, then click **"Sign In to Portal"**.

---

### Stage 3: Citizen Dashboard & Historical Reports
- **URL:** [https://civicpulse-governance.vercel.app/citizen](https://civicpulse-governance.vercel.app/citizen)
- **Screenshot Reference:** `evidence/03-citizen-dashboard.png`
- **What to Point Out:**
  - Authenticated citizen banner: *Aarav Sharma · Ward 14 - MG Road Central*.
  - Historical complaints list: 5 seeded records (`CP-2026-E552D8`, `CP-2026-D441A9`, etc.).
  - Status badges (*Resolved*, *In Progress*, *Under Review*) and citizen satisfaction rating tags (*Rated 5 ★*).
  - Status filter tabs across the top: *All Reports, Submitted, Under Review, Assigned, In Progress, Resolved, Rejected*.
- **Presenter Spoken Cue:**  
  *"Once authenticated, Aarav has full visibility into his personal reports, complete with tracking codes, status timelines, and officer assignment notes."*

---

### Stage 4: Smart Classification Engine Demonstration
- **URL:** [https://civicpulse-governance.vercel.app/citizen](https://civicpulse-governance.vercel.app/citizen)
- **Screenshot Reference:** `evidence/04-complaint-classification.png`
- **Action:** In the **"File New Infrastructure Complaint"** form on the citizen page:
  1. Click the **Title** input and type: `Deep hazardous pothole on MG Road near metro station`
  2. Click the **Description** input and type: `Large crater causing traffic disruption and risk of vehicle damage`
  3. Pause for 1 second.
- **What to Point Out:**
  - The **Smart Complaint Classifier** card dynamically activates below the fields.
  - **Confidence Score:** `98% match`
  - **Suggested Category:** `Roads & Potholes`
  - **Inferred Urgency:** `High`
  - **Routing Department:** `Road Infrastructure & Highway Maintenance`
  - **Signal Keyword Pills:** `# pothole`, `# road`, `# deep`
  - **Heuristic Reasoning:** *"Identified civic keywords [pothole, road] mapping to ROADS POTHOLES. Assessed priority as HIGH due to indicators [deep]."*
- **Presenter Spoken Cue:**  
  *"Notice how our in-memory NLP service immediately infers category, urgency, and the responsible department in real time, with zero API latency and zero cloud costs. To protect live production data, we do not click submit—the citizen can review recommendations and modify any field before submission."*
- **Safety Rule:** **DO NOT CLICK SUBMIT.** Clear the form or navigate to the next page.

---

### Stage 5: Interactive City-Wide Complaint Map
- **URL:** [https://civicpulse-governance.vercel.app/map](https://civicpulse-governance.vercel.app/map)
- **Screenshot Reference:** `evidence/06-complaint-map-analytics.png`
- **Action:** Click **"Issue Map"** in the top navigation bar.
- **What to Point Out:**
  - Full-screen Leaflet OpenStreetMap viewport centered over Bengaluru urban wards (Sadashivanagar, Malleswaram, Vasanth Nagar).
  - Colored map pins indicating complaint locations and urgency.
  - Multi-dimensional filter toolbar: Category dropdown, Status dropdown, Urgency dropdown.
  - Visual mode switch: Toggle between **"Color by Status"** and **"Color by Category"**.
  - Click any marker pin to display the interactive popup card with tracking code, address, time elapsed, and "View Details" trigger.
- **Presenter Spoken Cue:**  
  *"The city map gives citizens and field officers full geospatial visibility. Issues can be filtered dynamically by category or status, and clicking any pin reveals authentic ticket metadata direct from TiDB Cloud."*

---

### Stage 6: Municipal Admin Command Center & Analytics (Code / Architecture Walkthrough)
- **Context:** Administrator access on live production is protected by the private environment variable `ADMIN_PASSWORD` (minimum 16 characters). Explain the administrative capabilities using the code and architectural evidence.
- **Presenter Spoken Cue:**  
  *"On the municipal side, our Admin Command Center at `/admin` is protected by strict role-based Spring Security. It features four dedicated views:
  1. **Triage Board:** Search and filter incoming complaints, open the assignment modal, and dispatch tickets to specific departments, field teams, and officers with dispatch notes.
  2. **Audit History:** Every status advancement (from SUBMITTED to RESOLVED) logs official remarks with timestamps and actor IDs into the `complaint_updates` table.
  3. **Operational Analytics:** 6-month intake vs. resolution trends, horizontal department capacity bars, average resolution turnaround times, and one-click CSV export.
  4. **Feedback Audit:** Continuous monitoring of citizen 1-to-5 star ratings and comments on completed municipal works."*

---

### Stage 7: Public Tracking & Transparency
- **URL:** [https://civicpulse-governance.vercel.app/track](https://civicpulse-governance.vercel.app/track)
- **Action:** Click **"Track"** in the top navigation. Enter tracking code `CP-2026-E552D8` and click Search.
- **What to Point Out:**
  - Full public tracking timeline without requiring user login.
  - Anonymized citizen information (phone numbers and emails are stripped to prevent privacy leaks).
  - Chronological audit trail showing submission timestamp, review, crew assignment, and final resolution remark.
- **Presenter Spoken Cue:**  
  *"Finally, any citizen can track ticket progress using a 10-character code. Privacy is strictly protected: personal contact details are scrubbed on all public endpoints."*

---

## 4. 15 Likely Judge Questions & Answers

### Q1: What specific civic problem does CivicPulse solve that existing government portals fail to address?
**Answer:**  
"Existing municipal complaint portals suffer from three major failures: opaque tracking, misrouted complaints, and absence of geospatial intelligence. Citizens rarely know which department owns their issue or when it will be fixed. CivicPulse solves this with automated rule-based NLP classification to eliminate routing errors, transparent public tracking timelines, and interactive OpenStreetMap geospatial mapping for both citizens and field crews."

---

### Q2: Why did you use a rule-based NLP classifier instead of an external LLM (like GPT-4 or Gemini)?
**Answer:**  
"We deliberately designed an in-memory rule-based NLP engine for three architectural reasons:
1. **Zero Recurring API Costs:** Municipalities process millions of complaints annually; third-party LLM inference would create substantial, ongoing recurring operational costs.
2. **Deterministic & Auditable:** Public infrastructure triage requires transparent, explainable decisions. Our keyword rules and category mappings are fully inspectable, unlike black-box LLM hallucinations.
3. **Low Latency & High Availability:** Our engine evaluates complaints in-memory in under 5 milliseconds with zero network dependencies, functioning reliably even during network outages."

---

### Q3: How is the classification confidence score calculated?
**Answer:**  
"In `SmartClassificationService.java`, the input text is evaluated against municipal keyword dictionaries across 6 core categories. Matches in the complaint title receive a 3x weight multiplier, while description matches carry a 1x multiplier. If no category matches, it falls back to `OTHER` with a baseline confidence of `0.50` (50%). When matches are found, the confidence score scales dynamically using the formula:
$$\text{confidence} = \min\left(0.98,\; 0.65 + (\text{maxScore} \times 0.08)\right)$$
This yields an intuitive confidence rating between 65% and 98% based on evidence strength."

---

### Q4: How is complaint priority determined?
**Answer:**  
"Priority is determined through three cascading heuristic keyword filters:
- **URGENT:** Scans for life-threatening keywords such as `accident`, `fatal`, `electrocution`, `live wire`, `sparking`, `fire`, `gas leak`, or `severe flooding`.
- **HIGH:** Scans for severe disruption keywords such as `danger`, `crater`, `deep`, `blocking traffic`, `overflowing`, or `risk`.
- **LOW:** Scans for non-critical indicators such as `minor`, `cosmetic`, `paint`, or `suggestion`.
- **Default:** If no urgency markers match, it safely defaults to `MEDIUM` in accordance with standard municipal triage protocol."

---

### Q5: How is your database structured, and why did you choose TiDB Cloud Serverless?
**Answer:**  
"Our schema consists of 6 normalized relational tables: `users`, `complaints`, `assignments`, `complaint_updates`, `feedback`, and `notifications`. We chose TiDB Cloud Serverless because:
1. **MySQL 8 Wire Compatibility:** Works seamlessly with standard Spring Data JPA, Hibernate 7, and MySQL Connector/J.
2. **Distributed Cloud Scalability:** TiDB’s distributed architecture automatically scales storage and compute without manual sharding as municipal data grows.
3. **Transport Security:** All connections enforce TLS encryption over port 4000 (`useSSL=true&requireSSL=true`)."

---

### Q6: How is user authentication and session security managed?
**Answer:**  
"Authentication is completely stateless, powered by HMAC-SHA256 signed JSON Web Tokens (JJWT 0.12.6). Passwords are never stored in plaintext—they are hashed using Spring Security's `BCryptPasswordEncoder`. The JWT carries user identity and role claims, with token expiration set to 24 hours. Each incoming request passes through our `JwtAuthenticationFilter`, which validates token integrity and loads authorities into the `SecurityContextHolder`."

---

### Q7: How do you enforce Role-Based Access Control (RBAC)?
**Answer:**  
"RBAC is enforced on both backend and frontend:
- **Backend:** `SecurityConfig.java` defines strict endpoint authorization:
  - Public (`permitAll`): `/api/auth/**`, `/api/health`, `/api/complaints/track/**`, `/api/complaints/public`, `/api/complaints/map`, `/api/complaints/classify`.
  - Citizen (`hasAnyRole('CITIZEN', 'ADMIN')`): `/api/citizen/**`, `/api/complaints` (POST).
  - Admin (`hasRole('ADMIN')`): `/api/admin/**`.
- **Frontend:** React Router routes are guarded by `<ProtectedRoute role="CITIZEN">` and `<ProtectedRoute role="ADMIN">`. Unauthorized access attempts are immediately redirected to `/auth`."

---

### Q8: How do you protect citizen privacy on public tracking pages?
**Answer:**  
"When a user looks up a ticket at `/api/complaints/track/{trackingCode}`, the backend controller constructs a specialized `ComplaintResponse` DTO that deliberately omits the reporting citizen's email, phone number, and internal system IDs, as well as the personal phone numbers of field officers. Only the public tracking code, title, category, priority, status, address, GPS coordinates, photo URL, official timeline remarks, and assigned department name are returned."

---

### Q9: What happens if an uploaded photo contains invalid or malicious content?
**Answer:**  
"In `FileStorageService.java`, uploaded files undergo strict validation before storage:
1. **MIME Type Whitelist:** Only `image/jpeg`, `image/png`, and `image/webp` are permitted. Executables or script files are rejected immediately.
2. **File Size Enforcement:** Uploads are strictly capped at 10MB via Spring's `MultipartConfig`.
3. **UUID Filename Sanitization:** Original client filenames are discarded. Files are stored using cryptographic UUIDs (`UUID.randomUUID().toString() + extension`) to prevent directory traversal or file execution attacks."

---

### Q10: How does the notification system work?
**Answer:**  
"The notification system is backed by the relational `notifications` table. When an administrator updates a complaint status in `AdminController.updateStatus()` or assigns a field team in `AdminController.assignComplaint()`, the backend automatically calls `NotificationService.createNotification()`. A persistent notification record is created for the ticket owner. On the frontend, an in-app slide-over drawer tracks unread counts and allows citizens to mark items as read individually or in bulk."

---

### Q11: How do you handle cold starts and free-tier hosting limitations on Render?
**Answer:**  
"Render's Free tier spins down container instances during inactivity. We mitigated cold-start friction through several architectural choices:
1. **Lightweight JRE 25:** Our Docker image uses `eclipse-temurin:25-jre` rather than a full JDK, minimizing container image size to reduce spin-up time.
2. **HikariCP Pool Tuning:** We configured connection pooling with `minimum-idle=2`, `maximum-pool-size=5`, and a 30-second `keepalive-time` to prevent database connection dropouts on wake-up.
3. **Graceful UI Handling:** When Axios detects container initialization latency, the frontend displays a non-blocking informative banner ('Backend may be offline or spinning up') rather than crashing."

---

### Q12: How do you handle ephemeral storage on Render Free tier?
**Answer:**  
"On Render Free tier, the local container disk is ephemeral, meaning files saved to `/app/uploads` reset on container redeployments. Crucially, **all relational complaint metadata, GPS coordinates, status audit trails, feedback ratings, and user accounts are stored in TiDB Cloud Serverless**, which is completely independent of the container lifecycle. In production deployment, the file storage service can be switched to AWS S3 or Cloudflare R2 by simply changing the storage provider bean."

---

### Q13: What automated testing was performed on the platform?
**Answer:**  
"We maintain 100% pass rate across 16 automated backend unit and integration tests executed with Maven Surefire:
- **`SmartClassificationServiceTest` (5 tests):** Validates deterministic categorization, priority escalation (URGENT/HIGH), and department routing across potholes, streetlights, garbage, water leaks, and electrical hazards.
- **`JwtServiceTest` (2 tests):** Validates HMAC-SHA256 token generation, claim extraction, expiration, and role validation.
- **`DataInitializerTest` (9 tests):** Validates idempotent database seeding, production secure admin password enforcement, and sample complaint provisioning."

---

### Q14: How does CivicPulse scale to a city with millions of residents?
**Answer:**  
"CivicPulse scales horizontally at every tier:
- **Frontend Tier:** Static assets and React bundles are distributed globally across Vercel’s Edge CDN with sub-50ms cache hits.
- **Application Tier:** The Spring Boot backend is completely stateless—sessions are managed via self-contained JWT tokens. This allows multiple container instances to sit behind a load balancer without sticky sessions.
- **Database Tier:** TiDB Cloud Serverless separates compute from storage, scaling horizontal throughput automatically to handle traffic spikes during major weather events or civic emergencies."

---

### Q15: What is your post-hackathon roadmap for CivicPulse?
**Answer:**  
"Our post-hackathon development focuses on four concrete enhancements:
1. **Automated WhatsApp / SMS Gateway Integration:** Dispatching SMS notifications via Twilio or Gupshup for citizens without smartphones.
2. **Computer Vision Photo Verification:** Running lightweight client-side edge models to verify pothole depth or waste accumulation directly from captured camera frames.
3. **IoT Sensor Ingestion:** Telemetry connectors for smart municipal streetlights and stormwater sensors to trigger automated service tickets before citizens report them.
4. **Multilingual Regional Support:** Offline localization for regional Indian languages including Kannada, Hindi, and Tamil."

---

## 5. Technical Quick-Reference Card

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                        CIVICPULSE V2 QUICK REFERENCE                       │
├────────────────────────────────────────────────────────────────────────────┤
│ Live Frontend:   https://civicpulse-governance.vercel.app/                 │
│ Live Backend:    https://civicpulse-backend-pill.onrender.com              │
│ Health Endpoint: /api/health  --> {"status":"UP","service":"CivicPulse"}   │
│ GitHub Repo:     https://github.com/Siddu-119/CivicPulse                   │
├────────────────────────────────────────────────────────────────────────────┤
│ Technology Stack:                                                          │
│   • Frontend:    React 19.0.1, TypeScript 5.7.2, Vite 6.4.6, Tailwind v4  │
│   • Mapping:     Leaflet 1.9.4 & OpenStreetMap (No Google Maps API keys)   │
│   • Backend:     Spring Boot 4.0.9, Java 25 LTS, Spring Security 7.0.8     │
│   • Auth:        JJWT 0.12.6 (HMAC-SHA256 Stateless Tokens), BCrypt        │
│   • Database:    TiDB Cloud Serverless (MySQL 8 protocol, AWS Tokyo)       │
│   • Pool:        HikariCP (Max: 5, Min-Idle: 2, Keepalive: 30s)            │
├────────────────────────────────────────────────────────────────────────────┤
│ Reviewer Credentials:                                                      │
│   • Demo Citizen: citizen@civicpulse.org / Citizen@12345 (Ward 14)         │
│   • Quick-Fill:   One-click buttons available directly on /auth page       │
│   • Admin Access: Protected via Render ADMIN_PASSWORD production secret    │
├────────────────────────────────────────────────────────────────────────────┤
│ Verified Automated Tests: 16 of 16 PASS (100% Surefire compliance)        │
│ Verified Evidence: 5 genuine PNG screenshots in /evidence directory        │
└────────────────────────────────────────────────────────────────────────────┘
```
