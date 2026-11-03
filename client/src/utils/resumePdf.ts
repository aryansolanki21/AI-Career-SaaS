import jsPDF from "jspdf";
import type { ResumeData } from "../types/resumeBuilder";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const LEFT = 20;
const RIGHT = 190;
const CONTENT_WIDTH = RIGHT - LEFT;
const TOP_MARGIN = 20;
const BOTTOM_MARGIN = 18;
const BOTTOM_LIMIT = PAGE_HEIGHT - BOTTOM_MARGIN;

const COLORS = {
  heading: [25, 45, 75] as [number, number, number],
  text: [40, 40, 40] as [number, number, number],
  muted: [90, 90, 90] as [number, number, number],
  line: [190, 200, 210] as [number, number, number],
  link: [40, 80, 150] as [number, number, number],
};

const safeHref = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed) return "";

  try {
    const normalized = /^[a-z][a-z\d+.-]*:/i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    const url = new URL(normalized);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
};

const cleanValues = (values: string[]): string[] =>
  values.map((value) => value.trim()).filter(Boolean);

const getSafeFilename = (name: string): string => {
  const safeName = name
    .trim()
    .replace(/[^a-z0-9-_]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return safeName || "resume";
};

export const downloadResumePDF = (resume: ResumeData): void => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = TOP_MARGIN;

  const lineHeight = (fontSize: number) => fontSize * 0.48;

  const addPage = () => {
    pdf.addPage();
    y = TOP_MARGIN;
  };

  const ensureSpace = (height: number) => {
    if (y + height > BOTTOM_LIMIT) {
      addPage();
    }
  };

  const drawText = (
    text: string,
    options?: {
      size?: number;
      bold?: boolean;
      color?: [number, number, number];
      indent?: number;
      url?: string;
      align?: "left" | "center" | "right";
    },
  ) => {
    const value = text.trim();

    if (!value) return;

    const size = options?.size ?? 9;
    const indent = options?.indent ?? 0;
    const align = options?.align ?? "left";
    const fontStyle = options?.bold ? "bold" : "normal";
    const availableWidth = CONTENT_WIDTH - indent;

    pdf.setFont("helvetica", fontStyle);
    pdf.setFontSize(size);
    pdf.setTextColor(...(options?.color ?? COLORS.text));

    const lines = pdf.splitTextToSize(value, availableWidth) as string[];
    const heightPerLine = lineHeight(size);

    for (const line of lines) {
      ensureSpace(heightPerLine + 1);

      const textWidth = pdf.getTextWidth(line);

      const x =
        align === "center"
          ? PAGE_WIDTH / 2
          : align === "right"
            ? RIGHT
            : LEFT + indent;

      pdf.text(line, x, y, { align });

      if (options?.url) {
        const linkX =
          align === "center"
            ? x - textWidth / 2
            : align === "right"
              ? x - textWidth
              : x;

        pdf.link(
          linkX,
          y - heightPerLine * 0.8,
          textWidth,
          heightPerLine * 1.2,
          { url: options.url },
        );
      }

      y += heightPerLine;
    }

    y += 1;
  };

  const addSection = (title: string) => {
    ensureSpace(17);

    y += 4;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...COLORS.heading);
    pdf.text(title.toUpperCase(), LEFT, y);

    y += 2;

    pdf.setDrawColor(...COLORS.line);
    pdf.line(LEFT, y, RIGHT, y);

    y += 5;
  };

  const addBullet = (text: string) => {
    const value = text.trim();

    if (!value) return;

    const size = 9;
    const heightPerLine = lineHeight(size);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(...COLORS.text);

    const lines = pdf.splitTextToSize(value, CONTENT_WIDTH - 8) as string[];

    for (let index = 0; index < lines.length; index++) {
      ensureSpace(heightPerLine + 1);

      pdf.text(index === 0 ? "-" : "", LEFT + 1, y);
      pdf.text(lines[index], LEFT + 6, y);

      y += heightPerLine;
    }

    y += 1;
  };

  const addEntryHeading = (title: string, date: string) => {
    const cleanTitle = title.trim();
    const cleanDate = date.trim();

    if (!cleanTitle && !cleanDate) return;

    const titleWidth = cleanDate ? 125 : CONTENT_WIDTH;
    const dateWidth = 45;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);

    const titleLines = cleanTitle
      ? (pdf.splitTextToSize(cleanTitle, titleWidth) as string[])
      : [];

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    const dateLines = cleanDate
      ? (pdf.splitTextToSize(cleanDate, dateWidth) as string[])
      : [];

    const totalLines = Math.max(titleLines.length, dateLines.length);
    const heightPerLine = 4.5;

    ensureSpace(totalLines * heightPerLine + 2);

    if (titleLines.length) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.text);
      pdf.text(titleLines, LEFT, y);
    }

    if (dateLines.length) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...COLORS.muted);
      pdf.text(dateLines, RIGHT, y, { align: "right" });
    }

    y += totalLines * heightPerLine + 1;
  };

  const addContactLink = (label: string, value: string, url?: string) => {
    const cleanValue = value.trim();

    if (!cleanValue) return;

    drawText(`${label}: ${cleanValue}`, {
      size: 8,
      color: url ? COLORS.link : COLORS.muted,
      align: "center",
      url,
    });
  };

  const { personalDetails } = resume;

  // Header
  const name = personalDetails.fullName.trim() || "Resume";

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...COLORS.heading);

  const nameLines = pdf.splitTextToSize(name, CONTENT_WIDTH) as string[];
  const nameHeight = nameLines.length * 9;

  ensureSpace(nameHeight + 10);

  pdf.text(nameLines, PAGE_WIDTH / 2, y, { align: "center" });
  y += nameHeight + 2;

  const email = personalDetails.email.trim();
  const phone = personalDetails.phone.trim();
  const location = personalDetails.location.trim();
  const linkedin = personalDetails.linkedin.trim();
  const portfolio = personalDetails.portfolio.trim();

  if (email) {
    addContactLink("Email", email, `mailto:${email}`);
  }

  if (phone) {
    addContactLink("Phone", phone, `tel:${phone.replace(/[^\d+]/g, "")}`);
  }

  if (location) {
    addContactLink("Location", location);
  }

  if (linkedin) {
    addContactLink("LinkedIn", linkedin, safeHref(linkedin) || undefined);
  }

  if (portfolio) {
    addContactLink("Portfolio", portfolio, safeHref(portfolio) || undefined);
  }

  y += 2;

  ensureSpace(5);
  pdf.setDrawColor(100, 120, 145);
  pdf.line(LEFT, y, RIGHT, y);
  y += 5;

  // Professional Summary
  const summary = resume.professionalSummary.trim();

  if (summary) {
    addSection("Professional Summary");
    drawText(summary);
  }

  // Experience
  const experience = resume.experience.filter(
    (item) =>
      item.jobTitle.trim() ||
      item.company.trim() ||
      item.location.trim() ||
      item.startDate.trim() ||
      item.endDate.trim() ||
      item.bullets.some((bullet) => bullet.trim()),
  );

  if (experience.length > 0) {
    addSection("Experience");

    for (const item of experience) {
      const title = [item.jobTitle, item.company]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" - ");

      const date = [item.startDate, item.endDate]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" - ");

      addEntryHeading(title, date);

      if (item.location.trim()) {
        drawText(item.location, {
          size: 8,
          color: COLORS.muted,
        });
      }

      cleanValues(item.bullets).forEach(addBullet);

      y += 2;
    }
  }

  // Education
  const education = resume.education.filter(
    (item) =>
      item.degree.trim() ||
      item.institution.trim() ||
      item.location.trim() ||
      item.grade.trim() ||
      item.startDate.trim() ||
      item.endDate.trim(),
  );

  if (education.length > 0) {
    addSection("Education");

    for (const item of education) {
      const title = [item.degree, item.institution]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" - ");

      const date = [item.startDate, item.endDate]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" - ");

      addEntryHeading(title, date);

      const details = [item.location, item.grade]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" | ");

      if (details) {
        drawText(details, {
          size: 8,
          color: COLORS.muted,
        });
      }
    }
  }

  // Technical Skills
  const technicalSkills = cleanValues(resume.technicalSkills);

  if (technicalSkills.length > 0) {
    addSection("Technical Skills");
    drawText(technicalSkills.join(", "));
  }

  // Soft Skills
  const softSkills = cleanValues(resume.softSkills);

  if (softSkills.length > 0) {
    addSection("Soft Skills");
    drawText(softSkills.join(", "));
  }

  // Projects
  const projects = resume.projects.filter(
    (item) =>
      item.name.trim() ||
      item.description.trim() ||
      item.technologies.some((technology) => technology.trim()) ||
      item.link.trim(),
  );

  if (projects.length > 0) {
    addSection("Projects");

    for (const item of projects) {
      if (item.name.trim()) {
        drawText(item.name, { bold: true });
      }

      const technologies = cleanValues(item.technologies);

      if (technologies.length > 0) {
        drawText(`Technologies: ${technologies.join(", ")}`, {
          size: 8,
          color: COLORS.muted,
        });
      }

      if (item.description.trim()) {
        drawText(item.description);
      }

      if (item.link.trim()) {
        const projectUrl = safeHref(item.link);

        drawText(item.link, {
          size: 8,
          color: projectUrl ? COLORS.link : COLORS.muted,
          url: projectUrl || undefined,
        });
      }

      y += 2;
    }
  }

  // Certifications
  const certifications = cleanValues(resume.certifications);

  if (certifications.length > 0) {
    addSection("Certifications");
    certifications.forEach(addBullet);
  }

  pdf.save(`${getSafeFilename(personalDetails.fullName)}_Resume.pdf`);
};
