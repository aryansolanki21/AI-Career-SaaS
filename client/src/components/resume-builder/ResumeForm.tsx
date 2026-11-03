import { useState } from "react";
import type { FormEvent, InputHTMLAttributes } from "react";
import type {
  ResumeData,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
} from "../../types/resumeBuilder";

interface Props {
  onGenerate: (data: ResumeData) => void;
  loading: boolean;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  required?: boolean;
  maxLength?: number;
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  maxLength?: number;
}

const MAX_EXPERIENCE = 10;
const MAX_EDUCATION = 6;
const MAX_PROJECTS = 10;
const MAX_BULLETS = 12;
const MAX_SKILLS = 40;
const MAX_TECHNOLOGIES = 20;
const MAX_CERTIFICATIONS = 15;

const emptyResume: ResumeData = {
  personalDetails: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
  },
  professionalSummary: "",
  experience: [],
  education: [],
  technicalSkills: [],
  softSkills: [],
  projects: [],
  certifications: [],
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

const sectionTitleClass = "text-lg font-semibold text-slate-900";

const secondaryButtonClass =
  "text-sm font-medium text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const removeButtonClass =
  "text-sm font-medium text-red-600 transition hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

const createId = (): string => crypto.randomUUID();

const parseCommaSeparated = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseLines = (value: string): string[] =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const validateList = (
  items: string[],
  label: string,
  maxItems: number,
  maxLength: number,
): string | null => {
  if (items.length > maxItems) {
    return `${label} cannot contain more than ${maxItems} items.`;
  }

  if (items.some((item) => item.length > maxLength)) {
    return `Each ${label.toLowerCase()} item must not exceed ${maxLength} characters.`;
  }

  return null;
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  maxLength = 200,
}: FieldProps) => {
  const id = `resume-field-${crypto.randomUUID()}`;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={inputClass}
      />
    </div>
  );
};

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  maxLength,
}: TextAreaProps) => {
  const id = `resume-textarea-${crypto.randomUUID()}`;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        maxLength={maxLength}
        className={`${inputClass} resize-y`}
      />
    </div>
  );
};

const ResumeForm = ({ onGenerate, loading }: Props) => {
  const [form, setForm] = useState<ResumeData>(() => ({
    ...emptyResume,
    personalDetails: { ...emptyResume.personalDetails },
  }));

  // Keep comma-separated inputs as text while the user is editing.
  const [technicalSkillsText, setTechnicalSkillsText] = useState("");
  const [softSkillsText, setSoftSkillsText] = useState("");
  const [certificationsText, setCertificationsText] = useState("");
  const [projectTechnologyDrafts, setProjectTechnologyDrafts] = useState<
    Record<string, string>
  >({});

  const [validationError, setValidationError] = useState("");

  const updatePersonal = (
    field: keyof ResumeData["personalDetails"],
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        [field]: value,
      },
    }));
  };

  const updateField = <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addExperience = () => {
    if (form.experience.length >= MAX_EXPERIENCE) return;

    const entry: ResumeExperience = {
      id: createId(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    };

    setForm((prev) => ({
      ...prev,
      experience: [...prev.experience, entry],
    }));
  };

  const updateExperience = <K extends keyof ResumeExperience>(
    id: string,
    field: K,
    value: ResumeExperience[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  const addEducation = () => {
    if (form.education.length >= MAX_EDUCATION) return;

    const entry: ResumeEducation = {
      id: createId(),
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      grade: "",
    };

    setForm((prev) => ({
      ...prev,
      education: [...prev.education, entry],
    }));
  };

  const updateEducation = <K extends keyof ResumeEducation>(
    id: string,
    field: K,
    value: ResumeEducation[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  const addProject = () => {
    if (form.projects.length >= MAX_PROJECTS) return;

    const entry: ResumeProject = {
      id: createId(),
      name: "",
      technologies: [],
      description: "",
      link: "",
    };

    setForm((prev) => ({
      ...prev,
      projects: [...prev.projects, entry],
    }));

    setProjectTechnologyDrafts((prev) => ({
      ...prev,
      [entry.id]: "",
    }));
  };

  const updateProject = <K extends keyof ResumeProject>(
    id: string,
    field: K,
    value: ResumeProject[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeProject = (id: string) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));

    setProjectTechnologyDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    if (!form.personalDetails.fullName.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }

    const technicalSkills = parseCommaSeparated(technicalSkillsText);
    const softSkills = parseCommaSeparated(softSkillsText);
    const certifications = parseLines(certificationsText);

    const technicalSkillsError = validateList(
      technicalSkills,
      "Technical skills",
      MAX_SKILLS,
      100,
    );

    const softSkillsError = validateList(
      softSkills,
      "Soft skills",
      MAX_SKILLS,
      100,
    );

    const certificationsError = validateList(
      certifications,
      "Certifications",
      MAX_CERTIFICATIONS,
      100,
    );

    if (technicalSkillsError || softSkillsError || certificationsError) {
      setValidationError(
        technicalSkillsError ||
          softSkillsError ||
          certificationsError ||
          "Please check your list entries.",
      );
      return;
    }

    for (const item of form.experience) {
      const bullets = item.bullets
        .map((bullet) => bullet.trim())
        .filter(Boolean);
      const bulletError = validateList(
        bullets,
        "Experience bullets",
        MAX_BULLETS,
        500,
      );

      if (bulletError) {
        setValidationError(bulletError);
        return;
      }
    }

    const projects = form.projects.map((project) => ({
      ...project,
      technologies: parseCommaSeparated(
        projectTechnologyDrafts[project.id] ?? "",
      ),
    }));

    for (const project of projects) {
      const technologyError = validateList(
        project.technologies,
        "Project technologies",
        MAX_TECHNOLOGIES,
        100,
      );

      if (technologyError) {
        setValidationError(technologyError);
        return;
      }
    }

    setValidationError("");

    const resumeData: ResumeData = {
      ...form,
      personalDetails: {
        ...form.personalDetails,
        fullName: form.personalDetails.fullName.trim(),
      },
      experience: form.experience.map((item) => ({
        ...item,
        bullets: item.bullets.map((bullet) => bullet.trim()).filter(Boolean),
      })),
      technicalSkills,
      softSkills,
      projects,
      certifications,
    };

    onGenerate(resumeData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className={sectionTitleClass}>Personal Details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full Name"
            value={form.personalDetails.fullName}
            onChange={(value) => updatePersonal("fullName", value)}
            placeholder="Your full name"
            required
          />

          <Field
            label="Email"
            type="email"
            value={form.personalDetails.email}
            onChange={(value) => updatePersonal("email", value)}
            placeholder="you@example.com"
          />

          <Field
            label="Phone"
            value={form.personalDetails.phone}
            onChange={(value) => updatePersonal("phone", value)}
            placeholder="+91 98765 43210"
          />

          <Field
            label="Location"
            value={form.personalDetails.location}
            onChange={(value) => updatePersonal("location", value)}
            placeholder="Ahmedabad, India"
          />

          <Field
            label="LinkedIn URL"
            value={form.personalDetails.linkedin}
            onChange={(value) => updatePersonal("linkedin", value)}
            placeholder="https://linkedin.com/in/..."
            maxLength={300}
          />

          <Field
            label="Portfolio / GitHub URL"
            value={form.personalDetails.portfolio}
            onChange={(value) => updatePersonal("portfolio", value)}
            placeholder="https://github.com/..."
            maxLength={300}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={sectionTitleClass}>Professional Summary</h2>

        <TextArea
          label="Summary"
          value={form.professionalSummary}
          onChange={(value) => updateField("professionalSummary", value)}
          placeholder="Describe your professional background, strengths and career goals..."
          maxLength={2000}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className={sectionTitleClass}>Experience</h2>

          <button
            type="button"
            onClick={addExperience}
            disabled={form.experience.length >= MAX_EXPERIENCE}
            className={secondaryButtonClass}
          >
            + Add Experience
          </button>
        </div>

        {form.experience.map((item) => (
          <div
            key={item.id}
            className="space-y-3 rounded-xl border border-slate-200 p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Job Title"
                value={item.jobTitle}
                onChange={(value) =>
                  updateExperience(item.id, "jobTitle", value)
                }
              />

              <Field
                label="Company"
                value={item.company}
                onChange={(value) =>
                  updateExperience(item.id, "company", value)
                }
              />

              <Field
                label="Location"
                value={item.location}
                onChange={(value) =>
                  updateExperience(item.id, "location", value)
                }
              />

              <Field
                label="Start Date"
                value={item.startDate}
                onChange={(value) =>
                  updateExperience(item.id, "startDate", value)
                }
                placeholder="Jan 2024"
              />

              <Field
                label="End Date"
                value={item.endDate}
                onChange={(value) =>
                  updateExperience(item.id, "endDate", value)
                }
                placeholder="Present"
              />
            </div>

            <TextArea
              label="Responsibilities / Achievements (one per line)"
              value={item.bullets.join("\n")}
              onChange={(value) =>
                updateExperience(item.id, "bullets", value.split("\n"))
              }
              placeholder={
                "Developed REST APIs...\nImproved application performance..."
              }
              maxLength={MAX_BULLETS * 501}
            />

            <button
              type="button"
              onClick={() => removeExperience(item.id)}
              className={removeButtonClass}
              aria-label={`Remove experience ${item.jobTitle || "entry"}`}
            >
              Remove Experience
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className={sectionTitleClass}>Education</h2>

          <button
            type="button"
            onClick={addEducation}
            disabled={form.education.length >= MAX_EDUCATION}
            className={secondaryButtonClass}
          >
            + Add Education
          </button>
        </div>

        {form.education.map((item) => (
          <div
            key={item.id}
            className="space-y-3 rounded-xl border border-slate-200 p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Degree"
                value={item.degree}
                onChange={(value) => updateEducation(item.id, "degree", value)}
              />

              <Field
                label="Institution"
                value={item.institution}
                onChange={(value) =>
                  updateEducation(item.id, "institution", value)
                }
              />

              <Field
                label="Location"
                value={item.location}
                onChange={(value) =>
                  updateEducation(item.id, "location", value)
                }
              />

              <Field
                label="Start Date"
                value={item.startDate}
                onChange={(value) =>
                  updateEducation(item.id, "startDate", value)
                }
              />

              <Field
                label="End Date"
                value={item.endDate}
                onChange={(value) => updateEducation(item.id, "endDate", value)}
              />

              <Field
                label="Grade / CGPA"
                value={item.grade}
                onChange={(value) => updateEducation(item.id, "grade", value)}
              />
            </div>

            <button
              type="button"
              onClick={() => removeEducation(item.id)}
              className={removeButtonClass}
              aria-label={`Remove education ${item.degree || "entry"}`}
            >
              Remove Education
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className={sectionTitleClass}>Skills</h2>

        <TextArea
          label="Technical Skills (comma separated)"
          value={technicalSkillsText}
          onChange={setTechnicalSkillsText}
          placeholder="React, TypeScript, Node.js, PostgreSQL"
          maxLength={MAX_SKILLS * 101}
        />

        <TextArea
          label="Soft Skills (comma separated)"
          value={softSkillsText}
          onChange={setSoftSkillsText}
          placeholder="Communication, Teamwork, Problem Solving"
          maxLength={MAX_SKILLS * 101}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className={sectionTitleClass}>Projects</h2>

          <button
            type="button"
            onClick={addProject}
            disabled={form.projects.length >= MAX_PROJECTS}
            className={secondaryButtonClass}
          >
            + Add Project
          </button>
        </div>

        {form.projects.map((item) => (
          <div
            key={item.id}
            className="space-y-3 rounded-xl border border-slate-200 p-4"
          >
            <Field
              label="Project Name"
              value={item.name}
              onChange={(value) => updateProject(item.id, "name", value)}
            />

            <TextArea
              label="Description"
              value={item.description}
              onChange={(value) => updateProject(item.id, "description", value)}
              maxLength={1500}
            />

            <Field
              label="Technologies (comma separated)"
              value={projectTechnologyDrafts[item.id] ?? ""}
              onChange={(value) =>
                setProjectTechnologyDrafts((prev) => ({
                  ...prev,
                  [item.id]: value,
                }))
              }
              placeholder="React, Node.js, PostgreSQL"
              maxLength={MAX_TECHNOLOGIES * 101}
            />

            <Field
              label="Project Link"
              value={item.link}
              onChange={(value) => updateProject(item.id, "link", value)}
              placeholder="https://github.com/..."
              maxLength={300}
            />

            <button
              type="button"
              onClick={() => removeProject(item.id)}
              className={removeButtonClass}
              aria-label={`Remove project ${item.name || "entry"}`}
            >
              Remove Project
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className={sectionTitleClass}>Certifications</h2>

        <TextArea
          label="Certification names (one per line)"
          value={certificationsText}
          onChange={setCertificationsText}
          placeholder={
            "AWS Certified Cloud Practitioner\nGoogle Data Analytics Certificate"
          }
          maxLength={MAX_CERTIFICATIONS * 101}
        />
      </section>

      {validationError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {validationError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !form.personalDetails.fullName.trim()}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Generating Resume..." : "Generate Professional Resume"}
      </button>
    </form>
  );
};

export default ResumeForm;
