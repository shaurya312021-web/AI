import React, { useState, useRef } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  Edit3
} from 'lucide-react';
import { ResumeData, ExperienceItem, EducationItem, ProjectItem } from '../../types';
import { SuperchargeButton } from './SuperchargeButton';
import { SuperchargeSummaryButton } from './SuperchargeSummaryButton';
import { StyleControls } from './StyleControls';
import { ResumePreview } from './ResumePreview';

interface ResumeWizardProps {
  resume: ResumeData;
  onChangeResume: (updated: ResumeData) => void;
}

export const ResumeWizard: React.FC<ResumeWizardProps> = ({
  resume,
  onChangeResume,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'styling'>('personal');
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePrintPdf = () => {
    window.print();
  };

  // Helper updates
  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChangeResume({
      ...resume,
      personalInfo: {
        ...resume.personalInfo,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: 'New Company Inc',
      role: 'Software Engineer',
      location: 'City, State',
      startDate: '2023-01',
      endDate: 'Present',
      isCurrent: true,
      bulletPoints: ['Engineered core user features, improving response time by 20%.'],
    };
    onChangeResume({
      ...resume,
      experiences: [newExp, ...resume.experiences],
      updatedAt: new Date().toISOString(),
    });
  };

  const removeExperience = (id: string) => {
    onChangeResume({
      ...resume,
      experiences: resume.experiences.filter((exp) => exp.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  const updateExperience = (id: string, updatedFields: Partial<ExperienceItem>) => {
    onChangeResume({
      ...resume,
      experiences: resume.experiences.map((exp) =>
        exp.id === id ? { ...exp, ...updatedFields } : exp
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const addBulletPoint = (expId: string) => {
    const exp = resume.experiences.find((e) => e.id === expId);
    if (!exp) return;
    updateExperience(expId, {
      bulletPoints: [...exp.bulletPoints, 'Implemented automated testing pipelines to ensure high code quality.'],
    });
  };

  const updateBulletPoint = (expId: string, index: number, text: string) => {
    const exp = resume.experiences.find((e) => e.id === expId);
    if (!exp) return;
    const newPoints = [...exp.bulletPoints];
    newPoints[index] = text;
    updateExperience(expId, { bulletPoints: newPoints });
  };

  const removeBulletPoint = (expId: string, index: number) => {
    const exp = resume.experiences.find((e) => e.id === expId);
    if (!exp) return;
    updateExperience(expId, {
      bulletPoints: exp.bulletPoints.filter((_, i) => i !== index),
    });
  };

  // Education Helpers
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: 'University Name',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science',
      startDate: '2019-08',
      endDate: '2023-05',
    };
    onChangeResume({
      ...resume,
      education: [...resume.education, newEdu],
      updatedAt: new Date().toISOString(),
    });
  };

  const removeEducation = (id: string) => {
    onChangeResume({
      ...resume,
      education: resume.education.filter((e) => e.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  // Skills helpers
  const handleSkillsChange = (type: 'technical' | 'soft' | 'tools', rawStr: string) => {
    const arr = rawStr.split(',').map((s) => s.trim()).filter(Boolean);
    onChangeResume({
      ...resume,
      skills: {
        ...resume.skills,
        [type]: arr,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Projects helpers
  const addProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: 'Awesome Web App',
      description: 'Full stack web application built with React, Express and Node.js.',
      techStack: ['React', 'Node.js', 'Express'],
    };
    onChangeResume({
      ...resume,
      projects: [...resume.projects, newProj],
      updatedAt: new Date().toISOString(),
    });
  };

  const removeProject = (id: string) => {
    onChangeResume({
      ...resume,
      projects: resume.projects.filter((p) => p.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  const wizardTabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills & Tools', icon: Wrench },
    { id: 'projects', label: 'Projects & Certs', icon: FolderGit2 },
    { id: 'styling', label: 'Templates & Styling', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      
      {/* Mobile Sticky Toggle Bar */}
      <div className="xl:hidden sticky top-16 z-20 flex items-center justify-between bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-800">
            {showPreviewMobile ? 'Live Resume Preview' : 'Form Editor'}
          </span>
        </div>
        <button
          onClick={() => setShowPreviewMobile(!showPreviewMobile)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all min-h-[40px]"
        >
          {showPreviewMobile ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showPreviewMobile ? 'Edit Form' : 'View Preview'}</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Column (6 cols) */}
        <div className={`xl:col-span-6 space-y-5 ${showPreviewMobile ? 'hidden xl:block' : 'block'}`}>
          
          {/* Navigation Sub-Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xs flex overflow-x-auto gap-1.5 no-scrollbar touch-pan-x">
            {wizardTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFormTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 min-h-[40px] ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Personal Info */}
          {activeFormTab === 'personal' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Personal & Contact Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Resume Title</label>
                  <input
                    type="text"
                    value={resume.title}
                    onChange={(e) => onChangeResume({ ...resume, title: e.target.value })}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resume.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={resume.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={resume.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={resume.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={resume.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/alexmorgan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 text-xs">Professional Summary</label>
                  <SuperchargeSummaryButton
                    rawText={resume.personalInfo.summary}
                    targetTitle={resume.title || resume.experiences[0]?.role}
                    onApplySummary={(newSummary) => updatePersonalInfo('summary', newSummary)}
                    buttonText="Supercharge with AI"
                    size="sm"
                  />
                </div>
                <textarea
                  rows={4}
                  value={resume.personalInfo.summary}
                  onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                  placeholder="High-impact summary describing your skills, years of experience, and career goals... (e.g., 'Senior Full Stack Engineer with 6+ years...')"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Work Experience */}
          {activeFormTab === 'experience' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Work Experience</h3>
                  <p className="text-xs text-slate-500">Add work history and use AI Supercharge for X-Y-Z achievement bullets</p>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="space-y-6">
                {resume.experiences.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{exp.role || 'New Role'} @ {exp.company || 'Company'}</span>
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block">Job Title / Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block">End Date / Present</label>
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    {/* Bullet points with Supercharge button */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">Achievement Bullet Points:</label>
                        <button
                          type="button"
                          onClick={() => addBulletPoint(exp.id)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                        >
                          + Add Bullet
                        </button>
                      </div>

                      {exp.bulletPoints.map((bp, bpIdx) => (
                        <div key={bpIdx} className="flex items-start gap-2">
                          <textarea
                            rows={2}
                            value={bp}
                            onChange={(e) => updateBulletPoint(exp.id, bpIdx, e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                          <div className="flex flex-col gap-1">
                            <SuperchargeButton
                              rawText={bp}
                              roleTitle={exp.role}
                              onApplyBullet={(newBullet) => updateBulletPoint(exp.id, bpIdx, newBullet)}
                              size="sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeBulletPoint(exp.id, bpIdx)}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Education */}
          {activeFormTab === 'education' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Education & Academic Background</h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Degree</span>
                </button>
              </div>

              <div className="space-y-4">
                {resume.education.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{edu.degree} in {edu.fieldOfStudy}</span>
                      <button onClick={() => removeEducation(edu.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = resume.education.map((item) =>
                            item.id === edu.id ? { ...item, institution: e.target.value } : item
                          );
                          onChangeResume({ ...resume, education: updated });
                        }}
                        placeholder="Institution Name"
                        className="px-2.5 py-1.5 border rounded-lg bg-white"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = resume.education.map((item) =>
                            item.id === edu.id ? { ...item, degree: e.target.value } : item
                          );
                          onChangeResume({ ...resume, education: updated });
                        }}
                        placeholder="Degree (e.g. B.S.)"
                        className="px-2.5 py-1.5 border rounded-lg bg-white"
                      />
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => {
                          const updated = resume.education.map((item) =>
                            item.id === edu.id ? { ...item, fieldOfStudy: e.target.value } : item
                          );
                          onChangeResume({ ...resume, education: updated });
                        }}
                        placeholder="Field of Study"
                        className="px-2.5 py-1.5 border rounded-lg bg-white"
                      />
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => {
                          const updated = resume.education.map((item) =>
                            item.id === edu.id ? { ...item, gpa: e.target.value } : item
                          );
                          onChangeResume({ ...resume, education: updated });
                        }}
                        placeholder="GPA (optional)"
                        className="px-2.5 py-1.5 border rounded-lg bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Skills & Tools */}
          {activeFormTab === 'skills' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Skills & Competencies (Comma Separated)</h3>
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Technical Skills & Programming Languages:</label>
                <input
                  type="text"
                  value={resume.skills.technical.join(', ')}
                  onChange={(e) => handleSkillsChange('technical', e.target.value)}
                  placeholder="React, TypeScript, Node.js, PostgreSQL, Docker..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Developer Tools & Platforms:</label>
                <input
                  type="text"
                  value={resume.skills.tools.join(', ')}
                  onChange={(e) => handleSkillsChange('tools', e.target.value)}
                  placeholder="Git, Vite, VS Code, Postman, AWS, Docker..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Leadership & Soft Skills:</label>
                <input
                  type="text"
                  value={resume.skills.soft.join(', ')}
                  onChange={(e) => handleSkillsChange('soft', e.target.value)}
                  placeholder="Agile Leadership, Technical Architecture, Cross-functional Teamwork..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          )}

          {/* Tab 5: Projects & Certifications */}
          {activeFormTab === 'projects' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Featured Projects</h3>
                <button onClick={addProject} className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold">+ Add Project</button>
              </div>

              <div className="space-y-3">
                {resume.projects.map((p) => (
                  <div key={p.id} className="p-3 border rounded-xl bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={p.title}
                        onChange={(e) => {
                          const updated = resume.projects.map((item) =>
                            item.id === p.id ? { ...item, title: e.target.value } : item
                          );
                          onChangeResume({ ...resume, projects: updated });
                        }}
                        className="font-bold border px-2 py-1 rounded-lg bg-white"
                      />
                      <button onClick={() => removeProject(p.id)} className="text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={p.description}
                      onChange={(e) => {
                        const updated = resume.projects.map((item) =>
                          item.id === p.id ? { ...item, description: e.target.value } : item
                        );
                        onChangeResume({ ...resume, projects: updated });
                      }}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 6: Styling & Customization */}
          {activeFormTab === 'styling' && (
            <StyleControls
              styling={resume.styling}
              onChangeStyling={(newStyling) => onChangeResume({ ...resume, styling: newStyling })}
              onPrintPdf={handlePrintPdf}
            />
          )}

        </div>

        {/* Right Preview Column (6 cols sticky) */}
        <div className={`xl:col-span-6 sticky top-20 space-y-4 ${showPreviewMobile ? 'block' : 'hidden xl:block'}`}>
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Real-Time Split-Screen Live Preview</span>
            </span>
            <button
              onClick={handlePrintPdf}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
            >
              Export ATS PDF
            </button>
          </div>

          <ResumePreview ref={previewRef} resume={resume} />
        </div>

      </div>
    </div>
  );
};
