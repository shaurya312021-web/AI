import React, { forwardRef } from 'react';
import { ResumeData } from '../../types';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ resume }, ref) => {
    const { personalInfo, experiences, education, skills, projects, certifications, styling } = resume;

    const fontClass =
      styling.fontFamily === 'serif'
        ? 'font-serif'
        : styling.fontFamily === 'mono'
        ? 'font-mono'
        : 'font-sans';

    const densityPadding =
      styling.density === 'compact'
        ? 'p-6 space-y-3'
        : styling.density === 'spacious'
        ? 'p-10 space-y-6'
        : 'p-8 space-y-4';

    const accentColor = styling.accentColor || '#2563eb';

    // 1. Template: Tech (Single Column ATS Favorite)
    const renderTechTemplate = () => (
      <div className={`bg-white text-slate-900 ${fontClass} ${densityPadding} text-xs leading-normal max-w-2xl mx-auto shadow-sm border border-slate-200 print:shadow-none print:border-none print:max-w-none print:p-0`}>
        {/* Header */}
        <div className="border-b-2 pb-3 mb-3" style={{ borderColor: accentColor }}>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">{personalInfo.fullName || 'Your Full Name'}</h1>
          <p className="text-sm font-semibold mt-0.5" style={{ color: accentColor }}>
            {resume.title || 'Professional Role Title'}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-600">
            {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{personalInfo.email}</span>}
            {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{personalInfo.phone}</span>}
            {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{personalInfo.location}</span>}
            {personalInfo.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3 text-slate-400" />{personalInfo.linkedin}</span>}
            {personalInfo.github && <span className="flex items-center gap-1"><Github className="w-3 h-3 text-slate-400" />{personalInfo.github}</span>}
          </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">Professional Summary</h2>
            <p className="text-slate-700 leading-relaxed text-[11px]">{personalInfo.summary}</p>
          </div>
        )}

        {/* Technical Skills */}
        {(skills.technical.length > 0 || skills.soft.length > 0 || skills.tools.length > 0) && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">Core Competencies & Skills</h2>
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              {skills.technical.length > 0 && (
                <p><strong className="text-slate-900">Technical:</strong> {skills.technical.join(', ')}</p>
              )}
              {skills.tools.length > 0 && (
                <p><strong className="text-slate-900">Tools & Infrastructure:</strong> {skills.tools.join(', ')}</p>
              )}
              {skills.soft.length > 0 && (
                <p><strong className="text-slate-900">Leadership & Soft Skills:</strong> {skills.soft.join(', ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">Work Experience</h2>
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-xs">{exp.role} — <span style={{ color: accentColor }}>{exp.company}</span></span>
                    <span className="text-[10px] text-slate-500 font-medium">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate} | {exp.location}</span>
                  </div>
                  <ul className="list-disc list-outside ml-4 text-[11px] text-slate-700 space-y-0.5">
                    {exp.bulletPoints.map((bp, i) => (
                      <li key={i}>{bp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">Key Technical Projects</h2>
            <div className="space-y-2">
              {projects.map((proj) => (
                <div key={proj.id} className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{proj.title}</span>
                    {proj.link && <span className="text-[10px] text-blue-600 font-mono">{proj.link}</span>}
                  </div>
                  <p className="text-slate-700">{proj.description}</p>
                  {proj.techStack.length > 0 && (
                    <p className="text-[10px] text-slate-500 font-mono">Technologies: {proj.techStack.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">Education</h2>
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-[11px]">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span> — <span>{edu.institution}</span>
                </div>
                <span className="text-[10px] text-slate-500">{edu.startDate} – {edu.endDate} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</span>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">Certifications</h2>
            <p className="text-[11px] text-slate-700">{certifications.join(' • ')}</p>
          </div>
        )}
      </div>
    );

    // 2. Template: Corporate (Executive Header Bar)
    const renderCorporateTemplate = () => (
      <div className={`bg-white text-slate-900 ${fontClass} text-xs leading-normal max-w-2xl mx-auto shadow-sm border border-slate-200 print:shadow-none print:border-none print:max-w-none print:p-0`}>
        {/* Header Band */}
        <div className="p-6 text-white" style={{ backgroundColor: accentColor }}>
          <h1 className="text-2xl font-bold uppercase tracking-wide">{personalInfo.fullName || 'Executive Candidate'}</h1>
          <p className="text-sm text-slate-100 font-medium">{resume.title}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-slate-200">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          </div>
        </div>

        <div className={`${densityPadding}`}>
          {/* Executive Summary */}
          {personalInfo.summary && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 pb-0.5" style={{ borderColor: accentColor }}>Executive Summary</h2>
              <p className="text-slate-700 leading-relaxed text-[11px]">{personalInfo.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {experiences.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 pb-0.5" style={{ borderColor: accentColor }}>Professional Experience</h2>
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-xs">{exp.role} | <span style={{ color: accentColor }}>{exp.company}</span></span>
                    <span className="text-[10px] text-slate-500 font-mono">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                  </div>
                  <ul className="list-disc list-outside ml-4 text-[11px] text-slate-700 space-y-0.5">
                    {exp.bulletPoints.map((bp, i) => (
                      <li key={i}>{bp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Skills & Competencies */}
          {skills.technical.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 pb-0.5" style={{ borderColor: accentColor }}>Core Qualifications</h2>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.technical.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-semibold rounded-xs border border-slate-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 pb-0.5" style={{ borderColor: accentColor }}>Education & Credentials</h2>
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between text-[11px]">
                  <span className="font-bold">{edu.degree} in {edu.fieldOfStudy} - {edu.institution}</span>
                  <span className="text-slate-500 text-[10px]">{edu.startDate} - {edu.endDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

    // 3. Template: Minimalist
    const renderMinimalistTemplate = () => (
      <div className={`bg-white text-slate-800 ${fontClass} ${densityPadding} text-xs leading-relaxed max-w-2xl mx-auto shadow-sm border border-slate-200 print:shadow-none print:border-none print:max-w-none print:p-0`}>
        <div className="text-center space-y-1 pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-light tracking-widest uppercase text-slate-900">{personalInfo.fullName || 'Candidate Name'}</h1>
          <p className="text-xs tracking-wider uppercase text-slate-500 font-medium">{resume.title}</p>
          <div className="text-[10px] text-slate-500 flex justify-center gap-3 pt-1">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
        </div>

        {personalInfo.summary && (
          <p className="text-slate-600 text-center text-[11px] italic max-w-lg mx-auto py-1">{personalInfo.summary}</p>
        )}

        {experiences.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 text-center">Experience</h2>
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline font-medium text-slate-900 border-b border-slate-100 pb-0.5">
                  <span>{exp.role} / <span style={{ color: accentColor }}>{exp.company}</span></span>
                  <span className="text-[10px] text-slate-400">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                </div>
                <ul className="list-disc list-outside ml-4 text-[11px] text-slate-600 space-y-0.5">
                  {exp.bulletPoints.map((bp, i) => (
                    <li key={i}>{bp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 text-center">Education</h2>
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between text-[11px] text-slate-700">
                <span>{edu.degree}, {edu.fieldOfStudy} — {edu.institution}</span>
                <span className="text-slate-400 text-[10px]">{edu.startDate} – {edu.endDate}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    // 4. Template: Startup (Metric Focused)
    const renderStartupTemplate = () => (
      <div className={`bg-white text-slate-900 ${fontClass} ${densityPadding} text-xs leading-normal max-w-2xl mx-auto shadow-sm border border-slate-200 print:shadow-none print:border-none print:max-w-none print:p-0`}>
        <div className="flex justify-between items-start border-l-4 pl-4 py-1" style={{ borderColor: accentColor }}>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{personalInfo.fullName}</h1>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{resume.title}</p>
          </div>
          <div className="text-right text-[10px] text-slate-600 space-y-0.5 font-mono">
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
          </div>
        </div>

        {/* Highlights Banner */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
          <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">Impact & Highlights:</span>
          <p className="text-slate-700">{personalInfo.summary}</p>
        </div>

        {experiences.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 pb-0.5" style={{ borderColor: accentColor }}>Impact & Experience</h2>
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex justify-between font-bold text-slate-900">
                  <span className="text-xs">{exp.role} @ <span style={{ color: accentColor }}>{exp.company}</span></span>
                  <span className="text-[10px] text-slate-500 font-mono">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</span>
                </div>
                <ul className="list-disc list-outside ml-4 text-[11px] text-slate-700 space-y-1">
                  {exp.bulletPoints.map((bp, i) => (
                    <li key={i}>{bp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {skills.technical.length > 0 && (
          <div className="space-y-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Tech Stack</h2>
            <div className="flex flex-wrap gap-1">
              {skills.technical.map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] rounded-md">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    const getTemplateRender = () => {
      switch (styling.templateId) {
        case 'corporate':
          return renderCorporateTemplate();
        case 'minimalist':
          return renderMinimalistTemplate();
        case 'startup':
          return renderStartupTemplate();
        case 'tech':
        default:
          return renderTechTemplate();
      }
    };

    return (
      <div ref={ref} className="w-full bg-slate-100 p-2 sm:p-6 rounded-2xl overflow-x-auto min-h-[600px] flex justify-center items-start print:bg-white print:p-0">
        <div className="w-full">
          {getTemplateRender()}
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
