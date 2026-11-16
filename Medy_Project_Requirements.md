# MEDY CENTRAL HEALTHCARE PLATFORM
## Software Requirements Specification (SRS) & System Architecture Document
**Document ID:** `MEDY-SRS-2026-V2.4`  
**Version:** `2.4.0 (Enterprise Release)`  
**Status:** Approved Production Specification  
**Classification:** Confidential / Healthcare Enterprise Standard  
**Generated PDF:** [Medy_Project_Requirements.pdf](file:///c:/Users/Admin/OneDrive/Desktop/Medy/Medy_Project_Requirements.pdf)

---

## 1. Executive Summary & System Vision

### 1.1 Project Purpose & Background
Modern healthcare networks face critical operational friction due to isolated hospital electronic health record (EHR) databases, fragmented patient identities, and delayed verification of health insurance benefits. The **Medy Central Healthcare Ecosystem** provides an integrated, multi-tenant digital health infrastructure that connects network hospitals, issues cryptographically tracked digital health cards (**MediCard**), provides real-time facility resource tracking, and manages cross-facility patient care.

### 1.2 Core Strategic Objectives
- **Unified Health Identity:** Issue, track, and validate digital Medy Health Cards across Platinum, Gold, Silver, and Standard tiers.
- **Federated Multi-Hospital Governance:** Centralize hospital institution records with real-time operational status, bed capacity, and facility deactivation controls.
- **Strict Role-Based Access Control (RBAC):** Distinct permission boundaries separating global Super Administrators (`MEDY_ADMIN`) from facility Hospital Administrators (`HOSPITAL_ADMIN`).
- **Clinical Confidentiality in Volume Analytics:** Provide aggregated patient appointment volume summaries per doctor and hospital facility without exposing confidential clinical records in management views.
- **Comprehensive Diagnostic Tracking:** Maintain centralized catalogs for laboratory tests, patient biomarker baselines, and predictive organ risk assessments.
- **Immutable Security Trails:** Automatically record every sensitive transaction (logins, card freezes, credential updates) in append-only audit ledgers.

---

## 2. System Architecture & Technology Stack

The platform is designed following a modern multi-tier decoupled architecture:

```
+-----------------------------------------------------------------------+
|                    Client Presentation Layer                          |
|   React 18 SPA | Vite 5 | React Router 6 | Recharts | Lucide Icons   |
|     (Sky Blue & White Design System #0284c7 / #ffffff - No Tailwind)  |
+-----------------------------------------------------------------------+
                                   │  HTTP / REST (JWT Bearer Token)
                                   ▼
+-----------------------------------------------------------------------+
|                    Application & API Gateway Tier                     |
|           Node.js 20+ | Express.js 4 REST Controllers                 |
|   Auth Middleware (RBAC) | Input Sanitization | Audit Logging Engine   |
+-----------------------------------------------------------------------+
                                   │  Mongoose ODM (Lean Queries)
                                   ▼
+-----------------------------------------------------------------------+
|                       Persistence & Data Layer                        |
|                  MongoDB 7+ (medy Database)                           |
|   Collections: admins, hospitals, patients, medicards, appointments,  |
|                labtests, labcatalogtests, auditlogs, biomarkers       |
+-----------------------------------------------------------------------+
```

### Technology Matrix
| Layer | Framework / Technology | Role & Key Highlights |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 5, React Router 6 | Single Page Application (SPA), Sky Blue & White UI, high-contrast accessible design |
| **Backend** | Node.js 20+, Express.js 4 | RESTful JSON API, modular controllers, error handling |
| **Database** | MongoDB 7+, Mongoose 8 ODM | Document persistence, indexed queries, schema validation |
| **Security** | BCrypt.js (10 salt rounds), JWT | Encrypted password storage, stateless Bearer token authorization |
| **Visualizations** | Recharts 3, Lucide React Icons | Executive KPI cards, trend charts, operational indicators |

---

## 3. User Personas & Role-Based Access Control (RBAC)

### 3.1 Platform Personas
1. **Super Administrator (`MEDY_ADMIN` / `SUPER_ADMIN`):** Highest platform authority. Manages all hospital institutions, provisions hospital administrators, governs network-wide MediCard issuances, freezes suspect cards, and audits system-wide logs.
2. **Hospital Administrator (`HOSPITAL_ADMIN`):** Facility-scoped authority. Manages local staff, doctor appointment queues, hospital-assigned patients, and facility resources.
3. **Medical Practitioner / Doctor:** Consults with admitted patients, updates clinical biomarkers, and records visit outcomes.
4. **Patient / Insured Citizen:** Applies for digital Medy Health Cards, reviews coverage plan tier, monitors booked appointments, and tracks lab reports.

### 3.2 RBAC Permissions Matrix
| Functional Module | Super Admin | Hospital Admin | Doctor / Staff | Patient |
| :--- | :--- | :--- | :--- | :--- |
| **Hospital Facility Management (CRUD)** | Full Access | Read Only (Self) | None | Directory Only |
| **Hospital Admin Provisioning & Reset** | Full Access | None | None | None |
| **MediCard Issuance & Security Freeze** | Full Governance | Issue & View (Local) | Verify Only | View Own Card |
| **Patient Directory & Records** | Network-wide | Facility-scoped | Assigned Only | View Profile |
| **Doctor Appointments (Volume Summary)** | Network Summary | Facility Queue | Personal OPD | Book / View Own |
| **Diagnostic Lab Tests & Catalogs** | Catalog Admin | Order Local Tests | Order & Results | View Reports |
| **Security Audit Logs** | Full Audit Trail | None | None | None |
| **Biomarkers & Predictive Health Engine** | Model Analytics | Facility Aggregates | Clinical Entry | View Baselines |

---

## 4. Functional Requirements (FR)

### FR-1: Authentication, Authorization & Session Management
- **FR-1.1:** Support credentialed authentication via email or username and password.
- **FR-1.2:** Query accounts by exact email first before username fallback to prevent account collision.
- **FR-1.3:** Passwords must be hashed using BCrypt (>= 10 salt rounds).
- **FR-1.4:** Issue signed JSON Web Tokens (JWT) with configurable expiry (30 days default).
- **FR-1.5:** Reject inactive accounts (`status === 'Inactive'`) with HTTP 403 Forbidden.

### FR-2: Hospital Facility & Infrastructure Management
- **FR-2.1:** Full CRUD capabilities for hospital profiles (name, code, city, phone, email, address, bed capacity).
- **FR-2.2:** One-click status toggling (Active vs. Deactivated / Paused) without data loss.
- **FR-2.3:** Table rows must feature a dedicated quick-action button linking directly to assigned administrators.
- **FR-2.4:** Live tracking of total beds vs. available beds with capacity alerts.

### FR-3: Hospital Administrator Governance
- **FR-3.1:** Provision hospital admin accounts with full name, email, phone, designation, and hospital association.
- **FR-3.2:** Auto-generate unique sequential Administrator IDs (e.g. `HADM-001`, `HADM-002`).
- **FR-3.3:** Administrator Edit Modal includes an Auto-Generate Password utility and enforces minimum 6-character length.
- **FR-3.4:** Comprehensive search and filtering by hospital affiliation or account status.
- **FR-3.5:** Toggling status or deleting records writes immediately to the security audit trail.

### FR-4: Digital Health Card (MediCard) System
- **FR-4.1:** Generate and track unique card identifiers (e.g. `MEDY-PLT-8821`).
- **FR-4.2:** Support coverage tiers: Platinum (\$100k), Gold (\$50k), Silver (\$25k), and Standard (\$10k).
- **FR-4.3:** Super Admins can freeze/block compromised cards with mandatory audit reason logging.
- **FR-4.4:** Hospital allocation metrics indicating issuance distribution by facility.

### FR-5: Patient Directory & Demographics Governance
- **FR-5.1:** Capture patient demographics (name, age, gender, phone, email, hospital association).
- **FR-5.2:** Display linked Medy Insurance Card IDs in high-contrast Sky Blue badges.
- **FR-5.3:** Filter by hospital facility and search across patient records with sub-second debounce.

### FR-6: Doctor Appointments & Clinical Volume Scheduling
- **FR-6.1:** Clicking 'Appointments' within Patient Management toggles directly into an aggregated summary view on the same page.
- **FR-6.2:** Display aggregated metrics: Hospital Facility, Doctor Name, Department/Specialty, Total Patient Appointments, and Status Breakdown (Confirmed, Completed, Cancelled).
- **FR-6.3:** Protect clinical confidentiality by isolating patient personal diagnosis records from executive volume views.

### FR-7: Diagnostic Laboratory Testing & Catalog Service
- **FR-7.1:** Maintain a standardized laboratory diagnostic test catalog (Lipid Profile, CBC, LFT, HbA1c, Cardiac Markers).
- **FR-7.2:** Record normal reference ranges, specimen type, units, and turnaround hours.
- **FR-7.3:** Track test order lifecycles: `Requested` → `In-Progress` → `Completed` → `Archived`.

### FR-8: Biomarkers, Health Map & Predictive Risk Engine
- **FR-8.1:** Store historical telemetry for Blood Glucose, Blood Pressure, SpO2, BMI, and Serum Creatinine.
- **FR-8.2:** Rule-based multi-organ health risk assessment (Cardiovascular, Renal, Hepatic, Metabolic).
- **FR-8.3:** Visual Health Map displaying geographic risk concentrations.

### FR-9: Audit Logs, Security Trails & Event Monitoring
- **FR-9.1:** Automatically log every state-altering administrative transaction.
- **FR-9.2:** Capture timestamp (UTC ISO), actor, role, action, target entity, IP address, and status.
- **FR-9.3:** Track `SUPER_ADMIN_LOGIN`, `HOSPITAL_ADMIN_LOGIN`, `HOSPITAL_ADMIN_CREATED`, `HOSPITAL_ADMIN_UPDATED`, `HOSPITAL_ADMIN_STATUS_CHANGED`, `HOSPITAL_ADMIN_DELETED`, `MEDICARD_BLOCKED`, and `HOSPITAL_STATUS_CHANGED`.

### FR-10: Analytical Dashboards & Business Intelligence
- **FR-10.1:** Executive KPI metric cards: Total Hospitals, Active Facilities, Active MediCards, Registered Patients, Scheduled Appointments.
- **FR-10.2:** Interactive trend charts displaying card issuances, patient registrations, and occupancy.

### FR-11: Public Patient Self-Application & Enrollment Portal
- **FR-11.1:** Public enrollment form (`/patient-apply`) for prospective cardholders.
- **FR-11.2:** Validate applicant identity, contact details, preferred hospital, and plan tier.

---

## 5. Non-Functional Requirements (NFR)

### 5.1 UI/UX Design System Standards
- **Strict Color Scheme:** Primary Sky Blue (`#0284c7`), Secondary Sky (`#0ea5e9`), Light Sky Tint (`#f0f9ff`), Pure White (`#ffffff`), and Slate Navy (`#0f172a`).
- **Zero Tailwind Dependency:** Built with pure modular CSS (`index.css`), ensuring maximum rendering speed and zero runtime overhead.
- **Accessibility:** High-contrast text compliance (WCAG 2.1 AA) and semantic HTML components.

### 5.2 Information Security & Compliance
- **Password Protection:** Encrypted with BCrypt (>= 10 salt rounds). Plaintext passwords are never stored.
- **Session Protection:** Stateless JWT Bearer tokens validated per API request.
- **Inactive Account Locking:** Disabled accounts immediately lose API access.
- **Injection Prevention:** Parameterized MongoDB ODM queries preventing NoSQL injection.

### 5.3 Performance & Reliability
- **API Response:** P95 response latency under 250ms for indexed read queries.
- **Build Quality:** Zero ESLint or Vite build warnings; clean compilation exit code 0.
- **Database Self-Healing:** Auto-seeding routines in `server.js` ensure essential entities (default hospital, Super Admin, sample hospital administrators) are provisioned on fresh boots.

---

## 6. Core REST API Interface Reference

| Endpoint Route | HTTP Method | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates credentials and issues signed JWT bearer token. |
| `/api/hospitals` | `GET, POST` | Bearer (Admin) | Lists network hospitals or registers a new healthcare facility. |
| `/api/hospitals/:id` | `PUT, DELETE` | Bearer (Admin) | Updates hospital metadata or removes facility record. |
| `/api/hospitals/:id/status` | `PATCH` | Bearer (Admin) | Toggles hospital active/deactivated operational status. |
| `/api/hospital-admins` | `GET, POST` | Bearer (Super) | Lists hospital admins or provisions a new hospital admin account. |
| `/api/hospital-admins/:id` | `PUT, DELETE` | Bearer (Super) | Updates administrator credentials/profile or revokes account. |
| `/api/hospital-admins/:id/status` | `PATCH` | Bearer (Super) | Toggles hospital admin active/inactive platform access. |
| `/api/medicards` | `GET, POST` | Bearer (Admin) | Queries filtered health cards or issues a new card. |
| `/api/medicards/:id/block` | `PATCH` | Bearer (Admin) | Blocks health card with mandatory reason and logs audit event. |
| `/api/medicards/hospital-allocations` | `GET` | Bearer (Admin) | Aggregates health card distribution volume by facility. |
| `/api/patients` | `GET, POST` | Bearer / Public | Retrieves patient records or accepts new enrollment application. |
| `/api/appointments` | `GET, POST` | Bearer (Admin) | Retrieves doctor appointment schedules and volume breakdowns. |
| `/api/dashboard/stats` | `GET` | Bearer (Admin) | Yields platform KPI metrics, occupancy counts, and charts. |
| `/api/audit-logs` | `GET` | Bearer (Super) | Fetches immutable security audit records. |
| `/api/health` | `GET` | Public | Liveness and readiness probe for monitoring. |

---

## 7. Deployment & Verification Sign-Off

### 7.1 Runtime Environment
- **Node.js:** v18.0.0 or higher
- **MongoDB:** v6.0+ listening on `127.0.0.1:27017`
- **Default Ports:** Backend API: `http://127.0.0.1:5000` | Frontend Web: `http://localhost:3000`

### 7.2 Verification Sign-off Table
| Role / Responsibility | Representative | Verification Date | Status |
| :--- | :--- | :--- | :--- |
| **Lead Systems Architect** | Dr. Robert / Core Team | 16-Nov-2026 | **APPROVED** |
| **Healthcare Operations Director** | Dr. Rajesh Sharma (`HADM-001`) | 16-Nov-2026 | **APPROVED** |
| **Lead QA & Security Auditor** | Priya Sundaram (`HADM-002`) | 16-Nov-2026 | **VERIFIED** |
