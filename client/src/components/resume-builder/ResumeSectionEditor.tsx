import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import type { ResumeData } from "../../types/resumeBuilder";

interface Props {
  resume: ResumeData;
  onChange: (resume: ResumeData) => void;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "url";
  placeholder?: string;
  maxLength?: number;
}

interface AreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
}

interface CommaListFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxItems: number;
}

const MAX_EXPERIENCE = 10;
const MAX_EDUCATION = 6;
const MAX_PROJECTS = 10;
const MAX_BULLETS = 12;
const MAX_SKILLS = 40;
const MAX_TECHNOLOGIES = 20;
const MAX_CERTIFICATIONS = 15;

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

const createId = () => crypto.randomUUID();

const splitCommaSeparated = (value: string, maxItems: number): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength = 200,
}: FieldProps) => {
  const id = useId();

  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputClass}
      />
    </div>
  );
};

const Area = ({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  maxLength,
}: AreaProps) => {
  const id = useId();

  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${inputClass} resize-y`}
      />
    </div>
  );
};

const CommaListField = ({
  label,
  values,
  onChange,
  placeholder,
  maxItems,
}: CommaListFieldProps) => {
  const [draft, setDraft] = useState(values.join(", "));
  const id = useId();

  useEffect(() => {
    setDraft(values.join(", "));
  }, [values]);

  const commit = () => {
    onChange(splitCommaSeparated(draft, maxItems));
  };

  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        placeholder={placeholder}
        className={inputClass}
      />
      <p className="mt-1 text-xs text-slate-500">
        Separate items with commas. Maximum {maxItems} items.
      </p>
    </div>
  );
};

const Section = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const addButtonClass =
  "shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40";

const removeButtonClass =
  "rounded-md px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50";

const entryCardClass =
  "space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5";

const updateListItem = <T extends { id: string }>(
  items: T[],
  id: string,
  changes: Partial<T>,
): T[] =>
  items.map((item) => (item.id === id ? { ...item, ...changes } : item));

const ResumeSectionEditor = ({ resume, onChange }: Props) => {
  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    onChange({ ...resume, [key]: value });
  };

  const updatePersonal = (
    key: keyof ResumeData["personalDetails"],
    value: string,
  ) => {
    onChange({
      ...resume,
      personalDetails: {
        ...resume.personalDetails,
        [key]: value,
      },
    });
  };

  const addExperience = () => {
    if (resume.experience.length >= MAX_EXPERIENCE) return;

    update("experience", [
      ...resume.experience,
      {
        id: createId(),
        jobTitle: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        bullets: [],
      },
    ]);
  };

  const addEducation = () => {
    if (resume.education.length >= MAX_EDUCATION) return;

    update("education", [
      ...resume.education,
      {
        id: createId(),
        degree: "",
        institution: "",
        location: "",
        startDate: "",
        endDate: "",
        grade: "",
      },
    ]);
  };

  const addProject = () => {
    if (resume.projects.length >= MAX_PROJECTS) return;

    update("projects", [
      ...resume.projects,
      {
        id: createId(),
        name: "",
        technologies: [],
        description: "",
        link: "",
      },
    ]);
  };

  return (
    <div className="space-y-9">
      <Section title="Personal Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full Name"
            value={resume.personalDetails.fullName}
            onChange={(value) => updatePersonal("fullName", value)}
            placeholder="Your full name"
          />
          <Field
            label="Email"
            type="email"
            value={resume.personalDetails.email}
            onChange={(value) => updatePersonal("email", value)}
            placeholder="you@example.com"
          />
          <Field
            label="Phone"
            type="tel"
            value={resume.personalDetails.phone}
            onChange={(value) => updatePersonal("phone", value)}
            placeholder="+91 98765 43210"
          />
          <Field
            label="Location"
            value={resume.personalDetails.location}
            onChange={(value) => updatePersonal("location", value)}
            placeholder="City, Country"
          />
          <Field
            label="LinkedIn URL"
            type="url"
            value={resume.personalDetails.linkedin}
            onChange={(value) => updatePersonal("linkedin", value)}
            placeholder="https://linkedin.com/in/..."
            maxLength={300}
          />
          <Field
            label="Portfolio URL"
            type="url"
            value={resume.personalDetails.portfolio}
            onChange={(value) => updatePersonal("portfolio", value)}
            placeholder="https://yourportfolio.com"
            maxLength={300}
          />
        </div>
      </Section>

      <Section title="Professional Summary">
        <Area
          label="Summary"
          value={resume.professionalSummary}
          onChange={(value) => update("professionalSummary", value)}
          rows={5}
          maxLength={2000}
          placeholder="Write a short professional introduction highlighting your experience, strengths and career goals."
        />
      </Section>

      <Section
        title="Experience"
        action={
          <button
            type="button"
            onClick={addExperience}
            disabled={resume.experience.length >= MAX_EXPERIENCE}
            className={addButtonClass}
          >
            + Add Experience
          </button>
        }
      >
        {resume.experience.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No experience added yet. Add your work experience or internship.
          </p>
        )}

        {resume.experience.map((item, index) => (
          <div key={item.id} className={entryCardClass}>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-800">
                Experience {index + 1}
              </h4>
              <button
                type="button"
                onClick={() =>
                  update(
                    "experience",
                    resume.experience.filter((entry) => entry.id !== item.id),
                  )
                }
                className={removeButtonClass}
                aria-label={`Remove experience ${index + 1}`}
              >
                Remove
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Job Title"
                value={item.jobTitle}
                onChange={(value) =>
                  update(
                    "experience",
                    updateListItem(resume.experience, item.id, {
                      jobTitle: value,
                    }),
                  )
                }
                placeholder="Software Engineer"
              />
              <Field
                label="Company"
                value={item.company}
                onChange={(value) =>
                  update(
                    "experience",
                    updateListItem(resume.experience, item.id, {
                      company: value,
                    }),
                  )
                }
                placeholder="Company name"
              />
              <Field
                label="Location"
                value={item.location}
                onChange={(value) =>
                  update(
                    "experience",
                    updateListItem(resume.experience, item.id, {
                      location: value,
                    }),
                  )
                }
                placeholder="City, Country"
              />
              <Field
                label="Start Date"
                value={item.startDate}
                onChange={(value) =>
                  update(
                    "experience",
                    updateListItem(resume.experience, item.id, {
                      startDate: value,
                    }),
                  )
                }
                placeholder="Jan 2024"
              />
              <Field
                label="End Date"
                value={item.endDate}
                onChange={(value) =>
                  update(
                    "experience",
                    updateListItem(resume.experience, item.id, {
                      endDate: value,
                    }),
                  )
                }
                placeholder="Present"
              />
            </div>

            <Area
              label="Achievements (one per line)"
              value={item.bullets.join("\n")}
              onChange={(value) =>
                update(
                  "experience",
                  updateListItem(resume.experience, item.id, {
                    bullets: value.split("\n").slice(0, MAX_BULLETS),
                  }),
                )
              }
              rows={4}
              maxLength={MAX_BULLETS * 501}
              placeholder="Describe your responsibilities and achievements, one per line."
            />
            <p className="text-xs text-slate-500">
              Maximum {MAX_BULLETS} achievements, up to 500 characters each.
            </p>
          </div>
        ))}
        {resume.experience.length >= MAX_EXPERIENCE && (
          <p className="text-xs text-slate-500">
            Maximum {MAX_EXPERIENCE} experience entries reached.
          </p>
        )}
      </Section>

      <Section
        title="Education"
        action={
          <button
            type="button"
            onClick={addEducation}
            disabled={resume.education.length >= MAX_EDUCATION}
            className={addButtonClass}
          >
            + Add Education
          </button>
        }
      >
        {resume.education.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No education added yet. Add your degree, college or other
            qualifications.
          </p>
        )}

        {resume.education.map((item, index) => (
          <div key={item.id} className={entryCardClass}>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-800">
                Education {index + 1}
              </h4>
              <button
                type="button"
                onClick={() =>
                  update(
                    "education",
                    resume.education.filter((entry) => entry.id !== item.id),
                  )
                }
                className={removeButtonClass}
                aria-label={`Remove education ${index + 1}`}
              >
                Remove
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Degree"
                value={item.degree}
                onChange={(value) =>
                  update(
                    "education",
                    updateListItem(resume.education, item.id, {
                      degree: value,
                    }),
                  )
                }
                placeholder="B.E. in Information Technology"
              />
              <Field
                label="Institution"
                value={item.institution}
                onChange={(value) =>
                  update(
                    "education",
                    updateListItem(resume.education, item.id, {
                      institution: value,
                    }),
                  )
                }
                placeholder="College or university"
              />
              <Field
                label="Location"
                value={item.location}
                onChange={(value) =>
                  update(
                    "education",
                    updateListItem(resume.education, item.id, {
                      location: value,
                    }),
                  )
                }
                placeholder="City, Country"
              />
              <Field
                label="Start Date"
                value={item.startDate}
                onChange={(value) =>
                  update(
                    "education",
                    updateListItem(resume.education, item.id, {
                      startDate: value,
                    }),
                  )
                }
                placeholder="2022"
              />
              <Field
                label="End Date"
                value={item.endDate}
                onChange={(value) =>
                  update(
                    "education",
                    updateListItem(resume.education, item.id, {
                      endDate: value,
                    }),
                  )
                }
                placeholder="2026"
              />
              <Field
                label="Grade"
                value={item.grade}
                onChange={(value) =>
                  update(
                    "education",
                    updateListItem(resume.education, item.id, {
                      grade: value,
                    }),
                  )
                }
                placeholder="CGPA or percentage (optional)"
              />
            </div>
          </div>
        ))}
        {resume.education.length >= MAX_EDUCATION && (
          <p className="text-xs text-slate-500">
            Maximum {MAX_EDUCATION} education entries reached.
          </p>
        )}
      </Section>

      <Section title="Skills">
        <div className="grid gap-4">
          <CommaListField
            label="Technical Skills"
            values={resume.technicalSkills}
            onChange={(values) => update("technicalSkills", values)}
            maxItems={MAX_SKILLS}
            placeholder="Java, React, TypeScript, Node.js, PostgreSQL"
          />
          <CommaListField
            label="Soft Skills"
            values={resume.softSkills}
            onChange={(values) => update("softSkills", values)}
            maxItems={MAX_SKILLS}
            placeholder="Communication, Teamwork, Problem Solving"
          />
        </div>
      </Section>

      <Section
        title="Projects"
        action={
          <button
            type="button"
            onClick={addProject}
            disabled={resume.projects.length >= MAX_PROJECTS}
            className={addButtonClass}
          >
            + Add Project
          </button>
        }
      >
        {resume.projects.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No projects added yet. Add relevant academic, personal or
            professional projects.
          </p>
        )}

        {resume.projects.map((item, index) => (
          <div key={item.id} className={entryCardClass}>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-800">
                Project {index + 1}
              </h4>
              <button
                type="button"
                onClick={() =>
                  update(
                    "projects",
                    resume.projects.filter((project) => project.id !== item.id),
                  )
                }
                className={removeButtonClass}
                aria-label={`Remove project ${index + 1}`}
              >
                Remove
              </button>
            </div>

            <Field
              label="Project Name"
              value={item.name}
              onChange={(value) =>
                update(
                  "projects",
                  updateListItem(resume.projects, item.id, { name: value }),
                )
              }
              placeholder="CareerCraft AI"
            />

            <Area
              label="Description"
              value={item.description}
              onChange={(value) =>
                update(
                  "projects",
                  updateListItem(resume.projects, item.id, {
                    description: value,
                  }),
                )
              }
              rows={4}
              maxLength={1500}
              placeholder="Describe the project's purpose, key features and your contribution."
            />

            <CommaListField
              label="Technologies"
              values={item.technologies}
              onChange={(values) =>
                update(
                  "projects",
                  updateListItem(resume.projects, item.id, {
                    technologies: values,
                  }),
                )
              }
              maxItems={MAX_TECHNOLOGIES}
              placeholder="React, Node.js, PostgreSQL"
            />

            <Field
              label="Project Link"
              type="url"
              value={item.link}
              onChange={(value) =>
                update(
                  "projects",
                  updateListItem(resume.projects, item.id, { link: value }),
                )
              }
              placeholder="https://github.com/username/project"
              maxLength={300}
            />
          </div>
        ))}
        {resume.projects.length >= MAX_PROJECTS && (
          <p className="text-xs text-slate-500">
            Maximum {MAX_PROJECTS} projects reached.
          </p>
        )}
      </Section>

      <Section title="Certifications">
        <Area
          label="Certification names (one per line)"
          value={resume.certifications.join("\n")}
          onChange={(value) =>
            update(
              "certifications",
              value.split("\n").slice(0, MAX_CERTIFICATIONS),
            )
          }
          rows={4}
          maxLength={MAX_CERTIFICATIONS * 101}
          placeholder="Certification name - Issuing organization"
        />
        <p className="text-xs text-slate-500">
          Maximum {MAX_CERTIFICATIONS} certifications, up to 100 characters
          each.
        </p>
      </Section>
    </div>
  );
};

export default ResumeSectionEditor;
