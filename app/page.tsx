import { CheckCircle2, Bot, Sparkles, FolderTree, ArrowRight } from "lucide-react";

export default function Home() {
  const setupItems = [
    { name: "Next.js 16 + TypeScript", status: "Installed & Configured" },
    { name: "Tailwind CSS v4", status: "Ready for styling" },
    { name: "chess.js", status: "Installed for move validation & rules" },
    { name: "react-chessboard", status: "Installed for interactive UI" },
    { name: "Folder Architecture", status: "/components, /lib/engine, /workers, /types" },
    { name: "Git & Secrets Shield", status: ".gitignore & .env.example configured" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Chess-Bot
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Phase 0 Complete
                </span>
              </h1>
              <p className="text-sm text-slate-400">Adaptive AI &amp; Mistake Coach Web Application</p>
            </div>
          </div>
        </div>

        {/* Overview Box */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Project Foundations Initialized
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            All foundational tools and libraries are configured. In Phase 1, we will replace this screen with the live, playable chessboard against our first bot!
          </p>
        </div>

        {/* Setup Verification Checklist */}
        <div className="space-y-2.5 mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <FolderTree className="w-3.5 h-3.5" />
            Phase 0 Environment Checklist
          </h3>
          {setupItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 text-sm"
            >
              <span className="font-medium text-slate-200">{item.name}</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {item.status}
              </span>
            </div>
          ))}
        </div>

        {/* Footer / Next Step */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
          <span>Ready for Phase 1: Playable Board vs. Random Bot</span>
          <span className="flex items-center gap-1 text-blue-400 font-medium">
            Next Up <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
