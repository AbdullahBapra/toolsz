import type { TemplateProps, ResumeData, SectionKey } from "./types";

// ─── Shared helpers ────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export function fmtDate(d: string): string {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${MONTHS[(parseInt(m) || 1) - 1]} ${y}`;
}

function dateRange(start: string, end: string, current: boolean) {
  return `${fmtDate(start)} – ${current ? "Present" : fmtDate(end)}`;
}

const LEVEL_LABEL: Record<string, string> = {
  native: "Native", fluent: "Fluent", advanced: "Advanced",
  intermediate: "Intermediate", basic: "Basic",
};

// ─── 1. MODERN  (colored header + left sidebar) ────────────────────────────────

export function ModernTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color, borderBottom: `2px solid ${color}`, paddingBottom: 3, marginBottom: Math.round(7 * s), marginTop: Math.round(13 * s) }}>{t}</div>
  );
  const bullet = (b: string, i: number) => (
    <div key={i} style={{ display: "flex", gap: 5, marginBottom: 3 }}>
      <span style={{ color, fontSize: 10, marginTop: 1.5, flexShrink: 0 }}>▸</span>
      <span style={{ fontSize: 10.5, lineHeight: 1.5, color: "#374151" }}>{b}</span>
    </div>
  );
  const orderedSections = data.sectionOrder.filter(s => data.sectionVisible[s]);

  const sidebarSections: SectionKey[] = ["skills","education","certifications","languages","awards"];
  const mainSections: SectionKey[] = ["summary","experience","projects","volunteer","publications"];

  const sidebarOrder = orderedSections.filter(s => sidebarSections.includes(s));
  const mainOrder = orderedSections.filter(s => mainSections.includes(s));

  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, color: "#111" }}>
      <div style={{ background: color, padding: `${Math.round(26*s)}px 36px ${Math.round(22*s)}px`, color: "#fff" }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 70, height: 70, borderRadius: "50%", float: "right", border: "3px solid rgba(255,255,255,0.6)", objectFit: "cover" }} />}
        <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: 0.3 }}>{data.name || "Your Name"}</div>
        {data.title && <div style={{ fontSize: 12.5, opacity: 0.88, marginTop: 3 }}>{data.title}</div>}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "5px 16px", marginTop: 9, fontSize: 10, opacity: 0.85 }}>
          {data.email    && <span>✉ {data.email}</span>}
          {data.phone    && <span>☎ {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.linkedin && <span>in {data.linkedin}</span>}
          {data.github   && <span>⌥ {data.github}</span>}
          {data.website  && <span>🌐 {data.website}</span>}
        </div>
      </div>

      <div style={{ display: "flex", minHeight: 900 }}>
        <div style={{ width: 205, background: "#f8f9fb", padding: `${Math.round(18*s)}px 16px`, borderRight: "1px solid #e5e7eb", flexShrink: 0 }}>
          {sidebarOrder.map(key => {
            if (key === "skills" && data.skills.length) return (
              <div key={key}>{sec("Skills")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 3.5 }}>
                {data.skills.map((sk, i) => <span key={i} style={{ background: `${color}18`, color, fontSize: 9.5, padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>{sk}</span>)}
              </div></div>
            );
            if (key === "education" && data.education.length) return (
              <div key={key}>{sec("Education")}{data.education.map(e => (
                <div key={e.id} style={{ marginBottom: Math.round(9*s) }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700 }}>{e.school}</div>
                  <div style={{ fontSize: 10, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}</div>
                  {e.honors && <div style={{ fontSize: 9.5, color, fontStyle: "italic" }}>{e.honors}</div>}
                  <div style={{ fontSize: 9.5, color: "#6b7280" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
                </div>
              ))}</div>
            );
            if (key === "certifications" && data.certifications.length) return (
              <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: Math.round(7*s) }}>
                  <div style={{ fontSize: 10, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 9.5, color: "#6b7280" }}>{c.issuer}{c.date ? ` · ${fmtDate(c.date)}` : ""}</div>
                </div>
              ))}</div>
            );
            if (key === "languages" && data.languages.length) return (
              <div key={key}>{sec("Languages")}{data.languages.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{l.name}</span>
                  <span style={{ color: "#6b7280" }}>{LEVEL_LABEL[l.level] || l.level}</span>
                </div>
              ))}</div>
            );
            if (key === "awards" && data.awards.length) return (
              <div key={key}>{sec("Awards")}{data.awards.map(a => (
                <div key={a.id} style={{ marginBottom: Math.round(7*s) }}>
                  <div style={{ fontSize: 10, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontSize: 9.5, color: "#6b7280" }}>{a.issuer}{a.date ? ` · ${fmtDate(a.date)}` : ""}</div>
                  {a.description && <div style={{ fontSize: 9.5, color: "#374151", marginTop: 2 }}>{a.description}</div>}
                </div>
              ))}</div>
            );
            return null;
          })}
        </div>

        <div style={{ flex: 1, padding: `${Math.round(18*s)}px 26px` }}>
          {mainOrder.map(key => {
            if (key === "summary" && data.summary) return (
              <div key={key}>{sec("Professional Summary")}<p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#374151" }}>{data.summary}</p></div>
            );
            if (key === "experience" && data.experience.length) return (
              <div key={key}>{sec("Work Experience")}{data.experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: Math.round(11*s) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{exp.title}</div>
                      <div style={{ fontSize: 10.5, color, fontWeight: 600 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                    </div>
                    <div style={{ fontSize: 9.5, color: "#6b7280", textAlign: "right" as const, flexShrink: 0, marginLeft: 8 }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                  </div>
                  <div style={{ marginTop: 4 }}>{exp.bullets.filter(Boolean).map(bullet)}</div>
                </div>
              ))}</div>
            );
            if (key === "projects" && data.projects.length) return (
              <div key={key}>{sec("Projects")}{data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: Math.round(8*s) }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{p.name}{p.link ? <span style={{ fontSize: 9.5, color, fontWeight: 400, marginLeft: 6 }}>{p.link}</span> : null}</div>
                  {p.tech && <div style={{ fontSize: 9.5, color, marginBottom: 2 }}>{p.tech}</div>}
                  <div style={{ fontSize: 10.5, color: "#374151" }}>{p.description}</div>
                </div>
              ))}</div>
            );
            if (key === "volunteer" && data.volunteer.length) return (
              <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
                <div key={v.id} style={{ marginBottom: Math.round(8*s) }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                    <div style={{ fontSize: 9.5, color: "#6b7280" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
                  </div>
                  {v.description && <div style={{ fontSize: 10.5, color: "#374151", marginTop: 2 }}>{v.description}</div>}
                </div>
              ))}</div>
            );
            if (key === "publications" && data.publications.length) return (
              <div key={key}>{sec("Publications")}{data.publications.map(p => (
                <div key={p.id} style={{ marginBottom: Math.round(7*s) }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600 }}>{p.title}</span>
                  {p.publisher && <span style={{ fontSize: 10, color: "#6b7280" }}> — {p.publisher}</span>}
                  {p.date && <span style={{ fontSize: 9.5, color: "#6b7280" }}> ({fmtDate(p.date)})</span>}
                </div>
              ))}</div>
            );
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 2. CLASSIC  (centered serif header, single column) ────────────────────────

export function ClassicTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color, borderBottom: `1.5px solid ${color}`, paddingBottom: 4, marginBottom: Math.round(8*s), marginTop: Math.round(15*s) }}>{t}</div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, padding: `${Math.round(34*s)}px 50px`, color: "#111" }}>
      <div style={{ textAlign: "center" as const, marginBottom: Math.round(16*s), borderBottom: `2px solid ${color}`, paddingBottom: Math.round(13*s) }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px", display: "block", border: `3px solid ${color}` }} />}
        <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: 1, color }}>{data.name || "Your Name"}</div>
        {data.title && <div style={{ fontSize: 13, color: "#555", marginTop: 4, fontStyle: "italic" }}>{data.title}</div>}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" as const, gap: "4px 14px", marginTop: 7, fontSize: 10.5, color: "#555" }}>
          {data.email && <span>{data.email}</span>}{data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}{data.linkedin && <span>{data.linkedin}</span>}
          {data.github && <span>{data.github}</span>}{data.website && <span>{data.website}</span>}
        </div>
      </div>

      {orderedSections.map(key => {
        if (key === "summary" && data.summary) return <div key={key}>{sec("Professional Summary")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151" }}>{data.summary}</p></div>;
        if (key === "experience" && data.experience.length) return (
          <div key={key}>{sec("Work Experience")}{data.experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: Math.round(13*s) }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{exp.title}</div>
                <div style={{ fontSize: 10.5, color: "#555" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
              </div>
              <div style={{ fontSize: 11, color, fontStyle: "italic", marginBottom: 4 }}>{exp.company}{exp.location ? `, ${exp.location}` : ""}</div>
              {exp.bullets.filter(Boolean).map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
                  <span style={{ color: "#555", fontSize: 11, flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: 11, lineHeight: 1.55, color: "#374151" }}>{b}</span>
                </div>
              ))}
            </div>
          ))}</div>
        );
        if (key === "education" && data.education.length) return (
          <div key={key}>{sec("Education")}{data.education.map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(8*s) }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{e.school}</div>
                <div style={{ fontSize: 11, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.honors ? ` · ${e.honors}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
              </div>
              <div style={{ fontSize: 10.5, color: "#555", textAlign: "right" as const }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
            </div>
          ))}</div>
        );
        if (key === "skills" && data.skills.length) return <div key={key}>{sec("Skills")}<p style={{ fontSize: 11, color: "#374151", lineHeight: 1.7 }}>{data.skills.join(" · ")}</p></div>;
        if (key === "certifications" && data.certifications.length) return (
          <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
            <div key={c.id} style={{ fontSize: 11, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span><strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ""}</span>
              {c.date && <span style={{ color: "#555" }}>{fmtDate(c.date)}</span>}
            </div>
          ))}</div>
        );
        if (key === "projects" && data.projects.length) return (
          <div key={key}>{sec("Projects")}{data.projects.map(p => (
            <div key={p.id} style={{ marginBottom: Math.round(8*s) }}>
              <span style={{ fontSize: 11.5, fontWeight: 700 }}>{p.name}</span>
              {p.tech && <span style={{ fontSize: 10, color, marginLeft: 8, fontStyle: "italic" }}>{p.tech}</span>}
              {p.link && <span style={{ fontSize: 10, color, marginLeft: 8 }}>{p.link}</span>}
              <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>{p.description}</div>
            </div>
          ))}</div>
        );
        if (key === "languages" && data.languages.length) return (
          <div key={key}>{sec("Languages")}<div style={{ display: "flex", gap: "4px 18px", flexWrap: "wrap" as const }}>
            {data.languages.map(l => <span key={l.id} style={{ fontSize: 11 }}><strong>{l.name}</strong> — {LEVEL_LABEL[l.level] || l.level}</span>)}
          </div></div>
        );
        if (key === "awards" && data.awards.length) return (
          <div key={key}>{sec("Awards & Honors")}{data.awards.map(a => (
            <div key={a.id} style={{ fontSize: 11, marginBottom: 5 }}>
              <strong>{a.title}</strong>{a.issuer ? ` — ${a.issuer}` : ""}{a.date ? ` (${fmtDate(a.date)})` : ""}
              {a.description && <div style={{ color: "#374151", marginTop: 1 }}>{a.description}</div>}
            </div>
          ))}</div>
        );
        if (key === "volunteer" && data.volunteer.length) return (
          <div key={key}>{sec("Volunteer Experience")}{data.volunteer.map(v => (
            <div key={v.id} style={{ marginBottom: Math.round(8*s) }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{v.role}</div>
                <div style={{ fontSize: 10.5, color: "#555" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
              </div>
              <div style={{ fontSize: 11, color, fontStyle: "italic" }}>{v.org}</div>
              {v.description && <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>{v.description}</div>}
            </div>
          ))}</div>
        );
        if (key === "publications" && data.publications.length) return (
          <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
            <div key={p.id} style={{ fontSize: 11, marginBottom: 5 }}>
              [{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}
            </div>
          ))}</div>
        );
        return null;
      })}
    </div>
  );
}

// ─── 3. ATS-SAFE  (plain, no color, no columns) ───────────────────────────────

export function ATSTemplate({ data, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, margin: `${Math.round(12*s)}px 0 5px`, borderBottom: "1px solid #000", paddingBottom: 2 }}>{t}</div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: `Arial,Helvetica,${font},sans-serif`, background: "#fff", minHeight: 1123, padding: `${Math.round(30*s)}px 46px`, color: "#000" }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{data.name || "Your Name"}</div>
      {data.title && <div style={{ fontSize: 13, marginBottom: 5 }}>{data.title}</div>}
      <div style={{ fontSize: 11, marginBottom: Math.round(13*s), color: "#222" }}>
        {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).join(" | ")}
      </div>

      {orderedSections.map(key => {
        if (key === "summary" && data.summary) return (
          <div key={key}>{sec("Summary")}<p style={{ fontSize: 11, lineHeight: 1.65, marginBottom: 10 }}>{data.summary}</p></div>
        );
        if (key === "experience" && data.experience.length) return (
          <div key={key}>{sec("Work Experience")}{data.experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: Math.round(11*s) }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{exp.title} — {exp.company}{exp.location ? `, ${exp.location}` : ""}</div>
              <div style={{ fontSize: 11, color: "#333", marginBottom: 3 }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
              {exp.bullets.filter(Boolean).map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2 }}><span style={{ flexShrink: 0 }}>-</span><span style={{ fontSize: 11, lineHeight: 1.5 }}>{b}</span></div>
              ))}
            </div>
          ))}</div>
        );
        if (key === "education" && data.education.length) return (
          <div key={key}>{sec("Education")}{data.education.map(e => (
            <div key={e.id} style={{ marginBottom: 6, fontSize: 11 }}>
              <strong>{e.degree}{e.field ? ` in ${e.field}` : ""}</strong> — {e.school}
              {(e.startDate || e.endDate) && <span style={{ color: "#333" }}> ({fmtDate(e.startDate)}{e.endDate ? ` - ${fmtDate(e.endDate)}` : ""})</span>}
              {e.gpa && <span> | GPA: {e.gpa}</span>}
              {e.honors && <span> | {e.honors}</span>}
            </div>
          ))}</div>
        );
        if (key === "skills" && data.skills.length) return (
          <div key={key}>{sec("Skills")}<p style={{ fontSize: 11, lineHeight: 1.6 }}>{data.skills.join(", ")}</p></div>
        );
        if (key === "certifications" && data.certifications.length) return (
          <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
            <div key={c.id} style={{ fontSize: 11, marginBottom: 3 }}>{c.name}{c.issuer ? ` — ${c.issuer}` : ""}{c.date ? ` (${fmtDate(c.date)})` : ""}</div>
          ))}</div>
        );
        if (key === "projects" && data.projects.length) return (
          <div key={key}>{sec("Projects")}{data.projects.map(p => (
            <div key={p.id} style={{ marginBottom: 6, fontSize: 11 }}>
              <strong>{p.name}</strong>{p.tech ? ` [${p.tech}]` : ""}{p.link ? ` (${p.link})` : ""}: {p.description}
            </div>
          ))}</div>
        );
        if (key === "languages" && data.languages.length) return (
          <div key={key}>{sec("Languages")}<p style={{ fontSize: 11 }}>{data.languages.map(l => `${l.name} (${LEVEL_LABEL[l.level] || l.level})`).join(", ")}</p></div>
        );
        if (key === "awards" && data.awards.length) return (
          <div key={key}>{sec("Awards")}{data.awards.map(a => (
            <div key={a.id} style={{ fontSize: 11, marginBottom: 3 }}>{a.title}{a.issuer ? ` — ${a.issuer}` : ""}{a.date ? ` (${fmtDate(a.date)})` : ""}{a.description ? `: ${a.description}` : ""}</div>
          ))}</div>
        );
        if (key === "volunteer" && data.volunteer.length) return (
          <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
            <div key={v.id} style={{ marginBottom: 6, fontSize: 11 }}>
              <strong>{v.role}</strong> — {v.org} ({dateRange(v.startDate, v.endDate, v.current)}){v.description ? `: ${v.description}` : ""}
            </div>
          ))}</div>
        );
        if (key === "publications" && data.publications.length) return (
          <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
            <div key={p.id} style={{ fontSize: 11, marginBottom: 3 }}>[{i+1}] {p.title}{p.publisher ? `, ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}</div>
          ))}</div>
        );
        return null;
      })}
    </div>
  );
}

// ─── 4. EXECUTIVE  (left accent bar, premium single column) ───────────────────

export function ExecutiveTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: Math.round(14*s), marginBottom: Math.round(8*s) }}>
      <div style={{ width: 4, height: 16, background: color, borderRadius: 2, flexShrink: 0 }} />
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase" as const, color: "#111" }}>{t}</div>
      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
    </div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, color: "#111" }}>
      <div style={{ background: "#1a1a2e", padding: `${Math.round(28*s)}px 44px`, borderTop: `6px solid ${color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {data.photo && <img src={data.photo} alt="" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: `3px solid ${color}`, marginBottom: 8 }} />}
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>{data.name || "Your Name"}</div>
            {data.title && <div style={{ fontSize: 12, color, marginTop: 5, letterSpacing: 1, textTransform: "uppercase" as const, fontWeight: 600 }}>{data.title}</div>}
          </div>
          <div style={{ textAlign: "right" as const, fontSize: 10.5, color: "rgba(255,255,255,0.65)", lineHeight: 2 }}>
            {data.email && <div>{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
            {data.linkedin && <div>{data.linkedin}</div>}
            {data.github && <div>{data.github}</div>}
            {data.website && <div>{data.website}</div>}
          </div>
        </div>
      </div>
      <div style={{ padding: `${Math.round(20*s)}px 44px ${Math.round(30*s)}px` }}>
        {orderedSections.map(key => {
          if (key === "summary" && data.summary) return (
            <div key={key}>{sec("Executive Summary")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151", paddingLeft: 14 }}>{data.summary}</p></div>
          );
          if (key === "experience" && data.experience.length) return (
            <div key={key}>{sec("Professional Experience")}{data.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: Math.round(13*s), paddingLeft: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111" }}>{exp.title}</div>
                    <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 1 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                </div>
                <div style={{ marginTop: 5 }}>
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                      <span style={{ color, fontSize: 9, marginTop: 3, flexShrink: 0 }}>◆</span>
                      <span style={{ fontSize: 11, lineHeight: 1.55, color: "#374151" }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}</div>
          );
          if (key === "education" && data.education.length) return (
            <div key={key}>{sec("Education")}{data.education.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(8*s), paddingLeft: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{e.school}</div>
                  <div style={{ fontSize: 11, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.honors ? ` · ${e.honors}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
                </div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "skills" && data.skills.length) return (
            <div key={key}>{sec("Core Competencies")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, paddingLeft: 14 }}>
              {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 10.5, padding: "3px 10px", border: `1px solid ${color}`, borderRadius: 3, color, fontWeight: 500 }}>{sk}</span>)}
            </div></div>
          );
          if (key === "certifications" && data.certifications.length) return (
            <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
              <div key={c.id} style={{ paddingLeft: 14, marginBottom: 5, fontSize: 11 }}>
                <strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ""}{c.date ? ` (${fmtDate(c.date)})` : ""}
              </div>
            ))}</div>
          );
          if (key === "projects" && data.projects.length) return (
            <div key={key}>{sec("Key Projects")}{data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: Math.round(8*s), paddingLeft: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 10, color, fontWeight: 400, marginLeft: 6 }}>[{p.tech}]</span> : null}</div>
                {p.link && <div style={{ fontSize: 9.5, color, marginBottom: 2 }}>{p.link}</div>}
                <div style={{ fontSize: 11, color: "#374151" }}>{p.description}</div>
              </div>
            ))}</div>
          );
          if (key === "languages" && data.languages.length) return (
            <div key={key}>{sec("Languages")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px 20px", paddingLeft: 14 }}>
              {data.languages.map(l => <span key={l.id} style={{ fontSize: 11 }}><strong>{l.name}</strong> · {LEVEL_LABEL[l.level] || l.level}</span>)}
            </div></div>
          );
          if (key === "awards" && data.awards.length) return (
            <div key={key}>{sec("Awards & Recognition")}{data.awards.map(a => (
              <div key={a.id} style={{ paddingLeft: 14, marginBottom: 5, fontSize: 11 }}>
                <strong>{a.title}</strong>{a.issuer ? ` — ${a.issuer}` : ""}{a.date ? ` (${fmtDate(a.date)})` : ""}
                {a.description && <div style={{ color: "#374151", marginTop: 1 }}>{a.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "volunteer" && data.volunteer.length) return (
            <div key={key}>{sec("Volunteer & Community")}{data.volunteer.map(v => (
              <div key={v.id} style={{ marginBottom: Math.round(7*s), paddingLeft: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
                </div>
                {v.description && <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>{v.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "publications" && data.publications.length) return (
            <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
              <div key={p.id} style={{ paddingLeft: 14, fontSize: 11, marginBottom: 4 }}>
                [{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}
              </div>
            ))}</div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ─── 5. SIDELINE  (large colored left sidebar) ────────────────────────────────

export function SidelineTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sideSec = (t: string) => (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.25)", paddingBottom: 4, marginTop: Math.round(16*s), marginBottom: Math.round(8*s) }}>{t}</div>
  );
  const mainSec = (t: string) => (
    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" as const, color, borderBottom: `2px solid ${color}40`, paddingBottom: 3, marginTop: Math.round(14*s), marginBottom: Math.round(7*s) }}>{t}</div>
  );

  const sidebarSections: SectionKey[] = ["skills","languages","certifications","awards"];
  const mainSections: SectionKey[] = ["summary","experience","education","projects","volunteer","publications"];
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  const sideOrder = orderedSections.filter(s => sidebarSections.includes(s));
  const mainOrder = orderedSections.filter(s => mainSections.includes(s));

  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, display: "flex", color: "#111" }}>
      {/* Sidebar */}
      <div style={{ width: 230, background: color, padding: `${Math.round(28*s)}px 20px`, flexShrink: 0 }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto 12px", border: "3px solid rgba(255,255,255,0.5)" }} />}
        <div style={{ fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>{data.name || "Your Name"}</div>
        {data.title && <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.75)", marginTop: 5, lineHeight: 1.5 }}>{data.title}</div>}

        {sideSec("Contact")}
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", lineHeight: 2 }}>
          {data.email    && <div>✉ {data.email}</div>}
          {data.phone    && <div>☎ {data.phone}</div>}
          {data.location && <div>📍 {data.location}</div>}
          {data.linkedin && <div>in {data.linkedin}</div>}
          {data.github   && <div>⌥ {data.github}</div>}
          {data.website  && <div>🌐 {data.website}</div>}
        </div>

        {sideOrder.map(key => {
          if (key === "skills" && data.skills.length) return (
            <div key={key}>{sideSec("Skills")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
              {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 9, padding: "2px 7px", background: "rgba(255,255,255,0.18)", color: "#fff", borderRadius: 10, marginBottom: 2 }}>{sk}</span>)}
            </div></div>
          );
          if (key === "languages" && data.languages.length) return (
            <div key={key}>{sideSec("Languages")}{data.languages.map(l => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.9)", marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{l.name}</span><span style={{ opacity: 0.7 }}>{LEVEL_LABEL[l.level] || l.level}</span>
              </div>
            ))}</div>
          );
          if (key === "certifications" && data.certifications.length) return (
            <div key={key}>{sideSec("Certifications")}{data.certifications.map(c => (
              <div key={c.id} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: "#fff" }}>{c.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.65)" }}>{c.issuer}{c.date ? ` · ${fmtDate(c.date)}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "awards" && data.awards.length) return (
            <div key={key}>{sideSec("Awards")}{data.awards.map(a => (
              <div key={a.id} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: "#fff" }}>{a.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.65)" }}>{a.issuer}{a.date ? ` · ${fmtDate(a.date)}` : ""}</div>
              </div>
            ))}</div>
          );
          return null;
        })}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: `${Math.round(28*s)}px 28px` }}>
        {mainOrder.map(key => {
          if (key === "summary" && data.summary) return (
            <div key={key}>{mainSec("About Me")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151" }}>{data.summary}</p></div>
          );
          if (key === "experience" && data.experience.length) return (
            <div key={key}>{mainSec("Experience")}{data.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: Math.round(12*s) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{exp.title}</div>
                    <div style={{ fontSize: 10.5, color, fontWeight: 500 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 9.5, color: "#6b7280", flexShrink: 0, marginLeft: 8 }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                </div>
                <div style={{ marginTop: 4 }}>
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                      <span style={{ color, fontSize: 10, flexShrink: 0, marginTop: 1 }}>–</span>
                      <span style={{ fontSize: 11, lineHeight: 1.5, color: "#374151" }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}</div>
          );
          if (key === "education" && data.education.length) return (
            <div key={key}>{mainSec("Education")}{data.education.map(e => (
              <div key={e.id} style={{ marginBottom: Math.round(8*s) }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{e.school}</div>
                  <div style={{ fontSize: 9.5, color: "#6b7280" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                </div>
                <div style={{ fontSize: 11, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.honors ? ` · ${e.honors}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "projects" && data.projects.length) return (
            <div key={key}>{mainSec("Projects")}{data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: Math.round(8*s) }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 9.5, color, marginLeft: 8, fontWeight: 400 }}>{p.tech}</span> : null}</div>
                {p.link && <div style={{ fontSize: 9.5, color, marginBottom: 2 }}>{p.link}</div>}
                <div style={{ fontSize: 11, color: "#374151" }}>{p.description}</div>
              </div>
            ))}</div>
          );
          if (key === "volunteer" && data.volunteer.length) return (
            <div key={key}>{mainSec("Volunteer")}{data.volunteer.map(v => (
              <div key={v.id} style={{ marginBottom: Math.round(7*s) }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                  <div style={{ fontSize: 9.5, color: "#6b7280" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
                </div>
                {v.description && <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>{v.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "publications" && data.publications.length) return (
            <div key={key}>{mainSec("Publications")}{data.publications.map((p, i) => (
              <div key={p.id} style={{ fontSize: 11, marginBottom: 4 }}>
                [{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}
              </div>
            ))}</div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ─── 6. MINIMAL  (ultra-clean, generous whitespace) ───────────────────────────

export function MinimalTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase" as const, color: "#9ca3af", marginTop: Math.round(20*s), marginBottom: Math.round(10*s) }}>{t}</div>
  );
  const divider = <div style={{ height: 1, background: "#f3f4f6", margin: `${Math.round(6*s)}px 0` }} />;
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);

  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, padding: `${Math.round(48*s)}px 64px`, color: "#111" }}>
      <div style={{ marginBottom: Math.round(32*s) }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", marginBottom: 12 }} />}
        <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: -0.5, color: "#111" }}>{data.name || "Your Name"}</div>
        {data.title && <div style={{ fontSize: 13.5, color, marginTop: 6, fontWeight: 500 }}>{data.title}</div>}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px 20px", marginTop: 10, fontSize: 10.5, color: "#9ca3af" }}>
          {data.email    && <span>{data.email}</span>}
          {data.phone    && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
          {data.github   && <span>{data.github}</span>}
          {data.website  && <span>{data.website}</span>}
        </div>
      </div>

      {orderedSections.map(key => {
        if (key === "summary" && data.summary) return (
          <div key={key}>{sec("About")}<p style={{ fontSize: 12, lineHeight: 1.8, color: "#4b5563", maxWidth: 600 }}>{data.summary}</p></div>
        );
        if (key === "experience" && data.experience.length) return (
          <div key={key}>{sec("Experience")}{data.experience.map((exp, idx) => (
            <div key={exp.id}>
              {idx > 0 && divider}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{exp.title}</div>
                  <div style={{ fontSize: 11, color, marginTop: 1 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
              </div>
              <div style={{ marginTop: 6, marginBottom: Math.round(10*s) }}>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    <span style={{ color, fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>·</span>
                    <span style={{ fontSize: 11.5, lineHeight: 1.6, color: "#4b5563" }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}</div>
        );
        if (key === "education" && data.education.length) return (
          <div key={key}>{sec("Education")}{data.education.map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(10*s) }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{e.school}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.honors ? ` · ${e.honors}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
            </div>
          ))}</div>
        );
        if (key === "skills" && data.skills.length) return (
          <div key={key}>{sec("Skills")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
            {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 11, color: "#374151", padding: "3px 10px", border: "1px solid #e5e7eb", borderRadius: 20 }}>{sk}</span>)}
          </div></div>
        );
        if (key === "certifications" && data.certifications.length) return (
          <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
            <div key={c.id} style={{ fontSize: 11.5, marginBottom: 5, color: "#374151" }}>
              <span style={{ fontWeight: 600 }}>{c.name}</span>{c.issuer ? <span style={{ color: "#9ca3af" }}> · {c.issuer}</span> : null}{c.date ? <span style={{ color: "#9ca3af" }}> · {fmtDate(c.date)}</span> : null}
            </div>
          ))}</div>
        );
        if (key === "projects" && data.projects.length) return (
          <div key={key}>{sec("Projects")}{data.projects.map(p => (
            <div key={p.id} style={{ marginBottom: Math.round(10*s) }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                {p.tech && <span style={{ fontSize: 10, color: "#9ca3af" }}>{p.tech}</span>}
              </div>
              {p.link && <div style={{ fontSize: 10, color, marginBottom: 3 }}>{p.link}</div>}
              <div style={{ fontSize: 11.5, color: "#4b5563", lineHeight: 1.6 }}>{p.description}</div>
            </div>
          ))}</div>
        );
        if (key === "languages" && data.languages.length) return (
          <div key={key}>{sec("Languages")}<div style={{ display: "flex", gap: "6px 24px", flexWrap: "wrap" as const }}>
            {data.languages.map(l => <span key={l.id} style={{ fontSize: 11.5 }}><span style={{ fontWeight: 600 }}>{l.name}</span> <span style={{ color: "#9ca3af" }}>{LEVEL_LABEL[l.level] || l.level}</span></span>)}
          </div></div>
        );
        if (key === "awards" && data.awards.length) return (
          <div key={key}>{sec("Awards")}{data.awards.map(a => (
            <div key={a.id} style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{a.title}</span>
              <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 10 }}>{a.issuer}{a.date ? ` · ${fmtDate(a.date)}` : ""}</span>
              {a.description && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{a.description}</div>}
            </div>
          ))}</div>
        );
        if (key === "volunteer" && data.volunteer.length) return (
          <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
            <div key={v.id} style={{ marginBottom: Math.round(8*s) }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{v.role} <span style={{ color, fontWeight: 400 }}>{v.org}</span></div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
              </div>
              {v.description && <div style={{ fontSize: 11.5, color: "#4b5563", marginTop: 2 }}>{v.description}</div>}
            </div>
          ))}</div>
        );
        if (key === "publications" && data.publications.length) return (
          <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
            <div key={p.id} style={{ fontSize: 11.5, marginBottom: 5, color: "#374151" }}>
              [{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}
            </div>
          ))}</div>
        );
        return null;
      })}
    </div>
  );
}

// ─── 7. BOLD  (strong visual hierarchy, large section numbers) ────────────────

export function BoldTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  let secCount = 0;
  const sec = (t: string) => {
    secCount++;
    const n = secCount;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: Math.round(18*s), marginBottom: Math.round(9*s) }}>
        <div style={{ width: 28, height: 28, background: color, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>{String(n).padStart(2,"0")}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: 1.5, color: "#111" }}>{t}</div>
      </div>
    );
  };
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);

  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, color: "#111" }}>
      <div style={{ padding: `${Math.round(30*s)}px 44px ${Math.round(20*s)}px`, borderBottom: `5px solid ${color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            {data.photo && <img src={data.photo} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", marginBottom: 8 }} />}
            <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1 }}>{data.name || "Your Name"}</div>
            {data.title && <div style={{ fontSize: 14, color, fontWeight: 700, marginTop: 6, letterSpacing: 0.5 }}>{data.title}</div>}
          </div>
          <div style={{ textAlign: "right" as const, fontSize: 10.5, color: "#6b7280", lineHeight: 1.9 }}>
            {data.email && <div>{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
            {data.linkedin && <div>{data.linkedin}</div>}
            {data.github && <div>{data.github}</div>}
          </div>
        </div>
      </div>
      <div style={{ padding: `0 44px ${Math.round(30*s)}px` }}>
        {orderedSections.map(key => {
          if (key === "summary" && data.summary) return (
            <div key={key}>{sec("Profile")}<p style={{ fontSize: 11.5, lineHeight: 1.75, color: "#4b5563" }}>{data.summary}</p></div>
          );
          if (key === "experience" && data.experience.length) return (
            <div key={key}>{sec("Experience")}{data.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: Math.round(12*s), paddingLeft: 40, borderLeft: `3px solid ${color}20` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{exp.title}</div>
                    <div style={{ fontSize: 11.5, color, fontWeight: 600 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 10, background: `${color}15`, color, padding: "2px 8px", borderRadius: 4, height: "fit-content", fontWeight: 600 }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                </div>
                <div style={{ marginTop: 5 }}>
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, marginBottom: 3 }}>
                      <span style={{ color, fontSize: 12, flexShrink: 0, fontWeight: 900, marginTop: -1 }}>→</span>
                      <span style={{ fontSize: 11, lineHeight: 1.55, color: "#374151" }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}</div>
          );
          if (key === "education" && data.education.length) return (
            <div key={key}>{sec("Education")}{data.education.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(9*s), paddingLeft: 40 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{e.school}</div>
                  <div style={{ fontSize: 11.5, color: "#4b5563" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.honors ? ` · ${e.honors}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
                </div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "skills" && data.skills.length) return (
            <div key={key}>{sec("Skills")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7, paddingLeft: 40 }}>
              {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", background: `${color}15`, color, borderRadius: 4 }}>{sk}</span>)}
            </div></div>
          );
          if (key === "certifications" && data.certifications.length) return (
            <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
              <div key={c.id} style={{ fontSize: 11.5, marginBottom: 5, paddingLeft: 40 }}>
                <strong>{c.name}</strong>{c.issuer ? ` · ${c.issuer}` : ""}{c.date ? ` · ${fmtDate(c.date)}` : ""}
              </div>
            ))}</div>
          );
          if (key === "projects" && data.projects.length) return (
            <div key={key}>{sec("Projects")}{data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: Math.round(9*s), paddingLeft: 40 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{p.name}{p.tech ? <span style={{ fontSize: 10, color, fontWeight: 500, marginLeft: 8 }}>{p.tech}</span> : null}</div>
                {p.link && <div style={{ fontSize: 9.5, color, marginBottom: 3 }}>{p.link}</div>}
                <div style={{ fontSize: 11, color: "#4b5563" }}>{p.description}</div>
              </div>
            ))}</div>
          );
          if (key === "languages" && data.languages.length) return (
            <div key={key}>{sec("Languages")}<div style={{ display: "flex", gap: "6px 24px", flexWrap: "wrap" as const, paddingLeft: 40 }}>
              {data.languages.map(l => <span key={l.id} style={{ fontSize: 12 }}><strong>{l.name}</strong> <span style={{ color: "#6b7280", fontSize: 10 }}>{LEVEL_LABEL[l.level] || l.level}</span></span>)}
            </div></div>
          );
          if (key === "awards" && data.awards.length) return (
            <div key={key}>{sec("Awards")}{data.awards.map(a => (
              <div key={a.id} style={{ paddingLeft: 40, marginBottom: 6 }}>
                <strong style={{ fontSize: 12 }}>{a.title}</strong>
                <span style={{ fontSize: 10, color: "#6b7280", marginLeft: 10 }}>{a.issuer}{a.date ? ` · ${fmtDate(a.date)}` : ""}</span>
                {a.description && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{a.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "volunteer" && data.volunteer.length) return (
            <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
              <div key={v.id} style={{ marginBottom: Math.round(8*s), paddingLeft: 40 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
                </div>
                {v.description && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{v.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "publications" && data.publications.length) return (
            <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
              <div key={p.id} style={{ paddingLeft: 40, fontSize: 11.5, marginBottom: 4, color: "#374151" }}>
                [{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}
              </div>
            ))}</div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ─── 8. ELEGANT  (thin lines, refined typography) ────────────────────────────

export function ElegantTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: Math.round(16*s), marginBottom: Math.round(8*s) }}>
      <div style={{ width: 20, height: 1.5, background: color }} />
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase" as const, color: "#6b7280" }}>{t}</div>
      <div style={{ flex: 1, height: 0.5, background: "#e5e7eb" }} />
    </div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, padding: `${Math.round(36*s)}px 52px`, color: "#111" }}>
      <div style={{ textAlign: "center" as const, paddingBottom: Math.round(18*s), position: "relative" }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", margin: "0 auto 10px", display: "block" }} />}
        <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: 3, textTransform: "uppercase" as const, color: "#111" }}>{data.name || "Your Name"}</div>
        {data.title && <div style={{ fontSize: 11.5, color, marginTop: 6, letterSpacing: 2, fontWeight: 500, textTransform: "uppercase" as const }}>{data.title}</div>}
        <div style={{ width: 40, height: 1.5, background: color, margin: `${Math.round(10*s)}px auto` }} />
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" as const, gap: "4px 16px", fontSize: 10, color: "#9ca3af", letterSpacing: 0.5 }}>
          {data.email && <span>{data.email}</span>}{data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}{data.linkedin && <span>{data.linkedin}</span>}
          {data.github && <span>{data.github}</span>}{data.website && <span>{data.website}</span>}
        </div>
      </div>

      {orderedSections.map(key => {
        if (key === "summary" && data.summary) return (
          <div key={key}>{sec("Profile")}<p style={{ fontSize: 11.5, lineHeight: 1.8, color: "#4b5563", fontStyle: "italic", textAlign: "center" as const }}>{data.summary}</p></div>
        );
        if (key === "experience" && data.experience.length) return (
          <div key={key}>{sec("Experience")}{data.experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: Math.round(13*s) }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111" }}>{exp.title}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", fontStyle: "italic" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
              </div>
              <div style={{ fontSize: 11, color, fontStyle: "italic", marginBottom: 4 }}>{exp.company}{exp.location ? `, ${exp.location}` : ""}</div>
              {exp.bullets.filter(Boolean).map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
                  <span style={{ color, fontSize: 8, flexShrink: 0, marginTop: 3 }}>✦</span>
                  <span style={{ fontSize: 11, lineHeight: 1.6, color: "#4b5563" }}>{b}</span>
                </div>
              ))}
            </div>
          ))}</div>
        );
        if (key === "education" && data.education.length) return (
          <div key={key}>{sec("Education")}{data.education.map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(8*s) }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{e.school}</div>
                <div style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.honors ? ` · ${e.honors}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "right" as const }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
            </div>
          ))}</div>
        );
        if (key === "skills" && data.skills.length) return (
          <div key={key}>{sec("Skills")}<p style={{ fontSize: 11, color: "#4b5563", lineHeight: 2, textAlign: "center" as const }}>{data.skills.join("  ·  ")}</p></div>
        );
        if (key === "certifications" && data.certifications.length) return (
          <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
            <div key={c.id} style={{ fontSize: 11, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span><em>{c.name}</em>{c.issuer ? `, ${c.issuer}` : ""}</span>
              {c.date && <span style={{ color: "#9ca3af" }}>{fmtDate(c.date)}</span>}
            </div>
          ))}</div>
        );
        if (key === "projects" && data.projects.length) return (
          <div key={key}>{sec("Projects")}{data.projects.map(p => (
            <div key={p.id} style={{ marginBottom: Math.round(9*s) }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}{p.tech ? <span style={{ fontSize: 10, color, fontStyle: "italic", marginLeft: 8 }}>{p.tech}</span> : null}</div>
              {p.link && <div style={{ fontSize: 10, color, marginBottom: 2, fontStyle: "italic" }}>{p.link}</div>}
              <div style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.6 }}>{p.description}</div>
            </div>
          ))}</div>
        );
        if (key === "languages" && data.languages.length) return (
          <div key={key}>{sec("Languages")}<p style={{ fontSize: 11, textAlign: "center" as const, color: "#4b5563" }}>{data.languages.map(l => `${l.name} (${LEVEL_LABEL[l.level] || l.level})`).join("  ·  ")}</p></div>
        );
        if (key === "awards" && data.awards.length) return (
          <div key={key}>{sec("Awards")}{data.awards.map(a => (
            <div key={a.id} style={{ marginBottom: 5, fontSize: 11 }}>
              <em>{a.title}</em>{a.issuer ? ` — ${a.issuer}` : ""}{a.date ? ` (${fmtDate(a.date)})` : ""}
              {a.description && <div style={{ color: "#6b7280", marginTop: 1 }}>{a.description}</div>}
            </div>
          ))}</div>
        );
        if (key === "volunteer" && data.volunteer.length) return (
          <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
            <div key={v.id} style={{ marginBottom: Math.round(7*s) }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{v.role} <span style={{ color, fontStyle: "italic", fontWeight: 400 }}>at {v.org}</span></div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
              </div>
              {v.description && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{v.description}</div>}
            </div>
          ))}</div>
        );
        if (key === "publications" && data.publications.length) return (
          <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
            <div key={p.id} style={{ fontSize: 11, marginBottom: 4, color: "#4b5563" }}>
              [{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}
            </div>
          ))}</div>
        );
        return null;
      })}
    </div>
  );
}

// ─── 9. ACADEMIC  (dense CV format) ──────────────────────────────────────────

export function AcademicTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, color, borderBottom: `2px double ${color}`, paddingBottom: 3, marginTop: Math.round(14*s), marginBottom: Math.round(7*s), letterSpacing: 0.5 }}>{t}</div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, padding: `${Math.round(28*s)}px 46px`, color: "#000" }}>
      <div style={{ textAlign: "center" as const, borderBottom: `3px double ${color}`, paddingBottom: Math.round(12*s), marginBottom: Math.round(8*s) }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px", display: "block" }} />}
        <div style={{ fontSize: 22, fontWeight: 700 }}>{data.name || "Your Name"}</div>
        {data.title && <div style={{ fontSize: 11.5, color: "#444", marginTop: 3, fontStyle: "italic" }}>{data.title}</div>}
        <div style={{ fontSize: 10.5, color: "#333", marginTop: 6, lineHeight: 1.8 }}>
          {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).join(" | ")}
        </div>
      </div>

      {orderedSections.map(key => {
        if (key === "summary" && data.summary) return (
          <div key={key}>{sec("Research Statement / Summary")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#222" }}>{data.summary}</p></div>
        );
        if (key === "education" && data.education.length) return (
          <div key={key}>{sec("Education")}{data.education.map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(8*s) }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{e.degree}{e.field ? ` in ${e.field}` : ""}</div>
                <div style={{ fontSize: 11, color: "#333" }}>{e.school}{e.honors ? `, ${e.honors}` : ""}{e.gpa ? `, GPA: ${e.gpa}` : ""}</div>
              </div>
              <div style={{ fontSize: 11, color: "#444", textAlign: "right" as const }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
            </div>
          ))}</div>
        );
        if (key === "experience" && data.experience.length) return (
          <div key={key}>{sec("Academic / Professional Experience")}{data.experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: Math.round(11*s) }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{exp.title}, {exp.company}{exp.location ? `, ${exp.location}` : ""}</div>
                <div style={{ fontSize: 11, color: "#444" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
              </div>
              {exp.bullets.filter(Boolean).map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, flexShrink: 0, marginTop: 1 }}>•</span>
                  <span style={{ fontSize: 11, lineHeight: 1.55, color: "#222" }}>{b}</span>
                </div>
              ))}
            </div>
          ))}</div>
        );
        if (key === "publications" && data.publications.length) return (
          <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
            <div key={p.id} style={{ fontSize: 11, marginBottom: 6, paddingLeft: 20, textIndent: -20 as number }}>
              [{i+1}] {p.title}.{p.publisher ? ` ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}{p.url ? `. ${p.url}` : ""}
            </div>
          ))}</div>
        );
        if (key === "skills" && data.skills.length) return (
          <div key={key}>{sec("Technical Skills")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#222" }}>{data.skills.join(" · ")}</p></div>
        );
        if (key === "certifications" && data.certifications.length) return (
          <div key={key}>{sec("Certificates & Training")}{data.certifications.map(c => (
            <div key={c.id} style={{ fontSize: 11, marginBottom: 4 }}>
              <strong>{c.name}</strong>{c.issuer ? `, ${c.issuer}` : ""}{c.date ? ` (${fmtDate(c.date)})` : ""}
            </div>
          ))}</div>
        );
        if (key === "projects" && data.projects.length) return (
          <div key={key}>{sec("Research Projects")}{data.projects.map(p => (
            <div key={p.id} style={{ marginBottom: Math.round(7*s) }}>
              <div style={{ fontSize: 11.5, fontWeight: 700 }}>{p.name}{p.tech ? ` [${p.tech}]` : ""}{p.link ? ` — ${p.link}` : ""}</div>
              <div style={{ fontSize: 11, color: "#222", lineHeight: 1.6 }}>{p.description}</div>
            </div>
          ))}</div>
        );
        if (key === "languages" && data.languages.length) return (
          <div key={key}>{sec("Languages")}<p style={{ fontSize: 11 }}>{data.languages.map(l => `${l.name} (${LEVEL_LABEL[l.level] || l.level})`).join(", ")}</p></div>
        );
        if (key === "awards" && data.awards.length) return (
          <div key={key}>{sec("Honors & Awards")}{data.awards.map(a => (
            <div key={a.id} style={{ fontSize: 11, marginBottom: 4 }}>
              <strong>{a.title}</strong>{a.issuer ? `, ${a.issuer}` : ""}{a.date ? ` (${fmtDate(a.date)})` : ""}{a.description ? ` — ${a.description}` : ""}
            </div>
          ))}</div>
        );
        if (key === "volunteer" && data.volunteer.length) return (
          <div key={key}>{sec("Service & Leadership")}{data.volunteer.map(v => (
            <div key={v.id} style={{ marginBottom: Math.round(7*s) }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role}, {v.org}</div>
                <div style={{ fontSize: 11, color: "#444" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
              </div>
              {v.description && <div style={{ fontSize: 11, color: "#222" }}>{v.description}</div>}
            </div>
          ))}</div>
        );
        return null;
      })}
    </div>
  );
}

// ─── 10. CORPORATE  (two-column, gray right sidebar) ─────────────────────────

export function CorporateTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const mainSec = (t: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase" as const, letterSpacing: 1.2, borderBottom: `1.5px solid ${color}40`, paddingBottom: 3, marginTop: Math.round(14*s), marginBottom: Math.round(7*s) }}>{t}</div>
  );
  const sideSec = (t: string) => (
    <div style={{ fontSize: 9, fontWeight: 700, color: "#fff", textTransform: "uppercase" as const, letterSpacing: 1.5, borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 3, marginTop: Math.round(13*s), marginBottom: Math.round(6*s) }}>{t}</div>
  );

  const rightSections: SectionKey[] = ["skills","certifications","languages","awards","volunteer"];
  const leftSections: SectionKey[] = ["summary","experience","education","projects","publications"];
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  const leftOrder = orderedSections.filter(s => leftSections.includes(s));
  const rightOrder = orderedSections.filter(s => rightSections.includes(s));

  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, color: "#111" }}>
      <div style={{ background: color, padding: `${Math.round(22*s)}px 32px`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {data.photo && <img src={data.photo} alt="" style={{ width: 58, height: 58, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.5)", float: "left", marginRight: 14 }} />}
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>{data.name || "Your Name"}</div>
          {data.title && <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)", marginTop: 4, letterSpacing: 0.5 }}>{data.title}</div>}
        </div>
        <div style={{ textAlign: "right" as const, fontSize: 10, color: "rgba(255,255,255,0.75)", lineHeight: 1.9 }}>
          {data.email && <div>{data.email}</div>}
          {data.phone && <div>{data.phone}</div>}
          {data.location && <div>{data.location}</div>}
          {data.linkedin && <div>{data.linkedin}</div>}
          {data.github && <div>{data.github}</div>}
        </div>
      </div>

      <div style={{ display: "flex", minHeight: 900 }}>
        {/* Main */}
        <div style={{ flex: 1, padding: `${Math.round(18*s)}px 28px` }}>
          {leftOrder.map(key => {
            if (key === "summary" && data.summary) return (
              <div key={key}>{mainSec("Summary")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151" }}>{data.summary}</p></div>
            );
            if (key === "experience" && data.experience.length) return (
              <div key={key}>{mainSec("Work Experience")}{data.experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: Math.round(11*s) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{exp.title}</div>
                      <div style={{ fontSize: 11, color, fontWeight: 500 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                    </div>
                    <div style={{ fontSize: 9.5, color: "#6b7280", background: "#f3f4f6", padding: "2px 7px", borderRadius: 3, flexShrink: 0, marginLeft: 8 }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <div key={i} style={{ display: "flex", gap: 7, marginBottom: 3 }}>
                        <span style={{ color, fontSize: 10, flexShrink: 0, marginTop: 1 }}>▪</span>
                        <span style={{ fontSize: 11, lineHeight: 1.55, color: "#374151" }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}</div>
            );
            if (key === "education" && data.education.length) return (
              <div key={key}>{mainSec("Education")}{data.education.map(e => (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(8*s) }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{e.school}</div>
                    <div style={{ fontSize: 11, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.honors ? ` · ${e.honors}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                </div>
              ))}</div>
            );
            if (key === "projects" && data.projects.length) return (
              <div key={key}>{mainSec("Projects")}{data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: Math.round(8*s) }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 10, color, marginLeft: 8, fontWeight: 400 }}>{p.tech}</span> : null}</div>
                  {p.link && <div style={{ fontSize: 9.5, color, marginBottom: 2 }}>{p.link}</div>}
                  <div style={{ fontSize: 11, color: "#374151" }}>{p.description}</div>
                </div>
              ))}</div>
            );
            if (key === "publications" && data.publications.length) return (
              <div key={key}>{mainSec("Publications")}{data.publications.map((p, i) => (
                <div key={p.id} style={{ fontSize: 11, marginBottom: 4 }}>
                  [{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}
                </div>
              ))}</div>
            );
            return null;
          })}
        </div>

        {/* Right sidebar */}
        <div style={{ width: 195, background: "#2d3748", padding: `${Math.round(18*s)}px 16px`, flexShrink: 0 }}>
          {rightOrder.map(key => {
            if (key === "skills" && data.skills.length) return (
              <div key={key}>{sideSec("Skills")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
                {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 9.5, padding: "2px 7px", background: "rgba(255,255,255,0.15)", color: "#e2e8f0", borderRadius: 3 }}>{sk}</span>)}
              </div></div>
            );
            if (key === "certifications" && data.certifications.length) return (
              <div key={key}>{sideSec("Certifications")}{data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#e2e8f0" }}>{c.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>{c.issuer}{c.date ? ` · ${fmtDate(c.date)}` : ""}</div>
                </div>
              ))}</div>
            );
            if (key === "languages" && data.languages.length) return (
              <div key={key}>{sideSec("Languages")}{data.languages.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#e2e8f0", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{l.name}</span><span style={{ color: "rgba(255,255,255,0.55)", fontSize: 9 }}>{LEVEL_LABEL[l.level] || l.level}</span>
                </div>
              ))}</div>
            );
            if (key === "awards" && data.awards.length) return (
              <div key={key}>{sideSec("Awards")}{data.awards.map(a => (
                <div key={a.id} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#e2e8f0" }}>{a.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>{a.issuer}{a.date ? ` · ${fmtDate(a.date)}` : ""}</div>
                </div>
              ))}</div>
            );
            if (key === "volunteer" && data.volunteer.length) return (
              <div key={key}>{sideSec("Volunteer")}{data.volunteer.map(v => (
                <div key={v.id} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#e2e8f0" }}>{v.role}</div>
                  <div style={{ fontSize: 9, color }}>{v.org}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
                </div>
              ))}</div>
            );
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 11. TIMELINE  (left vertical dot-line for experience) ────────────────────

export function TimelineTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color, marginTop: Math.round(16*s), marginBottom: Math.round(8*s) }}>{t}</div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, color: "#111" }}>
      {/* Header */}
      <div style={{ padding: `${Math.round(28*s)}px 44px`, borderBottom: `3px solid ${color}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          {data.photo && <img src={data.photo} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", marginBottom: 8 }} />}
          <div style={{ fontSize: 29, fontWeight: 800, letterSpacing: -0.5 }}>{data.name || "Your Name"}</div>
          {data.title && <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 4, letterSpacing: 0.5 }}>{data.title}</div>}
        </div>
        <div style={{ textAlign: "right" as const, fontSize: 10, color: "#6b7280", lineHeight: 1.9 }}>
          {data.email && <div>{data.email}</div>}{data.phone && <div>{data.phone}</div>}
          {data.location && <div>{data.location}</div>}{data.linkedin && <div>{data.linkedin}</div>}
          {data.github && <div>{data.github}</div>}
        </div>
      </div>
      <div style={{ padding: `${Math.round(16*s)}px 44px` }}>
        {orderedSections.map(key => {
          if (key === "summary" && data.summary) return (
            <div key={key}>{sec("About")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#4b5563", borderLeft: `3px solid ${color}20`, paddingLeft: 12 }}>{data.summary}</p></div>
          );
          if (key === "experience" && data.experience.length) return (
            <div key={key}>{sec("Experience")}{data.experience.map(exp => (
              <div key={exp.id} style={{ display: "flex", gap: 14, marginBottom: Math.round(14*s) }}>
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", width: 20, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ width: 2, flex: 1, background: `${color}30`, marginTop: 4 }} />
                </div>
                <div style={{ flex: 1, paddingBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{exp.title}</div>
                      <div style={{ fontSize: 11, color, fontWeight: 500 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                    </div>
                    <div style={{ fontSize: 9.5, color: "#9ca3af", background: "#f9fafb", padding: "2px 7px", borderRadius: 4 }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                  </div>
                  <div style={{ marginTop: 5 }}>{exp.bullets.filter(Boolean).map((b, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                      <span style={{ color, fontSize: 9, marginTop: 2, flexShrink: 0 }}>◆</span>
                      <span style={{ fontSize: 11, lineHeight: 1.5, color: "#374151" }}>{b}</span>
                    </div>
                  ))}</div>
                </div>
              </div>
            ))}</div>
          );
          if (key === "education" && data.education.length) return (
            <div key={key}>{sec("Education")}{data.education.map(e => (
              <div key={e.id} style={{ display: "flex", gap: 14, marginBottom: Math.round(10*s) }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${color}`, flexShrink: 0, marginTop: 3 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{e.school}</div>
                  <div style={{ fontSize: 11, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                </div>
              </div>
            ))}</div>
          );
          if (key === "skills" && data.skills.length) return (
            <div key={key}>{sec("Skills")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
              {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 10, padding: "3px 9px", border: `1.5px solid ${color}40`, borderRadius: 12, color, background: `${color}08` }}>{sk}</span>)}
            </div></div>
          );
          if (key === "certifications" && data.certifications.length) return (
            <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
              <div key={c.id} style={{ fontSize: 11, marginBottom: 4 }}><strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ""}{c.date ? ` · ${fmtDate(c.date)}` : ""}</div>
            ))}</div>
          );
          if (key === "projects" && data.projects.length) return (
            <div key={key}>{sec("Projects")}{data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: Math.round(8*s) }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 9.5, color, marginLeft: 8, fontWeight: 400 }}>{p.tech}</span> : null}</div>
                {p.link && <div style={{ fontSize: 10, color }}>{p.link}</div>}
                <div style={{ fontSize: 11, color: "#374151" }}>{p.description}</div>
              </div>
            ))}</div>
          );
          if (key === "languages" && data.languages.length) return (
            <div key={key}>{sec("Languages")}<div style={{ display: "flex", gap: "4px 20px", flexWrap: "wrap" as const }}>
              {data.languages.map(l => <span key={l.id} style={{ fontSize: 11 }}><strong>{l.name}</strong> · {l.level}</span>)}
            </div></div>
          );
          if (key === "awards" && data.awards.length) return (
            <div key={key}>{sec("Awards")}{data.awards.map(a => (
              <div key={a.id} style={{ fontSize: 11, marginBottom: 4 }}><strong>{a.title}</strong>{a.issuer ? ` — ${a.issuer}` : ""}{a.date ? ` (${fmtDate(a.date)})` : ""}</div>
            ))}</div>
          );
          if (key === "volunteer" && data.volunteer.length) return (
            <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
              <div key={v.id} style={{ marginBottom: Math.round(7*s) }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
                {v.description && <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>{v.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "publications" && data.publications.length) return (
            <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
              <div key={p.id} style={{ fontSize: 11, marginBottom: 4 }}>[{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}</div>
            ))}</div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ─── 12. METRO  (huge bold name left, contact strip right) ────────────────────

export function MetroTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: Math.round(14*s), marginBottom: Math.round(7*s) }}>
      <div style={{ height: 14, width: 3, background: color, borderRadius: 2 }} />
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: 1.5 }}>{t}</div>
    </div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, display: "flex", color: "#111" }}>
      {/* Left: content */}
      <div style={{ flex: 1, padding: `${Math.round(32*s)}px 32px` }}>
        <div style={{ marginBottom: Math.round(20*s) }}>
          {data.photo && <img src={data.photo} alt="" style={{ width: 52, height: 52, borderRadius: 6, objectFit: "cover", marginBottom: 10 }} />}
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, lineHeight: 1, color: "#111" }}>{data.name || "Your Name"}</div>
          {data.title && <div style={{ fontSize: 13, color, fontWeight: 600, marginTop: 8, textTransform: "uppercase" as const, letterSpacing: 1 }}>{data.title}</div>}
        </div>
        {orderedSections.map(key => {
          if (key === "summary" && data.summary) return (
            <div key={key}>{sec("Profile")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151" }}>{data.summary}</p></div>
          );
          if (key === "experience" && data.experience.length) return (
            <div key={key}>{sec("Experience")}{data.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: Math.round(12*s), paddingLeft: 11, borderLeft: `2px solid ${color}25` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{exp.title}</div>
                  <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                </div>
                <div style={{ fontSize: 11, color, marginBottom: 4 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                    <span style={{ color, flexShrink: 0, fontSize: 10, marginTop: 1 }}>→</span>
                    <span style={{ fontSize: 11, lineHeight: 1.5, color: "#374151" }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}</div>
          );
          if (key === "education" && data.education.length) return (
            <div key={key}>{sec("Education")}{data.education.map(e => (
              <div key={e.id} style={{ marginBottom: Math.round(7*s) }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{e.school}</div>
                  <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                </div>
                <div style={{ fontSize: 11, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "projects" && data.projects.length) return (
            <div key={key}>{sec("Projects")}{data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: Math.round(7*s) }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 10, color, marginLeft: 8, fontWeight: 400 }}>{p.tech}</span> : null}</div>
                {p.link && <div style={{ fontSize: 10, color }}>{p.link}</div>}
                <div style={{ fontSize: 11, color: "#374151" }}>{p.description}</div>
              </div>
            ))}</div>
          );
          if (key === "volunteer" && data.volunteer.length) return (
            <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
              <div key={v.id} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                {v.description && <div style={{ fontSize: 11, color: "#374151" }}>{v.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "publications" && data.publications.length) return (
            <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
              <div key={p.id} style={{ fontSize: 11, marginBottom: 4 }}>[{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}</div>
            ))}</div>
          );
          return null;
        })}
      </div>
      {/* Right strip */}
      <div style={{ width: 180, background: color, padding: `${Math.round(32*s)}px 18px`, flexShrink: 0 }}>
        <div style={{ marginBottom: Math.round(20*s) }}>
          <div style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 8 }}>Contact</div>
          {[data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean).map((v, i) => (
            <div key={i} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", marginBottom: 6, wordBreak: "break-all" as const }}>{v}</div>
          ))}
        </div>
        {data.skills.length > 0 && (
          <div>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 8 }}>Skills</div>
            {data.skills.map((sk, i) => <div key={i} style={{ fontSize: 9.5, color: "#fff", marginBottom: 5, paddingLeft: 8, borderLeft: "2px solid rgba(255,255,255,0.4)" }}>{sk}</div>)}
          </div>
        )}
        {data.languages.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 8 }}>Languages</div>
            {data.languages.map(l => <div key={l.id} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{l.name} · {l.level}</div>)}
          </div>
        )}
        {data.certifications.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 8 }}>Certs</div>
            {data.certifications.map(c => <div key={c.id} style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", marginBottom: 5 }}>{c.name}</div>)}
          </div>
        )}
        {data.awards.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 8 }}>Awards</div>
            {data.awards.map(a => <div key={a.id} style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{a.title}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 13. COMPACT  (dense two equal columns top-to-bottom) ─────────────────────

export function CompactTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, color: "#fff", background: color, padding: "3px 8px", borderRadius: 3, marginTop: Math.round(10*s), marginBottom: Math.round(5*s), display: "inline-block" }}>{t}</div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  const leftSecs: SectionKey[] = ["summary","experience","projects","volunteer","publications"];
  const rightSecs: SectionKey[] = ["skills","education","certifications","languages","awards"];
  const leftOrder = orderedSections.filter(s => leftSecs.includes(s));
  const rightOrder = orderedSections.filter(s => rightSecs.includes(s));
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, color: "#111" }}>
      <div style={{ background: "#1f2937", padding: `${Math.round(18*s)}px 32px`, borderBottom: `4px solid ${color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {data.photo && <img src={data.photo} alt="" style={{ width: 48, height: 48, borderRadius: 4, objectFit: "cover", border: `2px solid ${color}` }} />}
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>{data.name || "Your Name"}</div>
              {data.title && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2, letterSpacing: 0.5 }}>{data.title}</div>}
            </div>
          </div>
          <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.65)", textAlign: "right" as const, lineHeight: 1.8 }}>
            {[data.email, data.phone, data.location, data.linkedin, data.github].filter(Boolean).join("  ·  ")}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 0 }}>
        <div style={{ flex: 1, padding: `${Math.round(12*s)}px 20px`, borderRight: "1px solid #e5e7eb" }}>
          {leftOrder.map(key => {
            if (key === "summary" && data.summary) return (
              <div key={key}>{sec("Summary")}<p style={{ fontSize: 10.5, lineHeight: 1.6, color: "#374151", marginTop: 4 }}>{data.summary}</p></div>
            );
            if (key === "experience" && data.experience.length) return (
              <div key={key}>{sec("Experience")}{data.experience.map(exp => (
                <div key={exp.id} style={{ marginTop: Math.round(7*s) }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700 }}>{exp.title}</div>
                    <div style={{ fontSize: 9, color: "#9ca3af" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                  </div>
                  <div style={{ fontSize: 10, color, marginBottom: 3 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                  {exp.bullets.filter(Boolean).map((b, i) => <div key={i} style={{ display: "flex", gap: 5, marginBottom: 2 }}><span style={{ color, fontSize: 9, flexShrink: 0 }}>▸</span><span style={{ fontSize: 10, lineHeight: 1.4, color: "#374151" }}>{b}</span></div>)}
                </div>
              ))}</div>
            );
            if (key === "projects" && data.projects.length) return (
              <div key={key}>{sec("Projects")}{data.projects.map(p => (
                <div key={p.id} style={{ marginTop: Math.round(6*s) }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 9, color, marginLeft: 6 }}>{p.tech}</span> : null}</div>
                  <div style={{ fontSize: 10, color: "#374151" }}>{p.description}</div>
                </div>
              ))}</div>
            );
            if (key === "volunteer" && data.volunteer.length) return (
              <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
                <div key={v.id} style={{ marginTop: 5 }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                  {v.description && <div style={{ fontSize: 10, color: "#374151" }}>{v.description}</div>}
                </div>
              ))}</div>
            );
            if (key === "publications" && data.publications.length) return (
              <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
                <div key={p.id} style={{ fontSize: 10, marginTop: 3 }}>[{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}</div>
              ))}</div>
            );
            return null;
          })}
        </div>
        <div style={{ width: 260, padding: `${Math.round(12*s)}px 20px`, flexShrink: 0 }}>
          {rightOrder.map(key => {
            if (key === "skills" && data.skills.length) return (
              <div key={key}>{sec("Skills")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 3, marginTop: 4 }}>
                {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 9.5, padding: "2px 7px", background: `${color}15`, color, border: `1px solid ${color}40`, borderRadius: 3 }}>{sk}</span>)}
              </div></div>
            );
            if (key === "education" && data.education.length) return (
              <div key={key}>{sec("Education")}{data.education.map(e => (
                <div key={e.id} style={{ marginTop: Math.round(6*s) }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{e.school}</div>
                  <div style={{ fontSize: 10, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}</div>
                  <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
                </div>
              ))}</div>
            );
            if (key === "certifications" && data.certifications.length) return (
              <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
                <div key={c.id} style={{ fontSize: 10, marginTop: 4 }}><strong>{c.name}</strong>{c.issuer ? ` · ${c.issuer}` : ""}</div>
              ))}</div>
            );
            if (key === "languages" && data.languages.length) return (
              <div key={key}>{sec("Languages")}{data.languages.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4 }}>
                  <strong>{l.name}</strong><span style={{ color: "#9ca3af" }}>{l.level}</span>
                </div>
              ))}</div>
            );
            if (key === "awards" && data.awards.length) return (
              <div key={key}>{sec("Awards")}{data.awards.map(a => (
                <div key={a.id} style={{ fontSize: 10, marginTop: 4 }}><strong>{a.title}</strong>{a.issuer ? ` — ${a.issuer}` : ""}</div>
              ))}</div>
            );
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 14. OXFORD  (traditional British CV, centered underline header) ───────────

export function OxfordTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, borderBottom: `1px solid #111`, paddingBottom: 2, marginTop: Math.round(16*s), marginBottom: Math.round(8*s) }}>{t}</div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: `Georgia,'Times New Roman',${font},serif`, background: "#fff", minHeight: 1123, padding: `${Math.round(36*s)}px 64px`, color: "#000" }}>
      <div style={{ textAlign: "center" as const, marginBottom: Math.round(18*s) }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", margin: "0 auto 10px", display: "block" }} />}
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 0.5 }}>{data.name || "Your Name"}</div>
        {data.title && <div style={{ fontSize: 12, color: "#444", marginTop: 4, fontStyle: "italic" }}>{data.title}</div>}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" as const, gap: "3px 14px", marginTop: 8, fontSize: 10.5, color: "#444" }}>
          {[data.email,data.phone,data.location,data.linkedin,data.github,data.website].filter(Boolean).map((v,i) => <span key={i}>{v}</span>)}
        </div>
        <div style={{ width: 60, height: 2, background: color, margin: `${Math.round(10*s)}px auto 0` }} />
      </div>
      {orderedSections.map(key => {
        if (key === "summary" && data.summary) return (
          <div key={key}>{sec("Personal Statement")}<p style={{ fontSize: 11, lineHeight: 1.8, color: "#222", textAlign: "justify" as const }}>{data.summary}</p></div>
        );
        if (key === "experience" && data.experience.length) return (
          <div key={key}>{sec("Employment History")}{data.experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: Math.round(12*s) }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{exp.title}</div>
                <div style={{ fontSize: 10.5, color: "#555", fontStyle: "italic" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
              </div>
              <div style={{ fontSize: 11, fontStyle: "italic", color, marginBottom: 4 }}>{exp.company}{exp.location ? `, ${exp.location}` : ""}</div>
              {exp.bullets.filter(Boolean).map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
                  <span style={{ flexShrink: 0, fontSize: 11 }}>•</span>
                  <span style={{ fontSize: 11, lineHeight: 1.55, color: "#222" }}>{b}</span>
                </div>
              ))}
            </div>
          ))}</div>
        );
        if (key === "education" && data.education.length) return (
          <div key={key}>{sec("Education")}{data.education.map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(8*s) }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{e.degree}{e.field ? ` in ${e.field}` : ""}</div>
                <div style={{ fontSize: 11, fontStyle: "italic", color: "#444" }}>{e.school}{e.honors ? `, ${e.honors}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
              </div>
              <div style={{ fontSize: 10.5, color: "#555", textAlign: "right" as const }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
            </div>
          ))}</div>
        );
        if (key === "skills" && data.skills.length) return (
          <div key={key}>{sec("Skills & Expertise")}<p style={{ fontSize: 11, lineHeight: 1.8, color: "#222" }}>{data.skills.join(" · ")}</p></div>
        );
        if (key === "certifications" && data.certifications.length) return (
          <div key={key}>{sec("Professional Qualifications")}{data.certifications.map(c => (
            <div key={c.id} style={{ fontSize: 11, marginBottom: 4 }}><em>{c.name}</em>{c.issuer ? `, ${c.issuer}` : ""}{c.date ? ` (${fmtDate(c.date)})` : ""}</div>
          ))}</div>
        );
        if (key === "projects" && data.projects.length) return (
          <div key={key}>{sec("Selected Projects")}{data.projects.map(p => (
            <div key={p.id} style={{ marginBottom: Math.round(7*s) }}>
              <div style={{ fontSize: 11.5, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 10, color, fontStyle: "italic", marginLeft: 8 }}>{p.tech}</span> : null}</div>
              <div style={{ fontSize: 11, color: "#222", lineHeight: 1.6 }}>{p.description}</div>
            </div>
          ))}</div>
        );
        if (key === "languages" && data.languages.length) return (
          <div key={key}>{sec("Languages")}<p style={{ fontSize: 11 }}>{data.languages.map(l => `${l.name} (${l.level})`).join(" · ")}</p></div>
        );
        if (key === "awards" && data.awards.length) return (
          <div key={key}>{sec("Awards & Distinctions")}{data.awards.map(a => (
            <div key={a.id} style={{ fontSize: 11, marginBottom: 4 }}><em>{a.title}</em>{a.issuer ? ` — ${a.issuer}` : ""}{a.date ? ` (${fmtDate(a.date)})` : ""}</div>
          ))}</div>
        );
        if (key === "volunteer" && data.volunteer.length) return (
          <div key={key}>{sec("Voluntary Activities")}{data.volunteer.map(v => (
            <div key={v.id} style={{ marginBottom: Math.round(7*s) }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role}, <em>{v.org}</em></div>
                <div style={{ fontSize: 10.5, color: "#555" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
              </div>
              {v.description && <div style={{ fontSize: 11, color: "#222" }}>{v.description}</div>}
            </div>
          ))}</div>
        );
        if (key === "publications" && data.publications.length) return (
          <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
            <div key={p.id} style={{ fontSize: 11, marginBottom: 4 }}>[{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}{p.date ? `, ${fmtDate(p.date)}` : ""}</div>
          ))}</div>
        );
        return null;
      })}
    </div>
  );
}

// ─── 15. TECH  (dark terminal header, monospace-accented) ─────────────────────

export function TechTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: Math.round(14*s), marginBottom: Math.round(7*s) }}>
      <span style={{ color, fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>{">"}</span>
      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const }}>{t}</span>
      <div style={{ flex: 1, height: 1, background: `${color}30` }} />
    </div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, color: "#111" }}>
      <div style={{ background: "#0f172a", padding: `${Math.round(28*s)}px 44px` }}>
        <div style={{ fontFamily: "monospace", color, fontSize: 11, marginBottom: 6, opacity: 0.7 }}>{"// resume.json"}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {data.photo && <img src={data.photo} alt="" style={{ width: 54, height: 54, borderRadius: 4, objectFit: "cover", marginBottom: 8, border: `2px solid ${color}50` }} />}
            <div style={{ fontSize: 27, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.3 }}>{data.name || "Your Name"}</div>
            {data.title && <div style={{ fontSize: 12, color, fontFamily: "monospace", marginTop: 5 }}>{`<${data.title} />`}</div>}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 9.5, color: "#64748b", lineHeight: 2, textAlign: "right" as const }}>
            {data.email && <div><span style={{ color: color + "99" }}>email:</span> {data.email}</div>}
            {data.phone && <div><span style={{ color: color + "99" }}>phone:</span> {data.phone}</div>}
            {data.location && <div><span style={{ color: color + "99" }}>location:</span> {data.location}</div>}
            {data.linkedin && <div><span style={{ color: color + "99" }}>linkedin:</span> {data.linkedin}</div>}
            {data.github && <div><span style={{ color: color + "99" }}>github:</span> {data.github}</div>}
          </div>
        </div>
        {data.skills.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
            {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 9.5, fontFamily: "monospace", padding: "2px 8px", background: `${color}20`, color, border: `1px solid ${color}40`, borderRadius: 3 }}>{sk}</span>)}
          </div>
        )}
      </div>
      <div style={{ padding: `${Math.round(16*s)}px 44px` }}>
        {orderedSections.filter(k => k !== "skills").map(key => {
          if (key === "summary" && data.summary) return (
            <div key={key}>{sec("About")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151", fontFamily: "inherit" }}>{data.summary}</p></div>
          );
          if (key === "experience" && data.experience.length) return (
            <div key={key}>{sec("Work Experience")}{data.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: Math.round(12*s) }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>{exp.title}</div>
                    <div style={{ fontSize: 11, color, fontFamily: "monospace", marginBottom: 4 }}>{exp.company}{exp.location ? ` @ ${exp.location}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 9.5, color: "#9ca3af", fontFamily: "monospace" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                </div>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
                    <span style={{ color, fontSize: 10, fontFamily: "monospace", flexShrink: 0 }}>$</span>
                    <span style={{ fontSize: 11, lineHeight: 1.5, color: "#374151" }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}</div>
          );
          if (key === "education" && data.education.length) return (
            <div key={key}>{sec("Education")}{data.education.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(8*s) }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{e.school}</div>
                  <div style={{ fontSize: 11, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
                </div>
                <div style={{ fontSize: 9.5, color: "#9ca3af", fontFamily: "monospace" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "certifications" && data.certifications.length) return (
            <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
              <div key={c.id} style={{ fontSize: 11, marginBottom: 4 }}><strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ""}{c.date ? ` (${fmtDate(c.date)})` : ""}</div>
            ))}</div>
          );
          if (key === "projects" && data.projects.length) return (
            <div key={key}>{sec("Projects")}{data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: Math.round(8*s) }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 9.5, color, fontFamily: "monospace", marginLeft: 8 }}>[{p.tech}]</span> : null}</div>
                {p.link && <div style={{ fontSize: 9.5, color, fontFamily: "monospace" }}>{p.link}</div>}
                <div style={{ fontSize: 11, color: "#374151" }}>{p.description}</div>
              </div>
            ))}</div>
          );
          if (key === "languages" && data.languages.length) return (
            <div key={key}>{sec("Languages")}<p style={{ fontSize: 11 }}>{data.languages.map(l => `${l.name} (${l.level})`).join(" · ")}</p></div>
          );
          if (key === "awards" && data.awards.length) return (
            <div key={key}>{sec("Awards")}{data.awards.map(a => (
              <div key={a.id} style={{ fontSize: 11, marginBottom: 4 }}><strong>{a.title}</strong>{a.issuer ? ` — ${a.issuer}` : ""}{a.date ? ` (${fmtDate(a.date)})` : ""}</div>
            ))}</div>
          );
          if (key === "volunteer" && data.volunteer.length) return (
            <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
              <div key={v.id} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                {v.description && <div style={{ fontSize: 11, color: "#374151" }}>{v.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "publications" && data.publications.length) return (
            <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
              <div key={p.id} style={{ fontSize: 11, marginBottom: 4 }}>[{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}</div>
            ))}</div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ─── 16. CARDS  (each section in a bordered card box) ─────────────────────────

export function CardsTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const card = (children: React.ReactNode) => (
    <div style={{ border: `1px solid #e5e7eb`, borderRadius: 8, padding: `${Math.round(12*s)}px 16px`, marginBottom: Math.round(10*s), boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>{children}</div>
  );
  const sec = (t: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, color, marginBottom: Math.round(8*s) }}>{t}</div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: font, background: "#f8fafc", minHeight: 1123, color: "#111" }}>
      <div style={{ background: "#fff", borderBottom: `3px solid ${color}`, padding: `${Math.round(24*s)}px 36px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {data.photo && <img src={data.photo} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: `3px solid ${color}30` }} />}
            <div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{data.name || "Your Name"}</div>
              {data.title && <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 3 }}>{data.title}</div>}
            </div>
          </div>
          <div style={{ fontSize: 10, color: "#6b7280", textAlign: "right" as const, lineHeight: 1.9 }}>
            {[data.email,data.phone,data.location,data.linkedin,data.github].filter(Boolean).map((v,i) => <div key={i}>{v}</div>)}
          </div>
        </div>
      </div>
      <div style={{ padding: `${Math.round(14*s)}px 28px`, display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          {orderedSections.filter(k => ["summary","experience","projects","volunteer","publications"].includes(k)).map(key => {
            if (key === "summary" && data.summary) return card(
              <div key={key}>{sec("Summary")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151" }}>{data.summary}</p></div>
            );
            if (key === "experience" && data.experience.length) return card(
              <div key={key}>{sec("Work Experience")}{data.experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: Math.round(10*s) }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{exp.title}</div>
                    <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                  </div>
                  <div style={{ fontSize: 10.5, color, marginBottom: 4 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                  {exp.bullets.filter(Boolean).map((b, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}><span style={{ color, fontSize: 9 }}>▸</span><span style={{ fontSize: 10.5, lineHeight: 1.5, color: "#374151" }}>{b}</span></div>)}
                </div>
              ))}</div>
            );
            if (key === "projects" && data.projects.length) return card(
              <div key={key}>{sec("Projects")}{data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 9.5, color, marginLeft: 8 }}>{p.tech}</span> : null}</div>
                  {p.link && <div style={{ fontSize: 9.5, color }}>{p.link}</div>}
                  <div style={{ fontSize: 11, color: "#374151" }}>{p.description}</div>
                </div>
              ))}</div>
            );
            if (key === "volunteer" && data.volunteer.length) return card(
              <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
                <div key={v.id} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                  {v.description && <div style={{ fontSize: 11, color: "#374151" }}>{v.description}</div>}
                </div>
              ))}</div>
            );
            if (key === "publications" && data.publications.length) return card(
              <div key={key}>{sec("Publications")}{data.publications.map((p, i) => <div key={p.id} style={{ fontSize: 11, marginBottom: 4 }}>[{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}</div>)}</div>
            );
            return null;
          })}
        </div>
        <div style={{ width: 210, flexShrink: 0 }}>
          {orderedSections.filter(k => ["skills","education","certifications","languages","awards"].includes(k)).map(key => {
            if (key === "skills" && data.skills.length) return card(
              <div key={key}>{sec("Skills")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
                {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 9.5, padding: "2px 8px", background: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: 10 }}>{sk}</span>)}
              </div></div>
            );
            if (key === "education" && data.education.length) return card(
              <div key={key}>{sec("Education")}{data.education.map(e => (
                <div key={e.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{e.school}</div>
                  <div style={{ fontSize: 10, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}</div>
                  <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}{e.gpa ? ` · ${e.gpa}` : ""}</div>
                </div>
              ))}</div>
            );
            if (key === "certifications" && data.certifications.length) return card(
              <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 5 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{c.issuer}{c.date ? ` · ${fmtDate(c.date)}` : ""}</div>
                </div>
              ))}</div>
            );
            if (key === "languages" && data.languages.length) return card(
              <div key={key}>{sec("Languages")}{data.languages.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 4 }}>
                  <strong>{l.name}</strong><span style={{ color: "#9ca3af" }}>{l.level}</span>
                </div>
              ))}</div>
            );
            if (key === "awards" && data.awards.length) return card(
              <div key={key}>{sec("Awards")}{data.awards.map(a => (
                <div key={a.id} style={{ marginBottom: 5 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{a.issuer}{a.date ? ` · ${fmtDate(a.date)}` : ""}</div>
                </div>
              ))}</div>
            );
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 17. NORDIC  (super spacious, hairline separators, premium minimal) ────────

export function NordicTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: Math.round(24*s), marginBottom: Math.round(12*s) }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" as const, color: "#9ca3af", whiteSpace: "nowrap" as const }}>{t}</div>
      <div style={{ flex: 1, height: 0.5, background: "#d1d5db" }} />
    </div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, padding: `${Math.round(52*s)}px 72px`, color: "#111" }}>
      <div style={{ marginBottom: Math.round(36*s) }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", marginBottom: 14 }} />}
        <div style={{ fontSize: 34, fontWeight: 300, letterSpacing: -0.5 }}>{data.name || "Your Name"}</div>
        {data.title && <div style={{ fontSize: 13, color, marginTop: 7, fontWeight: 400, letterSpacing: 0.5 }}>{data.title}</div>}
        <div style={{ display: "flex", gap: "4px 22px", flexWrap: "wrap" as const, marginTop: 12, fontSize: 10.5, color: "#9ca3af" }}>
          {[data.email,data.phone,data.location,data.linkedin,data.github,data.website].filter(Boolean).map((v,i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      {orderedSections.map(key => {
        if (key === "summary" && data.summary) return (
          <div key={key}>{sec("Profile")}<p style={{ fontSize: 12.5, lineHeight: 1.9, color: "#4b5563", fontWeight: 300 }}>{data.summary}</p></div>
        );
        if (key === "experience" && data.experience.length) return (
          <div key={key}>{sec("Experience")}{data.experience.map((exp, idx) => (
            <div key={exp.id} style={{ marginBottom: Math.round(18*s), paddingTop: idx > 0 ? Math.round(10*s) : 0, borderTop: idx > 0 ? "0.5px solid #f3f4f6" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{exp.title}</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
              </div>
              <div style={{ fontSize: 11, color, marginTop: 2, marginBottom: 6, fontWeight: 400 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
              {exp.bullets.filter(Boolean).map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, lineHeight: 1.7, color: "#4b5563", fontWeight: 300 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}</div>
        );
        if (key === "education" && data.education.length) return (
          <div key={key}>{sec("Education")}{data.education.map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(12*s) }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e.school}</div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 300 }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.honors ? ` · ${e.honors}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
            </div>
          ))}</div>
        );
        if (key === "skills" && data.skills.length) return (
          <div key={key}>{sec("Skills")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7 }}>
            {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 11, color: "#374151", padding: "4px 12px", border: "0.5px solid #d1d5db", borderRadius: 20, fontWeight: 300 }}>{sk}</span>)}
          </div></div>
        );
        if (key === "certifications" && data.certifications.length) return (
          <div key={key}>{sec("Certifications")}{data.certifications.map(c => (
            <div key={c.id} style={{ fontSize: 12, marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>{c.name}</span>{c.issuer ? <span style={{ color: "#9ca3af", fontWeight: 300 }}> · {c.issuer}</span> : null}
            </div>
          ))}</div>
        );
        if (key === "projects" && data.projects.length) return (
          <div key={key}>{sec("Projects")}{data.projects.map(p => (
            <div key={p.id} style={{ marginBottom: Math.round(12*s) }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}{p.tech ? <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 300, marginLeft: 10 }}>{p.tech}</span> : null}</div>
              {p.link && <div style={{ fontSize: 10, color, fontWeight: 300, marginBottom: 3 }}>{p.link}</div>}
              <div style={{ fontSize: 11.5, color: "#4b5563", lineHeight: 1.7, fontWeight: 300 }}>{p.description}</div>
            </div>
          ))}</div>
        );
        if (key === "languages" && data.languages.length) return (
          <div key={key}>{sec("Languages")}<div style={{ display: "flex", gap: "6px 28px", flexWrap: "wrap" as const }}>
            {data.languages.map(l => <span key={l.id} style={{ fontSize: 12 }}><span style={{ fontWeight: 500 }}>{l.name}</span> <span style={{ color: "#9ca3af", fontWeight: 300 }}>{l.level}</span></span>)}
          </div></div>
        );
        if (key === "awards" && data.awards.length) return (
          <div key={key}>{sec("Awards")}{data.awards.map(a => (
            <div key={a.id} style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{a.title}</span>
              <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 300, marginLeft: 12 }}>{a.issuer}{a.date ? ` · ${fmtDate(a.date)}` : ""}</span>
            </div>
          ))}</div>
        );
        if (key === "volunteer" && data.volunteer.length) return (
          <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
            <div key={v.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{v.role} <span style={{ color, fontWeight: 300 }}>{v.org}</span></div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{dateRange(v.startDate, v.endDate, v.current)}</div>
              </div>
              {v.description && <div style={{ fontSize: 11.5, color: "#4b5563", fontWeight: 300, marginTop: 2 }}>{v.description}</div>}
            </div>
          ))}</div>
        );
        if (key === "publications" && data.publications.length) return (
          <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
            <div key={p.id} style={{ fontSize: 12, marginBottom: 5, fontWeight: 300, color: "#374151" }}>[{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}</div>
          ))}</div>
        );
        return null;
      })}
    </div>
  );
}

// ─── 18. CREATIVE  (full-height left color bar + bold diagonal accent) ─────────

export function CreativeTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const sec = (t: string) => (
    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" as const, color, borderBottom: `2px solid ${color}`, paddingBottom: 3, marginTop: Math.round(14*s), marginBottom: Math.round(7*s) }}>{t}</div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  const sideKeys: SectionKey[] = ["skills","certifications","languages","awards"];
  const mainKeys: SectionKey[] = ["summary","experience","education","projects","volunteer","publications"];
  const sideOrder = orderedSections.filter(k => sideKeys.includes(k));
  const mainOrder = orderedSections.filter(k => mainKeys.includes(k));
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, display: "flex", color: "#111" }}>
      {/* Left: thin accent + sidebar */}
      <div style={{ width: 6, background: color, flexShrink: 0 }} />
      <div style={{ width: 200, background: "#18181b", padding: `${Math.round(28*s)}px 16px`, flexShrink: 0 }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto 14px", border: `3px solid ${color}` }} />}
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>{data.name || "Your Name"}</div>
        {data.title && <div style={{ fontSize: 10, color, fontWeight: 600, letterSpacing: 0.5, marginBottom: 14 }}>{data.title}</div>}
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 6 }}>Contact</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.75)", lineHeight: 2 }}>
          {data.email && <div>{data.email}</div>}
          {data.phone && <div>{data.phone}</div>}
          {data.location && <div>{data.location}</div>}
          {data.linkedin && <div>{data.linkedin}</div>}
          {data.github && <div>{data.github}</div>}
          {data.website && <div>{data.website}</div>}
        </div>
        {sideOrder.map(key => {
          if (key === "skills" && data.skills.length) return (
            <div key={key}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: 2, textTransform: "uppercase" as const, margin: `${Math.round(14*s)}px 0 6px` }}>Skills</div>
              {data.skills.map((sk, i) => <div key={i} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />{sk}</div>)}
            </div>
          );
          if (key === "certifications" && data.certifications.length) return (
            <div key={key}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: 2, textTransform: "uppercase" as const, margin: `${Math.round(14*s)}px 0 6px` }}>Certs</div>
              {data.certifications.map(c => <div key={c.id} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", marginBottom: 5 }}>{c.name}</div>)}
            </div>
          );
          if (key === "languages" && data.languages.length) return (
            <div key={key}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: 2, textTransform: "uppercase" as const, margin: `${Math.round(14*s)}px 0 6px` }}>Languages</div>
              {data.languages.map(l => <div key={l.id} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>{l.name} · {l.level}</div>)}
            </div>
          );
          if (key === "awards" && data.awards.length) return (
            <div key={key}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: 2, textTransform: "uppercase" as const, margin: `${Math.round(14*s)}px 0 6px` }}>Awards</div>
              {data.awards.map(a => <div key={a.id} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{a.title}</div>)}
            </div>
          );
          return null;
        })}
      </div>
      {/* Main content */}
      <div style={{ flex: 1, padding: `${Math.round(28*s)}px 26px` }}>
        {mainOrder.map(key => {
          if (key === "summary" && data.summary) return (
            <div key={key}>{sec("About Me")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151" }}>{data.summary}</p></div>
          );
          if (key === "experience" && data.experience.length) return (
            <div key={key}>{sec("Experience")}{data.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: Math.round(11*s) }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{exp.title}</div>
                  <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                </div>
                <div style={{ fontSize: 11, color, marginBottom: 4 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                    <span style={{ color, fontSize: 8, flexShrink: 0, marginTop: 3 }}>◆</span>
                    <span style={{ fontSize: 11, lineHeight: 1.5, color: "#374151" }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}</div>
          );
          if (key === "education" && data.education.length) return (
            <div key={key}>{sec("Education")}{data.education.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(8*s) }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{e.school}</div>
                  <div style={{ fontSize: 11, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "projects" && data.projects.length) return (
            <div key={key}>{sec("Projects")}{data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: Math.round(8*s) }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 9.5, color, marginLeft: 8 }}>{p.tech}</span> : null}</div>
                {p.link && <div style={{ fontSize: 9.5, color }}>{p.link}</div>}
                <div style={{ fontSize: 11, color: "#374151" }}>{p.description}</div>
              </div>
            ))}</div>
          );
          if (key === "volunteer" && data.volunteer.length) return (
            <div key={key}>{sec("Volunteer")}{data.volunteer.map(v => (
              <div key={v.id} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                {v.description && <div style={{ fontSize: 11, color: "#374151" }}>{v.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "publications" && data.publications.length) return (
            <div key={key}>{sec("Publications")}{data.publications.map((p, i) => (
              <div key={p.id} style={{ fontSize: 11, marginBottom: 4 }}>[{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}</div>
            ))}</div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ─── 19. INFOGRAPHIC  (skill progress bars, visual contact icons) ──────────────

export function InfographicTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const LEVEL_PCT: Record<string, number> = { native:100, fluent:85, advanced:70, intermediate:50, basic:30 };
  const sec = (t: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, color: "#fff", background: color, padding: "3px 10px 3px 14px", marginTop: Math.round(13*s), marginBottom: Math.round(7*s), position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "rgba(0,0,0,0.3)" }} />
      {t}
    </div>
  );
  const mainSec = (t: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color, borderBottom: `2px solid ${color}`, paddingBottom: 3, marginTop: Math.round(13*s), marginBottom: Math.round(7*s) }}>{t}</div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  const sideKeys: SectionKey[] = ["skills","languages","certifications","awards"];
  const mainKeys: SectionKey[] = ["summary","experience","education","projects","volunteer","publications"];
  const sideOrder = orderedSections.filter(k => sideKeys.includes(k));
  const mainOrder = orderedSections.filter(k => mainKeys.includes(k));
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, display: "flex", color: "#111" }}>
      {/* Sidebar */}
      <div style={{ width: 215, background: "#f1f5f9", padding: `${Math.round(24*s)}px 16px`, flexShrink: 0, borderRight: "1px solid #e2e8f0" }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 76, height: 76, borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto 12px", border: `3px solid ${color}` }} />}
        <div style={{ textAlign: "center" as const, marginBottom: Math.round(14*s) }}>
          <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>{data.name || "Your Name"}</div>
          {data.title && <div style={{ fontSize: 10, color, fontWeight: 600, marginTop: 4 }}>{data.title}</div>}
        </div>
        <div style={{ marginBottom: Math.round(12*s) }}>
          <div style={{ fontSize: 8.5, fontWeight: 700, color: "#9ca3af", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 6 }}>Contact</div>
          {[data.email,data.phone,data.location,data.linkedin,data.github].filter(Boolean).map((v,i) => (
            <div key={i} style={{ fontSize: 9.5, color: "#4b5563", marginBottom: 5, wordBreak: "break-all" as const }}>{v}</div>
          ))}
        </div>
        {sideOrder.map(key => {
          if (key === "skills" && data.skills.length) return (
            <div key={key}>{sec("Skills")}
              {data.skills.slice(0, 12).map((sk, i) => (
                <div key={i} style={{ marginBottom: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>{sk}</span>
                  </div>
                  <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2 }}>
                    <div style={{ height: "100%", background: color, borderRadius: 2, width: `${Math.max(40, 60 + (i % 4) * 10)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          );
          if (key === "languages" && data.languages.length) return (
            <div key={key}>{sec("Languages")}
              {data.languages.map(l => (
                <div key={l.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>{l.name}</span>
                    <span style={{ color: "#9ca3af" }}>{l.level}</span>
                  </div>
                  <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2 }}>
                    <div style={{ height: "100%", background: color, borderRadius: 2, width: `${LEVEL_PCT[l.level] || 50}%` }} />
                  </div>
                </div>
              ))}
            </div>
          );
          if (key === "certifications" && data.certifications.length) return (
            <div key={key}>{sec("Certs")}{data.certifications.map(c => (
              <div key={c.id} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: "#374151" }}>{c.name}</div>
                <div style={{ fontSize: 9, color: "#9ca3af" }}>{c.issuer}{c.date ? ` · ${fmtDate(c.date)}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "awards" && data.awards.length) return (
            <div key={key}>{sec("Awards")}{data.awards.map(a => (
              <div key={a.id} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: "#374151" }}>{a.title}</div>
                <div style={{ fontSize: 9, color: "#9ca3af" }}>{a.issuer}</div>
              </div>
            ))}</div>
          );
          return null;
        })}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: `${Math.round(24*s)}px 26px` }}>
        {mainOrder.map(key => {
          if (key === "summary" && data.summary) return (
            <div key={key}>{mainSec("About")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151" }}>{data.summary}</p></div>
          );
          if (key === "experience" && data.experience.length) return (
            <div key={key}>{mainSec("Experience")}{data.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: Math.round(11*s), paddingLeft: 12, borderLeft: `3px solid ${color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{exp.title}</div>
                  <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                </div>
                <div style={{ fontSize: 10.5, color, marginBottom: 4 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                    <span style={{ color, fontSize: 9, flexShrink: 0, marginTop: 2 }}>▸</span>
                    <span style={{ fontSize: 11, lineHeight: 1.5, color: "#374151" }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}</div>
          );
          if (key === "education" && data.education.length) return (
            <div key={key}>{mainSec("Education")}{data.education.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: Math.round(8*s) }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{e.school}</div>
                  <div style={{ fontSize: 11, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "projects" && data.projects.length) return (
            <div key={key}>{mainSec("Projects")}{data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: Math.round(8*s) }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 9.5, color, marginLeft: 8 }}>{p.tech}</span> : null}</div>
                {p.link && <div style={{ fontSize: 9.5, color }}>{p.link}</div>}
                <div style={{ fontSize: 11, color: "#374151" }}>{p.description}</div>
              </div>
            ))}</div>
          );
          if (key === "volunteer" && data.volunteer.length) return (
            <div key={key}>{mainSec("Volunteer")}{data.volunteer.map(v => (
              <div key={v.id} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                {v.description && <div style={{ fontSize: 11, color: "#374151" }}>{v.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "publications" && data.publications.length) return (
            <div key={key}>{mainSec("Publications")}{data.publications.map((p, i) => (
              <div key={p.id} style={{ fontSize: 11, marginBottom: 4 }}>[{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}</div>
            ))}</div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ─── 20. SPLIT  (strict 50/50 two-column with no header band) ─────────────────

export function SplitTemplate({ data, color, font, spacing: sp }: TemplateProps) {
  const s = sp;
  const leftSec = (t: string) => (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#fff", background: color, padding: "3px 8px", marginTop: Math.round(12*s), marginBottom: Math.round(6*s), display: "inline-block", borderRadius: 2 }}>{t}</div>
  );
  const rightSec = (t: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color, borderLeft: `3px solid ${color}`, paddingLeft: 8, marginTop: Math.round(12*s), marginBottom: Math.round(6*s) }}>{t}</div>
  );
  const orderedSections = data.sectionOrder.filter(sk => data.sectionVisible[sk]);
  const leftKeys: SectionKey[] = ["skills","certifications","languages","education","awards"];
  const rightKeys: SectionKey[] = ["summary","experience","projects","volunteer","publications"];
  const leftOrder = orderedSections.filter(k => leftKeys.includes(k));
  const rightOrder = orderedSections.filter(k => rightKeys.includes(k));
  return (
    <div style={{ width: 794, fontFamily: font, background: "#fff", minHeight: 1123, display: "flex", color: "#111" }}>
      {/* Left half */}
      <div style={{ width: 397, background: "#fafafa", padding: `${Math.round(28*s)}px 24px`, borderRight: "2px solid #e5e7eb", flexShrink: 0 }}>
        {data.photo && <img src={data.photo} alt="" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", marginBottom: 12 }} />}
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{data.name || "Your Name"}</div>
        {data.title && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 5, letterSpacing: 0.5 }}>{data.title}</div>}
        <div style={{ marginTop: 12, fontSize: 9.5, color: "#6b7280", lineHeight: 2 }}>
          {[data.email,data.phone,data.location,data.linkedin,data.github,data.website].filter(Boolean).map((v,i) => <div key={i}>{v}</div>)}
        </div>
        {leftOrder.map(key => {
          if (key === "skills" && data.skills.length) return (
            <div key={key}>{leftSec("Skills")}<div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
              {data.skills.map((sk, i) => <span key={i} style={{ fontSize: 9.5, padding: "2px 7px", background: `${color}20`, color, borderRadius: 3 }}>{sk}</span>)}
            </div></div>
          );
          if (key === "education" && data.education.length) return (
            <div key={key}>{leftSec("Education")}{data.education.map(e => (
              <div key={e.id} style={{ marginBottom: Math.round(7*s) }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{e.school}</div>
                <div style={{ fontSize: 10, color: "#374151" }}>{e.degree}{e.field ? ` in ${e.field}` : ""}</div>
                <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "certifications" && data.certifications.length) return (
            <div key={key}>{leftSec("Certifications")}{data.certifications.map(c => (
              <div key={c.id} style={{ marginBottom: 5 }}>
                <div style={{ fontSize: 10.5, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{c.issuer}{c.date ? ` · ${fmtDate(c.date)}` : ""}</div>
              </div>
            ))}</div>
          );
          if (key === "languages" && data.languages.length) return (
            <div key={key}>{leftSec("Languages")}{data.languages.map(l => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                <strong>{l.name}</strong><span style={{ color: "#9ca3af" }}>{l.level}</span>
              </div>
            ))}</div>
          );
          if (key === "awards" && data.awards.length) return (
            <div key={key}>{leftSec("Awards")}{data.awards.map(a => (
              <div key={a.id} style={{ marginBottom: 5 }}>
                <div style={{ fontSize: 10.5, fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{a.issuer}{a.date ? ` · ${fmtDate(a.date)}` : ""}</div>
              </div>
            ))}</div>
          );
          return null;
        })}
      </div>
      {/* Right half */}
      <div style={{ flex: 1, padding: `${Math.round(28*s)}px 24px` }}>
        {rightOrder.map(key => {
          if (key === "summary" && data.summary) return (
            <div key={key}>{rightSec("About")}<p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151" }}>{data.summary}</p></div>
          );
          if (key === "experience" && data.experience.length) return (
            <div key={key}>{rightSec("Experience")}{data.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: Math.round(11*s) }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{exp.title}</div>
                  <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                </div>
                <div style={{ fontSize: 10.5, color, marginBottom: 4 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}>
                    <span style={{ color, fontSize: 9, flexShrink: 0, marginTop: 2 }}>▸</span>
                    <span style={{ fontSize: 11, lineHeight: 1.5, color: "#374151" }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}</div>
          );
          if (key === "projects" && data.projects.length) return (
            <div key={key}>{rightSec("Projects")}{data.projects.map(p => (
              <div key={p.id} style={{ marginBottom: Math.round(7*s) }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}{p.tech ? <span style={{ fontSize: 9.5, color, marginLeft: 8 }}>{p.tech}</span> : null}</div>
                {p.link && <div style={{ fontSize: 9.5, color }}>{p.link}</div>}
                <div style={{ fontSize: 11, color: "#374151" }}>{p.description}</div>
              </div>
            ))}</div>
          );
          if (key === "volunteer" && data.volunteer.length) return (
            <div key={key}>{rightSec("Volunteer")}{data.volunteer.map(v => (
              <div key={v.id} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{v.role} · <span style={{ color }}>{v.org}</span></div>
                {v.description && <div style={{ fontSize: 11, color: "#374151" }}>{v.description}</div>}
              </div>
            ))}</div>
          );
          if (key === "publications" && data.publications.length) return (
            <div key={key}>{rightSec("Publications")}{data.publications.map((p, i) => (
              <div key={p.id} style={{ fontSize: 11, marginBottom: 4 }}>[{i+1}] <em>{p.title}</em>{p.publisher ? `, ${p.publisher}` : ""}</div>
            ))}</div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ─── Template registry ─────────────────────────────────────────────────────────

export const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<TemplateProps>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  ats: ATSTemplate,
  executive: ExecutiveTemplate,
  sideline: SidelineTemplate,
  minimal: MinimalTemplate,
  bold: BoldTemplate,
  elegant: ElegantTemplate,
  academic: AcademicTemplate,
  corporate: CorporateTemplate,
  timeline: TimelineTemplate,
  metro: MetroTemplate,
  compact: CompactTemplate,
  oxford: OxfordTemplate,
  tech: TechTemplate,
  cards: CardsTemplate,
  nordic: NordicTemplate,
  creative: CreativeTemplate,
  infographic: InfographicTemplate,
  split: SplitTemplate,
};

export type TemplateMeta = {
  id: string; label: string; desc: string; category: string;
  thumb: { headerH: number; headerBg: string; leftW: number; rightBg: string; headerLeft?: boolean; noHeader?: boolean; dark?: boolean; dots?: boolean; bars?: boolean; };
};

export const TEMPLATE_META: TemplateMeta[] = [
  { id:"modern",      label:"Modern",      desc:"Two-column sidebar layout",       category:"Professional", thumb:{ headerH:18, headerBg:"accent",  leftW:26, rightBg:"#f8f9fb" } },
  { id:"classic",     label:"Classic",     desc:"Centered serif header",           category:"Traditional",  thumb:{ headerH:22, headerBg:"none",    leftW:0,  rightBg:"#fff" } },
  { id:"ats",         label:"ATS-Safe",    desc:"Plain text, max compatibility",   category:"Functional",   thumb:{ headerH:0,  headerBg:"none",    leftW:0,  rightBg:"#fff", noHeader:true } },
  { id:"executive",   label:"Executive",   desc:"Dark premium header",             category:"Professional", thumb:{ headerH:22, headerBg:"dark",    leftW:0,  rightBg:"#fff", dark:true } },
  { id:"sideline",    label:"Sideline",    desc:"Bold full-height left sidebar",   category:"Modern",       thumb:{ headerH:0,  headerBg:"none",    leftW:32, rightBg:"#fff", headerLeft:true } },
  { id:"minimal",     label:"Minimal",     desc:"Ultra-clean whitespace",          category:"Minimal",      thumb:{ headerH:0,  headerBg:"none",    leftW:0,  rightBg:"#fff", noHeader:true } },
  { id:"bold",        label:"Bold",        desc:"Numbered strong sections",        category:"Modern",       thumb:{ headerH:20, headerBg:"none",    leftW:0,  rightBg:"#fff" } },
  { id:"elegant",     label:"Elegant",     desc:"Thin lines, centered serif",      category:"Traditional",  thumb:{ headerH:20, headerBg:"none",    leftW:0,  rightBg:"#fff" } },
  { id:"academic",    label:"Academic",    desc:"Dense CV format for academia",    category:"Academic",     thumb:{ headerH:18, headerBg:"none",    leftW:0,  rightBg:"#fff" } },
  { id:"corporate",   label:"Corporate",   desc:"Dark right sidebar",              category:"Professional", thumb:{ headerH:18, headerBg:"accent",  leftW:0,  rightBg:"#fff" } },
  { id:"timeline",    label:"Timeline",    desc:"Dot-line timeline for experience",category:"Modern",       thumb:{ headerH:16, headerBg:"none",    leftW:0,  rightBg:"#fff", dots:true } },
  { id:"metro",       label:"Metro",       desc:"Large name + right contact strip",category:"Modern",       thumb:{ headerH:0,  headerBg:"none",    leftW:0,  rightBg:"accent", headerLeft:true } },
  { id:"compact",     label:"Compact",     desc:"Dense two-column, dark header",   category:"Functional",   thumb:{ headerH:16, headerBg:"dark",    leftW:50, rightBg:"#fff", dark:true } },
  { id:"oxford",      label:"Oxford",      desc:"Traditional British CV style",    category:"Academic",     thumb:{ headerH:20, headerBg:"none",    leftW:0,  rightBg:"#fff" } },
  { id:"tech",        label:"Tech",        desc:"Terminal dark header, monospace", category:"Modern",       thumb:{ headerH:28, headerBg:"dark",    leftW:0,  rightBg:"#fff", dark:true } },
  { id:"cards",       label:"Cards",       desc:"Each section in a card box",      category:"Modern",       thumb:{ headerH:18, headerBg:"none",    leftW:28, rightBg:"#f8fafc" } },
  { id:"nordic",      label:"Nordic",      desc:"Spacious, hairline separators",   category:"Minimal",      thumb:{ headerH:0,  headerBg:"none",    leftW:0,  rightBg:"#fff", noHeader:true } },
  { id:"creative",    label:"Creative",    desc:"Dark sidebar + thin accent bar",  category:"Creative",     thumb:{ headerH:0,  headerBg:"none",    leftW:30, rightBg:"#fff", dark:true } },
  { id:"infographic", label:"Infographic", desc:"Skill bars + visual sidebar",     category:"Creative",     thumb:{ headerH:0,  headerBg:"none",    leftW:28, rightBg:"#f1f5f9", bars:true } },
  { id:"split",       label:"Split",       desc:"Strict 50/50 two-column layout",  category:"Modern",       thumb:{ headerH:0,  headerBg:"none",    leftW:50, rightBg:"#fff", noHeader:true } },
];
