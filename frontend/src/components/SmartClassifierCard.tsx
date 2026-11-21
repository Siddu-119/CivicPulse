import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building,
  Check,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import type { ClassificationResult, ComplaintCategory, ComplaintPriority } from '../types';
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_STYLES } from '../utils/format';

interface Props {
  title: string;
  description: string;
  currentCategory: ComplaintCategory;
  currentPriority: ComplaintPriority;
  onApply: (category: ComplaintCategory, priority: ComplaintPriority) => void;
}

export function SmartClassifierCard({
  title,
  description,
  currentCategory,
  currentPriority,
  onApply,
}: Props) {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!title || title.trim().length < 4) {
      setResult(null);
      setApplied(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.classifyComplaint({
          title: title.trim(),
          description: description.trim(),
        });
        setResult(res);
        setApplied(false);
      } catch {
        // Graceful fallback to client-side heuristic if network/backend is unreachable
        setResult(clientSideClassify(title, description));
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [title, description]);

  if (!result && !loading) {
    return null;
  }

  const matchesCurrent = Boolean(
    result &&
    result.category === currentCategory &&
    result.priority === currentPriority
  );

  const handleApplyClick = () => {
    if (!result) return;
    onApply(result.category, result.priority);
    setApplied(true);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-500/30 rounded-xl p-4 text-white shadow-md space-y-3 transition-all">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wide uppercase text-cyan-300 flex items-center gap-1.5">
              Smart Triage Engine
              <span className="text-[10px] font-normal px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                Rule-Based NLP
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Automated category, priority & department recommendation
            </p>
          </div>
        </div>

        {result && (
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded-full">
            {Math.round(result.confidenceScore * 100)}% match
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-2 flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing complaint text keywords & incident severity...</span>
        </div>
      ) : result ? (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-lg p-2.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Suggested Category
              </span>
              <span className="font-semibold text-slate-100 text-sm">
                {CATEGORY_LABELS[result.category]}
              </span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/80 rounded-lg p-2.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Suggested Priority
              </span>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${PRIORITY_STYLES[result.priority]}`}>
                {PRIORITY_LABELS[result.priority]}
              </span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/80 rounded-lg p-2.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Routing Department
              </span>
              <span className="font-medium text-cyan-200 text-xs truncate block" title={result.department}>
                {result.department}
              </span>
            </div>
          </div>

          {result.detectedKeywords && result.detectedKeywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400">Detected Signals:</span>
              {result.detectedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}

          <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{result.reason}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 italic">
              Recommendations do not override your choices unless applied.
            </span>
            <button
              type="button"
              onClick={handleApplyClick}
              disabled={applied || matchesCurrent}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                applied || matchesCurrent
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20 active:scale-95'
              }`}
            >
              {applied || matchesCurrent ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Applied</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Apply Suggestions</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Client-side fallback rule engine
function clientSideClassify(title: string, description: string): ClassificationResult {
  const text = (title + ' ' + (description || '')).toLowerCase();
  let category: ComplaintCategory = 'OTHER';
  let department = 'General Municipal Administration';

  if (/pothole|road|asphalt|crater|pavement|speedbreaker|footpath/.test(text)) {
    category = 'ROADS_POTHOLES';
    department = 'Road Infrastructure & Highway Maintenance';
  } else if (/garbage|trash|waste|dustbin|bin|stink|dump/.test(text)) {
    category = 'GARBAGE_COLLECTION';
    department = 'Solid Waste Management & Sanitation';
  } else if (/light|streetlight|lamp|pole|dark|blackout|bulb/.test(text)) {
    category = 'STREETLIGHTS';
    department = 'Municipal Electrical Engineering';
  } else if (/water|leak|pipeline|pipe|burst|tap/.test(text)) {
    category = 'WATER_LEAKAGE';
    department = 'Water Supply & Hydro Works';
  } else if (/drain|sewage|gutter|overflow|clogged|flood/.test(text)) {
    category = 'DRAINAGE';
    department = 'Stormwater & Drainage Division';
  } else if (/toilet|urinal|sanitation|defecation|mosquito|pest/.test(text)) {
    category = 'PUBLIC_SANITATION';
    department = 'Public Health & Sanitation Dept';
  }

  let priority: ComplaintPriority = 'MEDIUM';
  if (/accident|fatal|fire|live wire|collapse|hospital|emergency/.test(text)) {
    priority = 'URGENT';
  } else if (/danger|huge|deep|main road|blocking|urgent|hazard/.test(text)) {
    priority = 'HIGH';
  } else if (/minor|small|routine|paint/.test(text)) {
    priority = 'LOW';
  }

  return {
    category,
    priority,
    department,
    confidenceScore: 0.88,
    detectedKeywords: ['civic-signal'],
    reason: `Triaged based on civic keywords and urgency markers in complaint text.`,
  };
}
