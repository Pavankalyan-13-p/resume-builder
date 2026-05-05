import React, { useState } from "react";
import {
  FileText, Edit3, Briefcase, GraduationCap, Code, Globe, Award,
  Sparkles, Star, User, Eye, Upload, Crown, Target, Lock, Check,
  X, Clock, Download, LogOut, ArrowLeft, ArrowRight
} from "lucide-react";
import { TEMPLATE_COMPONENTS } from "./ResumeTemplates.jsx";
import { TEMPLATES } from "../data/resumeData.js";
import Editor from "./Editor.jsx";
import ATSModal from "./ATSModal.jsx";
import JobSuggestionsModal from "./JobSuggestionsModal.jsx";
import CoverLetterModal from "./CoverLetterGenerator.jsx";
import InterviewSimulator from "./InterviewSimulator.jsx";
export default function BuilderPage(props) {
  const { resume, setResume, templateId, onSelectTemplate, activeSection, setActiveSection, saveStatus, ats, atsOpen, setAtsOpen, user, onBackHome, onPDF, onWord, onSignIn, onSignUp, onLogout, onUpgrade, sidebarOpen, setSidebarOpen, onOpenProfile, onOpenImport, downloadsRemaining, isPreviewLocked } = props;
  const Template = TEMPLATE_COMPONENTS[templateId] || TEMPLATE_COMPONENTS["classic"];
  const [mobileTab, setMobileTab]         = useState("edit");
  const [jobModal, setJobModal]           = useState(false);
  const [clModal, setClModal]             = useState(false);
  const [interviewModal, setInterviewModal] = useState(false);

  const sections = [
    { id: "personal", label: "Personal", icon: <User style={{ width: 14, height: 14 }} /> },
    { id: "summary", label: "Summary", icon: <Edit3 style={{ width: 14, height: 14 }} /> },
    { id: "experience", label: "Experience", icon: <Briefcase style={{ width: 14, height: 14 }} /> },
    { id: "education", label: "Education", icon: <GraduationCap style={{ width: 14, height: 14 }} /> },
    { id: "skills", label: "Skills", icon: <Code style={{ width: 14, height: 14 }} /> },
    { id: "projects", label: "Projects", icon: <Sparkles style={{ width: 14, height: 14 }} /> },
    { id: "languages", label: "Languages", icon: <Globe style={{ width: 14, height: 14 }} /> },
    { id: "certifications", label: "Certs", icon: <Award style={{ width: 14, height: 14 }} /> },
    { id: "templates", label: "Templates", icon: <FileText style={{ width: 14, height: 14 }} /> },
    { id: "_cover-letter", label: "Cover Letter", icon: <Edit3 style={{ width: 14, height: 14, color: "#b84a2e" }} />, modal: () => setClModal(true) },
    { id: "_interview",    label: "Simulator",    icon: <Star style={{ width: 14, height: 14, color: "#6d28d9" }} />, modal: () => setInterviewModal(true) },
  ];

  const atsColor = ats.score >= 80 ? "#15803d" : ats.score >= 60 ? "#d97706" : "#dc2626";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', system-ui, sans-serif", background: "#f0ede8" }}>

      {/* TOP BAR */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 1.5rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onBackHome}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f5f5f5", border: "1px solid #e0e0e0", cursor: "pointer", padding: "7px 14px", fontSize: "0.8rem", fontWeight: 600, color: "#333", borderRadius: "2px", whiteSpace: "nowrap" }}
          >
            <ArrowLeft style={{ width: 13, height: 13 }} /> Home
          </button>
          <div className="bldr-divider" style={{ width: "1px", height: "24px", background: "#e5e5e5" }}></div>
          <div className="bldr-logo" style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: 28, height: 28, background: "#1a2e4a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText style={{ width: 13, height: 13, color: "#fff" }} />
            </div>
            <span style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a2e4a" }}>Foliant</span>
          </div>
          <div className="bldr-save" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", color: "#aaa", marginLeft: "4px" }}>
            <Clock style={{ width: 11, height: 11 }} />
            {saveStatus === "saving" ? "Saving..." : "All saved"}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Mobile edit/preview toggle - CSS shows it only on mobile */}
          <button
            className="bldr-toggle"
            onClick={() => setMobileTab(t => t === "edit" ? "preview" : "edit")}
            style={{ display: "none", alignItems: "center", gap: "6px", padding: "7px 14px", background: mobileTab === "preview" ? "#1a2e4a" : "#f5f5f5", color: mobileTab === "preview" ? "#fff" : "#333", border: "1px solid #e0e0e0", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}
          >
            {mobileTab === "edit" ? <Eye style={{ width: 14, height: 14 }} /> : <Edit3 style={{ width: 14, height: 14 }} />}
            {mobileTab === "edit" ? "Preview" : "Edit"}
          </button>
          <button
            className="bldr-import"
            onClick={onOpenImport}
            title="Import PDF or Word resume (Pro)"
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, color: "#555", position: "relative" }}
          >
            <Upload style={{ width: 13, height: 13 }} /> Import
            {(!user || user.plan !== "pro") && <Crown style={{ width: 10, height: 10, color: "#b84a2e", position: "absolute", top: 3, right: 3 }} />}
          </button>
          <button
            className="bldr-ats"
            onClick={user ? () => setAtsOpen(true) : onSignUp}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: user ? atsColor : "#999", position: "relative" }}
          >
            <Target style={{ width: 14, height: 14 }} />
            {user ? `ATS ${ats.score}/100` : "ATS Score"}
            {!user && <Lock style={{ width: 10, height: 10, color: "#b84a2e", position: "absolute", top: 3, right: 3 }} />}
          </button>
          <button
            className="bldr-jobs"
            onClick={() => setJobModal(true)}
            title="Job Suggestions - find roles that match your resume"
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "#555", position: "relative", whiteSpace: "nowrap" }}
          >
            <Briefcase style={{ width: 14, height: 14 }} /> Jobs
            {(!user || user.plan !== "pro") && <Crown style={{ width: 10, height: 10, color: "#b84a2e", position: "absolute", top: 3, right: 3 }} />}
          </button>
          <button
            className="bldr-cl"
            onClick={() => { if (!user) { onSignIn(); return; } setClModal(true); }}
            title="Cover Letter Generator — free for signed-in users"
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "#555", position: "relative", whiteSpace: "nowrap" }}
          >
            <Edit3 style={{ width: 14, height: 14 }} /> Cover Letter
            {!user && <Lock style={{ width: 10, height: 10, color: "#888", position: "absolute", top: 3, right: 3 }} />}
          </button>
          <button
            className="bldr-interview"
            onClick={() => { if (!user || user.plan !== "pro") { onUpgrade("monthly"); return; } setInterviewModal(true); }}
            title="Interview Simulator — Premium feature"
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "#555", position: "relative", whiteSpace: "nowrap" }}
          >
            <Star style={{ width: 14, height: 14 }} /> Simulator
            {(!user || user.plan !== "pro") && <Crown style={{ width: 10, height: 10, color: "#b84a2e", position: "absolute", top: 3, right: 3 }} />}
          </button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <button
              onClick={onPDF}
              disabled={user && downloadsRemaining === 0}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: user && downloadsRemaining === 0 ? "#9ca3af" : "#1a2e4a", color: "#fff", border: "none", cursor: user && downloadsRemaining === 0 ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              <Download style={{ width: 14, height: 14 }} /> PDF
            </button>
            {user && downloadsRemaining !== Infinity && (
              <span style={{ fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.03em", color: downloadsRemaining === 0 ? "#dc2626" : downloadsRemaining <= 2 ? "#d97706" : "#6b7280", whiteSpace: "nowrap" }}>
                {downloadsRemaining === 0 ? "Limit reached" : `${downloadsRemaining} left today`}
              </span>
            )}
          </div>
          <button
            className="bldr-word"
            onClick={onWord}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", border: "1px solid #1a2e4a", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "#1a2e4a", position: "relative", whiteSpace: "nowrap" }}
          >
            {user?.plan === "pro" ? <Download style={{ width: 14, height: 14 }} /> : <Crown style={{ width: 14, height: 14, color: "#b84a2e" }} />} Word
          </button>
          {user ? (
            <div className="bldr-user" style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "8px", borderLeft: "1px solid #eee" }}>
              <button onClick={onOpenProfile} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: user.plan === "pro" ? "#b84a2e" : "#1a2e4a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>
                  {user.name[0].toUpperCase()}
                </div>
              </button>
              <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "#999" }}>
                <LogOut style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ) : (
            <button className="bldr-signup" onClick={onSignUp} style={{ padding: "7px 14px", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500, color: "#333", whiteSpace: "nowrap" }}>
              Sign up
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className={`bldr-tab-${mobileTab}`} style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* EDITOR PANEL */}
        <aside className="bldr-editor" style={{ width: "420px", minWidth: "420px", background: "#fff", borderRight: "1px solid #e5e5e5", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Section tabs */}
          <div style={{ borderBottom: "1px solid #e8e8e8", overflowX: "auto", flexShrink: 0, WebkitOverflowScrolling: "touch" }}>
            <div style={{ display: "flex", minWidth: "max-content" }}>
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => s.modal ? s.modal() : setActiveSection(s.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px", padding: "12px 14px",
                    fontSize: "0.75rem", fontWeight: 600, border: "none",
                    borderBottom: !s.modal && activeSection === s.id ? "2px solid #1a2e4a" : "2px solid transparent",
                    cursor: "pointer", background: "none",
                    color: s.modal ? "#555" : activeSection === s.id ? "#1a2e4a" : "#888",
                    whiteSpace: "nowrap", transition: "color 0.15s", minHeight: "44px"
                  }}
                >
                  {s.icon} {s.label}
                  {s.modal && <Crown style={{ width: 9, height: 9, color: "#b84a2e", marginLeft: 1 }} />}
                </button>
              ))}
            </div>
          </div>
          {/* Editor content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
            <Editor resume={resume} setResume={setResume} section={activeSection} templateId={templateId} onSelectTemplate={onSelectTemplate} user={user} />
          </div>
        </aside>

        {/* PREVIEW PANEL */}
        <main className="bldr-preview" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1.5rem", background: "#e8e3da" }}>
          {/* Preview-locked banner */}
          {isPreviewLocked && (
            <div style={{ width: "100%", maxWidth: "210mm", background: "#1a2e4a", color: "#fff", padding: "10px 16px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Crown style={{ width: 14, height: 14, color: "#f59e0b", flexShrink: 0 }} />
                <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                  Preview - <strong style={{ color: "#f59e0b" }}>{TEMPLATES.find(x => x.id === templateId)?.name}</strong> is a Pro template
                </span>
              </div>
              <button onClick={() => onUpgrade('monthly')} style={{ padding: "5px 14px", background: "#b84a2e", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
                Upgrade to Export <ArrowRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
          )}
          <div style={{ width: "100%", maxWidth: "210mm" }}>
            <style>{`
              @media (max-width: 640px) {
                #resume-preview-inner { transform: scale(0.72); transform-origin: top left; width: 138.9% !important; margin-bottom: calc((0.72 - 1) * 100%); }
                .bldr-preview-scale-wrap { overflow: hidden; }
              }
              @media (min-width: 641px) and (max-width: 900px) {
                #resume-preview-inner { transform: scale(0.85); transform-origin: top left; width: 117.6% !important; margin-bottom: calc((0.85 - 1) * 100%); }
              }
            `}</style>
            <div className="bldr-preview-scale-wrap">
              <div id="resume-preview-inner" style={{ background: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.18)", width: "100%" }}>
                <Template r={resume} />
              </div>
            </div>
            <div style={{ textAlign: "center", fontSize: "0.7rem", color: "#999", marginTop: "12px", paddingBottom: "3rem" }}>A4 &middot; 210 &times; 297 mm</div>
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR - hidden on desktop via CSS */}
      <div className="bldr-tabs-bar" style={{ display: "none", background: "#fff", borderTop: "2px solid #e5e5e5", height: "58px", position: "sticky", bottom: 0, zIndex: 40, flexShrink: 0 }}>
        <button onClick={() => setMobileTab("edit")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", border: "none", background: "none", cursor: "pointer", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: mobileTab === "edit" ? "#1a2e4a" : "#aaa", borderTop: mobileTab === "edit" ? "2px solid #1a2e4a" : "2px solid transparent", marginTop: "-2px" }}>
          <Edit3 style={{ width: 18, height: 18 }} /> Edit
        </button>
        <button onClick={() => setMobileTab("preview")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", border: "none", background: "none", cursor: "pointer", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: mobileTab === "preview" ? "#1a2e4a" : "#aaa", borderTop: mobileTab === "preview" ? "2px solid #1a2e4a" : "2px solid transparent", marginTop: "-2px" }}>
          <Eye style={{ width: 18, height: 18 }} /> Preview
        </button>
        <button onClick={onPDF} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", border: "none", background: "#1a2e4a", cursor: "pointer", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff" }}>
          <Download style={{ width: 18, height: 18 }} /> PDF
        </button>
        <button onClick={() => setJobModal(true)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", border: "none", background: "none", cursor: "pointer", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#888", position: "relative" }}>
          <Briefcase style={{ width: 16, height: 16 }} />
          {(!user || user.plan !== "pro") && <Crown style={{ width: 8, height: 8, color: "#b84a2e", position: "absolute", top: 5, right: "calc(50% - 12px)" }} />}
          Jobs
        </button>
        <button onClick={() => { if (!user) { onSignIn(); return; } setClModal(true); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", border: "none", background: "none", cursor: "pointer", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#888", position: "relative" }}>
          <Edit3 style={{ width: 16, height: 16 }} />
          {!user && <Lock style={{ width: 8, height: 8, color: "#888", position: "absolute", top: 5, right: "calc(50% - 12px)" }} />}
          Cover
        </button>
        <button onClick={() => { if (!user || user.plan !== "pro") { onUpgrade("monthly"); return; } setInterviewModal(true); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", border: "none", background: "none", cursor: "pointer", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#888", position: "relative" }}>
          <Star style={{ width: 16, height: 16 }} />
          {(!user || user.plan !== "pro") && <Crown style={{ width: 8, height: 8, color: "#b84a2e", position: "absolute", top: 5, right: "calc(50% - 12px)" }} />}
          Interview
        </button>
        <button onClick={user ? onOpenProfile : onSignUp} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", border: "none", background: "none", cursor: "pointer", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#888" }}>
          {user ? (
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: user.plan === "pro" ? "#b84a2e" : "#1a2e4a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>{user.name[0].toUpperCase()}</div>
          ) : (
            <User style={{ width: 18, height: 18 }} />
          )}
          {user ? "Profile" : "Sign in"}
        </button>
      </div>

      {atsOpen && <ATSModal ats={ats} onClose={() => setAtsOpen(false)} />}
      {jobModal && <JobSuggestionsModal resume={resume} user={user} onClose={() => setJobModal(false)} onUpgrade={onUpgrade} />}
      {clModal && <CoverLetterModal resume={resume} user={user} onClose={() => setClModal(false)} onUpgrade={onUpgrade} />}
      {interviewModal && <InterviewSimulator resume={resume} user={user} onClose={() => setInterviewModal(false)} onUpgrade={onUpgrade} />}
    </div>
  );
}
