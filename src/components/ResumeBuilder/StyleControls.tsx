import React from 'react';
import { Palette, Type, LayoutGrid, Download, Printer, Check } from 'lucide-react';
import { ResumeData, TemplateId, AccentColor, TypographyFont, LayoutDensity } from '../../types';

interface StyleControlsProps {
  styling: ResumeData['styling'];
  onChangeStyling: (newStyling: ResumeData['styling']) => void;
  onPrintPdf: () => void;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
  styling,
  onChangeStyling,
  onPrintPdf,
}) => {
  const templates: { id: TemplateId; label: string; desc: string }[] = [
    { id: 'tech', label: 'Tech (Single-Column)', desc: 'Clean, modern ATS favorite' },
    { id: 'corporate', label: 'Corporate (Executive)', desc: 'Classic header & serif font' },
    { id: 'minimalist', label: 'Minimalist', desc: 'Airy layout with generous whitespace' },
    { id: 'startup', label: 'Startup (Metric-Focused)', desc: 'Bold typography highlighting KPIs' },
  ];

  const colors: { value: AccentColor; label: string }[] = [
    { value: '#2563eb', label: 'Royal Blue' },
    { value: '#059669', label: 'Emerald' },
    { value: '#4f46e5', label: 'Indigo' },
    { value: '#dc2626', label: 'Burgundy' },
    { value: '#7c3aed', label: 'Violet' },
    { value: '#0f172a', label: 'Charcoal Slate' },
  ];

  const fonts: { value: TypographyFont; label: string }[] = [
    { value: 'sans', label: 'Inter / Modern Sans' },
    { value: 'serif', label: 'Playfair / Executive Serif' },
    { value: 'mono', label: 'Roboto Mono / Developer' },
  ];

  const densities: { value: LayoutDensity; label: string }[] = [
    { value: 'compact', label: 'Compact (1 Page Max)' },
    { value: 'normal', label: 'Balanced (Standard)' },
    { value: 'spacious', label: 'Spacious (Multi-Page)' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-5">
      
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>Design & Customization Suite</span>
          </h3>
          <p className="text-xs text-slate-500">Customize styling & export clean ATS-compliant text-selectable PDF</p>
        </div>

        <button
          onClick={onPrintPdf}
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Export ATS PDF</span>
        </button>
      </div>

      {/* 1. Template Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">1. ATS Optimized Template:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {templates.map((tpl) => {
            const isSelected = styling.templateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onChangeStyling({ ...styling, templateId: tpl.id })}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full text-white flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
                <span className="text-xs font-bold text-slate-900 block">{tpl.label}</span>
                <span className="text-[10px] text-slate-500 line-clamp-1">{tpl.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Palette & Typography */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
        
        {/* Accent Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-slate-500" />
            <span>Accent Color Palette:</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {colors.map((c) => {
              const isSelected = styling.accentColor === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onChangeStyling({ ...styling, accentColor: c.value })}
                  style={{ backgroundColor: c.value }}
                  className={`w-7 h-7 rounded-full transition-all flex items-center justify-center text-white shadow-2xs ${
                    isSelected ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105 opacity-90'
                  }`}
                  title={c.label}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <span>Typography Font:</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {fonts.map((f) => {
              const isSelected = styling.fontFamily === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => onChangeStyling({ ...styling, fontFamily: f.value })}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label.split('/')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Density */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            <span>Section Density:</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {densities.map((d) => {
              const isSelected = styling.density === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => onChangeStyling({ ...styling, density: d.value })}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.value}
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
