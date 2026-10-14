# ARplusCSS — Documentation: ADDIE Model & V-Model SDLC Answers

---

## 1. How will the AR-based instructional materials for Computer System Servicing be systematically developed following the ADDIE Model and V Model SDLC?

| **ADDIE Phase** | **V-Model Phase** | **How It Was Done** |
|---|---|---|
| **Analysis** | Requirements Analysis | Identified CSS competencies from the TESDA curriculum; listed which skills students struggle with; defined what the app must teach |
| **Design** | System / Architecture Design | Designed the app screen flow, AR hotspot layout for each component, wire-order logic for cabling, and step-by-step lesson structure |
| **Development** | Module / Unit Implementation | Built in 5 phases: (1) camera capture and marker tracking, (2) component tapping and 3D placement, (3) instructional guide panels and quizzes, (4) polish and bug fixes, (5) distribution and testing |
| **Implementation** | Integration Testing | Tested end-to-end on Infinix GT 30 Pro and Realme 6 Pro; fixed marker tracking bugs; verified capture-to-AR flow works on real devices |
| **Evaluation** | Acceptance / Operational Testing | Pending — classroom beta test with SPICT students has not yet been conducted; app is ready for deployment |

The V-Model's right side (verification and validation) maps to ADDIE's Evaluation phase. The app's built-in marker verification and on-device testing serve as verification, while the classroom beta-test will serve as validation.

---

## 1.1. What specific CSS competencies do Grade 9 and 10 SPICT students identify as most difficult to master under conventional instruction?

| **CSS Competency (TESDA)** | **Lesson** | **Why It Is Difficult Under Conventional Instruction** |
|---|---|---|
| **Install / Configure Computer Systems** — CPU, RAM, power connectors, GPU, front-panel headers | Hardware Components | Students cannot see inside the socket, struggle with pin orientation, and cannot feel the latch click from printed diagrams alone |
| **Prepare / Interpret Technical Drawings** — T568A / T568B wire order, crossover vs. straight-through cable | Network Cabling | Memorizing 8 wire colors in the correct order and understanding which standard goes on which end is confusing without hands-on practice |
| **Apply Quality Standards** — tug-test, latch-click verification, correct thermal paste amount | Both lessons | "How hard to press" and "how much is enough" cannot be shown in a textbook; students need to feel it |
| **Perform Mensuration / Calculation** — motherboard size, strip length, wire trim length | Both lessons | Students struggle with precision measurement when they do not have a physical ruler or component in front of them |
| **Observe Safety** — grounding, powering off, avoiding sharp bends, not overtightening | Embedded in all guides | Safety rules are easy to read but easy to skip when there is no consequence shown; students need guided reinforcement |

The app covers **9 hardware components** taught in a strict step-by-step order (CPU first, then CPU cooler, RAM, power connectors, and so on) and **6 cabling steps** (strip, untwist, trim, wire order, insert, crimp) with a built-in wire-color quiz that students must pass before proceeding.

---

## 1.2. What instructional content, 3D models, and interactive features are required to address the identified CSS learning gaps?

| **Learning Gap** | **Instructional Content** | **3D Models** | **Interactive AR Features** |
|---|---|---|---|
| **CPU socket alignment** | Step-by-step guide: lift the retention arm, align the golden triangle notch, drop the CPU in without sliding, lock the arm | Realistic 3D motherboard and CPU models | Highlighted target zone on the board; the app checks if the student places the CPU in the correct area before allowing them to continue |
| **Cable routing (24-pin ATX, 4-pin EPS)** | Guide: route the cable behind the tray, align the clip, press until the latch clicks | 3D power connector models | Target zones for each connector; the app detects wrong-slot placement and shows an error message guiding the student to try again on the correct slot |
| **RAM notch orientation** | Guide: "The notch differs between DDR4 and DDR5 — align carefully before pressing down" | 3D RAM model | Highlighted slot with correct orientation; placement must be accurate to proceed |
| **T568A vs T568B wire order** | Color-coded pin tables for both standards; overview of when to use each | 3D RJ45 connector model (both ends) | Interactive wire-color quiz: students select the correct color for each of the 8 pins on both ends; incorrect answers are flagged immediately; students must pass the quiz before inserting or crimping |
| **Crossover cable logic** | Explanation of which pairs swap between ends (pairs 1–3 and 2–6) | Same 3D RJ45 model reused for End A and End B | Students toggle between End A and End B; the app shows the correct wire order for each end based on the chosen cable type |
| **Insert depth and strain relief** | "Feed wires in until the tips are visible at the front; the outer jacket should enter the connector body" | 3D animated conductors sliding into the connector | Animated insertion showing wires sliding into both connector ends simultaneously after the wire-order quiz is passed |
| **Crimp force** | "Squeeze the crimping tool firmly once; then tug-test the cable" | 3D crimp animation | Looping crimp-press animation with audio guide; step is marked complete after the animation finishes |
| **Thermal paste amount** | "Apply a pea-sized dot in the center — do not spread it" | 3D CPU cooler model | Instructional guide panel with safety tips displayed alongside the model |

### 3D Model Inventory

| Component | Description | File Size |
|---|---|---|
| Motherboard | Full board with all slots and ports | 32.2 MB |
| CPU | Processor with pin/land details | 105.3 MB |
| CPU Cooler | Cooling block with fan mount | 26.1 MB |
| RAM | Memory module | 2.9 MB |
| 24-pin ATX Power | Main motherboard power connector | 546 KB |
| 4-pin EPS Power | CPU power connector | 199 KB |
| SATA Cable | Storage data cable | 3.2 MB |
| Front-Panel USB Header | USB header for front panel | 11 KB |
| Front-Panel Switches | Power/reset switch header | 71 KB |
| Graphics Card (GPU) | PCIe expansion card | 2.2 MB |
| RJ45 Connector | Network cable end (used for both ends in cabling lesson) | 396 KB |

### Audio, Video and Animation Assets

| Asset Type | Count | Description |
|---|---|---|
| Hardware voice-overs | 9 audio guides | One per component — explains installation steps and safety tips aloud |
| Network voice-overs | 7 audio guides | One per cabling step plus cable-type overviews |
| Sound effects | 3 | Install confirmation, quiz success, and click feedback |
| Demo videos | 5 | Short clips showing strip, untwist, trim (straight and crossover), and crimp techniques |
| 3D animations | 15+ | Component snap-and-seat animations for each slot, wire slide, crimp press, and conductor insertion |

---

## 1.3. How will the AR application be constructed, tested, and refined in accordance with the V-model SDLC phases during the development stage?

| **V-Model Construction Phase** | **V-Model Verification Phase** | **What Was Done** |
|---|---|---|
| **Requirements Analysis** | Acceptance Testing | Defined all 5 development phases in the project status document; classroom beta test is the final acceptance milestone |
| **System Design** | System Testing | Designed the 8-screen navigation flow, the state management for both lessons, the hotspot layout for the motherboard, and the wire-order logic for cabling |
| **Architecture Design** | Integration Testing | Camera capture screen passes data correctly to both AR screens; marker tracking unique-naming system prevents stale-marker bugs |
| **Module Design** | Unit Testing | Each component guide and wire-color quiz functions as a testable unit; the guide panel is reused across both lessons |
| **Coding / Construction** | Code Review / Static Analysis | Automated linting (code style checks) runs on the codebase; unreferenced components were identified for cleanup |
| | **On-Device Verification** | Motherboard capture → track → align → install flow works; RJ45 capture → track → wire-order quiz → insertion animation works; tested on Infinix GT 30 Pro and Realme 6 Pro |
| | **Marker Verification** | The app verifies captured images against reference photos using visual fingerprinting and color analysis to ensure the correct object was photographed |

### How Bugs and Issues Are Refined

Each problem found during testing maps to a specific fix:

- **Stale-marker bug** — When a user re-captured a new marker, the app kept showing the old image. Fixed by giving each capture a unique internal name.
- **RJ45 tracking flow** — Verified on both test devices to work correctly.
- **Motherboard verification** — Visual fingerprint and color checks are now active during capture.
- **Install sequence** — Components can only be installed in the correct order (CPU first, then cooler, then RAM, and so on).

---

## 1.4. How will the AR materials be deployed and beta-tested within the CSS classroom setting prior to full evaluation?

### Current Deployment Readiness

| **Artifact** | **Status** | **Details** |
|---|---|---|
| **Release APK** | Built and installable | An Android installable file has been built and is ready to distribute to student devices |
| **Build process** | Documented | Step-by-step instructions are written in the project README |
| **Web landing page** | Ready | A static webpage with a download link and user manual is prepared at `web/index.html` |
| **User manual** | Auto-generated PDF | A printable user manual covers before-you-begin setup, both lessons, and troubleshooting |
| **Printable marker reference** | Available | A printable motherboard reference sheet for students who do not have a physical board |
| **Marker verification** | Motherboard: active; RJ45: pending | The app verifies motherboard captures in real time; RJ45 verification is planned |

### Beta-Test Plan

**Step 1 — Pre-Test Setup:**
- Distribute the APK to students through the landing page download link
- Print the motherboard reference sheet for students who will use it as their AR marker
- Ensure all Android devices have Google Play Services for AR (ARCore) installed

**Step 2 — Classroom Session:**

| Activity | Approximate Time | What Will Be Recorded |
|---|---|---|
| Hardware lesson: capture a real motherboard or the printed reference, align the virtual board, install all 9 components in order | ~15 minutes | How many students complete each component, how long it takes, how many wrong-slot attempts occur |
| Network lesson: choose cable type, capture an RJ45 port, complete 6 cabling steps, pass the 16-pin wire-color quiz | ~15 minutes | How many students pass each step, how many wire-order errors, how long each step takes |
| Marker verification logging | Ongoing | Whether the capture passed or failed, which device was used |

**Step 3 — Data Collection Points:**

| Metric | What It Tells Us |
|---|---|
| Component installation completion | Which parts students find easiest and hardest to place correctly |
| Wrong-slot attempts | Where students are confused about which slot a component belongs in |
| Wire-order quiz errors | Which pin positions are most commonly mistaken |
| Marker capture pass/fail | How reliable the camera tracking is across different lighting and device conditions |
| Time on task | Which lessons or steps take the longest for students |

---

*Generated from ARplusCSS codebase analysis.*
