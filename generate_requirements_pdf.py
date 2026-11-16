import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and display total page count:
    'Page X of Y' alongside running header and footer.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress header and footer on the cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor('#0284c7'))

        # Running Header
        self.drawString(54, 750, "MEDY HEALTHCARE ECOSYSTEM")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#64748b'))
        self.drawRightString(558, 750, "Software Requirements Specification (SRS) v2.4")

        # Header Rule
        self.setStrokeColor(colors.HexColor('#bae6fd'))
        self.setLineWidth(0.75)
        self.line(54, 742, 558, 742)

        # Footer Rule
        self.setStrokeColor(colors.HexColor('#e2e8f0'))
        self.setLineWidth(0.75)
        self.line(54, 46, 558, 46)

        # Running Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#64748b'))
        self.drawString(54, 34, "CONFIDENTIAL & PROPRIETARY — FOR AUTHORIZED HEALTHCARE PLATFORM USE ONLY")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 34, page_str)
        self.restoreState()

def build_pdf(filename="Medy_Project_Requirements.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    PRIMARY = colors.HexColor('#0284c7')      # Sky Blue Primary
    PRIMARY_DARK = colors.HexColor('#0369a1') # Deep Sky Blue
    NAVY = colors.HexColor('#0f172a')          # Slate 900
    TEXT_MAIN = colors.HexColor('#1e293b')     # Slate 800
    TEXT_MUTED = colors.HexColor('#64748b')    # Slate 500
    BG_LIGHT = colors.HexColor('#f0f9ff')      # Sky 50
    BORDER_LIGHT = colors.HexColor('#bae6fd')  # Sky 200
    WHITE = colors.HexColor('#ffffff')
    GREEN = colors.HexColor('#10b981')
    AMBER = colors.HexColor('#f59e0b')
    RED = colors.HexColor('#ef4444')

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        alignment=1, # Center
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=NAVY,
        alignment=1,
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_MUTED,
        alignment=1,
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY_DARK,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=NAVY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_MAIN,
        spaceAfter=4,
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_MAIN,
        leftIndent=12,
        spaceAfter=2,
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=PRIMARY_DARK,
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=WHITE,
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_MAIN,
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=NAVY,
    )

    story = []

    # =========================================================================
    # PAGE 1: COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 40))

    # Medy Brand Header Box
    brand_table = Table(
        [[
            Paragraph("<font size=28><b>+ MEDY</b></font><br/><font size=10 color='#64748b'>Central Healthcare Ecosystem & MediCard Platform</font>", ParagraphStyle('Brand', parent=title_style, alignment=1))
        ]],
        colWidths=[504],
    )
    brand_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1.5, BORDER_LIGHT),
        ('PADDING', (0,0), (-1,-1), 18),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(brand_table)

    story.append(Spacer(1, 35))
    story.append(Paragraph("SOFTWARE REQUIREMENTS SPECIFICATION", title_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("System Architecture, Functional Specifications & Quality Standards", subtitle_style))
    story.append(Spacer(1, 15))

    # Sky Blue Accent Rule
    story.append(HRFlowable(width="80%", thickness=2, color=PRIMARY, spaceAfter=25, spaceBefore=10))

    # Metadata Grid
    meta_data = [
        [Paragraph("<b>Document Identifier:</b>", table_cell_bold), Paragraph("MEDY-SRS-2026-V2.4", table_cell_style), Paragraph("<b>Release Status:</b>", table_cell_bold), Paragraph("<font color='#0284c7'><b>Approved Production Spec</b></font>", table_cell_style)],
        [Paragraph("<b>Document Version:</b>", table_cell_bold), Paragraph("2.4.0 (Enterprise)", table_cell_style), Paragraph("<b>Release Date:</b>", table_cell_bold), Paragraph("November 2026", table_cell_style)],
        [Paragraph("<b>Platform Scope:</b>", table_cell_bold), Paragraph("Unified Hospital Admin & MediCard", table_cell_style), Paragraph("<b>Primary Architecture:</b>", table_cell_bold), Paragraph("MERN (Mongo, Express, React, Node)", table_cell_style)],
        [Paragraph("<b>Author / Architecture:</b>", table_cell_bold), Paragraph("Medy Core Engineering Team", table_cell_style), Paragraph("<b>Target Environment:</b>", table_cell_bold), Paragraph("Secure Multi-Facility Cloud", table_cell_style)],
    ]
    meta_table = Table(meta_data, colWidths=[120, 132, 120, 132])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#eaeff5')),
        ('PADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 35))

    # Executive Overview Callout
    exec_summary_text = (
        "<b>EXECUTIVE MANDATE:</b> The Medy platform provides centralized governance, digital health card "
        "(MediCard) lifecycle management, hospital facility management, and cross-facility patient tracking. "
        "This specification sets forth all functional capabilities, data schemas, security standards, and non-functional "
        "criteria required for deployment, operation, and auditing across accredited healthcare institutions."
    )
    exec_box = Table([[Paragraph(exec_summary_text, callout_style)]], colWidths=[504])
    exec_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('PADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(exec_box)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: SECTION 1 - PROJECT OVERVIEW & ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("1. Executive Summary & System Objectives", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph("<b>1.1 Project Purpose & Background</b>", h2_style))
    story.append(Paragraph(
        "Modern healthcare delivery suffers from fragmented patient identities, isolated hospital databases, "
        "and delayed verification of health insurance benefits. The <b>Medy Central Healthcare Platform</b> "
        "unifies patient records, diagnostic histories, and insurance entitlement cards under a single "
        "high-availability system. It gives hospital administrations real-time visibility into bed capacities, "
        "doctor appointments, diagnostic tests, and health card validations while enforcing strict role separation.",
        body_style
    ))

    story.append(Paragraph("<b>1.2 Strategic Objectives</b>", h2_style))
    story.append(Paragraph("• <b>Unified Digital Health Identity:</b> Issue and verify cryptographically tracked Medy Health Cards (Platinum, Gold, Silver, Standard).", bullet_style))
    story.append(Paragraph("• <b>Multi-Facility Federation:</b> Connect diverse hospital locations under a central administration network.", bullet_style))
    story.append(Paragraph("• <b>Strict Role Separation (RBAC):</b> Partition capabilities between Central Super Admins and local Hospital Admins.", bullet_style))
    story.append(Paragraph("• <b>Doctor Appointment Aggregations:</b> Deliver appointment analytics per doctor and facility without exposing confidential clinical data in high-level views.", bullet_style))
    story.append(Paragraph("• <b>Auditable Diagnostic Workflow:</b> Track laboratory test catalogs, orders, patient biomarker telemetry, and risk scores.", bullet_style))
    story.append(Paragraph("• <b>Comprehensive Audit Trails:</b> Record every sensitive event (login, credential reset, card freeze) in immutable logs.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("2. System Architecture & Technology Stack", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10, spaceBefore=2))

    # Architecture Table
    arch_data = [
        [Paragraph("Tier / Layer", table_header_style), Paragraph("Technology / Framework", table_header_style), Paragraph("Key Responsibilities & Highlights", table_header_style)],
        [
            Paragraph("<b>Client Presentation</b>", table_cell_bold),
            Paragraph("React 18, Vite 5, React Router 6, Recharts, Lucide Icons", table_cell_style),
            Paragraph("Responsive SPA; Sky Blue & White design system; zero Tailwind dependency; accessible semantic components.", table_cell_style)
        ],
        [
            Paragraph("<b>Application Server</b>", table_cell_bold),
            Paragraph("Node.js 20+, Express.js 4, RESTful Architecture", table_cell_style),
            Paragraph("Modular routers; JWT Bearer authorization; request sanitization; rate limiting; centralized error handling.", table_cell_style)
        ],
        [
            Paragraph("<b>Persistence Tier</b>", table_cell_bold),
            Paragraph("MongoDB 7+, Mongoose 8 ODM", table_cell_style),
            Paragraph("Document schema validation; auto-indexing on UUIDs & emails; lean population; transactional state safety.", table_cell_style)
        ],
        [
            Paragraph("<b>Security & Auth</b>", table_cell_bold),
            Paragraph("BCrypt.js (10 rounds), JSON Web Tokens (JWT)", table_cell_style),
            Paragraph("Stateless authorization tokens; inactive account denial; brute-force protection; immutable audit trail logging.", table_cell_style)
        ],
    ]
    arch_table = Table(arch_data, colWidths=[100, 160, 244])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_DARK),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(arch_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: SECTION 2 - USER PERSONAS & ROLE MATRIX
    # =========================================================================
    story.append(Paragraph("3. User Personas & Role-Based Access Control (RBAC)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph(
        "Access to system functionalities is strictly guarded by an RBAC model. Users are assigned "
        "one of the authorized platform roles upon provisioning:",
        body_style
    ))

    # Persona Descriptions
    story.append(Paragraph("<b>1. Super Administrator (MEDY_ADMIN / SUPER_ADMIN):</b> Has global command authority over the platform. Manages hospital enrollments, provisions and audits hospital administrator credentials, inspects network-wide MediCard issuances, freezes fraudulent cards, and reviews immutable security audit trails.", body_style))
    story.append(Paragraph("<b>2. Hospital Administrator (HOSPITAL_ADMIN):</b> Manages facility-specific operations for their assigned hospital. Oversees clinical staff, local patient admissions, doctor appointment queues, and hospital-assigned lab tests.", body_style))
    story.append(Paragraph("<b>3. Medical Specialist / Doctor:</b> Manages consultations, clinical diagnoses, biometric biomarker evaluations, and patient prescriptions.", body_style))
    story.append(Paragraph("<b>4. Patient / Insured Citizen:</b> Applies for Medy Health Cards, reviews coverage plan tier, monitors booked appointments, and tracks lab reports.", body_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Role-Based Permissions Matrix</b>", h2_style))

    # RBAC Table
    rbac_data = [
        [Paragraph("Feature / Capability Module", table_header_style), Paragraph("Super Admin", table_header_style), Paragraph("Hospital Admin", table_header_style), Paragraph("Doctor / Staff", table_header_style), Paragraph("Patient", table_header_style)],
        [Paragraph("Hospital Facility CRUD & Deactivation", table_cell_bold), Paragraph("Full Access", table_cell_style), Paragraph("Read Only (Self)", table_cell_style), Paragraph("None", table_cell_style), Paragraph("Public Directory", table_cell_style)],
        [Paragraph("Hospital Admin Provision & Password Reset", table_cell_bold), Paragraph("Full Access", table_cell_style), Paragraph("None", table_cell_style), Paragraph("None", table_cell_style), Paragraph("None", table_cell_style)],
        [Paragraph("MediCard Lifecycle (Issue, Block, Unblock)", table_cell_bold), Paragraph("Full Governance", table_cell_style), Paragraph("Issue & View (Local)", table_cell_style), Paragraph("Verify Only", table_cell_style), Paragraph("View Own Card", table_cell_style)],
        [Paragraph("Patient Directory & Demographics", table_cell_bold), Paragraph("Network-wide", table_cell_style), Paragraph("Facility-scoped", table_cell_style), Paragraph("Assigned Patients", table_cell_style), Paragraph("View Own Profile", table_cell_style)],
        [Paragraph("Doctor Appointments (Volume & Scheduling)", table_cell_bold), Paragraph("Network Summary", table_cell_style), Paragraph("Facility Queue", table_cell_style), Paragraph("Personal OPD", table_cell_style), Paragraph("Book / View Own", table_cell_style)],
        [Paragraph("Lab Diagnostic Catalogs & Bookings", table_cell_bold), Paragraph("Catalog Admin", table_cell_style), Paragraph("Order Local Tests", table_cell_style), Paragraph("Order & Results", table_cell_style), Paragraph("View Reports", table_cell_style)],
        [Paragraph("Security Audit Logs & Event Inspection", table_cell_bold), Paragraph("Full Audit Access", table_cell_style), Paragraph("None", table_cell_style), Paragraph("None", table_cell_style), Paragraph("None", table_cell_style)],
        [Paragraph("Biomarkers & Predictive Risk Analysis", table_cell_bold), Paragraph("Model Analytics", table_cell_style), Paragraph("Facility Aggregates", table_cell_style), Paragraph("Clinical Clinical Entry", table_cell_style), Paragraph("View Own Baselines", table_cell_style)],
    ]
    rbac_table = Table(rbac_data, colWidths=[174, 85, 85, 80, 80])
    rbac_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_DARK),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(rbac_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: SECTION 3 - FUNCTIONAL REQUIREMENTS (PART 1)
    # =========================================================================
    story.append(Paragraph("4. Detailed Functional Requirements (Modules 1 - 6)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph("<b>FR-1: Authentication, Authorization & Session Management</b>", h2_style))
    story.append(Paragraph("• <b>FR-1.1:</b> The system shall authenticate Super Admins and Hospital Admins using email or unique username and password.", bullet_style))
    story.append(Paragraph("• <b>FR-1.2:</b> The system shall query administrators by exact email address first before falling back to username to eliminate identity collision.", bullet_style))
    story.append(Paragraph("• <b>FR-1.3:</b> Passwords must be hashed using BCrypt with a minimum salt rounds factor of 10.", bullet_style))
    story.append(Paragraph("• <b>FR-1.4:</b> Upon successful login, the system shall issue a signed JSON Web Token (JWT) with configurable expiry (default 30 days).", bullet_style))
    story.append(Paragraph("• <b>FR-1.5:</b> If an administrator account status is 'Inactive', all login attempts and API access must be immediately rejected with HTTP 403 Forbidden.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>FR-2: Hospital Facility & Infrastructure Management</b>", h2_style))
    story.append(Paragraph("• <b>FR-2.1:</b> The Super Administrator shall have full CRUD permissions over hospital records (name, facility code, city, phone, email, address, total beds, available beds).", bullet_style))
    story.append(Paragraph("• <b>FR-2.2:</b> The system shall support immediate one-click deactivation/reactivation of hospitals, safely archiving access without data loss.", bullet_style))
    story.append(Paragraph("• <b>FR-2.3:</b> Each hospital row in the facility table shall provide a direct action button to inspect and manage assigned administrators.", bullet_style))
    story.append(Paragraph("• <b>FR-2.4:</b> Facilities must track bed allocation metrics (total beds vs. available beds) with real-time capacity indicators.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>FR-3: Hospital Administrator Governance Module</b>", h2_style))
    story.append(Paragraph("• <b>FR-3.1:</b> Super Administrators shall provision new hospital admin accounts with full name, email, phone, designation, and hospital assignment.", bullet_style))
    story.append(Paragraph("• <b>FR-3.2:</b> The system shall auto-generate sequential unique Administrator IDs (e.g. <code>HADM-001</code>).", bullet_style))
    story.append(Paragraph("• <b>FR-3.3:</b> Administrator editing modals shall include an Auto-Generate Password utility and enforce a minimum 6-character length.", bullet_style))
    story.append(Paragraph("• <b>FR-3.4:</b> Hospital admins can be filtered by hospital affiliation, active/inactive status, or searched by name, email, or designation.", bullet_style))
    story.append(Paragraph("• <b>FR-3.5:</b> Account status toggling and deletions must provide instant user feedback and record a permanent entry in the system audit trail.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>FR-4: Digital Health Card (MediCard) System</b>", h2_style))
    story.append(Paragraph("• <b>FR-4.1:</b> The system shall maintain unique MediCard numbers (e.g. <code>MEDY-PLT-8821</code>) mapped to patient identities and insurance tiers.", bullet_style))
    story.append(Paragraph("• <b>FR-4.2:</b> Tiers supported: Platinum ($100k coverage), Gold ($50k coverage), Silver ($25k coverage), and Standard ($10k coverage).", bullet_style))
    story.append(Paragraph("• <b>FR-4.3:</b> Super Admins shall be empowered to block suspect or expired cards with a mandatory audit reason log (e.g. 'Suspected fraud').", bullet_style))
    story.append(Paragraph("• <b>FR-4.4:</b> The UI shall provide hospital-level issuance allocation counters indicating which hospitals are actively enrolling cardholders.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>FR-5: Patient Directory & Demographics Governance</b>", h2_style))
    story.append(Paragraph("• <b>FR-5.1:</b> The system shall maintain patient demographics (full name, age, gender, contact phone, email, registered hospital facility).", bullet_style))
    story.append(Paragraph("• <b>FR-5.2:</b> The directory table shall clearly indicate linked Medy Insurance Card IDs in high-contrast Sky Blue badges.", bullet_style))
    story.append(Paragraph("• <b>FR-5.3:</b> Patients can be filtered by hospital facility and searched by name, phone, or card number with sub-second debounce.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>FR-6: Doctor Appointments & Clinical Volume Scheduling</b>", h2_style))
    story.append(Paragraph("• <b>FR-6.1:</b> When clicking 'Appointments' within Patient Management, the view shall toggle on the same page into an aggregated summary view.", bullet_style))
    story.append(Paragraph("• <b>FR-6.2:</b> The summary table must display: Hospital Facility, Doctor Name, Department/Specialty, Total Patient Appointments, and Status Breakdown (Confirmed, Completed, Cancelled).", bullet_style))
    story.append(Paragraph("• <b>FR-6.3:</b> In compliance with medical confidentiality guidelines, this high-level summary view shall NOT expose patient personal or diagnostic details.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: SECTION 4 - FUNCTIONAL REQUIREMENTS (PART 2)
    # =========================================================================
    story.append(Paragraph("5. Detailed Functional Requirements (Modules 7 - 12)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10, spaceBefore=2))

    story.append(Paragraph("<b>FR-7: Diagnostic Laboratory Testing & Catalog Service</b>", h2_style))
    story.append(Paragraph("• <b>FR-7.1:</b> The platform shall provide a standardized laboratory diagnostic test catalog (e.g. Lipid Profile, Complete Blood Count, Liver Function Test, HbA1c, Cardiac Markers).", bullet_style))
    story.append(Paragraph("• <b>FR-7.2:</b> Each catalog test must specify normal reference ranges, specimen type (blood, serum, urine), unit of measurement, and estimated turnaround hours.", bullet_style))
    story.append(Paragraph("• <b>FR-7.3:</b> Diagnostic orders shall support status progression: <code>Requested</code> → <code>In-Progress</code> → <code>Completed</code> → <code>Archived</code>.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>FR-8: Biomarkers, Health Map & Predictive Risk Engine</b>", h2_style))
    story.append(Paragraph("• <b>FR-8.1:</b> The system shall maintain historical patient biomarkers: Blood Glucose, Systolic/Diastolic BP, SpO2, BMI, and Serum Creatinine.", bullet_style))
    story.append(Paragraph("• <b>FR-8.2:</b> The Predictive Risk Engine shall evaluate organ health indicators (Cardiovascular, Renal, Hepatic, Metabolic) using rule-based scoring.", bullet_style))
    story.append(Paragraph("• <b>FR-8.3:</b> The Health Map module shall visualize regional health risk distributions across participating network facilities.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>FR-9: Pharmacy Formulary & Prescription Management</b>", h2_style))
    story.append(Paragraph("• <b>FR-9.1:</b> Hospital medical staff shall review medicine formularies, dosage guidelines, contraindications, and active pharmaceutical stocks.", bullet_style))
    story.append(Paragraph("• <b>FR-9.2:</b> System shall record electronic prescriptions tied directly to patient visits and doctor consultations.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>FR-10: Audit Logs, Security Trails & Event Monitoring</b>", h2_style))
    story.append(Paragraph("• <b>FR-10.1:</b> An immutable audit log entry shall be automatically generated for every state-altering administrative action.", bullet_style))
    story.append(Paragraph("• <b>FR-10.2:</b> Audit records must capture: Timestamp (UTC ISO), Actor Name/Email, Actor Role, Action Type, Target Entity, IP Address, and Execution Status.", bullet_style))
    story.append(Paragraph("• <b>FR-10.3:</b> Actions tracked include: <code>SUPER_ADMIN_LOGIN</code>, <code>HOSPITAL_ADMIN_LOGIN</code>, <code>HOSPITAL_ADMIN_CREATED</code>, <code>HOSPITAL_ADMIN_UPDATED</code>, <code>HOSPITAL_ADMIN_STATUS_CHANGED</code>, <code>HOSPITAL_ADMIN_DELETED</code>, <code>MEDICARD_BLOCKED</code>, and <code>HOSPITAL_STATUS_CHANGED</code>.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>FR-11: Analytical Dashboards & Business Intelligence Metrics</b>", h2_style))
    story.append(Paragraph("• <b>FR-11.1:</b> The dashboard shall present executive KPI metric cards: Total Network Hospitals, Active Facilities, Active MediCards, Registered Patients, and Scheduled Appointments.", bullet_style))
    story.append(Paragraph("• <b>FR-11.2:</b> Interactive visual charts (via Recharts) shall display monthly card issuance trends, patient admission distributions, and hospital occupancy rates.", bullet_style))
    story.append(Paragraph("• <b>FR-11.3:</b> All metrics must dynamically recalculate when facility filters or date range parameters are adjusted.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>FR-12: Public Patient Self-Application & Enrollment Portal</b>", h2_style))
    story.append(Paragraph("• <b>FR-12.1:</b> A public-facing web form (<code>/patient-apply</code>) shall allow prospective patients to submit enrollment requests for Medy Health Cards.", bullet_style))
    story.append(Paragraph("• <b>FR-12.2:</b> Form validates applicant identity, contact phone, preferred healthcare facility, and selected insurance tier.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: SECTION 5 - NON-FUNCTIONAL REQUIREMENTS (NFRs)
    # =========================================================================
    story.append(Paragraph("6. Non-Functional Requirements & Design Standards", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10, spaceBefore=2))

    # NFR Table
    nfr_data = [
        [Paragraph("Category", table_header_style), Paragraph("Standard & Target Metric", table_header_style), Paragraph("Implementation Specification", table_header_style)],
        [
            Paragraph("<b>UI/UX Design System</b>", table_cell_bold),
            Paragraph("Sky Blue & White Aesthetic<br/>WCAG 2.1 AA Contrast", table_cell_style),
            Paragraph("Primary Sky Blue (<code>#0284c7</code>), Deep Sky (<code>#0369a1</code>), Ice Tint (<code>#f0f9ff</code>), White (<code>#ffffff</code>). Zero Tailwind dependencies; pure high-performance CSS; fluid 100% responsive layout across desktop and tablet.", table_cell_style)
        ],
        [
            Paragraph("<b>Information Security</b>", table_cell_bold),
            Paragraph("HIPAA & OWASP Top 10<br/>BCrypt Hashing + JWT", table_cell_style),
            Paragraph("Passwords encrypted with salt rounds >= 10; stateless JWT session tokens; all REST endpoints guarded by bearer verification; inactive account denial; parameterized MongoDB queries preventing injection.", table_cell_style)
        ],
        [
            Paragraph("<b>Response Time & Speed</b>", table_cell_bold),
            Paragraph("P95 < 250ms (API)<br/>Page Load < 1.2s", table_cell_style),
            Paragraph("Vite module bundling; lean selective field projection (<code>select('-password')</code>); indexed queries on email, username, cardId, and hospitalId; asynchronous background logging.", table_cell_style)
        ],
        [
            Paragraph("<b>Reliability & Availability</b>", table_cell_bold),
            Paragraph("99.9% Uptime<br/>Auto-Seeding Recovery", table_cell_style),
            Paragraph("Automatic database self-healing: on startup, server verifies and provisions default hospital and super administrator credentials if empty, preventing initial deployment lockouts.", table_cell_style)
        ],
        [
            Paragraph("<b>Maintainability & Code Quality</b>", table_cell_bold),
            Paragraph("Zero Linter / Build Errors<br/>Clean Component Trees", table_cell_style),
            Paragraph("Strict ESLint and Vite build validation (clean exit code 0); separated concerns between controllers, models, and routes; shared AuthContext for unified authentication state.", table_cell_style)
        ],
        [
            Paragraph("<b>Data Privacy & Compliance</b>", table_cell_bold),
            Paragraph("Confidential Clinical Summary<br/>Protected Health Info (PHI)", table_cell_style),
            Paragraph("Patient directory and doctor appointments summaries isolate confidential diagnostic details from high-level volume metrics to prevent accidental clinical disclosure.", table_cell_style)
        ],
    ]
    nfr_table = Table(nfr_data, colWidths=[110, 150, 244])
    nfr_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_DARK),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(nfr_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("7. Database Schema & Data Models", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10, spaceBefore=2))

    # Schema Table
    schema_data = [
        [Paragraph("Collection / Model", table_header_style), Paragraph("Key Fields & Types", table_header_style), Paragraph("Indices & Constraints", table_header_style)],
        [
            Paragraph("<b>Admin</b><br/>(Admins & Super Admins)", table_cell_bold),
            Paragraph("<code>adminId</code> (String), <code>fullName</code> (String), <code>email</code> (String), <code>username</code> (String), <code>password</code> (Hash), <code>role</code> (Enum), <code>hospitalId</code> (ObjectId), <code>status</code> (Enum: Active/Inactive)", table_cell_style),
            Paragraph("Unique on <code>email</code> and <code>username</code>; index on <code>role</code> and <code>hospitalId</code>; defaults to Active.", table_cell_style)
        ],
        [
            Paragraph("<b>Hospital</b><br/>(Healthcare Facilities)", table_cell_bold),
            Paragraph("<code>name</code> (String), <code>code</code> (String), <code>city</code> (String), <code>phone</code> (String), <code>email</code> (String), <code>address</code> (String), <code>status</code> (Enum), <code>totalBeds</code> (Number), <code>availableBeds</code> (Number)", table_cell_style),
            Paragraph("Unique index on <code>code</code>; case-insensitive name lookup; default status: 'Active'.", table_cell_style)
        ],
        [
            Paragraph("<b>Patient</b><br/>(Insured Citizens)", table_cell_bold),
            Paragraph("<code>name</code> (String), <code>age</code> (Number), <code>gender</code> (Enum), <code>phone</code> (String), <code>email</code> (String), <code>hospitalName</code> (String), <code>cardId</code> (String), <code>emergencyContact</code> (String)", table_cell_style),
            Paragraph("Index on <code>phone</code>, <code>cardId</code>, and <code>hospitalName</code>; clean string sanitization.", table_cell_style)
        ],
        [
            Paragraph("<b>MediCard</b><br/>(Digital Health Cards)", table_cell_bold),
            Paragraph("<code>cardNumber</code> (String), <code>patientName</code> (String), <code>hospitalName</code> (String), <code>insurancePlan</code> (Enum), <code>status</code> (Enum: Active/Blocked), <code>issueDate</code> (Date), <code>blockReason</code> (String)", table_cell_style),
            Paragraph("Unique on <code>cardNumber</code>; index on <code>status</code>, <code>hospitalName</code>, and <code>insurancePlan</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>Appointment</b><br/>(Doctor Consultations)", table_cell_bold),
            Paragraph("<code>patientName</code> (String), <code>patientPhone</code> (String), <code>doctorName</code> (String), <code>department</code> (String), <code>hospitalName</code> (String), <code>date</code> (Date), <code>time</code> (String), <code>status</code> (Enum)", table_cell_style),
            Paragraph("Compound index on <code>(hospitalName, doctorName)</code>; status enum: Confirmed, Completed, Cancelled.", table_cell_style)
        ],
        [
            Paragraph("<b>AuditLog</b><br/>(Security Event Trail)", table_cell_bold),
            Paragraph("<code>actor</code> (String), <code>role</code> (String), <code>action</code> (String), <code>target</code> (String), <code>details</code> (String), <code>ipAddress</code> (String), <code>status</code> (String), <code>createdAt</code> (Date)", table_cell_style),
            Paragraph("TTL / Append-only ledger; indexed by <code>createdAt</code> (-1) and <code>action</code> for fast forensic audit filtering.", table_cell_style)
        ],
    ]
    schema_table = Table(schema_data, colWidths=[110, 220, 174])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_DARK),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(schema_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 7: SECTION 6 - REST API SPECIFICATION & DEPLOYMENT
    # =========================================================================
    story.append(Paragraph("8. RESTful API Interface & Endpoint Mapping", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10, spaceBefore=2))

    # API Endpoints Table
    api_data = [
        [Paragraph("Endpoint Route", table_header_style), Paragraph("Method", table_header_style), Paragraph("Auth Level", table_header_style), Paragraph("Description & Operations", table_header_style)],
        [Paragraph("<code>/api/auth/login</code>", table_cell_bold), Paragraph("POST", table_cell_style), Paragraph("Public", table_cell_style), Paragraph("Authenticates credentials; issues signed JWT bearer token.", table_cell_style)],
        [Paragraph("<code>/api/hospitals</code>", table_cell_bold), Paragraph("GET, POST", table_cell_style), Paragraph("Bearer (Admin)", table_cell_style), Paragraph("Lists all facilities or registers a new hospital institution.", table_cell_style)],
        [Paragraph("<code>/api/hospitals/:id</code>", table_cell_bold), Paragraph("PUT, DELETE", table_cell_style), Paragraph("Bearer (Admin)", table_cell_style), Paragraph("Updates facility metadata or purges record.", table_cell_style)],
        [Paragraph("<code>/api/hospitals/:id/status</code>", table_cell_bold), Paragraph("PATCH", table_cell_style), Paragraph("Bearer (Admin)", table_cell_style), Paragraph("Toggles facility status between Active and Inactive.", table_cell_style)],
        [Paragraph("<code>/api/hospital-admins</code>", table_cell_bold), Paragraph("GET, POST", table_cell_style), Paragraph("Bearer (Super)", table_cell_style), Paragraph("Queries admins by facility or provisions new hospital admin.", table_cell_style)],
        [Paragraph("<code>/api/hospital-admins/:id</code>", table_cell_bold), Paragraph("PUT, DELETE", table_cell_style), Paragraph("Bearer (Super)", table_cell_style), Paragraph("Modifies credentials/profile or revokes administrator account.", table_cell_style)],
        [Paragraph("<code>/api/hospital-admins/:id/status</code>", table_cell_bold), Paragraph("PATCH", table_cell_style), Paragraph("Bearer (Super)", table_cell_style), Paragraph("Toggles administrator active/inactive access status.", table_cell_style)],
        [Paragraph("<code>/api/medicards</code>", table_cell_bold), Paragraph("GET, POST", table_cell_style), Paragraph("Bearer (Admin)", table_cell_style), Paragraph("Fetches filtered cards or issues a new health card.", table_cell_style)],
        [Paragraph("<code>/api/medicards/:id/block</code>", table_cell_bold), Paragraph("PATCH", table_cell_style), Paragraph("Bearer (Admin)", table_cell_style), Paragraph("Blocks card with mandatory reason and logs audit event.", table_cell_style)],
        [Paragraph("<code>/api/medicards/hospital-allocations</code>", table_cell_bold), Paragraph("GET", table_cell_style), Paragraph("Bearer (Admin)", table_cell_style), Paragraph("Aggregates health card distribution volume by hospital.", table_cell_style)],
        [Paragraph("<code>/api/patients</code>", table_cell_bold), Paragraph("GET, POST", table_cell_style), Paragraph("Bearer / Public", table_cell_style), Paragraph("Queries patient records or accepts new enrollment request.", table_cell_style)],
        [Paragraph("<code>/api/appointments</code>", table_cell_bold), Paragraph("GET, POST", table_cell_style), Paragraph("Bearer (Admin)", table_cell_style), Paragraph("Returns appointment schedules and status distributions.", table_cell_style)],
        [Paragraph("<code>/api/dashboard/stats</code>", table_cell_bold), Paragraph("GET", table_cell_style), Paragraph("Bearer (Admin)", table_cell_style), Paragraph("Yields executive KPIs, chart metrics, and facility counts.", table_cell_style)],
        [Paragraph("<code>/api/audit-logs</code>", table_cell_bold), Paragraph("GET", table_cell_style), Paragraph("Bearer (Super)", table_cell_style), Paragraph("Lists immutable audit records filtered by actor/action.", table_cell_style)],
        [Paragraph("<code>/api/health</code>", table_cell_bold), Paragraph("GET", table_cell_style), Paragraph("Public", table_cell_style), Paragraph("Readiness & liveness health check probe for load balancers.", table_cell_style)],
    ]
    api_table = Table(api_data, colWidths=[150, 50, 75, 229])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_DARK),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(api_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("9. Deployment, Environmental & Sign-off Criteria", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=8, spaceBefore=2))

    story.append(Paragraph("• <b>Host Runtime Requirements:</b> Node.js v18.0.0 or higher, npm v9.0.0+, MongoDB v6.0+ instance running on default port 27017.", bullet_style))
    story.append(Paragraph("• <b>Default Port Allocations:</b> Backend API Service listens on <code>http://127.0.0.1:5000</code>; Frontend Dev/Production Server serves on <code>http://localhost:3000</code>.", bullet_style))
    story.append(Paragraph("• <b>Production Build Command:</b> <code>npm --prefix frontend run build</code> (verifies compilation, bundle size, and syntax validity with zero errors).", bullet_style))
    story.append(Paragraph("• <b>Database Persistence Verification:</b> Verified with pre-seeded test data including default hospital, super admin, hospital admins, sample patients, and active cards.", bullet_style))

    story.append(Spacer(1, 10))

    # Sign-off Table
    sign_data = [
        [Paragraph("Role / Authority", table_header_style), Paragraph("Representative", table_header_style), Paragraph("Date Verified", table_header_style), Paragraph("Approval Status", table_header_style)],
        [Paragraph("Lead Systems Architect", table_cell_bold), Paragraph("Dr. Robert / Architecture Team", table_cell_style), Paragraph("16-Nov-2026", table_cell_style), Paragraph("<font color='#10b981'><b>APPROVED</b></font>", table_cell_style)],
        [Paragraph("Healthcare Operations Director", table_cell_bold), Paragraph("Dr. Rajesh Sharma (HADM-001)", table_cell_style), Paragraph("16-Nov-2026", table_cell_style), Paragraph("<font color='#10b981'><b>APPROVED</b></font>", table_cell_style)],
        [Paragraph("Lead QA & Security Auditor", table_cell_bold), Paragraph("Priya Sundaram (HADM-002)", table_cell_style), Paragraph("16-Nov-2026", table_cell_style), Paragraph("<font color='#10b981'><b>VERIFIED</b></font>", table_cell_style)],
    ]
    sign_table = Table(sign_data, colWidths=[150, 160, 94, 100])
    sign_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(sign_table)

    # Build Document using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename} ({os.path.getsize(filename):,} bytes)")

if __name__ == "__main__":
    out_pdf = "Medy_Project_Requirements.pdf"
    if len(sys.argv) > 1:
        out_pdf = sys.argv[1]
    build_pdf(out_pdf)
