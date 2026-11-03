import type { ReactNode } from "react";
import type { ResumeData } from "../../types/resumeBuilder";

interface Props {
  resume: ResumeData;
}

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

const contactLinkClass =
  "break-all text-blue-700 underline decoration-blue-200 underline-offset-2";

const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wider text-slate-900">
    {children}
  </h2>
);

const ResumePreview = ({ resume }: Props) => {
  const { personalDetails } = resume;

  const email = personalDetails.email.trim();
  const phone = personalDetails.phone.trim();
  const location = personalDetails.location.trim();
  const linkedin = personalDetails.linkedin.trim();
  const portfolio = personalDetails.portfolio.trim();

  const hasContact = Boolean(
    email || phone || location || linkedin || portfolio,
  );

  const experience = resume.experience.filter(
    (item) =>
      item.jobTitle.trim() ||
      item.company.trim() ||
      item.location.trim() ||
      item.startDate.trim() ||
      item.endDate.trim() ||
      item.bullets.some((bullet) => bullet.trim()),
  );

  const education = resume.education.filter(
    (item) =>
      item.degree.trim() ||
      item.institution.trim() ||
      item.location.trim() ||
      item.grade.trim() ||
      item.startDate.trim() ||
      item.endDate.trim(),
  );

  const projects = resume.projects.filter(
    (item) =>
      item.name.trim() ||
      item.description.trim() ||
      item.technologies.some((technology) => technology.trim()) ||
      item.link.trim(),
  );

  const technicalSkills = resume.technicalSkills.filter((skill) =>
    skill.trim(),
  );

  const softSkills = resume.softSkills.filter((skill) => skill.trim());

  const certifications = resume.certifications.filter((item) => item.trim());

  return (
    <article
      id="resume-preview"
      className="mx-auto min-h-264 w-full max-w-204 overflow-hidden bg-white px-6 py-10 text-slate-800 shadow-sm sm:px-14 sm:py-12"
    >
      <header className="border-b border-slate-300 pb-5 text-center">
        <h1 className="wrap-break-word text-3xl font-bold tracking-wide text-slate-900">
          {personalDetails.fullName.trim() || "Your Name"}
        </h1>

        {hasContact && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs leading-5 text-slate-600">
            {email && (
              <a href={`mailto:${email}`} className={contactLinkClass}>
                {email}
              </a>
            )}

            {phone && (
              <>
                {email && <span aria-hidden="true">|</span>}
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className={contactLinkClass}
                >
                  {phone}
                </a>
              </>
            )}

            {location && (
              <>
                {(email || phone) && <span aria-hidden="true">|</span>}
                <span className="wrap-break-word">{location}</span>
              </>
            )}

            {linkedin && (
              <>
                {(email || phone || location) && (
                  <span aria-hidden="true">|</span>
                )}
                {safeHref(linkedin) ? (
                  <a
                    href={safeHref(linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={contactLinkClass}
                  >
                    LinkedIn
                  </a>
                ) : (
                  <span className="break-all">{linkedin}</span>
                )}
              </>
            )}

            {portfolio && (
              <>
                {(email || phone || location || linkedin) && (
                  <span aria-hidden="true">|</span>
                )}
                {safeHref(portfolio) ? (
                  <a
                    href={safeHref(portfolio)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={contactLinkClass}
                  >
                    Portfolio
                  </a>
                ) : (
                  <span className="break-all">{portfolio}</span>
                )}
              </>
            )}
          </div>
        )}
      </header>

      {resume.professionalSummary.trim() && (
        <section className="mt-6">
          <SectionHeading>Professional Summary</SectionHeading>
          <p className="whitespace-pre-line wrap-break-word text-sm leading-6">
            {resume.professionalSummary.trim()}
          </p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mt-6">
          <SectionHeading>Experience</SectionHeading>

          <div className="space-y-4">
            {experience.map((item) => {
              const bullets = item.bullets.filter((bullet) => bullet.trim());

              const dates = [item.startDate, item.endDate]
                .filter((value) => value.trim())
                .join(" – ");

              const companyDetails = [item.company, item.location]
                .filter((value) => value.trim())
                .join(" | ");

              return (
                <div key={item.id} className="wrap-break-word">
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                    {item.jobTitle.trim() && (
                      <h3 className="text-sm font-semibold">{item.jobTitle}</h3>
                    )}

                    {dates && (
                      <span className="text-xs text-slate-600">{dates}</span>
                    )}
                  </div>

                  {companyDetails && (
                    <p className="mt-0.5 text-sm text-slate-700">
                      {companyDetails}
                    </p>
                  )}

                  {bullets.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-5">
                      {bullets.map((bullet, index) => (
                        <li
                          key={`${item.id}-bullet-${index}`}
                          className="wrap-break-word"
                        >
                          {bullet.trim()}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mt-6">
          <SectionHeading>Education</SectionHeading>

          <div className="space-y-3">
            {education.map((item) => {
              const dates = [item.startDate, item.endDate]
                .filter((value) => value.trim())
                .join(" – ");

              const details = [item.institution, item.location, item.grade]
                .filter((value) => value.trim())
                .join(" | ");

              return (
                <div key={item.id} className="wrap-break-word">
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                    {item.degree.trim() && (
                      <h3 className="text-sm font-semibold">{item.degree}</h3>
                    )}

                    {dates && (
                      <span className="text-xs text-slate-600">{dates}</span>
                    )}
                  </div>

                  {details && (
                    <p className="text-sm text-slate-700">{details}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {technicalSkills.length > 0 && (
        <section className="mt-6">
          <SectionHeading>Technical Skills</SectionHeading>
          <p className="wrap-break-word text-sm leading-6">
            {technicalSkills.join(", ")}
          </p>
        </section>
      )}

      {softSkills.length > 0 && (
        <section className="mt-5">
          <SectionHeading>Soft Skills</SectionHeading>
          <p className="wrap-break-word text-sm leading-6">
            {softSkills.join(", ")}
          </p>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mt-6">
          <SectionHeading>Projects</SectionHeading>

          <div className="space-y-4">
            {projects.map((item) => {
              const technologies = item.technologies.filter((technology) =>
                technology.trim(),
              );
              const projectUrl = safeHref(item.link);

              return (
                <div key={item.id} className="wrap-break-word">
                  {item.name.trim() && (
                    <h3 className="text-sm font-semibold">{item.name}</h3>
                  )}

                  {technologies.length > 0 && (
                    <p className="mt-0.5 text-xs leading-5 text-slate-600">
                      Technologies: {technologies.join(", ")}
                    </p>
                  )}

                  {item.description.trim() && (
                    <p className="mt-1 whitespace-pre-line wrap-break-word text-sm leading-5">
                      {item.description.trim()}
                    </p>
                  )}

                  {item.link.trim() && (
                    <p className="mt-1 break-all text-xs">
                      {projectUrl ? (
                        <a
                          href={projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={contactLinkClass}
                        >
                          {item.link}
                        </a>
                      ) : (
                        <span className="text-slate-600">{item.link}</span>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="mt-6">
          <SectionHeading>Certifications</SectionHeading>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-5">
            {certifications.map((item, index) => (
              <li key={`certification-${index}`} className="wrap-break-word">
                {item.trim()}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
};

export default ResumePreview;
