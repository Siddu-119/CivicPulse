# CivicPulse V2 — Smart City Civic Complaint Management Platform

> **Tagline:** Report. Track. Resolve. Empowering Responsive Urban Governance.
> **Evaluation:** Round 2 Hackathon Evaluation Submission
> **Live Web Application:** [https://civic-pulse-ruby-nine.vercel.app/](https://civicpulse-governance.vercel.app)
> **Live API Backend:** [https://civicpulse-backend-pill.onrender.com](https://civicpulse-backend-pill.onrender.com)
> **Backend Health Check:** [https://civicpulse-backend-pill.onrender.com/api/health](https://civicpulse-backend-pill.onrender.com/api/health)
> **Source Repository:** [https://github.com/Siddu-119/CivicPulse](https://github.com/Siddu-119/CivicPulse)

---

## 1. Executive Summary & Problem Statement

Urban civic infrastructure issues—such as hazardous potholes, failed streetlights, broken water mains, and overflowing garbage—frequently go unaddressed due to fragmented communication channels between citizens and municipal authorities. Citizens experience opaque reporting systems with no visibility into ticket status or assigned crews, while city administrators face unstructured backlogs, miscategorized complaints, and an absence of geospatial dispatch intelligence.

**CivicPulse V2** is a modern civic-tech platform designed to eliminate these barriers:
- **For Citizens:** Geo-tagged complaint submission with automatic rule-based NLP classification, interactive map pin-drops, public tracking codes, in-app status notifications, and post-resolution satisfaction ratings.
- **For Municipal Administrators:** A centralized operational command center featuring interactive geospatial complaint visualization, multi-department assignment triage, status transition audits, and operational trend analytics with one-click CSV export.

---

## 2. Core V2 Feature Highlights

### 🗺️ Interactive Civic Issue Map
- **Leaflet OpenStreetMap Engine:** Interactive map visualization rendering OpenStreetMap tiles via Leaflet 1.9.4 with custom SVG/CSS status and category marker pins.
- **Authentic Geodata:** Renders actual complaint coordinates (`latitude`, `longitude`) directly from the cloud database.
- **Multi-Dimensional Filters:** Filter issues on the map dynamically by **Category** (Roads, Water, Lighting, Drainage, Sanitation, etc.), **Status** (Submitted, Under Review, Assigned, In Progress, Resolved, Rejected), and **Priority** (Low, Medium, High, Urgent).
- **Dual Coloring Modes:** Toggle visual marker colors by **Status** or by **Category**.
- **Interactive Pin-Drop & Browser Geolocation:** Citizens can click anywhere on the interactive map to pin an incident location, or use one-click browser GPS positioning with fallback to manual address input.
- **Popup Overlays & Modal Inspection:** Instant map popup cards displaying category badges, status indicators, addresses, timestamps, and a trigger to view full complaint details.

### 📊 Advanced Operational Analytics
- **Dashboard KPI Metrics:** Tallies for Total Complaints, Resolved Complaints, Active Queue, and Percentage Resolution Rate.
- **6-Month Intake vs. Resolution Velocity:** Month-over-month trend visualization comparing complaint intake volume against successful resolutions.
- **Department Workload Distribution:** Horizontal capacity distribution across municipal departments (Roads & Infrastructure, BESCOM Electrical Division, BWSSB Water Board, Solid Waste Management, and Public Health & Sanitation).
- **Category & Priority Breakdowns:** Visual distributions highlighting municipal problem hotspots and urgency levels.
- **Resolution Turnaround Metric:** Dynamic computation of average resolution turnaround time (in days).
- **One-Click CSV Export:** Administrators can export the municipal complaint and analytics dataset to CSV for offline reporting and presentations.

### 🧠 Smart Rule-Based NLP Classification
- **Municipal Keyword Heuristics:** Evaluates complaint titles and descriptions using structured municipal heuristics and regex dictionaries without external AI dependencies or third-party API costs.
- **Multi-Attribute Inference:** Simultaneously infers:
  1. **Complaint Category** (e.g., `ROADS_POTHOLES`, `WATER_LEAKAGE`, `STREETLIGHTS`, `DRAINAGE`, `GARBAGE_COLLECTION`)
  2. **Priority Urgency** (e.g., `URGENT` for sparking live wires, gas leaks, and flooding; `HIGH` for hazardous potholes; `MEDIUM` standard; `LOW`)
  3. **Responsible Municipal Department** (e.g., *Department of Roads & Infrastructure*, *BESCOM Electrical Division*, *BWSSB Water Board*)
- **Confidence Scoring & Signal Pill Highlights:** Displays transparent confidence ratings and highlights detected trigger keywords (e.g., `pothole`, `crater`, `spark`).
- **One-Click Acceptance:** Citizens can preview suggestions and apply them directly into the form or freely modify any field before submission.

### 🔔 Persistent Notification System
- **Relational `Notification` Entity:** Stored in the database with user association, complaint link, notification type, message, read state, and timestamp.
- **In-App Notification Drawer:** Slide-over drawer accessible from the navigation bar with an unread badge counter.
- **Automated Workflow Triggers:** Citizens receive persistent notifications when:
  - An administrator assigns their complaint to a municipal field team.
  - The status advances (e.g., `UNDER_REVIEW` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED`).
  - An official municipal remark or work update is published.
- **Item & Batch Actions:** Mark individual notifications as read or clear all with "Mark all as read".

### 🔍 Public Tracking & Citizen Feedback
- **Transparent Public Tracking:** Citizens can look up any complaint by its unique tracking code (`/track`) to review the resolution timeline and official remarks without requiring an account.
- **Privacy Anonymization:** Public endpoints sanitize citizen phone numbers, emails, and officer personal contact info.
- **5-Star Citizen Rating:** Upon ticket resolution, citizens can rate the quality of municipal work (1 to 5 stars) and submit feedback.

### 🛡️ Security & Reliability Architecture
- **Stateless JWT Authentication:** HMAC-SHA256 signed tokens with role-based claim validation.
- **Role-Based Access Control:** Strict boundary enforcement ensuring Citizens cannot invoke administrative triage APIs or view other citizens' private profile data.
- **Sanitized Global Error Handler:** Centralized `@ExceptionHandler` prevents database schema leakage or Java stack traces from reaching clients during server errors.
- **Secure File Validation:** Uploaded evidence photos are validated for MIME type (JPEG, PNG, WEBP), size (<10MB), and stored with random UUID filenames.
- **CORS Protection:** Configurable origin whitelisting supporting local development hosts and production frontend domains.

---

## 3. Technology Stack

### Frontend
| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `19.0.1` | Core client component architecture |
| **Language** | TypeScript | `5.7.2` | Static typing and interface contracts |
| **Build Tool** | Vite | `6.4.6` | Fast bundling and development proxy |
| **Routing** | React Router DOM | `7.1.5` | Client-side routing and navigation |
| **Styling** | Tailwind CSS | `4.3.3` | Utility-first responsive design system |
| **Icons** | Lucide React | `0.546.0` | UI iconography |
| **Mapping** | Leaflet | `1.9.4` | OpenStreetMap rendering and marker pins (via CDN) |
| **HTTP Client** | Axios | `1.8.4` | API communication with JWT interceptors |
| **Hosting** | Vercel | Free Tier | SPA hosting with edge CDN |

### Backend
| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Spring Boot | `4.0.9` | Enterprise REST API and application container |
| **Language** | Java (JDK) | `25` | Java 25 runtime environment (Java 25 required) |
| **Security** | Spring Security | `7.0.8` | Filter chain, CORS, and role authorization |
| **Authentication** | JJWT | `0.12.6` | HMAC-SHA256 JWT creation and parsing |
| **ORM / Data** | Spring Data JPA / Hibernate | `7` | Relational entity persistence and mapping |
| **Driver** | MySQL Connector/J | `9.7.0` | JDBC driver with TLS transport encryption |
| **Connection Pool** | HikariCP | Managed | Connection pooling optimized for serverless DB |
| **Build Tool** | Apache Maven | `3.9+` | Dependency resolution and build lifecycle |
| **Hosting** | Render | Free Tier | Dockerized Linux web service container |

### Database
| Component | Technology | Region | Purpose |
| :--- | :--- | :--- | :--- |
| **Cloud Database** | TiDB Cloud Serverless | AWS Tokyo (`ap-northeast-1`) | MySQL 8 compatible distributed SQL database |
| **Encryption** | In-transit TLS / SSL | Port 4000 | Encrypted JDBC transport (`useSSL=true&requireSSL=true`) |

---

## 4. System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER (Vercel)                          │
│                                                                         │
│   React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Leaflet 1.9.4      │
│   ├── Landing Page & City Stats                                         │
│   ├── Citizen Dashboard (Pin-Drop Map, Rule-Based Classifier)           │
│   ├── Admin Command Center (Triage Board, Analytics, CSV Export)        │
│   └── Public Tracking Portal (/track/{code})                            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                             HTTPS / JSON REST
                          (Stateless Bearer JWT)
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                         BACKEND TIER (Render Free)                      │
│                                                                         │
│   Spring Boot 4.0.9 (Java 25) Container                                 │
│   ├── SecurityFilterChain (CORS Whitelist, Stateless Session, JWT)      │
│   ├── REST Controllers:                                                 │
│   │   ├── AuthController (/api/auth/**)                                 │
│   │   ├── CitizenController (/api/citizen/**)                           │
│   │   ├── ComplaintController (/api/complaints/**, /map, /classify)     │
│   │   ├── AdminController (/api/admin/**)                               │
│   │   ├── NotificationController (/api/notifications/**)                │
│   │   └── HomeController (/, /api/health)                               │
│   ├── Services:                                                         │
│   │   ├── SmartClassificationService (In-Memory Heuristics)             │
│   │   ├── ComplaintService & NotificationService                        │
│   │   └── FileStorageService (Local Container Uploads)                  │
│   └── Connection Pool: HikariCP (Size: 5, Idle: 2, Keepalive: 30s)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                         JDBC TLS over Port 4000
                  (useSSL=true&requireSSL=true & UTF-8)
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    DATABASE TIER (TiDB Cloud Serverless)                │
│                                                                         │
│   MySQL 8.0 Protocol Compatible • AWS Tokyo (ap-northeast-1)            │
│   ├── users (Citizens and Administrators with BCrypt credentials)       │
│   ├── complaints (Geo-coordinates, categories, priorities, statuses)    │
│   ├── assignments (Department dispatch, field crew details, notes)      │
│   ├── complaint_updates (Audit timeline of remarks & status changes)    │
│   ├── feedback (Post-resolution 1-5 star ratings and comments)          │
│   └── notifications (Persistent in-app citizen alerts)                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema & Persistence

The platform utilizes 6 relational tables defined in `backend/schema-tidb.sql`:

1. **`users`**: User identities, roles (`CITIZEN`, `ADMIN`), BCrypt-hashed passwords, ward assignments, and contact details.
2. **`complaints`**: Core ticket entities storing tracking codes, title, description, category, priority, status, address, GPS coordinates (`latitude`, `longitude`), photo reference, and citizen foreign key.
3. **`assignments`**: Operational dispatch records linking complaints to municipal departments, field teams, designated officers, and administrative instructions.
4. **`complaint_updates`**: Audit log capturing status transitions, official municipal remarks, and updating actor identities.
5. **`feedback`**: Citizen satisfaction records capturing 1-to-5 star ratings and evaluation comments upon ticket resolution.
6. **`notifications`**: In-app notifications linking users to specific complaint status events with read/unread tracking.

All complaint records, coordinates, status histories, notifications, and feedback persist in TiDB Cloud Serverless.

---

## 6. Deployment & Infrastructure Notes

### Render Free Tier Runtime Characteristics
- **Cold Starts:** The backend is deployed on Render's Free tier. On the Free tier, web service instances may spin down during periods of inactivity. When a request arrives while the service is dormant, an initial container cold start occurs while the instance boots and the JVM initializes. Subsequent requests execute with standard responsiveness.
- **Ephemeral Storage:** The local container filesystem on Render Free is ephemeral. Uploaded complaint evidence photos stored in `/app/uploads` are preserved during runtime but do not persist across container redeployments or cold restart cycles. All relational complaint data, coordinates, status histories, notifications, and feedback persist in TiDB Cloud Serverless.

### TiDB Cloud Serverless Configuration
- Hosted in AWS Tokyo (`ap-northeast-1`) on a distributed serverless cluster.
- Connected via encrypted JDBC TLS transport (`useSSL=true&requireSSL=true&serverTimezone=UTC`).
- HikariCP connection pool is tuned for containerized serverless hosting (`maximum-pool-size=5`, `minimum-idle=2`, `keepalive-time=30000ms`, `max-lifetime=600000ms`).

---

## 7. Local Development Setup

### Prerequisites
- **Java Development Kit (JDK):** Version 25 (Java 25 is required; earlier JDK versions cannot compile or run the application bytecode)
- **Apache Maven:** Version 3.9+
- **Node.js:** Version 18.x, 20.x, or 22.x (with `npm`)
- **Database:** Local MySQL 8.0+ server or a TiDB Cloud Serverless cluster

---

### Step 1: Database Setup
Create the `civicpulse` database in your local MySQL instance:

```sql
CREATE DATABASE civicpulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

*(Optional: Execute `backend/schema-tidb.sql` to inspect or manually provision tables).*

---

### Step 2: Backend Setup (Spring Boot)

Navigate to the `backend` directory and configure your environment variables:

```powershell
cd backend

# Configure environment variables
$env:DB_URL="jdbc:mysql://localhost:3306/civicpulse?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_LOCAL_MYSQL_PASSWORD"

# Set a secure random key of at least 32 UTF-8 bytes (minimum 32 characters) for HMAC-SHA256 signing
# Example generator: openssl rand -hex 32
$env:JWT_SECRET="YOUR_RANDOM_SECRET_OF_AT_LEAST_32_BYTES"

$env:ADMIN_EMAIL="admin@civicpulse.gov"
$env:ADMIN_PASSWORD="Admin@12345"
$env:REQUIRE_SECURE_ADMIN_PASSWORD="false"
$env:SEED_SAMPLE_DATA="true"

# Compile and start backend
mvn compile
mvn spring-boot:run
```

> **Configuration Note:**
> Settings are managed via system environment variables or `application.properties`. The application reads `JWT_SECRET` as raw UTF-8 string bytes via `Keys.hmacShaKeyFor(...)`. Each developer must generate a secure secret string of at least 32 UTF-8 bytes (minimum 32 characters) to ensure token integrity.

The Spring Boot backend will start on **`http://localhost:8080`**.
When `SEED_SAMPLE_DATA=true`, `DataInitializer` automatically provisions default accounts and realistic geo-tagged sample complaints.

---

### Step 3: Frontend Setup (React + Vite)

In a separate terminal, navigate to the `frontend` directory:

```powershell
cd frontend
npm install
npm run dev
```

The Vite dev server will start on **`http://localhost:5173`**.
Vite's development proxy (`vite.config.ts`) automatically forwards all `/api` and `/uploads` requests to `http://localhost:8080`.

---

## 8. Reviewer & Demo Credentials

### Live Web Application Access
Open the live frontend application: [https://civic-pulse-ruby-nine.vercel.app/](https://civic-pulse-ruby-nine.vercel.app/)

#### 1. Live Production Deployment Credentials
| Role | Email | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Demo Citizen** | `citizen@civicpulse.org` | `Citizen@12345` | Available only when `SEED_SAMPLE_DATA=true` is enabled in the backend environment. If not enabled on the live service, reviewers can register a custom account via the "Create Citizen Account" tab. |
| **Municipal Admin** | `admin@civicpulse.gov` | *(Private Production Secret)* | Secured by the private production `ADMIN_PASSWORD` environment variable (minimum 16 characters). The UI quick-fill button fills the local development password (`Admin@12345`), which is rejected on production. |

#### 2. Local Development Default Credentials
When running locally with `REQUIRE_SECURE_ADMIN_PASSWORD=false` and `SEED_SAMPLE_DATA=true`:
- **Municipal Admin:** `admin@civicpulse.gov` / `Admin@12345` (matching the `/auth` quick-fill button)
- **Demo Citizen:** `citizen@civicpulse.org` / `Citizen@12345` (matching the `/auth` quick-fill button)

> **Evaluator Access Note:**
> The demo citizen account (`citizen@civicpulse.org` / `Citizen@12345`) is available only when `SEED_SAMPLE_DATA=true` is enabled in the backend environment. Because live seed state depends on active environment flags, reviewers can always register and evaluate a custom citizen account directly using the "Create Citizen Account" tab on `/auth`. Administrator access on the live service is secured by the private production `ADMIN_PASSWORD` secret (minimum 16 characters); the `/auth` quick-fill button populates `Admin@12345` which applies to default local development only.

---

## 9. REST API Documentation

### Public & System Endpoints
| Method | Endpoint | Access | Response / Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Backend metadata JSON: `{ "project": "CivicPulse", "message": "Smart City Complaint and Resolution Platform", "status": "Backend is running successfully" }` |
| `GET` | `/api/health` | Public | Health check JSON: `{ "status": "UP", "service": "CivicPulse Backend", "timestamp": <epoch_ms> }` (aliases: `/health`, `/healthz`) |
| `POST` | `/api/auth/register` | Public | Register a new citizen account |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive HMAC-SHA256 JWT |
| `GET` | `/api/public/stats` | Public | City-wide totals (total, resolved, active queue, satisfaction rate) |
| `GET` | `/api/complaints/public` | Public | Recent anonymized complaints feed |
| `GET` | `/api/complaints/track/{trackingCode}` | Public | Public tracking timeline and official remarks by tracking code |
| `GET` | `/api/complaints/map` | Public | Geospatial complaint coordinates, categories, and status markers |
| `POST` | `/api/complaints/classify` | Public | In-memory rule-based NLP classifier evaluating category, priority, and department |
| `GET` | `/uploads/{filename}` | Public | Static image retrieval for uploaded complaint evidence |

### Citizen Endpoints (`Authorization: Bearer <token>`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/citizen/profile` | Citizen / Admin | Retrieve profile of the authenticated citizen |
| `GET` | `/api/citizen/complaints` | Citizen / Admin | Paginated list of complaints filed by the authenticated user |
| `GET` | `/api/citizen/complaints/{id}` | Citizen / Admin | Detailed complaint record with timeline and team assignment |
| `POST` | `/api/complaints` | Citizen / Admin | Submit complaint with multipart photo evidence & coordinates |
| `POST` | `/api/complaints/{id}/feedback` | Citizen / Admin | Submit 1-to-5 star rating and comment on a resolved complaint |

### Notification Endpoints (`Authorization: Bearer <token>`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | List persistent notifications for authenticated user |
| `GET` | `/api/notifications/unread-count` | Authenticated | Retrieve count of unread notifications |
| `PUT` | `/api/notifications/{id}/read` | Authenticated | Mark a single notification as read |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all notifications for the authenticated user as read |

### Administrator Endpoints (`Authorization: Bearer <admin_token>`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin Only | Overview counters, active triage metrics, and recent feedback |
| `GET` | `/api/admin/analytics` | Admin Only | 6-month intake vs. resolution trends, department workloads, category distributions |
| `GET` | `/api/admin/complaints` | Admin Only | Search and filter complaints table with pagination |
| `GET` | `/api/admin/complaints/{id}` | Admin Only | Full complaint details for administrative review |
| `PUT` | `/api/admin/complaints/{id}/status` | Admin Only | Update ticket status with official remark (triggers notification) |
| `PUT` | `/api/admin/complaints/{id}/assign` | Admin Only | Assign department, field crew, officer & notes (triggers notification) |

---

## 10. Test and Build Verification

### Backend Unit Tests (16 of 16 Tests Passed)
Verified via Maven Surefire test execution (`mvn test`):

```text
-------------------------------------------------------------------------------
Test set: com.civicpulse.config.DataInitializerTest
-------------------------------------------------------------------------------
Tests run: 9, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.745 s
  [PASS] testAdminAccountCreatedWhenMissing
  [PASS] testExistingAdminNotOverwritten
  [PASS] testProductionModeRejectsWeakPassword
  [PASS] testProductionModeAcceptsStrongPassword
  [PASS] testDevelopmentModeAllowsDefaultPassword
  [PASS] testSampleDataSeededWhenEnabled
  [PASS] testSampleDataSkippedWhenDisabled
  [PASS] testSampleDataNotDuplicated
  [PASS] testDemoCitizenAccountCreated

-------------------------------------------------------------------------------
Test set: com.civicpulse.service.SmartClassificationServiceTest
-------------------------------------------------------------------------------
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.087 s
  [PASS] testClassifyPothole (Category: ROADS_POTHOLES, Priority: HIGH, Dept: Roads)
  [PASS] testClassifyStreetlight (Category: STREETLIGHTS, Priority: MEDIUM, Dept: Electrical)
  [PASS] testClassifyUrgentHazard (Priority: URGENT, Dept: Electrical/Hazard)
  [PASS] testClassifyGarbage (Category: GARBAGE_COLLECTION, Dept: Solid Waste)
  [PASS] testClassifyWaterLeak (Category: WATER_LEAKAGE, Dept: BWSSB)

-------------------------------------------------------------------------------
Test set: com.civicpulse.security.JwtServiceTest
-------------------------------------------------------------------------------
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.779 s
  [PASS] testGenerateAndExtractEmail (HMAC-SHA256 Token generation & subject extraction)
  [PASS] testMismatchedUserValidation (Role & identity mismatch rejection)

Total tests run: 16, Failures: 0, Errors: 0, Skipped: 0 (100% PASS)
```

### Frontend Production Build
Verified via Vite production build (`npm run build`):

```text
$ cd frontend && npm run build
> tsc -b && vite build
vite v6.4.6 building for production...
transforming...
✓ 1759 modules transformed.
rendering chunks...
computing gzip sizes...
dist/index.html                   1.49 kB │ gzip:   0.76 kB
dist/assets/index-JLgS77IA.css   54.48 kB │ gzip:   9.45 kB
dist/assets/index-DUMBN-hw.js   477.92 kB │ gzip: 138.51 kB
✓ built in 5.95s
```

---

## 11. Platform Interface Walkthrough

| Screen | Description | Path |
| :--- | :--- | :--- |
| **Public Landing Page** | City resolution stats, interactive issue map preview, 4-step workflow, and recent complaints feed | `/` |
| **Interactive City-Wide Issue Map** | Full-screen map with category/status/priority filters, custom markers, and popup inspection | `/map` |
| **Citizen Dashboard & Pin-Drop Map** | Citizen workspace for filing complaints, interactive pin-drops, GPS positioning, and tracking personal tickets | `/citizen` |
| **Smart Complaint Classifier** | Rule-based NLP classifier suggesting category, urgency priority, and department based on title and description | Component on `/citizen` |
| **Admin Command Center & Triage** | Operations dashboard with operational counters, search/filter table, field crew dispatch modal, and status editor | `/admin` |
| **Advanced Analytics & Trends** | Operational visualizations featuring 6-month intake vs. resolution trends, department workloads, and CSV export | Tab on `/admin` |
| **Persistent Notification Drawer** | Slide-over drawer with unread counter badge, mark-as-read controls, and direct links to updated complaints | Slide-over on all authenticated views |
| **Public Tracking & Feedback Rating** | Citizen tracking page with anonymized privacy view, official remark timeline, and 5-star citizen rating form | `/track/{code}` |

---

## 12. Future Roadmap

1. **Automated WhatsApp / SMS Gateway Integration:** Dispatch SMS and WhatsApp status updates to citizens for low-bandwidth mobile devices.
2. **Citizen Photo Computer Vision:** Integrate client-side or edge computer vision models to assess pothole depth or waste accumulation from uploaded photos.
3. **IoT Sensor Ingestion:** Telemetry connectors for smart municipal infrastructure (e.g. smart streetlights, stormwater level sensors) to automate ticket generation.
4. **Multilingual Regional Localization:** Offline localization support for Kannada, Hindi, and regional Indian languages.

---

## 13. Author & Hackathon Submission

- **Author / Lead Developer:** [Siddu (@Siddu-119)](https://github.com/Siddu-119)
- **Source Repository:** [https://github.com/Siddu-119/CivicPulse](https://github.com/Siddu-119/CivicPulse)
- **Deployment Environments:**
  - **Frontend:** [https://civic-pulse-ruby-nine.vercel.app/](https://civic-pulse-ruby-nine.vercel.app/) (Vercel Free Tier)
  - **Backend:** [https://civicpulse-backend-pill.onrender.com](https://civicpulse-backend-pill.onrender.com) (Render Free Web Service)
  - **Database:** TiDB Cloud Serverless (`ap-northeast-1` AWS Tokyo)
