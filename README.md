# CivicPulse V2 — Smart City Civic Complaint Management Platform

> **Tagline:** Report. Track. Resolve. Build Smarter, Responsive Cities.  
> **Evaluation:** Round 2 Hackathon Submission  
> **Status:** Production-Ready & Feature-Complete

---

## 1. Executive Summary & Problem Statement

Modern municipalities face a communication breakdown between citizens and urban departments. Citizens struggle with opaque complaint processes, lack of real-time visibility, and disconnected departments. Meanwhile, municipal authorities grapple with unstructured complaint queues, misrouted tasks, and absence of geospatial intelligence.

**CivicPulse V2** is a modern civic-tech platform that bridges this gap. It empowers citizens to submit geo-tagged complaints with automatic rule-based NLP categorization, track resolution progress on interactive OpenStreetMap visualizers, receive persistent in-app notifications, and review completed public works. For city administrators, CivicPulse V2 provides an enterprise-grade command center featuring live geospatial clustering, department dispatch triage, automated workload distribution, and real-time operational analytics with CSV export.

---

## 2. Core V2 Feature Highlights

### 🗺️ Interactive Civic Issue Map
- **Live Leaflet OpenStreetMap Engine:** Powered by OpenStreetMap tiles and client-side marker clustering.
- **Real Backend Geodata:** Plots authentic complaint coordinates (`latitude`, `longitude`) directly from the database.
- **Multi-Dimensional Filters:** Filter issues on the map dynamically by **Category** (Roads, Water, Lighting, Drainage, etc.), **Status** (Submitted, Under Review, Assigned, In Progress, Resolved, Rejected), and **Priority** (Low, Medium, High, Urgent).
- **Dual Visual Modes:** Toggle marker pins colored by **Status** or by **Category**.
- **Interactive Pin-Drop & Browser Geolocation:** Citizens can either click anywhere on the interactive map to pin an exact incident location, or use one-click browser GPS positioning with fallback to manual address input.
- **Detailed Popup Overlays:** Instant popup cards with category badge, status indicator, address, time elapsed, and one-click "View Full Details" modal trigger.

### 📊 Advanced Analytics & Operational Trends
- **Real-Time KPI Metric Cards:** Live tallies of Total Complaints, Resolved Complaints, Active Queue, and Percentage Resolution Rate.
- **6-Month Intake vs. Resolution Trend Chart:** Visual bar & area visualization comparing month-over-month complaint intake against successful resolution velocity.
- **Department Workload Distribution:** Horizontal capacity bars showing active tickets dispatched across Road Maintenance, Electrical, BWSSB Water Board, Solid Waste Management, and Sanitation.
- **Category & Priority Breakdowns:** Detailed distribution analytics showing municipal problem hotspots and urgency levels.
- **Resolution Velocity Metric:** Real-time computation of average resolution turnaround time (in days).
- **1-Click CSV Export:** Administrators can export the comprehensive municipal analytics dataset to CSV for civic reporting and offline presentations.

### 🧠 Smart Complaint Classification Engine
- **Rule-Based Municipal NLP Service:** Evaluates complaint titles and descriptions using structured municipal heuristics and regex dictionaries without requiring paid third-party API keys.
- **Multi-Attribute Inference:** Simultaneously suggests:
  1. **Complaint Category** (e.g., `ROADS_POTHOLES`, `WATER_LEAKAGE`, `STREETLIGHTS`, `DRAINAGE`, etc.)
  2. **Priority Urgency** (e.g., `URGENT` for sparking live wires, gas leaks, and flooding; `HIGH` for accidents/craters; `MEDIUM` standard; `LOW`)
  3. **Responsible Municipal Department** (e.g., *Department of Roads & Infrastructure*, *BESCOM Electrical Division*, *BWSSB Water Board*)
- **Confidence Scoring & Signal Pill Highlights:** Displays transparent confidence rating (e.g., 94%) and highlights detected trigger keywords (e.g., `pothole`, `crater`, `spark`).
- **Single-Click Citizen Acceptance:** Citizens can preview recommendations and apply them into the form with one click, or freely modify any field manually.

### 🔔 Persistent Notification System
- **MySQL-Backed `Notification` Entity:** Stored in the database with user association, complaint link, notification type, message, read state, and timestamp.
- **Real-Time Notification Drawer:** Modern slide-over drawer accessible from the top navigation bar with unread count badge.
- **Automated Civic Triggers:** Citizens receive persistent notifications when:
  - An administrator assigns their complaint to a municipal field crew.
  - The status advances (e.g., `UNDER_REVIEW` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED`).
  - An official municipal remark or work update is published.
- **Batch & Item Actions:** Mark individual notifications as read or clear all with "Mark all as read".

### 🎨 Premium UI/UX & Mobile Responsiveness
- **Color Theme:** Deep Navy (`#0B192C`, `#1E293B`), Clean White/Light Neutral surfaces (`#F8FAFC`), and Cyan/Teal accent highlights (`#00ADB5`, `#06B6D4`).
- **Design System:** Tailored typography (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono`), glassmorphic badge accents, subtle border glows, and crisp status tags.
- **Fully Responsive Layouts:** Optimized for mobile phones, tablets, and desktop displays with responsive sidebars, fluid map viewports, stacked form grids, and collapsible navigation.
- **1-Click Demo Login:** Dedicated quick-fill buttons on the login page for **Demo Citizen** (`citizen@civicpulse.org`) and **Demo Admin** (`admin@civicpulse.gov`).

### 🛡️ Enterprise Security & Reliability
- **Stateless JWT Authentication:** HMAC-SHA256 tokens with role-based claim validation and robust fallback configuration.
- **Role-Based Authorization:** Strict boundary enforcement ensuring Citizens cannot invoke administrative triage APIs, and cannot read other citizens' non-public complaint records.
- **Sanitized Global Error Handler:** Catch-all `@ExceptionHandler` prevents database schema leakage or Java stack traces from reaching clients during server errors.
- **Secure File Validation:** Uploaded evidence photos are validated for MIME type (JPEG, PNG, WEBP), size (<10MB), and stored with random UUID filenames.
- **Public Anonymization:** Public complaint tracking endpoints (`/api/complaints/track/{code}`) strip citizen phone numbers, emails, and officer personal contact info.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 (TypeScript)
- **Tooling:** Vite 6 / Vite 8, React Router v7
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **Mapping:** Leaflet 1.9.4 & OpenStreetMap
- **HTTP Client:** Axios (configured with JWT interceptors)

### Backend
- **Framework:** Spring Boot 4.0.9 (Java 25 LTS)
- **Security:** Spring Security 7.0.8, JJWT 0.12.6 (HMAC-SHA256)
- **Persistence:** Spring Data JPA, Hibernate 7
- **Database:** MySQL 8.0 (Port 3306)
- **Build Tool:** Apache Maven 3.9.16

---

## 4. Architecture & Clean Directory Structure

```text
CivicPulse/
├── backend/                                  # Spring Boot 4.0.9 + Java 25 + MySQL 8
│   ├── src/main/java/com/civicpulse/
│   │   ├── BackendApplication.java           # Main Spring Boot entrypoint
│   │   ├── HomeController.java               # API root metadata controller
│   │   ├── config/
│   │   │   ├── SecurityConfig.java           # SecurityFilterChain & CORS rules
│   │   │   ├── WebConfig.java                # Static resource upload mapping
│   │   │   └── DataInitializer.java          # Database seeder with sample geo-complaints
│   │   ├── controller/
│   │   │   ├── AuthController.java           # /api/auth/register, /api/auth/login
│   │   │   ├── CitizenController.java        # /api/citizen/profile, /api/citizen/complaints/**
│   │   │   ├── ComplaintController.java      # /api/complaints/**, /map, /classify, /track
│   │   │   ├── AdminController.java          # /api/admin/dashboard, /admin/analytics, triage
│   │   │   └── NotificationController.java   # /api/notifications/**
│   │   ├── dto/                              # Record DTOs (Analytics, Map, Classification, etc.)
│   │   ├── entity/                           # JPA Entities (User, Complaint, Notification, etc.)
│   │   ├── exception/
│   │   │   └── GlobalExceptionHandler.java   # Centralized error handler returning sanitized JSON
│   │   ├── repository/                       # Spring Data JPA repositories
│   │   ├── security/                         # JwtService, JwtAuthenticationFilter
│   │   └── service/                          # Business logic services
│   ├── src/test/java/com/civicpulse/
│   │   ├── service/SmartClassificationServiceTest.java  # 5 NLP test scenarios (100% PASS)
│   │   └── security/JwtServiceTest.java                 # JWT generation/validation tests (100% PASS)
│   ├── src/main/resources/application.properties
│   ├── .env.example                          # Backend environment variable template
│   ├── .gitignore                            # Backend git ignore rules
│   └── pom.xml                               # Maven project definition
│
├── frontend/                                 # React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── CivicMap.tsx                  # Interactive Leaflet OpenStreetMap component
│   │   │   ├── SmartClassifierCard.tsx       # Live NLP classification recommendation card
│   │   │   ├── NotificationDrawer.tsx        # Persistent notification slide-over panel
│   │   │   ├── AdvancedAnalyticsView.tsx     # KPI cards, trend charts, CSV export
│   │   │   ├── ComplaintDetailModal.tsx      # Rich detail modal with timeline & ratings
│   │   │   └── StatusBadge.tsx               # Status badges
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx               # Public portal with hero, stats, live preview
│   │   │   ├── MapPage.tsx                   # Dedicated full-screen civic issue explorer
│   │   │   ├── CitizenDashboardPage.tsx      # File complaint, pin-drop map, view reports
│   │   │   ├── AdminDashboardPage.tsx        # Triage board, geospatial map, analytics, feedback
│   │   │   ├── TrackPage.tsx                 # Public tracking code lookup with timeline
│   │   │   └── AuthPage.tsx                  # Login/Register with 1-click demo accounts
│   │   ├── services/api.ts                   # Central Axios client with token management
│   │   ├── types/index.ts                    # TypeScript interface definitions
│   │   └── utils/format.ts                   # Date, category, status, and color formatters
│   ├── index.html                            # Leaflet CDN and font imports
│   ├── package.json                          # Frontend package definition
│   ├── package-lock.json                     # Locked frontend dependency tree
│   ├── tsconfig.json                         # TypeScript configuration
│   ├── vite.config.ts                        # Vite configuration with API proxy
│   ├── vercel.json                           # Vercel SPA routing rewrite config
│   ├── .env.example                          # Frontend environment variable template
│   └── .gitignore                            # Frontend git ignore rules
│
├── tools/
│   └── preview-server.ts                     # Optional standalone Node.js preview server
│
├── package.json                              # Root monorepo script runner
├── .env.example                              # Root environment configuration guide
├── .gitignore                                # Comprehensive root gitignore
└── README.md                                 # This documentation
```

---

## 5. Getting Started & Local Setup

### Prerequisites
- **Java Development Kit (JDK):** Version 21 or 25 LTS
- **Apache Maven:** Version 3.8+ or 3.9+
- **Node.js:** Version 18.x, 20.x, or 22.x (with `npm`)
- **MySQL Server:** Version 8.0+

---

### Step 1: Database Setup (MySQL)
Start your local MySQL service and create the `civicpulse` database:

```sql
CREATE DATABASE civicpulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### Step 2: Backend Setup (Spring Boot)

Navigate to the `backend` directory and set the required environment variables:

```powershell
cd backend

# Configure environment variables (or create backend/.env)
$env:DB_URL="jdbc:mysql://localhost:3306/civicpulse?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
$env:JWT_SECRET="civicpulse-development-jwt-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256"
$env:ADMIN_EMAIL="admin@civicpulse.gov"
$env:ADMIN_PASSWORD="Admin@12345"

# Compile and start backend
mvn compile
mvn spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080`**.  
On first boot, `DataInitializer` automatically provisions default accounts and realistic geo-tagged sample complaints.

---

### Step 3: Frontend Setup (React + Vite)

In a new terminal window, navigate to the `frontend` directory:

```powershell
cd frontend
npm install
npm run dev
```

*(Alternatively, run `npm run dev` directly from the repository root).*  
The Vite dev server will start on **`http://localhost:5173`** with an automated proxy forwarding `/api` and `/uploads` to `http://localhost:8080`.

---

## 6. Pre-Configured Test Credentials

For quick evaluation during Hackathon judging, use these 1-click credentials:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@civicpulse.gov` | `Admin@12345` | Triage board, Assign field crews, Update status, View Advanced Analytics, Geospatial Map, Feedback Audit |
| **Verified Citizen** | `citizen@civicpulse.org` | `Citizen@12345` | Submit complaints with NLP classifier, Pin-drop map, View notifications drawer, Track reports, Submit 5-star ratings |

*(Quick-fill buttons are conveniently available on the `/auth` page for instant login without typing).*

---

## 7. REST API Documentation (V2 Endpoints)

### Public & Authentication Endpoints
- `POST /api/auth/register` — Citizen account registration
- `POST /api/auth/login` — Account authentication (returns JWT token & user profile)
- `GET /api/public/stats` — City-wide vital statistics (total, resolved, active, satisfaction)
- `GET /api/complaints/public` — Recent anonymized complaints feed
- `GET /api/complaints/track/{trackingCode}` — Anonymized tracking timeline by tracking code
- `GET /api/complaints/map` — **[V2]** Geospatial coordinates and status markers for all complaints
- `POST /api/complaints/classify` — **[V2]** Rule-based NLP classifier for title & description

### Citizen Endpoints (`Authorization: Bearer <token>`)
- `GET /api/citizen/profile` — Current authenticated citizen profile
- `GET /api/citizen/complaints` — Paginated list of citizen's submitted complaints
- `GET /api/citizen/complaints/{id}` — **[V2]** Detailed complaint record with timeline and crew assignment
- `POST /api/complaints` — Submit new complaint with multipart photo evidence & coordinates
- `POST /api/complaints/{id}/feedback` — Submit 1-5 star citizen rating and remark on resolved issues

### Notification Endpoints (`Authorization: Bearer <token>`)
- `GET /api/notifications` — **[V2]** List persistent notifications for logged-in user
- `GET /api/notifications/unread-count` — **[V2]** Get unread notification badge count
- `PUT /api/notifications/{id}/read` — **[V2]** Mark a single notification as read
- `PUT /api/notifications/read-all` — **[V2]** Mark all user notifications as read

### Administrator Endpoints (`Authorization: Bearer <admin_token>`)
- `GET /api/admin/dashboard` — Overview operational counters and recent feedback
- `GET /api/admin/analytics` — **[V2]** Advanced analytics, 6-month trends, department workloads
- `GET /api/admin/complaints` — Filtered/searched complaints table with pagination
- `GET /api/admin/complaints/{id}` — Full complaint record for triage inspection
- `PUT /api/admin/complaints/{id}/status` — Advance status with official remark (triggers notification)
- `PUT /api/admin/complaints/{id}/assign` — Assign department, crew, officer & notes (triggers notification)

---

## 8. Test and Build Verification

All verification tests pass with 100% compliance:

```text
================================================================================
1. Backend Unit Tests
================================================================================
Running SmartClassificationServiceTest directly...
  [PASS] testClassifyPothole (Category: ROADS_POTHOLES, Priority: HIGH, Dept: Roads)
  [PASS] testClassifyStreetlight (Category: STREETLIGHTS, Priority: MEDIUM, Dept: Electrical)
  [PASS] testClassifyUrgentHazard (Priority: URGENT, Dept: Electrical/Hazard)
  [PASS] testClassifyGarbage (Category: GARBAGE_COLLECTION, Dept: Solid Waste)
  [PASS] testClassifyWaterLeak (Category: WATER_LEAKAGE, Dept: BWSSB)
All 5 SmartClassificationService tests passed successfully!

Running JwtServiceTest directly...
  [PASS] testGenerateAndExtractEmail (HMAC-SHA256 Token generation & subject extraction)
  [PASS] testMismatchedUserValidation (Role & identity mismatch rejection)
All JwtService tests passed successfully!

================================================================================
2. Frontend Production Build (React 19 + TypeScript + Vite 6)
================================================================================
$ cd frontend && npm run build
> tsc -b && vite build
✓ 1759 modules transformed.
dist/index.html                   1.49 kB │ gzip:   0.76 kB
dist/assets/index-JLgS77IA.css   54.48 kB │ gzip:   9.45 kB
dist/assets/index-DUMBN-hw.js   477.92 kB │ gzip: 138.51 kB
✓ built in 5.95s (Exit code: 0)
```

---

## 9. Platform Screenshots & Interface Walkthrough

| Screen | Description | Reference |
|:---|:---|:---:|
| **Public Landing Page** | Hero portal with real-time city resolution stats, embedded interactive issue map preview, 4-step workflow, and recent complaints feed. | `docs/screenshots/landing-page.png` |
| **Citizen Dashboard & Pin-Drop Map** | Citizen workspace displaying submitted complaints with status tags, interactive OpenStreetMap pin-drop selector, and GPS geolocation button. | `docs/screenshots/citizen-dashboard.png` |
| **Smart Complaint Classifier** | Real-time NLP classifier analyzing citizen title and description to infer category, urgency priority, and municipal department. | `docs/screenshots/smart-classifier.png` |
| **Admin Command Center & Triage** | Operations dashboard with operational counters, search/filter table, field crew dispatch modal, and status timeline editor. | `docs/screenshots/admin-dashboard.png` |
| **Interactive City-Wide Issue Map** | Dedicated full-screen `/map` route with multi-category filters, status markers, clustering, and rich popup cards. | `docs/screenshots/interactive-map.png` |
| **Advanced Analytics & Trends** | Operational visualizations featuring 6-month Intake vs. Resolution velocity, department workload bars, priority distribution, and CSV export. | `docs/screenshots/admin-analytics.png` |
| **Persistent Notification Center** | Slide-over notification drawer with unread counter badge, mark-as-read controls, and direct links to resolved complaints. | `docs/screenshots/notifications-drawer.png` |
| **Public Tracking & Feedback Rating** | Citizen tracking page with anonymized privacy view, official remark timeline, and 5-star citizen resolution rating form. | `docs/screenshots/public-tracking.png` |

---

## 10. Future Roadmap (Beyond Round 2)

1. **Automated WhatsApp/SMS Alert Integration:** Webhook triggers to dispatch SMS updates to citizens without smartphones.
2. **Citizen Photo Computer Vision:** Integration with edge AI models to verify pothole severity or garbage volume automatically from uploaded images.
3. **IoT Sensor Ingestion:** Telemetry connectors for smart streetlights and stormwater level sensors to auto-generate tickets before citizens report them.
4. **Multilingual Regional Support:** Translation into Kannada, Hindi, and regional Indian languages using lightweight offline localization bundles.

---

## 11. Authors & Acknowledgments

Developed with ❤️ for **Round 2 Evaluation** of the Smart Civic Management Hackathon.  
*CivicPulse — Transforming Citizen Voices into Municipal Action.*
