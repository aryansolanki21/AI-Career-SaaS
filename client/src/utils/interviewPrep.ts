import type {
  InterviewPrepResult,
  InterviewType,
} from "../types/interviewPrep";
import { toPdfSafeText } from "./pdfText";

type Rgb = [number, number, number];
type FontStyle = "normal" | "bold" | "italic";

const BLUE: Rgb = [29, 78, 216];
const INK: Rgb = [15, 23, 42];
const MUTED: Rgb = [100, 116, 139];
const RULE: Rgb = [226, 232, 240];

const MARGIN = 18;
// Space kept free so a question title never sits alone at the bottom of a page.
const MIN_QUESTION_HEIGHT = 45;

const INTERVIEW_LABEL: Record<InterviewType, string> = {
  technical: "Technical",
  hr: "HR & Behavioural",
};

const toFileName = (jobRole: string): string => {
  const slug = jobRole
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `interview-prep-${slug || "questions"}.pdf`;
};

export const downloadInterviewQuestions = async (
  result: InterviewPrepResult,
): Promise<void> => {
  // Loaded on demand so jsPDF is not part of the main bundle.
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  let y = MARGIN + 2;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - MARGIN) {
      pdf.addPage();
      y = MARGIN + 2;
    }
  };

  // The font is set before wrapping because jsPDF measures with the current font.
  const writeBlock = (
    text: string,
    size: number,
    style: FontStyle,
    color: Rgb,
    indent = 0,
  ) => {
    pdf
      .setFont("helvetica", style)
      .setFontSize(size)
      .setTextColor(...color);

    const lineHeight = size * 0.5;
    const lines = pdf.splitTextToSize(
      toPdfSafeText(text),
      contentWidth - indent,
    ) as string[];

    for (const line of lines) {
      ensureSpace(lineHeight);
      pdf.text(line, MARGIN + indent, y);
      y += lineHeight;
    }
  };

  const total = result.questions.length;

  writeBlock("Interview preparation", 19, "bold", INK);
  y += 2;
  writeBlock(`Role: ${result.jobRole}`, 10, "normal", MUTED);
  writeBlock(
    `Interview: ${INTERVIEW_LABEL[result.interviewType]}`,
    10,
    "normal",
    MUTED,
  );
  writeBlock(`Questions: ${total}`, 10, "normal", MUTED);
  y += 4;

  pdf
    .setDrawColor(...RULE)
    .setLineWidth(0.3)
    .line(MARGIN, y, pageWidth - MARGIN, y);
  y += 8;

  result.questions.forEach((item, index) => {
    ensureSpace(MIN_QUESTION_HEIGHT);

    writeBlock(`Question ${index + 1}  |  ${item.category}`, 10, "bold", BLUE);
    y += 1.5;
    writeBlock(item.question, 10.5, "normal", INK);
    y += 2;
    writeBlock(`Hint: ${item.hint}`, 9, "italic", MUTED, 3);
    y += 7;
  });

  const pageCount = pdf.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    const label = `Page ${page} of ${pageCount}`;

    pdf.setPage(page);
    pdf
      .setFont("helvetica", "normal")
      .setFontSize(8)
      .setTextColor(...MUTED);
    pdf.text(
      label,
      pageWidth - MARGIN - pdf.getTextWidth(label),
      pageHeight - 10,
    );
  }

  pdf.save(toFileName(result.jobRole));
};
