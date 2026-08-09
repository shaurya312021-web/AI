import React from 'react';
import { Container, Copy, Terminal, CheckCircle2 } from 'lucide-react';

interface DockerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DockerGuideModal: React.FC<DockerGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Container className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Local Docker Environment Setup</h2>
              <p className="text-xs text-slate-500">Run ResuMock AI platform locally using Docker or Docker Compose</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-2 rounded-xl hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Docker Compose */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>Option A: Run with Docker Compose (Recommended)</span>
          </h3>
          <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl font-mono text-xs space-y-2 shadow-inner">
            <div className="text-slate-400"># 1. Set GEMINI_API_KEY environment variable (optional for offline fallback)</div>
            <div className="text-emerald-400">export GEMINI_API_KEY="your-gemini-api-key-here"</div>
            <div className="text-slate-400"># 2. Launch container stack on port 3000</div>
            <div className="text-blue-400">docker compose up -d --build</div>
            <div className="text-slate-400"># 3. Access in browser: http://localhost:3000</div>
          </div>
        </div>

        {/* Step 2: Docker Build */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>Option B: Direct Docker Build & Run</span>
          </h3>
          <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl font-mono text-xs space-y-2 shadow-inner">
            <div className="text-slate-400"># Build production image</div>
            <div className="text-blue-400">docker build -t resumock-ai .</div>
            <div className="text-slate-400"># Run container mapping port 3000</div>
            <div className="text-emerald-400">docker run -d -p 3000:3000 -e GEMINI_API_KEY=$GEMINI_API_KEY --name resumock resumock-ai</div>
          </div>
        </div>

        {/* Included Config Features */}
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
          <span className="font-bold block flex items-center gap-1.5 text-blue-900">
            <CheckCircle2 className="w-4 h-4 text-blue-600" /> Included Docker Features in Root Directory:
          </span>
          <p className="text-blue-800 leading-relaxed">
            • <strong className="font-mono">Dockerfile</strong>: Multi-stage Node 20 alpine build compiling Vite SPA client + esbuild CommonJS server.<br />
            • <strong className="font-mono">docker-compose.yml</strong>: Healthchecks, port 3000 mapping, and environment injection.<br />
            • <strong className="font-mono">server.ts</strong>: Full-stack Express backend serving API routes and Vite SPA.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
