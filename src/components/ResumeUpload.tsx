import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { parseResumeText } from '../utils/aiService';
import { ResumeData } from '../types';

interface ResumeUploadProps {
  currentResume: ResumeData;
  onResumeParsed: (parsedResume: ResumeData) => void;
  onNavigateToBuilder: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  currentResume,
  onResumeParsed,
  onNavigateToBuilder,
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    setFileName(file.name);
    setIsParsing(true);
    setSuccessMessage('');

    try {
      let fileData = '';
      let text = '';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      try {
        text = await file.text();
        // If file is binary PDF/Zip stream, clear text so server relies on fileData
        if (text.includes('%PDF') || text.includes('PK\x03\x04') || /[\x00-\x08\x0E-\x1F]/.test(text.slice(0, 300))) {
          text = '';
        }
      } catch (e) {
        text = '';
      }

      if (text) {
        setRawText(text);
      }

      const parsed = await parseResumeText(text, fileData, file.type || 'application/pdf');
      const mergedResume: ResumeData = {
        ...currentResume,
        title: parsed.personalInfo?.fullName ? `${parsed.personalInfo.fullName}'s Resume` : currentResume.title,
        personalInfo: {
          ...currentResume.personalInfo,
          ...(parsed.personalInfo || {}),
        },
        experiences: parsed.experiences && Array.isArray(parsed.experiences) && parsed.experiences.length > 0
          ? parsed.experiences.map((exp, idx) => ({
              id: `exp-${Date.now()}-${idx}`,
              company: exp.company || 'Extracted Company',
              role: exp.role || 'Software Engineer',
              location: exp.location || 'San Francisco, CA',
              startDate: exp.startDate || '2022-01',
              endDate: exp.endDate || 'Present',
              isCurrent: exp.isCurrent ?? true,
              bulletPoints: Array.isArray(exp.bulletPoints) && exp.bulletPoints.length > 0
                ? exp.bulletPoints
                : ['Engineered scalable application features.'],
            }))
          : currentResume.experiences,
        skills: {
          technical: parsed.skills?.technical && Array.isArray(parsed.skills.technical) && parsed.skills.technical.length > 0
            ? parsed.skills.technical
            : currentResume.skills.technical,
          soft: parsed.skills?.soft && Array.isArray(parsed.skills.soft) && parsed.skills.soft.length > 0
            ? parsed.skills.soft
            : currentResume.skills.soft,
          tools: parsed.skills?.tools && Array.isArray(parsed.skills.tools) && parsed.skills.tools.length > 0
            ? parsed.skills.tools
            : currentResume.skills.tools,
        },
        education: parsed.education && Array.isArray(parsed.education) && parsed.education.length > 0
          ? parsed.education.map((edu, idx) => ({
              id: `edu-${Date.now()}-${idx}`,
              institution: edu.institution || 'University',
              degree: edu.degree || 'Bachelor of Science',
              fieldOfStudy: edu.fieldOfStudy || 'Computer Science',
              startDate: edu.startDate || '2018-08',
              endDate: edu.endDate || '2022-05',
              gpa: edu.gpa || '3.8',
            }))
          : currentResume.education,
        updatedAt: new Date().toISOString(),
      };

      onResumeParsed(mergedResume);
      setSuccessMessage('Resume parsed and extracted successfully! Redirecting to Live Resume Builder...');
      setTimeout(() => {
        onNavigateToBuilder();
      }, 1200);
    } catch (err) {
      console.error('Failed to parse file:', err);
      alert('Error reading file. Please paste the plain text directly below.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualParse = async () => {
    if (!rawText || rawText.trim().length < 20) {
      alert('Please paste at least a paragraph of resume text.');
      return;
    }

    setIsParsing(true);
    setSuccessMessage('');
    try {
      const parsed = await parseResumeText(rawText);
      const mergedResume: ResumeData = {
        ...currentResume,
        personalInfo: {
          ...currentResume.personalInfo,
          ...(parsed.personalInfo || {}),
        },
        experiences: parsed.experiences && Array.isArray(parsed.experiences) && parsed.experiences.length > 0
          ? parsed.experiences.map((exp, idx) => ({
              id: `exp-${Date.now()}-${idx}`,
              company: exp.company || 'Company',
              role: exp.role || 'Role',
              location: exp.location || 'Location',
              startDate: exp.startDate || '2022-01',
              endDate: exp.endDate || 'Present',
              isCurrent: exp.isCurrent ?? true,
              bulletPoints: Array.isArray(exp.bulletPoints) && exp.bulletPoints.length > 0
                ? exp.bulletPoints
                : ['Delivered core project milestones.'],
            }))
          : currentResume.experiences,
        skills: {
          technical: parsed.skills?.technical && Array.isArray(parsed.skills.technical) && parsed.skills.technical.length > 0
            ? parsed.skills.technical
            : currentResume.skills.technical,
          soft: parsed.skills?.soft && Array.isArray(parsed.skills.soft) && parsed.skills.soft.length > 0
            ? parsed.skills.soft
            : currentResume.skills.soft,
          tools: parsed.skills?.tools && Array.isArray(parsed.skills.tools) && parsed.skills.tools.length > 0
            ? parsed.skills.tools
            : currentResume.skills.tools,
        },
        education: parsed.education && Array.isArray(parsed.education) && parsed.education.length > 0
          ? parsed.education.map((edu, idx) => ({
              id: `edu-${Date.now()}-${idx}`,
              institution: edu.institution || 'University',
              degree: edu.degree || 'Bachelor of Science',
              fieldOfStudy: edu.fieldOfStudy || 'Computer Science',
              startDate: edu.startDate || '2018-08',
              endDate: edu.endDate || '2022-05',
              gpa: edu.gpa || '3.8',
            }))
          : currentResume.education,
        updatedAt: new Date().toISOString(),
      };

      onResumeParsed(mergedResume);
      setSuccessMessage('Resume text extracted! Opening Live Resume Builder...');
      setTimeout(() => {
        onNavigateToBuilder();
      }, 1000);
    } catch (err) {
      console.error(err);
      alert('Parse failed. Try again.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Module 1A: Resume Upload & Parsing Engine</h2>
            <p className="text-xs text-slate-500">Upload pre-existing resumes (PDF / DOCX max 5MB) or paste raw text to extract experience & skills.</p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* File Dropzone */}
      <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-all text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          {isParsing ? <Loader2 className="w-8 h-8 animate-spin" /> : <FileText className="w-8 h-8" />}
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">Drag & drop your resume file here</h3>
          <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, or TXT format (Max size: 5MB)</p>
        </div>

        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 cursor-pointer transition-all shadow-md">
          <Upload className="w-4 h-4" />
          <span>Select Resume File</span>
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {fileName && (
          <p className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full inline-block">
            Loaded File: {fileName}
          </p>
        )}
      </div>

      {/* Manual Paste Fallback */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Or Paste Resume Raw Text</span>
          </h3>
          <span className="text-xs text-slate-400">Direct AI Parser</span>
        </div>

        <textarea
          rows={8}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste your full resume text here (Work experience, skills, education, summary)..."
          className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />

        <div className="flex justify-end">
          <button
            onClick={handleManualParse}
            disabled={isParsing || !rawText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md"
          >
            {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>Parse & Populate Resume</span>
          </button>
        </div>
      </div>

    </div>
  );
};
