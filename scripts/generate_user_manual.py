"""Generate the end-user PDF manual for ARplusCSS.

Run from the project root:
    python3 scripts/generate_user_manual.py
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "ARplusCSS_User_Manual.pdf"
LOGO = ROOT / "assets" / "logo.png"
HERO = ROOT / "assets" / "images" / "home-hero.png"

NAVY = colors.HexColor("#0C2D6B")
BLUE = colors.HexColor("#1D4ED8")
PALE = colors.HexColor("#EAF1FC")
TEXT = colors.HexColor("#263B63")
GREEN = colors.HexColor("#15803D")
AMBER = colors.HexColor("#A65A00")
BORDER = colors.HexColor("#B8D0EF")


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.line(doc.leftMargin, 1.35 * cm, A4[0] - doc.rightMargin, 1.35 * cm)
    canvas.setFillColor(TEXT)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(doc.leftMargin, 0.85 * cm, "ARplusCSS User Manual")
    canvas.drawRightString(A4[0] - doc.rightMargin, 0.85 * cm, f"Page {doc.page}")
    canvas.restoreState()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT), pagesize=A4, rightMargin=1.7 * cm, leftMargin=1.7 * cm,
        topMargin=1.45 * cm, bottomMargin=1.8 * cm,
        title="ARplusCSS User Manual", author="ARplusCSS",
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="ManualTitle", parent=styles["Title"], fontName="Helvetica-Bold",
        fontSize=27, leading=33, textColor=NAVY, alignment=TA_CENTER, spaceAfter=10))
    styles.add(ParagraphStyle(name="Subtitle", parent=styles["BodyText"], fontSize=12, leading=18,
        textColor=TEXT, alignment=TA_CENTER, spaceAfter=14))
    styles.add(ParagraphStyle(name="H1Manual", parent=styles["Heading1"], fontName="Helvetica-Bold",
        fontSize=19, leading=23, textColor=NAVY, spaceBefore=8, spaceAfter=10))
    styles.add(ParagraphStyle(name="H2Manual", parent=styles["Heading2"], fontName="Helvetica-Bold",
        fontSize=13, leading=17, textColor=BLUE, spaceBefore=11, spaceAfter=5))
    styles.add(ParagraphStyle(name="BodyManual", parent=styles["BodyText"], fontSize=10.2, leading=15,
        textColor=TEXT, spaceAfter=6))
    styles.add(ParagraphStyle(name="SmallManual", parent=styles["BodyText"], fontSize=8.8, leading=12,
        textColor=TEXT, spaceAfter=3))
    styles.add(ParagraphStyle(name="TableHead", parent=styles["BodyText"], fontSize=8.8, leading=12,
        textColor=colors.white, spaceAfter=0))
    styles.add(ParagraphStyle(name="Callout", parent=styles["BodyText"], fontSize=10, leading=14,
        textColor=TEXT, leftIndent=6, rightIndent=6, spaceAfter=2))

    def p(text, style="BodyManual"):
        return Paragraph(text, styles[style])

    def th(text):
        return p(f"<b>{text}</b>", "TableHead")

    def heading(text, level=1):
        return p(text, "H1Manual" if level == 1 else "H2Manual")

    def bullets(items):
        return [p(f"• {item}") for item in items]

    def callout(title, body, accent=BLUE):
        table = Table([[p(f"<b>{title}</b><br/>{body}", "Callout")]], colWidths=[17.6 * cm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PALE),
            ("BOX", (0, 0), (-1, -1), 1, accent),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        return table

    def numbered(rows):
        data = [[p(f"<b>{n}</b>", "BodyManual"), p(text)] for n, text in enumerate(rows, 1)]
        table = Table(data, colWidths=[0.8 * cm, 16.8 * cm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LINEBELOW", (0, 0), (-1, -2), 0.3, BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        return table

    story = []
    story += [Spacer(1, 0.35 * cm)]
    if LOGO.exists():
        image = Image(str(LOGO), width=7.3 * cm, height=6.7 * cm)
        image.hAlign = "CENTER"
        story += [image, Spacer(1, 0.1 * cm)]
    story += [p("USER MANUAL", "ManualTitle"),
              p("Augmented Reality–Based Instructional Materials in Computer System Servicing", "Subtitle"),
              Spacer(1, 0.2 * cm)]
    if HERO.exists():
        hero = Image(str(HERO), width=14.5 * cm, height=9.0 * cm)
        hero.hAlign = "CENTER"
        story += [hero, Spacer(1, 0.25 * cm)]
    story += [callout("What this app does", "ARplusCSS is an interactive learning app for practicing motherboard component installation and RJ45 network-cable preparation in augmented reality."),
              Spacer(1, 0.35 * cm),
              p("Version 1.0  •  For learners and classroom users", "SmallManual")]
    story += [PageBreak()]

    story += [heading("Before you begin"),
              p("For the best experience, use a supported Android device with a working rear camera and Google Play Services for AR (ARCore). Allow camera access when the app asks. ARplusCSS needs a well-lit, uncluttered area and is intended as an instructional aid—not as a substitute for your motherboard or equipment manual."),
              heading("Prepare your learning area", 2)]
    story += bullets([
        "Use bright, even light. Avoid glare, deep shadows, and reflections on the motherboard or work surface.",
        "Keep the device steady and make sure the rear camera lens is clean.",
        "For motherboard practice, place the board flat and safely powered off. Never handle live hardware.",
        "For network practice, use a flat horizontal surface with enough room for the AR workspace.",
    ])
    story += [heading("Start the app", 2), numbered([
        "Open ARplusCSS. The opening screen advances automatically after a few seconds; you may also tap it to continue.",
        "On the home screen, tap <b>GET STARTED</b>.",
        "Choose <b>HARDWARE COMPONENTS</b>, <b>NETWORK CABLING</b>, or <b>HELP/GUIDE</b>.",
    ]), Spacer(1, 0.15 * cm),
              callout("Camera permission", "If camera access is not allowed, choose <b>Grant Permission</b>. The lessons cannot start without it.", AMBER)]
    story += [heading("Common controls", 2)]
    control_data = [
        [th("Control"), th("What it does")],
        [p("Exit", "SmallManual"), p("Leaves the current AR lesson.", "SmallManual")],
        [p("Reset", "SmallManual"), p("Restarts the current motherboard lesson while keeping its alignment.", "SmallManual")],
        [p("i", "SmallManual"), p("Shows or hides a short description of the selected component.", "SmallManual")],
        [p("Back", "SmallManual"), p("Closes a step-by-step guide and returns to the AR activity.", "SmallManual")],
    ]
    table = Table(control_data, colWidths=[4.1 * cm, 13.5 * cm], repeatRows=1)
    table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("BACKGROUND", (0,1), (-1,-1), colors.white), ("GRID", (0,0), (-1,-1), 0.4, BORDER),
        ("VALIGN", (0,0), (-1,-1), "TOP"), ("PADDING", (0,0), (-1,-1), 7)]))
    story += [table, PageBreak()]

    story += [heading("Hardware Components lesson"),
              p("This activity places a 3D motherboard over a photo of the board you capture. The hotspot layout is calibrated for the ASUS P5G41T-M LX3 and boards with a similar layout."),
              heading("1. Capture your motherboard marker", 2), numbered([
        "From the options screen, tap <b>HARDWARE COMPONENTS</b> (or the <b>Scan</b> button).",
        "Place the motherboard flat, in good light. Fill the camera frame with the motherboard.",
        "Tap <b>Capture</b>. Check the preview, then choose <b>Use Photo</b>; choose <b>Retake</b> if the image is blurry, dark, or poorly framed.",
        "The motherboard dimensions are fixed for this lesson at 24.4 × 18.8 cm. Use a board with a similar component layout for the best hotspot alignment.",
    ]),
    heading("2. Align the virtual board", 2), p("Point the camera at the same motherboard used for the photo. When it is detected, the alignment panel appears.")]
    story += bullets([
        "Use ROTATE, TILT, and ROLL to match the virtual board’s orientation to the real board.",
        "Use SCALE +/− and the MOVE controls to match its size and position. BACK/FORWARD adjusts depth.",
        "Use RESET POSITION if you want to start alignment again, then choose <b>Lock Motherboard Position</b>.",
        "When the status says “Position locked — tap Start,” tap <b>Start</b> to begin.",
    ])
    story += [callout("Alignment tip", "Move slowly and look at the socket and connector locations. Accurate alignment makes the blue target slots easier to use.")]
    story += [heading("3. Complete the installation practice", 2), numbered([
        "Read the guide for the current component, then tap <b>Back</b>.",
        "Use the arrow controls to move the 3D component over the blue slot.",
        "Tap <b>Place</b>. If the location is incorrect, adjust it and try again; use the placement <b>Reset</b> to return it to its starting position.",
        "After a successful placement, tap <b>Next</b> for the next component. Finish all items to see the completion screen, or select <b>Start Over</b> to practice again.",
    ]),
    heading("Lesson sequence", 2),
    p("The activity guides you through: CPU → CPU cooler → RAM → 4-pin CPU power → 24-pin ATX power → SATA data cable → front-panel USB → front-panel switches → GPU."),
    callout("Hardware safety", "Switch off and unplug real equipment before connecting components. Avoid touching CPU pins or socket contacts, use anti-static precautions, and never force a connector. Always confirm real-board pin locations in that board’s manual.", AMBER)]

    story += [heading("Network Cabling lesson"),
              p("This activity creates an AR cable workspace on a flat horizontal surface. It teaches the preparation steps and lets you practice the eight-wire order for both RJ45 ends."),
              heading("1. Choose a cable type", 2)]
    cable_data = [
        [th("Cable type"), th("Use"), th("Wire standard")],
        [p("Straight-through", "SmallManual"), p("Connect different device types, such as a PC to a switch.", "SmallManual"), p("T568B on End A and End B.", "SmallManual")],
        [p("Crossover", "SmallManual"), p("Connect similar devices directly for servicing practice.", "SmallManual"), p("T568B on End A; T568A on End B.", "SmallManual")],
    ]
    table = Table(cable_data, colWidths=[3.2*cm, 7.4*cm, 7.0*cm], repeatRows=1)
    table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("BACKGROUND", (0,1), (-1,-1), colors.white), ("GRID", (0,0), (-1,-1), 0.4, BORDER),
        ("VALIGN", (0,0), (-1,-1), "TOP"), ("PADDING", (0,0), (-1,-1), 7)]))
    story += [table, heading("2. Place the AR workspace", 2), numbered([
        "Tap your selected cable type, then point the rear camera at a flat, well-lit surface.",
        "Wait for the message <b>Surface ready — tap a cabling step</b>.",
        "Tap a green step hotspot to view the illustrated AR action and its instructions. Tap <b>Back</b> to return to the workspace.",
    ]),
    heading("Cabling preparation steps", 2)]
    story += bullets([
        "<b>Strip:</b> Remove about 2–3 cm (1 inch) of the outer jacket without nicking the conductors.",
        "<b>Untwist:</b> Open the pairs only as far as necessary and straighten the conductors.",
        "<b>Order:</b> Arrange the eight wires in the required standard.",
        "<b>Trim:</b> Keep the order pinched and cut the wire ends evenly.",
        "<b>Insert:</b> With the latch down and gold contacts up, push wires fully into the plug.",
        "<b>Crimp:</b> Seat the plug in the correct crimp-tool die, crimp firmly, and perform a gentle tug test.",
    ])
    story += [callout("Tool safety", "Use a proper RJ45 crimper and cable stripper. Keep cutting tools away from hands and eyes. Test finished cables with a cable tester when available.", AMBER), PageBreak()]

    story += [heading("RJ45 wire-order practice"),
              p("Select the <b>Order</b> hotspot to begin the interactive wire exercise. The app shows the active connector end, its standard, the pin count, and the expected order."),
              heading("How to complete each end", 2), numbered([
        "Hold the orientation in mind: <b>latch down, contacts up</b>. Pins 1–8 run left to right.",
        "Tap an available wire in the AR workspace.",
        "Tap its numbered pin. A correct wire stays in place; an incorrect choice shows a correction message and increments the Corrections count.",
        "Complete all eight pins. Choose <b>Build End B</b> to move to the second connector.",
        "When both ends are correct, choose <b>Practice again</b> to restart the exercise.",
    ]), heading("Pin orders", 2)]
    order_data = [
        [th("Standard"), th("Pins 1 → 8 (left to right)")],
        [p("T568B", "SmallManual"), p("White-Orange, Orange, White-Green, Blue, White-Blue, Green, White-Brown, Brown", "SmallManual")],
        [p("T568A", "SmallManual"), p("White-Green, Green, White-Orange, Blue, White-Blue, Orange, White-Brown, Brown", "SmallManual")],
    ]
    table = Table(order_data, colWidths=[3*cm, 14.6*cm], repeatRows=1)
    table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("BACKGROUND", (0,1), (-1,-1), colors.white), ("GRID", (0,0), (-1,-1), 0.4, BORDER),
        ("VALIGN", (0,0), (-1,-1), "TOP"), ("PADDING", (0,0), (-1,-1), 7)]))
    story += [table, Spacer(1, 0.2*cm), callout("Remember", "Straight-through uses T568B at both ends. Crossover uses T568B at End A and T568A at End B. Modern Auto-MDIX equipment may accept straight-through cables in situations where crossover was previously required.")]
    story += [heading("Troubleshooting", 1)]
    trouble_data = [
        [th("If this happens…"), th("Try this")],
        [p("The camera will not open", "SmallManual"), p("Allow camera permission in Android settings, then reopen the app. Close any other app using the camera.", "SmallManual")],
        [p("Motherboard is not detected", "SmallManual"), p("Use the same board you photographed. Improve lighting, reduce glare, keep the board flat, and point the camera at the whole board. Re-capture a clear photo if needed.", "SmallManual")],
        [p("Virtual board does not line up", "SmallManual"), p("Use the alignment controls and lock the position again. The lesson works best with the calibrated ASUS P5G41T-M LX3 layout or a closely similar board.", "SmallManual")],
        [p("Network workspace does not appear", "SmallManual"), p("Point at a clear, horizontal, well-lit surface and move the phone slowly until surface detection succeeds.", "SmallManual")],
        [p("A wire will not stay in a pin", "SmallManual"), p("Check the on-screen order, select the wire first, then tap the matching numbered pin. Correct any reported mismatch.", "SmallManual")],
    ]
    table = Table(trouble_data, colWidths=[5.1*cm, 12.5*cm], repeatRows=1)
    table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("BACKGROUND", (0,1), (-1,-1), colors.white), ("GRID", (0,0), (-1,-1), 0.4, BORDER),
        ("VALIGN", (0,0), (-1,-1), "TOP"), ("PADDING", (0,0), (-1,-1), 7)]))
    story += [table, Spacer(1, 0.25*cm), callout("Need a refresher?", "Open <b>HELP/GUIDE</b> from the options screen for a quick in-app summary of the lessons, components, cabling types, and capture tips.", GREEN)]

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    build()
