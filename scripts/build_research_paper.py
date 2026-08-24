#!/usr/bin/env python3
"""Build the audience-ready research paper from audited benchmark results."""

from __future__ import annotations

import math
from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "coding-intelligence-field-study.pdf"
W, H = A4

INK = HexColor("#111411")
PAPER = HexColor("#F3F0E7")
WHITE = HexColor("#FBFAF5")
LIME = HexColor("#C8FF3D")
CORAL = HexColor("#FF5D47")
BLUE = HexColor("#285BFF")
MINT = HexColor("#B8F2DB")
MUTED = HexColor("#666A63")
LINE = HexColor("#D4D0C5")
PALE_BLUE = HexColor("#E8EDFF")
PALE_LIME = HexColor("#EFFFD0")


def wrap(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_text(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    font: str = "Helvetica",
    size: float = 9.5,
    leading: float | None = None,
    color: Color = INK,
) -> float:
    leading = leading or size * 1.35
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap(text, font, size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def small_caps(c: canvas.Canvas, text: str, x: float, y: float, color: Color = MUTED) -> None:
    c.setFillColor(color)
    c.setFont("Courier-Bold", 7.2)
    c.drawString(x, y, text.upper())


def page_frame(c: canvas.Canvas, number: int, section: str) -> None:
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(42, H - 38, W - 42, H - 38)
    small_caps(c, "Coding Intelligence Field Study", 42, H - 28, INK)
    small_caps(c, section, W - 42 - stringWidth(section.upper(), "Courier-Bold", 7.2), H - 28, MUTED)
    c.line(42, 35, W - 42, 35)
    small_caps(c, "Applied research / August 2026", 42, 22, MUTED)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 8)
    c.drawRightString(W - 42, 22, f"{number:02d}")


def section_title(c: canvas.Canvas, index: str, title: str, subtitle: str, y: float = H - 82) -> float:
    small_caps(c, index, 42, y, BLUE)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 25)
    y -= 31
    for line in wrap(title, "Helvetica-Bold", 25, W - 84):
        c.drawString(42, y, line)
        y -= 29
    y -= 3
    y = draw_text(c, subtitle, 42, y, W - 84, "Helvetica", 9.5, 13.5, MUTED)
    return y - 18


def rounded(c: canvas.Canvas, x: float, y: float, w: float, h: float, fill: Color, stroke: Color | None = None, radius: float = 10) -> None:
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.roundRect(x, y, w, h, radius, fill=1, stroke=1)
    else:
        c.roundRect(x, y, w, h, radius, fill=1, stroke=0)


def chip(c: canvas.Canvas, text: str, x: float, y: float, fill: Color = LIME, color: Color = INK) -> float:
    width = stringWidth(text.upper(), "Courier-Bold", 6.8) + 16
    rounded(c, x, y - 4, width, 17, fill, radius=8)
    small_caps(c, text, x + 8, y + 1, color)
    return width


def arrow(c: canvas.Canvas, x1: float, y1: float, x2: float, y2: float, color: Color = INK) -> None:
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(1.3)
    c.line(x1, y1, x2, y2)
    angle = math.atan2(y2 - y1, x2 - x1)
    for delta in (2.55, -2.55):
        c.line(x2, y2, x2 + 8 * math.cos(angle + delta), y2 + 8 * math.sin(angle + delta))


def stat(c: canvas.Canvas, x: float, y: float, value: str, label: str, color: Color) -> None:
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(x, y, value)
    draw_text(c, label, x, y - 18, 98, "Helvetica", 7.8, 10, MUTED)


def make_cover(c: canvas.Canvas) -> None:
    c.setFillColor(INK)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(HexColor("#292D29"))
    c.setLineWidth(0.4)
    for x in range(42, int(W), 42):
        c.line(x, 0, x, H)
    for y in range(42, int(H), 42):
        c.line(0, y, W, y)

    small_caps(c, "Applied research / two phases / August 2026", 48, H - 66, LIME)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 40)
    c.drawString(48, H - 142, "How coding assistants")
    c.drawString(48, H - 188, "actually differ.")
    c.setStrokeColor(LIME)
    c.setLineWidth(5)
    c.line(48, H - 213, 216, H - 213)

    draw_text(
        c,
        "A reproducible field study of assistant products, frontier models, open-weight workers, neutral harnesses, and distributed AI development.",
        48,
        H - 252,
        410,
        "Helvetica",
        13,
        19,
        HexColor("#C8CBC5"),
    )

    rounded(c, 48, 190, W - 96, 184, HexColor("#1C201C"), HexColor("#424842"), 14)
    c.setFillColor(CORAL)
    c.circle(78, 337, 16, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("Courier-Bold", 7)
    c.drawCentredString(78, 334.5, "01")
    small_caps(c, "Principal finding", 108, 340, HexColor("#9EA49B"))
    c.setFillColor(WHITE)
    c.setFont("Times-Bold", 24)
    c.drawString(78, 300, "The strongest setup is a portfolio,")
    c.drawString(78, 271, "not a winner.")
    draw_text(
        c,
        "Codex leads. Claude challenges. OpenCode routes bounded workers. Pi keeps the model comparison honest.",
        78,
        233,
        W - 156,
        "Helvetica",
        9,
        13,
        HexColor("#B7BCB4"),
    )

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(48, 112, "Coding Intelligence Field Study")
    small_caps(c, "3 assistants / 5 neutral model routes / 20 phase 2 observations", 48, 91, LIME)
    c.setFillColor(HexColor("#777D75"))
    c.setFont("Helvetica", 7.5)
    c.drawRightString(W - 48, 52, "Evidence-backed local study")


def make_abstract(c: canvas.Canvas) -> None:
    page_frame(c, 2, "Abstract")
    y = section_title(
        c,
        "00 / ABSTRACT",
        "Separate the product from the model.",
        "Phase 1 measured complete assistant experiences. Phase 2 held the Pi harness constant and changed only the model route. Together, the two phases distinguish product advantage, model capability, and workflow design.",
    )
    rounded(c, 42, y - 108, W - 84, 105, WHITE, LINE)
    small_caps(c, "Research claim", 60, y - 28, CORAL)
    draw_text(
        c,
        "A strong AI development practice should combine specialized roles rather than choose one permanent winner: a frontier planner and integrator, an independent reviewer, economical bounded workers, and a neutral model harness.",
        60,
        y - 51,
        W - 120,
        "Times-Roman",
        12.2,
        16,
        INK,
    )

    stats_y = y - 160
    stat(c, 48, stats_y, "3", "primary coding assistants", BLUE)
    stat(c, 175, stats_y, "2", "completed research phases", CORAL)
    stat(c, 303, stats_y, "20", "neutral Phase 2 observations", INK)
    stat(c, 438, stats_y, "5", "models in the fixed Pi harness", BLUE)

    q_y = stats_y - 90
    small_caps(c, "Research questions", 42, q_y, BLUE)
    questions = [
        ("Q1", "Which assistant should lead?", "Codex was the strongest default integrator; Claude was the strongest independent reviewer."),
        ("Q2", "Is OpenCode worth exploring?", "Yes, when model flexibility and bounded open-model work matter more than native polish."),
        ("Q3", "Can economical models implement?", "Yes. Qwen and GLM passed hard tasks when work was explicit and verifiable."),
        ("Q4", "Should every task be distributed?", "No. Distribution improved separation and auditability but was 3.57x slower in the measured route."),
    ]
    y0 = q_y - 27
    for i, (num, q, a) in enumerate(questions):
        col = i % 2
        row = i // 2
        x = 42 + col * 258
        yy = y0 - row * 120
        c.setFillColor(LIME if i == 0 else PALE_BLUE)
        c.circle(x + 13, yy - 2, 13, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("Courier-Bold", 6.8)
        c.drawCentredString(x + 13, yy - 4, num)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x + 36, yy + 2, q)
        draw_text(c, a, x + 36, yy - 18, 205, "Helvetica", 8, 11.3, MUTED)


def make_design(c: canvas.Canvas) -> None:
    page_frame(c, 3, "Study design")
    y = section_title(
        c,
        "01 / STUDY DESIGN",
        "Two phases, one evidence chain.",
        "The design first tested whole assistant products, then isolated model behavior inside a fixed control surface.",
    )
    box_y = y - 142
    box_w = 188
    rounded(c, 42, box_y, box_w, 135, WHITE, LINE)
    chip(c, "Phase 1", 58, box_y + 104, LIME)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(58, box_y + 76, "Assistant products")
    draw_text(c, "Planning, permissions, tools, plugins, integration, and distributed work.", 58, box_y + 55, 154, "Helvetica", 8.4, 11.5, MUTED)
    small_caps(c, "Codex / Claude Code / OpenCode", 58, box_y + 15, BLUE)

    arrow(c, 238, box_y + 68, 273, box_y + 68, BLUE)
    rounded(c, 276, box_y + 33, 44, 70, CORAL)
    c.setFillColor(WHITE)
    c.setFont("Courier-Bold", 7)
    c.drawCentredString(298, box_y + 76, "EVIDENCE")
    c.drawCentredString(298, box_y + 61, "HANDOFF")

    arrow(c, 323, box_y + 68, 358, box_y + 68, BLUE)
    rounded(c, 365, box_y, box_w, 135, WHITE, LINE)
    chip(c, "Phase 2", 381, box_y + 104, BLUE, WHITE)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(381, box_y + 76, "Models in one harness")
    draw_text(c, "Analysis, bounded implementation, and concurrent debugging with fixed tools.", 381, box_y + 55, 154, "Helvetica", 8.4, 11.5, MUTED)
    small_caps(c, "Sol / Fable / GLM / Qwen / Kimi", 381, box_y + 15, BLUE)

    y2 = box_y - 50
    small_caps(c, "Evidence chain", 42, y2, CORAL)
    stages = [
        ("1", "Frozen start", "Named commit in an isolated worktree."),
        ("2", "Frozen prompt", "Versioned and hashed before execution."),
        ("3", "Saved work", "Patch retained even when a run failed."),
        ("4", "Private checks", "Verification hidden from the model."),
        ("5", "Audited claim", "Result labels preserve uncertainty."),
    ]
    start_y = y2 - 42
    for i, (n, title, body) in enumerate(stages):
        yy = start_y - i * 70
        c.setFillColor(BLUE if i < 4 else CORAL)
        c.circle(57, yy + 5, 15, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(57, yy + 2, n)
        if i < 4:
            c.setStrokeColor(LINE)
            c.line(57, yy - 12, 57, yy - 52)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(86, yy + 9, title)
        draw_text(c, body, 205, yy + 9, 320, "Helvetica", 8.4, 11.2, MUTED)


def make_assistants(c: canvas.Canvas) -> None:
    page_frame(c, 4, "Assistant differentiation")
    y = section_title(
        c,
        "02 / THE ASSISTANTS",
        "Four tools. Four different jobs.",
        "The assistant is the system around the model: tools, permissions, context, orchestration, and developer experience.",
    )
    rows = [
        ("01", "Codex", "Lead and integrator", "Best default lead", "Plan, implement, integrate, and run the final gate.", LIME),
        ("02", "Claude Code", "Reviewer and alternate lead", "Strongest challenger", "Challenge plans and perform fresh high-risk reviews.", PALE_BLUE),
        ("03", "OpenCode", "Open-model worker", "Worth keeping", "Route hosted open models to narrow, independently testable tasks.", MINT),
        ("04", "Pi", "Neutral model harness", "The laboratory", "Compare models without mixing in assistant-product differences.", HexColor("#FFE0DA")),
    ]
    row_h = 116
    for i, (n, name, role, finding, use, color) in enumerate(rows):
        yy = y - (i + 1) * row_h + 8
        rounded(c, 42, yy, W - 84, row_h - 12, WHITE, LINE)
        c.setFillColor(color)
        c.circle(70, yy + 52, 18, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("Courier-Bold", 7)
        c.drawCentredString(70, yy + 49, n)
        small_caps(c, role, 101, yy + 76, MUTED)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 17)
        c.drawString(101, yy + 49, name)
        c.setFillColor(BLUE)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(286, yy + 69, finding)
        draw_text(c, use, 286, yy + 46, 240, "Helvetica", 8.4, 11.2, MUTED)
    rounded(c, 42, 71, W - 84, 52, INK)
    small_caps(c, "Observed operating rule", 60, 101, LIME)
    draw_text(c, "Use Codex to lead, Claude to challenge, OpenCode to route bounded open-model work, and Pi to compare models neutrally.", 60, 83, W - 120, "Helvetica", 8.2, 10.5, WHITE)


def make_phase1(c: canvas.Canvas) -> None:
    page_frame(c, 5, "Phase 1 results")
    y = section_title(
        c,
        "03 / PHASE 1",
        "Products under development pressure.",
        "The assistant study moved from repository analysis to fixes, interfaces, an incident, cross-assistant tooling, and a securitized-products trade-capture system.",
    )
    cards = [
        ("Codex + Sol", "99", "129.209 s", "Fastest accepted frontier repair", BLUE),
        ("Claude + Opus", "97", "228.453 s", "Strong independent review", CORAL),
        ("OpenCode + Kimi K2.7", "99", "55.115 s", "Fastest shared-model result", INK),
    ]
    card_w = 164
    for i, (name, score, secs, note, color) in enumerate(cards):
        x = 42 + i * 176
        rounded(c, x, y - 155, card_w, 145, WHITE, LINE)
        small_caps(c, name, x + 15, y - 34, color)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 31)
        c.drawString(x + 15, y - 75, score)
        c.setFont("Helvetica-Bold", 9)
        c.drawRightString(x + card_w - 15, y - 70, secs)
        draw_text(c, note, x + 15, y - 101, card_w - 30, "Helvetica", 8, 10.5, MUTED)

    bar_top = y - 210
    small_caps(c, "Measured distributed workflow", 42, bar_top, CORAL)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(42, bar_top - 30, "Correct and auditable - but 3.57x slower.")
    draw_text(c, "Codex planned, Claude challenged, OpenCode implemented with Kimi, Codex integrated, and Claude reviewed. The route scored 100 with zero frontier repair.", 42, bar_top - 51, W - 84, "Helvetica", 8.8, 12, MUTED)
    max_w = W - 180
    base_y = bar_top - 130
    data = [("Distributed", 536.704, CORAL), ("Solo Codex", 150.206, BLUE)]
    for i, (label, value, color) in enumerate(data):
        yy = base_y - i * 58
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(42, yy + 7, label)
        bw = max_w * value / 536.704
        rounded(c, 125, yy, bw, 22, color, radius=5)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(132 + bw, yy + 7, f"{value:.3f} s")
    rounded(c, 42, 78, W - 84, 79, PALE_LIME)
    small_caps(c, "Decision", 58, 131, BLUE)
    draw_text(c, "Do not distribute every task. Use the multi-assistant route when independent challenge, ownership separation, or auditability justifies the coordination cost.", 58, 111, W - 116, "Helvetica-Bold", 9.5, 13, INK)


def make_phase2_method(c: canvas.Canvas) -> None:
    page_frame(c, 6, "Phase 2 methodology")
    y = section_title(
        c,
        "04 / PHASE 2 METHOD",
        "Five models. One neutral Pi harness.",
        "The baseline, prompts, tools, provider, timeouts, and zero-intervention policy stayed fixed. Only the model route changed across 20 counted observations.",
    )
    model_y = y - 45
    names = [("SOL", BLUE), ("FABLE", CORAL), ("KIMI", INK), ("QWEN", HexColor("#7AA500")), ("GLM", HexColor("#6549D8"))]
    for i, (name, color) in enumerate(names):
        x = 54 + i * 106
        rounded(c, x, model_y, 80, 38, color, radius=9)
        c.setFillColor(WHITE)
        c.setFont("Courier-Bold", 7)
        c.drawCentredString(x + 40, model_y + 16, name)
        arrow(c, x + 40, model_y - 5, W / 2, model_y - 74, LINE)

    rounded(c, 152, model_y - 155, W - 304, 70, INK)
    small_caps(c, "Fixed control surface", 173, model_y - 111, LIME)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 17)
    c.drawString(173, model_y - 139, "Pi 0.84.2")
    arrow(c, W / 2, model_y - 163, W / 2, model_y - 202, BLUE)

    outputs_y = model_y - 270
    outputs = ["Isolated worktree", "Visible + private tests", "Patch + telemetry", "Audit report"]
    for i, label in enumerate(outputs):
        x = 42 + (i % 2) * 258
        yy = outputs_y - (i // 2) * 60
        rounded(c, x, yy, 240, 44, WHITE, LINE, 8)
        c.setFillColor(BLUE)
        c.circle(x + 20, yy + 22, 5, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x + 35, yy + 18, label)

    rules_y = outputs_y - 162
    small_caps(c, "Control rules", 42, rules_y, CORAL)
    rules = [
        "Fresh session for every route",
        "Early-edit requirement",
        "Fixed timeout and zero intervention",
        "Saved patch after failure",
        "Private verification preserved",
        "Subscription, API, and provider costs labeled separately",
    ]
    for i, rule in enumerate(rules):
        x = 42 + (i % 2) * 258
        yy = rules_y - 30 - (i // 2) * 42
        c.setFillColor(LIME)
        c.circle(x + 6, yy + 2, 5, fill=1, stroke=0)
        draw_text(c, rule, x + 20, yy + 5, 220, "Helvetica", 8.2, 10.5, INK)


def make_phase2_results(c: canvas.Canvas) -> None:
    page_frame(c, 7, "Phase 2 results")
    y = section_title(
        c,
        "05 / PHASE 2 RESULTS",
        "Capability clustered. Reliability separated.",
        "Sol and GLM tied at 100. Qwen approached frontier quality at the lowest saved Pi cost. Kimi remains penalized for a counted timeout even though its saved patch later scored 95.",
    )
    rows = [
        ("GPT-5.6 Sol", "100", "3/3", "333.389", "$0.0808", BLUE),
        ("GLM 5.2", "100", "3/3", "744.357", "$0.0562", HexColor("#6549D8")),
        ("Claude Fable 5", "99.8", "3/3", "241.862", "$0.3644", CORAL),
        ("Qwen3.8-27B", "98.8", "3/3", "621.744", "$0.0160", HexColor("#7AA500")),
        ("Kimi K3", "68.75", "1/3", "1178.618", "$0.0760", INK),
    ]
    headers = [("MODEL", 48), ("SCORE", 250), ("WRITE", 318), ("SECONDS", 382), ("PI COST", 470)]
    small_caps(c, "Strict weighted comparison", 42, y, BLUE)
    for label, x in headers:
        small_caps(c, label, x, y - 31, MUTED)
    c.setStrokeColor(LINE)
    c.line(42, y - 40, W - 42, y - 40)
    row_y = y - 73
    for name, score, accept, secs, cost, color in rows:
        c.setFillColor(color)
        c.circle(52, row_y + 3, 5, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9.5)
        c.drawString(66, row_y, name)
        c.setFont("Helvetica-Bold", 10)
        c.drawRightString(286, row_y, score)
        c.setFont("Helvetica", 9)
        c.drawRightString(353, row_y, accept)
        c.drawRightString(445, row_y, secs)
        c.drawRightString(545, row_y, cost)
        c.setStrokeColor(LINE)
        c.line(42, row_y - 16, W - 42, row_y - 16)
        row_y -= 45

    chart_y = row_y - 5
    small_caps(c, "Strict score", 42, chart_y, CORAL)
    chart_max = 420
    for i, (name, score, _, _, _, color) in enumerate(rows):
        yy = chart_y - 32 - i * 31
        c.setFillColor(INK)
        c.setFont("Helvetica", 7.6)
        c.drawString(42, yy + 4, name)
        raw = float(score)
        rounded(c, 145, yy, chart_max * raw / 100, 14, color, radius=4)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawRightString(W - 42, yy + 4, score)

    rounded(c, 42, 75, W - 84, 67, WHITE, LINE)
    small_caps(c, "Cost reconciliation", 58, 119, CORAL)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(58, 91, "Saved Pi telemetry: $0.5933")
    c.drawRightString(W - 58, 91, "Observed account decrease: about $2.50")
    draw_text(c, "The $1.9067 difference cannot be allocated by model; route-level cost rankings remain provisional.", 58, 76, W - 116, "Helvetica", 7.7, 9.5, MUTED)


def make_orchestration(c: canvas.Canvas) -> None:
    page_frame(c, 8, "Recommended operating model")
    y = section_title(
        c,
        "06 / ORCHESTRATION",
        "Frontier judgment at the top. Economical execution underneath.",
        "This architecture combines the strongest observed product and model behaviors without pretending that every task needs a committee.",
    )
    top_y = y - 75
    rounded(c, 169, top_y, 258, 75, INK)
    small_caps(c, "01 / Plan", 190, top_y + 51, LIME)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(190, top_y + 22, "Codex + Sol")
    arrow(c, W / 2, top_y - 7, W / 2, top_y - 48, BLUE)

    worker_y = top_y - 148
    workers = [
        ("02A / Build", "Qwen worker", "Small bounded component", PALE_LIME),
        ("02B / Build", "GLM worker", "Hard asynchronous unit", PALE_BLUE),
        ("02C / Challenge", "Claude review", "Independent risk review", HexColor("#FFE0DA")),
    ]
    for i, (step, name, body, fill) in enumerate(workers):
        x = 42 + i * 176
        rounded(c, x, worker_y, 164, 95, fill, LINE)
        small_caps(c, step, x + 14, worker_y + 70, BLUE if i < 2 else CORAL)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(x + 14, worker_y + 43, name)
        draw_text(c, body, x + 14, worker_y + 23, 136, "Helvetica", 7.5, 9.5, MUTED)
        arrow(c, x + 82, worker_y - 8, W / 2, worker_y - 59, LINE)

    rounded(c, 117, worker_y - 122, 362, 43, WHITE, LINE)
    small_caps(c, "Evidence handoff: patches / tests / reports", 167, worker_y - 99, BLUE)
    arrow(c, W / 2, worker_y - 130, W / 2, worker_y - 169, BLUE)
    rounded(c, 169, worker_y - 247, 258, 75, BLUE)
    small_caps(c, "03 / Integrate", 190, worker_y - 196, LIME)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(190, worker_y - 225, "Codex final gate")

    rounded(c, 42, 78, W - 84, 66, INK)
    small_caps(c, "Control rule", 58, 121, LIME)
    draw_text(c, "Keep assignments non-overlapping. Require an early edit, fixed timeout, saved patch, private verification, and frontier fallback.", 58, 101, W - 116, "Helvetica-Bold", 9, 12, WHITE)


def make_tools_conclusion(c: canvas.Canvas) -> None:
    page_frame(c, 9, "Tools and conclusion")
    y = section_title(
        c,
        "07 / TOOLS AND CONCLUSION",
        "Evidence before impressions.",
        "Every conclusion traces back to a named baseline, frozen prompt, patch, verification record, timing, and explicitly labeled cost field.",
    )
    tool_rows = [
        ("Assistants", "Codex, Claude Code, OpenCode, Pi"),
        ("Frontier models", "GPT-5.6 Sol and Terra; Claude Opus, Sonnet, Fable"),
        ("Open models", "Kimi K2.7 and K3; Qwen3.8-27B; DeepSeek V4; GLM 5.2"),
        ("Model access", "OpenRouter, Ollama Cloud, subscription routes"),
        ("Evidence harness", "Git worktrees, frozen prompts, JSON manifests, saved patches"),
        ("Verification", "Visible tests, private suites, browser QA, scope checks"),
        ("Portability", "AGENTS.md, skills, read-only MCP, repository scripts"),
        ("Showcase", "Next-compatible app, Vinext build, synthetic trade workspace"),
    ]
    left_x, right_x = 42, 300
    for i, (label, value) in enumerate(tool_rows):
        x = left_x if i < 4 else right_x
        yy = y - 15 - (i % 4) * 60
        small_caps(c, label, x, yy, BLUE if i % 2 == 0 else CORAL)
        draw_text(c, value, x, yy - 18, 235, "Helvetica", 8.2, 10.8, INK)

    line_y = y - 268
    c.setStrokeColor(LINE)
    c.line(42, line_y, W - 42, line_y)
    small_caps(c, "Conclusion", 42, line_y - 28, CORAL)
    c.setFillColor(INK)
    c.setFont("Times-Bold", 22)
    c.drawString(42, line_y - 61, "Build a team of roles,")
    c.drawString(42, line_y - 87, "not a leaderboard of brands.")
    draw_text(
        c,
        "Codex is the default lead. Claude is the independent reviewer. OpenCode is the flexible worker harness. Pi is the neutral lab. Sol plans; Qwen executes cheaply; GLM handles hard asynchronous work; Fable buys speed; Kimi stays guarded until completion is more reliable.",
        42,
        line_y - 111,
        W - 84,
        "Helvetica",
        9.2,
        13,
        MUTED,
    )

    lim_y = line_y - 196
    small_caps(c, "Read with care", 42, lim_y, BLUE)
    limitations = [
        "Most Phase 1 routes ran once; only Phase 2 T10 was repeated.",
        "Synthetic tasks show observed behavior, not universal rank.",
        "OpenRouter balance did not reconcile to saved Pi cost telemetry.",
        "The trade-capture workspace is a synthetic mock, not production financial software.",
    ]
    for i, item in enumerate(limitations):
        yy = lim_y - 25 - i * 27
        c.setFillColor(LIME)
        c.circle(47, yy + 3, 3.5, fill=1, stroke=0)
        draw_text(c, item, 58, yy + 6, W - 100, "Helvetica", 8, 10.2, INK)

def make_evidence_index(c: canvas.Canvas) -> None:
    page_frame(c, 10, "Evidence index")
    y = section_title(
        c,
        "08 / EVIDENCE INDEX",
        "The claims are inspectable.",
        "The website and this paper summarize repository evidence. These primary artifacts preserve the detailed narrative, run blocks, validation rules, and reproducibility record.",
    )
    artifacts = [
        (
            "Phase 1 comprehensive report",
            "benchmark/reports/phase-1/PHASE-1-COMPREHENSIVE.md",
            "Assistant differentiation, benchmark tasks, distributed workflow, trade-capture artifact, and limitations.",
        ),
        (
            "Phase 2 comprehensive report",
            "benchmark/reports/phase-2/PHASE-2-COMPREHENSIVE.md",
            "Neutral Pi comparison, task-level outcomes, role recommendations, cost caveat, and audit findings.",
        ),
        (
            "Phase 2 result block",
            "benchmark/blocks/phase-2-pi-model-comparison-2026-08-23.results.json",
            "Structured scores, acceptance counts, elapsed time, telemetry labels, and status fields.",
        ),
        (
            "Neutral protocol",
            "benchmark/phase-2/PROTOCOL.md",
            "Fixed control surface, early-edit rule, timeouts, zero intervention, private checks, and saved-patch policy.",
        ),
        (
            "Final study report",
            "benchmark/reports/final-study-report.md",
            "Cross-phase conclusions, recommended operating model, and decision guidance.",
        ),
        (
            "Browser QA report",
            "benchmark/reports/results-site-browser-qa.md",
            "Visible validation record for the results interface and user-facing research experience.",
        ),
    ]
    row_h = 79
    for i, (title, path, note) in enumerate(artifacts):
        yy = y - (i + 1) * row_h + 8
        rounded(c, 42, yy, W - 84, row_h - 12, WHITE, LINE)
        c.setFillColor(LIME if i % 2 == 0 else PALE_BLUE)
        c.circle(61, yy + 34, 11, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("Courier-Bold", 6.5)
        c.drawCentredString(61, yy + 32, f"{i + 1:02d}")
        c.setFont("Helvetica-Bold", 10)
        c.drawString(84, yy + 47, title)
        c.setFont("Courier", 6.3)
        c.setFillColor(BLUE)
        c.drawString(84, yy + 30, path)
        draw_text(c, note, 84, yy + 14, W - 145, "Helvetica", 7.4, 9.2, MUTED)

    rounded(c, 42, 74, W - 84, 56, INK)
    small_caps(c, "Scope note", 58, 108, LIME)
    draw_text(c, "The study records observed behavior on named synthetic tasks. It is a decision aid, not a universal model ranking or production-finance certification.", 58, 90, W - 116, "Helvetica", 8, 10.5, WHITE)


def build() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle("How Coding Assistants Actually Differ")
    c.setAuthor("Coding Intelligence Field Study")
    c.setSubject("Coding assistant, model, harness, and orchestration comparison")

    pages = [
        make_cover,
        make_abstract,
        make_design,
        make_assistants,
        make_phase1,
        make_phase2_method,
        make_phase2_results,
        make_orchestration,
        make_tools_conclusion,
        make_evidence_index,
    ]
    for i, page in enumerate(pages):
        page(c)
        if i < len(pages) - 1:
            c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
