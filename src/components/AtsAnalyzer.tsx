import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle2, Sparkles, Loader2, ArrowRight, Zap, RefreshCw, Plus } from 'lucide-react';
import { ResumeData, JobDescription, AtsReport } from '../types';
import { runAtsAnalysis } from '../utils/aiService';

interface AtsAnalyzerProps {
  resume: ResumeData;
  jobDescription: JobDescription;
  onChangeJobDescription: (jd: JobDescription) => void;
  onUpdateResumeSkills: (newTechnicalSkills: string[]) => void;
  onNavigateToInterview: () => void;
}

export const AtsAnalyzer: React.FC<AtsAnalyzerProps> = ({
  resume,
  jobDescription,
  onChangeJobDescription,
  onUpdateResumeSkills,
  onNavigateToInterview,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<AtsReport | null>(null);

  const handleRunAnalysis = async () => {
    if (!jobDescription.rawText || jobDescription.rawText.trim().length < 20) {
      alert('Please paste or enter a detailed Job Description first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const resReport = await runAtsAnalysis(resume, jobDescription);
      setReport(resReport);
    } catch (err) {
      console.error(err);
      alert('ATS Analysis failed. Using fallback report.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddSkillToResume = (skillKeyword: string) => {
    const existing = new Set(resume.skills.technical.map((s) => s.toLowerCase()));
    if (!existing.has(skillKeyword.toLowerCase())) {
      const updated = [...resume.skills.technical, skillKeyword];
      onUpdateResumeSkills(updated);
      alert(`Added "${skillKeyword}" to your Technical Skills!`);
    } else {
      alert(`"${skillKeyword}" is already in your technical skills.`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Module 2: ATS & Job Description (JD) Gap Analyzer</h2>
            <p className="text-xs text-slate-500">Scan candidate resume against target JD to uncover missing skills & action verb improvements.</p>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing || !jobDescription.rawText}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-95 min-h-[44px]"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Run ATS Gap Scan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Input: Target Job Description (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Target Job Description</h3>
            
            <div className="space-y-2 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Job Role Title</label>
                <input
                  type="text"
                  value={jobDescription.title}
                  onChange={(e) => onChangeJobDescription({ ...jobDescription, title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={jobDescription.company}
                  onChange={(e) => onChangeJobDescription({ ...jobDescription, company: e.target.value })}
                  placeholder="e.g. AetherAI Labs"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Paste Job Description Text</label>
                <textarea
                  rows={12}
                  value={jobDescription.rawText}
                  onChange={(e) => onChangeJobDescription({ ...jobDescription, rawText: e.target.value })}
                  placeholder="Paste responsibilities, required skills, technical requirements from the target job posting..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Report Card & Skill Gaps (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {report ? (
            <div className="space-y-5">
              
              {/* Match Scores Overview */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">ATS Match Breakdown</h3>
                  <span className="text-xs font-semibold text-slate-500">Resume: {resume.title}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Overall Match</span>
                    <span className="text-2xl font-black text-blue-800">{report.overallScore}%</span>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Skills Match</span>
                    <span className="text-2xl font-black text-emerald-800">{report.skillsMatchScore}%</span>
                  </div>

                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Keywords Match</span>
                    <span className="text-2xl font-black text-purple-800">{report.keywordMatchScore}%</span>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Formatting Score</span>
                    <span className="text-2xl font-black text-amber-800">{report.formattingScore}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* Missing Skills & Keyword Gap List */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Missing Skills & Keyword Gaps</span>
                  </h3>
                  <span className="text-xs text-slate-500">{report.missingKeywords.length} gaps flagged</span>
                </div>

                <div className="space-y-2">
                  {report.missingKeywords.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{gap.keyword}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            gap.importance === 'critical'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {gap.importance}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">Category: {gap.category}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSkillToResume(gap.keyword)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition-all shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Resume</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Tips */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>Actionable Optimization Advice</span>
                </h3>

                <div className="space-y-2 text-xs">
                  {report.actionableTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-800 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onNavigateToInterview}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    <span>Proceed to AI Interviewer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Target className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">Ready for ATS Keyword Scan</h3>
                <p className="text-xs text-slate-500">Paste your target Job Description on the left and click "Run ATS Gap Scan" to calculate compatibility scores and missing skills.</p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
