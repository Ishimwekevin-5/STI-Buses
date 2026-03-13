/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { 
  Bus, 
  Users, 
  BarChart3, 
  Scan, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Home, 
  Wifi,
  Bell,
  Settings,
  MapPin,
  Navigation
} from "lucide-react";

// Fix for Leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── DATA ────────────────────────────────────────────────────────────────────
const BUSES = ["Bus A", "Bus B", "Bus C"];
const ROUTES: Record<string, string> = { 
  "Bus A": "Kicukiro → School", 
  "Bus B": "Kimironko → School", 
  "Bus C": "Nyamirambo → School" 
};

const GRADES = ["S1","S2","S3","S4","S5","S6"];

const generateInitialStudents = () => {
  const students = [];
  const firstNames = ["Amina", "David", "Grace", "Eric", "Aline", "Jean", "Diane", "Patrick", "Sonia", "Kevin", "Alice", "Bob", "Charlie", "Doris", "Eve", "Frank", "Gloria", "Henry", "Iris", "Jack", "Kathy", "Leo", "Mona", "Nick", "Olivia", "Paul", "Quincy", "Rose", "Sam", "Tina"];
  const lastNames = ["Uwimana", "Nkurunziza", "Mukamana", "Habimana", "Ingabire", "Bizimana", "Uwase", "Nshuti", "Umutoni", "Mugisha", "Mutoni", "Kayisire", "Shema", "Uwineza", "Mutesi", "Gakuba", "Umutesi", "Rugamba", "Uwera", "Ntwari", "Mukantwali", "Ndayisaba", "Ingabire", "Habineza", "Uwera", "Kagame", "Umutoni", "Mukamana", "Shema", "Uwase"];
  
  let idCounter = 1;
  BUSES.forEach(bus => {
    for (let i = 0; i < 30; i++) {
      const name = `${firstNames[i]} ${lastNames[(i + idCounter) % 30]}`;
      students.push({
        id: idCounter++,
        ref: String(102400 + idCounter),
        name,
        grade: GRADES[i % GRADES.length],
        bus,
        route: ROUTES[bus].split(" ")[0],
        paid: i !== 5 && i !== 15, // Most have paid
        parent: `0788-${100 + i}-${200 + i}`,
        photo: name.split(" ").map(n => n[0]).join("").toUpperCase(),
        term: "Term 1"
      });
    }
  });
  return students;
};

const INITIAL_STUDENTS = generateInitialStudents();

const BUS_DETAILS: Record<string, { plate: string, driver: string, phone: string }> = {
  "Bus A": { plate: "RAE 123 A", driver: "John Doe", phone: "0788-111-222" },
  "Bus B": { plate: "RAE 456 B", driver: "Jane Smith", phone: "0788-333-444" },
  "Bus C": { plate: "RAE 789 C", driver: "Mike Ross", phone: "0788-555-666" }
};

const BUS_LOCATIONS: Record<string, { lat: number, lng: number, lastUpdate: string }> = {
  "Bus A": { lat: -1.9441, lng: 30.0619, lastUpdate: "2 mins ago" },
  "Bus B": { lat: -1.9706, lng: 30.1044, lastUpdate: "Just now" },
  "Bus C": { lat: -1.9612, lng: 30.0447, lastUpdate: "5 mins ago" }
};

const TERMS = ["Term 1", "Term 2", "Term 3"];
const CURRENT_TERM = "Term 1";

type UserRole = "manager" | "student" | null;

function genRef(students: any[]) {
  const max = students.reduce((m, s) => {
    const num = parseInt(s.ref || "0");
    return Math.max(m, num);
  }, 102400);
  return String(max + 1);
}

// ─── HOME SELECTION ──────────────────────────────────────────────────────────
function HomeSelection({ onSelect }: { onSelect: (role: UserRole) => void }) {
  return (
    <div style={{ minHeight: "100vh", background: "#010409", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 800, width: "100%", textAlign: "center" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 32, color: "#ffc800", fontWeight: 800, letterSpacing: 4, marginBottom: 8 }}>STI SMART BUS</div>
          <div style={{ fontSize: 14, color: "#8b949e", letterSpacing: 2 }}>SELECT YOUR PORTAL TO CONTINUE</div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <div 
            onClick={() => onSelect("manager")}
            style={{ 
              background: "#0d1117", border: "1px solid #21262d", borderRadius: 16, padding: 40, cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", textAlign: "left", position: "relative", overflow: "hidden"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffc800"; e.currentTarget.style.transform = "translateY(-8px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#21262d"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "#ffc80022", color: "#ffc800", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Bus size={28} />
            </div>
            <div style={{ fontSize: 20, color: "#e6edf3", fontWeight: 700, marginBottom: 12 }}>Buses Manager</div>
            <div style={{ fontSize: 13, color: "#8b949e", lineHeight: 1.6 }}>Access full fleet analytics, manage student registries, and monitor real-time boarding status across all routes.</div>
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8, color: "#ffc800", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
              ENTER PORTAL <Check size={14} />
            </div>
          </div>

          <div 
            onClick={() => onSelect("student")}
            style={{ 
              background: "#0d1117", border: "1px solid #21262d", borderRadius: 16, padding: 40, cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", textAlign: "left", position: "relative", overflow: "hidden"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#58a6ff"; e.currentTarget.style.transform = "translateY(-8px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#21262d"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "#58a6ff22", color: "#58a6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Users size={28} />
            </div>
            <div style={{ fontSize: 20, color: "#e6edf3", fontWeight: 700, marginBottom: 12 }}>Student Portal</div>
            <div style={{ fontSize: 13, color: "#8b949e", lineHeight: 1.6 }}>Scan your bank slip reference for boarding, view your assigned bus details, and check driver contact information.</div>
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8, color: "#58a6ff", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
              ACCESS SCANNER <Check size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BUS DETAILS VIEW ────────────────────────────────────────────────────────
function BusDetailsView({ busName }: { busName: string }) {
  const details = BUS_DETAILS[busName];
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeSlide 0.4s ease" }}>
      <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: 32, background: "linear-gradient(180deg, #ffc80011 0%, transparent 100%)", borderBottom: "1px solid #21262d", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "#ffc80022", color: "#ffc800", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Bus size={40} />
          </div>
          <div style={{ fontSize: 24, color: "#e6edf3", fontWeight: 800 }}>{busName}</div>
          <div style={{ fontSize: 12, color: "#8b949e", letterSpacing: 2, marginTop: 4 }}>ASSIGNED TRANSPORT</div>
        </div>
        
        <div style={{ padding: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 10, color: "#8b949e", letterSpacing: 2, marginBottom: 8 }}>PLATE NUMBER</div>
              <div style={{ fontSize: 18, color: "#ffc800", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{details.plate}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#8b949e", letterSpacing: 2, marginBottom: 8 }}>ROUTE</div>
              <div style={{ fontSize: 14, color: "#e6edf3" }}>{ROUTES[busName]}</div>
            </div>
            <div style={{ gridColumn: "1/3", height: 1, background: "#21262d" }} />
            <div>
              <div style={{ fontSize: 10, color: "#8b949e", letterSpacing: 2, marginBottom: 8 }}>DRIVER NAME</div>
              <div style={{ fontSize: 16, color: "#e6edf3", fontWeight: 600 }}>{details.driver}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#8b949e", letterSpacing: 2, marginBottom: 8 }}>CONTACT</div>
              <div style={{ fontSize: 16, color: "#58a6ff", fontWeight: 600 }}>{details.phone}</div>
            </div>
          </div>

          <div style={{ marginTop: 32, padding: 20, background: "#00e67611", border: "1px solid #00e67633", borderRadius: 12, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00e676", boxShadow: "0 0 10px #00e676" }} />
            <div style={{ fontSize: 12, color: "#e6edf3" }}>This bus is currently active and on its designated route.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ toasts }: { toasts: any[] }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column-reverse", gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type==="success"?"#0a2e1a": t.type==="error"?"#2e0a0a":"#1a1a0a",
          border: `1px solid ${t.type==="success"?"#00e676": t.type==="error"?"#ff1744":"#ffc800"}`,
          borderRadius:8, padding:"12px 18px", minWidth:260,
          display:"flex", alignItems:"center", gap:10,
          animation:"toastIn 0.3s cubic-bezier(.175,.885,.32,1.275)",
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)"
        }}>
          <span style={{ fontSize:18 }}>{t.type==="success"?"✅":t.type==="error"?"❌":"⚠️"}</span>
          <span style={{ color:"#eee", fontSize:13, fontFamily:"'DM Mono', monospace" }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SCANNER VIEW ────────────────────────────────────────────────────────────
function ScannerView({ students, activeBus, boardedLogs, usedRefs, onBoard, archiveSession, addToast }: any) {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busStudents = students.filter((s: any) => s.bus === activeBus);
  const boarded = busStudents.filter((s: any) => boardedLogs.some((l: any) => l.id === s.id));
  const pending = busStudents.filter((s: any) => !boardedLogs.some((l: any) => l.id === s.id));
  const driver = BUS_DETAILS[activeBus];

  useEffect(() => { inputRef.current?.focus(); }, []);

  const verify = () => {
    const code = input.trim().toUpperCase();
    if (!code) return;
    
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setResult({ 
        ok: false, 
        code: "INVALID_FORMAT", 
        label: "Invalid Format", 
        detail: "Reference must be exactly 6 digits.", 
        student: null 
      });
      return;
    }

    setPhase("scanning");
    setResult(null);
    setTimeout(() => {
      const student = students.find((s: any) => s.ref === code);
      let verdict;
      if (!student) {
        verdict = { ok: false, code: "UNKNOWN", label: "Code Not Found", detail: `"${code}" is not registered in the system.`, student: null };
      } else if (student.bus !== activeBus) {
        verdict = { ok: false, code: "WRONG_BUS", label: "Wrong Bus", detail: `${student.name} is assigned to ${student.bus}.`, student };
      } else if (!student.paid) {
        verdict = { ok: false, code: "UNPAID", label: "Fee Pending", detail: `Transport fee not cleared for ${student.name}.`, student };
      } else if (usedRefs.includes(code)) {
        verdict = { ok: false, code: "USED", label: "Reference Used", detail: `Bank slip ${code} has already been used.`, student: students.find((s: any) => s.ref === code) };
      } else {
        verdict = { ok: true, code: "APPROVED", label: "Boarding Approved", detail: `${student.name} — ${activeBus} · ${ROUTES[activeBus]}`, student };
        onBoard(student.id, student.ref);
        addToast(`📲 SMS → ${student.parent}: "${student.name} boarded ${activeBus}"`, "success");
      }
      setResult(verdict);
      setPhase("done");
    }, 1400);
  };

  const reset = () => { setInput(""); setResult(null); setPhase("idle"); setTimeout(()=>inputRef.current?.focus(),50); };

  const scanColor = result ? (result.ok ? "#00e676" : result.code==="UNPAID"?"#ffc800":"#ff1744") : "#ffc800";

  return (
    <div style={{ display:"flex", gap:24, height:"100%" }}>
      {/* Scanner Panel */}
      <div style={{ flex:"0 0 380px", display:"flex", flexDirection:"column", gap:20 }}>
        {/* Active Bus Header */}
        <div style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:10, background:"#ffc80022", border:"1px solid #ffc80055", display:"flex", alignItems:"center", justifyContent:"center", color:"#ffc800" }}>
            <Bus size={22} />
          </div>
          <div>
            <div style={{ fontSize:11, color:"#8b949e", letterSpacing:2 }}>ACTIVE SESSION</div>
            <div style={{ fontSize:18, color:"#ffc800", fontWeight:700 }}>{activeBus}</div>
            <div style={{ fontSize:11, color:"#8b949e" }}>{ROUTES[activeBus]}</div>
          </div>
          <div style={{ marginLeft:"auto", textAlign:"right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color:"#00e676" }}>{boarded.length}</div>
              <div style={{ fontSize:10, color:"#8b949e" }}>/ {busStudents.length} boarded</div>
            </div>
            {boarded.length > 0 && (
              <button 
                onClick={archiveSession}
                style={{ 
                  padding: "6px 10px", background: "#ffc80022", border: "1px solid #ffc80044", 
                  borderRadius: 6, color: "#ffc800", fontSize: 9, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4
                }}
              >
                <FileText size={10} /> ARCHIVE LIST
              </button>
            )}
          </div>
        </div>

        {/* Scanner Box */}
        <div style={{
          background:"#0d1117", border:`2px solid ${phase==="scanning"?"#ffc800":result?scanColor:"#21262d"}`,
          borderRadius:12, padding:24, position:"relative", overflow:"hidden",
          transition:"border-color 0.3s"
        }}>
          {phase==="scanning" && (
            <div style={{ position:"absolute", left:0, right:0, height:3, background:"linear-gradient(90deg,transparent,#ffc800,transparent)", animation:"scanLine 0.7s linear infinite", zIndex:5 }} />
          )}
          <div style={{ fontSize:10, color:"#8b949e", letterSpacing:3, marginBottom:14 }}>BANK SLIP REFERENCE</div>
          <input
            ref={inputRef}
            value={input}
            onChange={e=>{
              const val = e.target.value.toUpperCase().replace(/\D/g, '');
              if (val.length <= 6) setInput(val);
            }}
            onKeyDown={e=>e.key==="Enter"&&verify()}
            placeholder="XXXXXX"
            style={{
              width:"100%", boxSizing:"border-box",
              background:"#010409", border:"1px solid #30363d",
              borderRadius:8, padding:"16px 18px",
              color:"#ffc800", fontSize:24, fontFamily:"'DM Mono',monospace",
              letterSpacing:6, textAlign:"center", transition:"all 0.2s"
            }}
          />
          <button
            onClick={verify}
            disabled={phase==="scanning"||!input.trim()}
            style={{
              marginTop:14, width:"100%", padding:"15px",
              background: phase==="scanning"||!input.trim() ? "#0d1117" : "#ffc800",
              border:"none", borderRadius:8,
              color: phase==="scanning"||!input.trim() ? "#555" : "#000",
              fontSize:13, letterSpacing:3, cursor: phase==="scanning"||!input.trim() ? "not-allowed" : "pointer",
              fontFamily:"'DM Mono',monospace", fontWeight:700, transition:"all 0.2s"
            }}
          >
            {phase==="scanning" ? "⟳  VERIFYING..." : "▶  VERIFY BANK SLIP"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            background:"#0d1117", border:`2px solid ${scanColor}`,
            borderRadius:12, padding:20, animation:"fadeSlide 0.4s ease"
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:scanColor+"22", border:`1px solid ${scanColor}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                {result.ok?"✅":result.code==="UNPAID"?"💳":result.code==="DUPLICATE"?"🔁":"❌"}
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:scanColor }}>{result.label}</div>
                <div style={{ fontSize:11, color:"#8b949e", marginTop:2 }}>{result.detail}</div>
              </div>
            </div>
            {result.student && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                {[["NAME",result.student.name],["GRADE",result.student.grade],["TERM",result.student.term],["BUS",result.student.bus],["PARENT",result.student.parent]].map(([k,v])=>(
                  <div key={k} style={{ background:"#010409", borderRadius:6, padding:"8px 10px" }}>
                    <div style={{ fontSize:9, color:"#8b949e", letterSpacing:2 }}>{k}</div>
                    <div style={{ fontSize:11, color:"#e6edf3", marginTop:2 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={reset} style={{ width:"100%", padding:"10px", background:"transparent", border:"1px solid #21262d", borderRadius:6, color:"#8b949e", fontSize:11, letterSpacing:2, cursor:"pointer", fontFamily:"'DM Mono',monospace" }}>
              ↩ SCAN NEXT
            </button>
          </div>
        )}

        {/* Quick Fill */}
        <div>
          <div style={{ fontSize:10, color:"#555", letterSpacing:2, marginBottom:10 }}>QUICK TEST</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {students.filter((s: any)=>s.bus===activeBus).map((s: any)=>(
              <button key={s.ref} onClick={()=>{setInput(s.ref);setResult(null);setPhase("idle");}} style={{
                padding:"5px 10px", background:"transparent", border:"1px solid #21262d",
                borderRadius:20, color:"#8b949e", fontSize:10, cursor:"pointer", fontFamily:"'DM Mono',monospace",
                letterSpacing:1, transition:"all 0.2s"
              }} 
              >{s.ref}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Boarding List */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:16 }}>
        {/* Driver (No Verification Required) */}
        <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#58a6ff", boxShadow: "0 0 8px #58a6ff" }} />
            <span style={{ fontSize: 11, color: "#8b949e", letterSpacing: 2 }}>DRIVER (SYSTEM VERIFIED)</span>
          </div>
          <div style={{ padding: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: "#58a6ff08" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#58a6ff22", color: "#58a6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{driver.driver[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#e6edf3" }}>{driver.driver}</div>
                <div style={{ fontSize: 10, color: "#8b949e" }}>{driver.plate} · Assigned Driver</div>
              </div>
              <div style={{ fontSize: 10, color: "#58a6ff", fontWeight: 700 }}>READY</div>
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, flex: 1 }}>
          {/* Boarded */}
          <div style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #21262d", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#00e676", boxShadow:"0 0 8px #00e676" }} />
              <span style={{ fontSize:11, color:"#8b949e", letterSpacing:2 }}>BOARDED ({boarded.length})</span>
            </div>
            <div style={{ padding:8, maxHeight:340, overflowY:"auto" }}>
              {boarded.length===0 && <div style={{ padding:"20px", textAlign:"center", color:"#555", fontSize:12 }}>No boardings yet</div>}
              {boarded.map((s: any)=>(
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, marginBottom:4, background:"#00e67608" }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:"#00e67622", color:"#00e676", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>{s.photo}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, color:"#e6edf3" }}>{s.name}</div>
                    <div style={{ fontSize:10, color:"#8b949e" }}>{s.ref} · {s.grade}</div>
                  </div>
                  <div style={{ fontSize:10, color:"#00e676" }}>✓</div>
                </div>
              ))}
            </div>
          </div>
          {/* Pending */}
          <div style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #21262d", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#ffc800", animation:"pulse 2s infinite" }} />
              <span style={{ fontSize:11, color:"#8b949e", letterSpacing:2 }}>PENDING ({pending.length})</span>
            </div>
            <div style={{ padding:8, maxHeight:340, overflowY:"auto" }}>
              {pending.length===0 && <div style={{ padding:"20px", textAlign:"center", color:"#00e676", fontSize:12 }}>🎉 All boarded!</div>}
              {pending.map((s: any)=>(
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, marginBottom:4 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:"#21262d", color:"#8b949e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>{s.photo}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, color:"#8b949e" }}>{s.name}</div>
                    <div style={{ fontSize:10, color:"#555" }}>{s.ref} · {s.grade}</div>
                  </div>
                  {!s.paid && <div style={{ fontSize:9, color:"#ffc800", background:"#ffc80022", padding:"2px 6px", borderRadius:4 }}>UNPAID</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN STUDENTS VIEW ─────────────────────────────────────────────────────
function StudentsView({ students, setStudents, addToast }: any) {
  const [modal, setModal] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState("");
  const [filterBus, setFilterBus] = useState("All");

  const filtered = students.filter((s: any) => {
    const query = search.toLowerCase();
    const matchesBus = filterBus === "All" || s.bus === filterBus;
    
    const feeStatus = s.paid ? "paid cleared" : "unpaid pending";
    
    const matchesSearch = 
      s.name.toLowerCase().includes(query) ||
      s.ref.toLowerCase().includes(query) ||
      s.grade.toLowerCase().includes(query) ||
      s.term.toLowerCase().includes(query) ||
      s.bus.toLowerCase().includes(query) ||
      s.route.toLowerCase().includes(query) ||
      feeStatus.includes(query);

    return matchesBus && matchesSearch;
  });

  const openAdd = () => { setForm({ name:"", grade:"S1", bus:"Bus A", route:"Kicukiro", paid:true, parent:"", term: CURRENT_TERM }); setModal("add"); };
  const openEdit = (s: any) => { setForm({...s}); setModal("edit"); };
  const save = () => {
    if (!form.name || !form.parent) return addToast("Fill all required fields", "error");
    if (modal === "add") {
      const nameStr = String(form.name);
      const newStudent = { 
        ...form, 
        id: Date.now(), 
        ref: genRef(students), 
        photo: nameStr.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() 
      };
      setStudents((p: any) => [...p, newStudent]);
      addToast(`${newStudent.name} added — ${newStudent.ref}`, "success");
    } else {
      setStudents((p: any) => p.map((s: any) => s.id === form.id ? { ...form } : s));
      addToast(`${form.name} updated`, "success");
    }
    setModal(null);
  };
  const del = (id: number, name: string) => { setStudents((p: any) => p.filter((s: any) => s.id !== id)); addToast(`${name} removed`, "error"); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or bank slip..."
          style={{ flex: 1, background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: "10px 14px", color: "#e6edf3", fontSize: 13, fontFamily: "'DM Mono',monospace" }} />
        {["All", ...BUSES].map(b => (
          <button key={b} onClick={() => setFilterBus(b)} style={{
            padding: "10px 16px", borderRadius: 8, border: `1px solid ${filterBus === b ? "#ffc800" : "#21262d"}`,
            background: filterBus === b ? "#ffc80022" : "transparent", color: filterBus === b ? "#ffc800" : "#8b949e",
            cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono',monospace"
          }}>{b}</button>
        ))}
        <button onClick={openAdd} style={{ padding: "10px 20px", background: "#ffc800", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono',monospace", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> ADD STUDENT
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 60px 80px 80px 100px 80px 80px", padding: "10px 16px", borderBottom: "1px solid #21262d", fontSize: 10, color: "#8b949e", letterSpacing: 2 }}>
          <span>BANK SLIP</span><span>NAME</span><span>GR</span><span>TERM</span><span>BUS</span><span>ROUTE</span><span>FEE</span><span>ACTIONS</span>
        </div>
        {filtered.map((s: any, i: number) => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr 60px 80px 80px 100px 80px 80px", padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #161b22" : "none", alignItems: "center", transition: "background 0.15s" }}
          >
            <span style={{ fontSize: 11, color: "#ffc800", fontFamily: "'DM Mono',monospace" }}>{s.ref}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: "#21262d", color: "#8b949e", display: "flex", alignItems:"center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{s.photo}</div>
              <span style={{ fontSize: 13, color: "#e6edf3" }}>{s.name}</span>
            </div>
            <span style={{ fontSize: 12, color: "#8b949e" }}>{s.grade}</span>
            <span style={{ fontSize: 10, color: "#ffc800", background: "#ffc80011", padding: "2px 6px", borderRadius: 4, width: "fit-content" }}>{s.term}</span>
            <span style={{ fontSize: 12, color: "#8b949e" }}>{s.bus}</span>
            <span style={{ fontSize: 11, color: "#8b949e" }}>{s.route}</span>
            <span style={{ fontSize: 11, color: s.paid ? "#00e676" : "#ff1744" }}>{s.paid ? "✓ Paid" : "✗ Due"}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => openEdit(s)} style={{ background: "transparent", border: "1px solid #21262d", borderRadius: 6, padding: "4px 8px", color: "#8b949e", cursor: "pointer" }}><Edit3 size={12} /></button>
              <button onClick={() => del(s.id, s.name)} style={{ background: "transparent", border: "1px solid #21262d", borderRadius: 6, padding: "4px 8px", color: "#ff1744", cursor: "pointer" }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#555", fontSize: 13 }}>No students found</div>}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 16, padding: 32, width: 480, animation: "fadeSlide 0.3s ease" }}>
            <div style={{ fontSize: 16, color: "#e6edf3", fontWeight: 700, marginBottom: 24 }}>{modal === "add" ? "ADD STUDENT" : "EDIT STUDENT"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {( [["Name", "name", "text"], ["Parent Phone", "parent", "text"]] as const).map(([label, key, type]) => (
                <div key={key} style={{ gridColumn: key === "name" ? "1/3" : "auto" }}>
                  <div style={{ fontSize: 10, color: "#8b949e", marginBottom: 6, letterSpacing: 2 }}>{label.toUpperCase()}</div>
                  <input value={form[key] || ""} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))} type={type}
                    style={{ width: "100%", boxSizing: "border-box", background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: "10px 14px", color: "#e6edf3", fontSize: 13, fontFamily: "'DM Mono',monospace" }} />
                </div>
              ))}
              {( [["Grade", "grade", GRADES], ["Term", "term", TERMS], ["Bus", "bus", BUSES]] as const).map(([label, key, opts]) => (
                <div key={key}>
                  <div style={{ fontSize: 10, color: "#8b949e", marginBottom: 6, letterSpacing: 2 }}>{label.toUpperCase()}</div>
                  <select value={form[key] || ""} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                    style={{ width: "100%", background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: "10px 14px", color: "#e6edf3", fontSize: 13, fontFamily: "'DM Mono',monospace" }}>
                    {(opts as any).map((o: string) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              {( [["Fee Paid", "paid"]] as const).map(([label, key]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", background: "#0d1117", borderRadius: 8, border: "1px solid #21262d", cursor: "pointer" }} onClick={() => setForm((p: any) => ({ ...p, [key]: !p[key] }))}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: form[key] ? "#00e676" : "#21262d", border: `1px solid ${form[key] ? "#00e676" : "#30363d"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{form[key] ? "✓" : ""}</div>
                  <span style={{ fontSize: 12, color: "#8b949e" }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #21262d", borderRadius: 8, color: "#8b949e", cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>CANCEL</button>
              <button onClick={save} style={{ flex: 2, padding: "12px", background: "#ffc800", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ students, boardedLogs, role, setView, setActiveBus }: any) {
  const total = students.length;
  const paid = students.filter((s: any)=>s.paid).length;
  const boardedCount = boardedLogs.length;

  const busStats = BUSES.map(b => ({
    bus: b, route: ROUTES[b],
    total: students.filter((s: any)=>s.bus===b).length,
    boarded: students.filter((s: any)=>s.bus===b && boardedLogs.some((l: any) => l.id === s.id)).length,
    paid: students.filter((s: any)=>s.bus===b&&s.paid).length,
  }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      {/* KPI Cards - Only for Manager */}
      {role === "manager" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {[
            { label:"TOTAL STUDENTS", value:total, color:"#ffc800", icon: Users },
            { label:"BOARDED TODAY", value:boardedCount, color:"#00e676", icon: Check },
            { label:"FEE CLEARED", value:paid, color:"#58a6ff", icon: Wifi },
          ].map(k=>(
            <div key={k.label} style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:12, padding:"20px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ fontSize:9, color:"#8b949e", letterSpacing:2 }}>{k.label}</div>
                <div style={{ color:k.color, opacity:0.7 }}><k.icon size={14}/></div>
              </div>
              <div style={{ fontSize:36, fontWeight:800, color:k.color, fontFamily:"'DM Mono',monospace" }}>{k.value}</div>
              <div style={{ height:4, background:"#21262d", borderRadius:2, marginTop:12 }}>
                <div style={{ height:"100%", background:k.color, borderRadius:2, width:`${(k.value/total)*100}%`, transition:"width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bus Status - Only for Manager */}
      {role === "manager" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {busStats.map(b=>(
            <div key={b.bus} style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:12, padding:"20px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:"#ffc80022", color:"#ffc800", display:"flex", alignItems:"center", justifyContent:"center" }}><Bus size={18}/></div>
                  <div>
                    <div style={{ fontSize:14, color:"#e6edf3", fontWeight:700 }}>{b.bus}</div>
                    <div style={{ fontSize:10, color:"#8b949e" }}>{b.route}</div>
                    <div style={{ fontSize:9, color:"#555", marginTop:2 }}>Driver: {BUS_DETAILS[b.bus].driver}</div>
                  </div>
                </div>
                <button 
                  onClick={() => { setActiveBus(b.bus); setView("fleet-map"); }}
                  style={{ 
                    padding: "6px 10px", background: "transparent", border: "1px solid #21262d", 
                    borderRadius: 6, color: "#8b949e", fontSize: 9, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4
                  }}
                >
                  <MapPin size={10} /> TRACK
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {[["STUDENTS",b.total,"#8b949e"],["BOARDED",b.boarded,"#00e676"],["FEE OK",b.paid,"#58a6ff"]].map(([l,v,c])=>(
                  <div key={l as string} style={{ background:"#161b22", borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:700, color:c as string }}>{v}</div>
                    <div style={{ fontSize:9, color:"#555", letterSpacing:1, marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ height:6, background:"#21262d", borderRadius:3, marginTop:16 }}>
                <div style={{ height:"100%", background:"linear-gradient(90deg,#00e676,#00e67688)", borderRadius:3, width:`${b.total?((b.boarded/b.total)*100):0}%`, transition:"width 0.5s" }} />
              </div>
              <div style={{ fontSize:10, color:"#8b949e", marginTop:6 }}>{b.boarded}/{b.total} boarded</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent */}
      <div style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid #21262d", fontSize:11, color:"#8b949e", letterSpacing:2 }}>RECENTLY BOARDED</div>
        {boardedLogs.length===0 && <div style={{ padding:"32px", textAlign:"center", color:"#555" }}>No boardings yet today</div>}
        {boardedLogs.slice(-10).reverse().map((log: any, i: number) => {
          const s = students.find((st: any) => st.id === log.id);
          if (!s) return null;
          return (
            <div key={log.id + log.time} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px", borderBottom:i < 9 ?"1px solid #161b22":"none" }}>
              <div style={{ width:36, height:36, borderRadius:8, background:"#00e67622", color:"#00e676", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>{s.photo}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:"#e6edf3" }}>{s.name}</div>
                <div style={{ fontSize:10, color:"#8b949e" }}>{s.ref} · {log.bus} · {s.grade}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize:10, color:"#00e676", fontWeight: 700 }}>✓ BOARDED</div>
                <div style={{ fontSize:9, color:"#555", marginTop: 2 }}>
                  {new Date(log.time).toLocaleDateString("en-RW", { day: "numeric", month: "short" })} · {new Date(log.time).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ARCHIVE VIEW ─────────────────────────────────────────────────────────────
function ArchiveView({ archives }: { archives: any[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ffc80022", color: "#ffc800", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText size={20} />
        </div>
        <div>
          <div style={{ fontSize: 18, color: "#e6edf3", fontWeight: 700 }}>Boarding Archive</div>
          <div style={{ fontSize: 11, color: "#8b949e" }}>Historical records of all bus trips and payments</div>
        </div>
      </div>

      {archives.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", background: "#0d1117", border: "1px solid #21262d", borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
          <div style={{ fontSize: 14, color: "#8b949e" }}>No archived sessions found.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {archives.map(session => (
            <div key={session.id} style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", background: "#161b22", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 13, color: "#ffc800", fontWeight: 700 }}>{session.bus}</div>
                  <div style={{ width: 1, height: 12, background: "#30363d" }} />
                  <div style={{ fontSize: 10, color: "#ffc800", background: "#ffc80011", padding: "2px 6px", borderRadius: 4 }}>{session.term}</div>
                  <div style={{ width: 1, height: 12, background: "#30363d" }} />
                  <div style={{ fontSize: 11, color: "#8b949e" }}>{new Date(session.date).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" })}</div>
                </div>
                <div style={{ fontSize: 11, color: "#00e676", fontWeight: 700 }}>{session.students.length} STUDENTS</div>
              </div>
              <div style={{ padding: "12px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {session.students.map((s: any) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, background: "#010409", borderRadius: 8, border: "1px solid #161b22" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "#21262d", color: "#8b949e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{s.photo}</div>
                      <div>
                        <div style={{ fontSize: 12, color: "#e6edf3" }}>{s.name}</div>
                        <div style={{ fontSize: 9, color: "#8b949e" }}>REF: {s.ref} · {s.grade}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FLEET MAP VIEW ──────────────────────────────────────────────────────────
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function FleetMapView({ busName, boardedLogs }: { busName: string, boardedLogs: any[] }) {
  const details = BUS_DETAILS[busName];
  const location = BUS_LOCATIONS[busName];
  const isActive = boardedLogs.some(log => log.bus === busName);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "#ffc80022", color: "#ffc800", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bus size={28} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#e6edf3" }}>{busName}</div>
            <div style={{ fontSize: 13, color: "#8b949e" }}>{details.plate} · {details.driver}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ 
            display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", 
            borderRadius: 20, background: isActive ? "#00e67622" : "#ff174422", 
            border: `1px solid ${isActive ? "#00e67644" : "#ff174444"}`,
            color: isActive ? "#00e676" : "#ff1744", fontSize: 12, fontWeight: 700
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? "#00e676" : "#ff1744", animation: isActive ? "pulse 2s infinite" : "none" }} />
            {isActive ? "ACTIVE SESSION" : "INACTIVE"}
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>Last signal: {location.lastUpdate}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, flex: 1 }}>
        {/* Interactive Map */}
        <div style={{ 
          background: "#0d1117", border: "1px solid #21262d", borderRadius: 16, 
          position: "relative", overflow: "hidden", minHeight: 400
        }}>
          <MapContainer 
            center={[location.lat, location.lng]} 
            zoom={13} 
            style={{ height: "100%", width: "100%", background: "#0d1117" }}
            zoomControl={false}
          >
            <ChangeView center={[location.lat, location.lng]} zoom={13} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {Object.entries(BUS_LOCATIONS).map(([name, loc]) => {
              const busIsActive = boardedLogs.some(log => log.bus === name);
              const busDetails = BUS_DETAILS[name];
              return (
                <Marker key={name} position={[loc.lat, loc.lng]}>
                  <Popup>
                    <div style={{ minWidth: 180, padding: "4px 0" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#ffc800", marginBottom: 4 }}>{name}</div>
                      <div style={{ fontSize: 11, color: "#333", marginBottom: 8 }}>{busDetails.plate}</div>
                      <div style={{ height: 1, background: "#eee", marginBottom: 8 }} />
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: "#666" }}>DRIVER</span>
                        <span style={{ fontSize: 10, fontWeight: 700 }}>{busDetails.driver}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: "#666" }}>STATUS</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: busIsActive ? "#00e676" : "#ff1744" }}>
                          {busIsActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                      <div style={{ fontSize: 9, color: "#999", marginTop: 8 }}>Last update: {loc.lastUpdate}</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          
          {/* Map UI Overlay */}
          <div style={{ position: "absolute", bottom: 20, left: 20, background: "#161b22cc", padding: "12px", borderRadius: 12, border: "1px solid #21262d", backdropFilter: "blur(8px)", pointerEvents: "none", zIndex: 1000 }}>
            <div style={{ fontSize: 10, color: "#8b949e", letterSpacing: 1, marginBottom: 4 }}>CURRENT COORDINATES</div>
            <div style={{ fontSize: 13, color: "#e6edf3", fontFamily: "'DM Mono',monospace" }}>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</div>
          </div>
        </div>

        {/* Info Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 11, color: "#8b949e", letterSpacing: 2, marginBottom: 16 }}>ROUTE PROGRESS</div>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: 4, top: 4, bottom: 4, width: 2, background: "#21262d" }} />
              {[
                { label: "Start: Kicukiro", done: true },
                { label: "Checkpoint 1", done: isActive },
                { label: "Checkpoint 2", done: false },
                { label: "School", done: false }
              ].map((step, i) => (
                <div key={i} style={{ marginBottom: 16, position: "relative" }}>
                  <div style={{ 
                    position: "absolute", left: -20, top: 4, width: 10, height: 10, 
                    borderRadius: "50%", background: step.done ? "#00e676" : "#21262d",
                    border: `2px solid ${step.done ? "#00e676" : "#30363d"}`,
                    boxShadow: step.done ? "0 0 8px #00e67666" : "none"
                  }} />
                  <div style={{ fontSize: 12, color: step.done ? "#e6edf3" : "#555" }}>{step.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [view, setView] = useState("dashboard");
  const [activeBus, setActiveBus] = useState("Bus A");
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [boardedLogs, setBoardedLogs] = useState<any[]>([]);
  const [usedRefs, setUsedRefs] = useState<string[]>([]);
  const [archives, setArchives] = useState<any[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);

  // For student role, we'll assume they are assigned to a specific bus (e.g., Bus A)
  const studentAssignedBus = "Bus A";

  useEffect(() => {
    if (role === "student") {
      setView("scan");
      setActiveBus(studentAssignedBus);
    } else if (role === "manager") {
      setView("dashboard");
    }
  }, [role]);

  const addToast = (msg: string, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const onBoard = (id: number, ref: string) => {
    setBoardedLogs(p => [...p, { id, time: new Date().toISOString(), bus: activeBus }]);
    setUsedRefs(p => [...p, ref]);
  };

  const archiveSession = () => {
    if (boardedLogs.length === 0) return addToast("No boardings to archive", "error");
    
    const sessionData = {
      id: Date.now(),
      bus: activeBus,
      term: CURRENT_TERM,
      date: new Date().toISOString(),
      students: students.filter(s => boardedLogs.some(l => l.id === s.id))
    };

    setArchives(p => [sessionData, ...p]);
    setBoardedLogs([]);
    addToast(`Session archived: ${boardedLogs.length} students`, "success");
  };

  if (!role) {
    return <HomeSelection onSelect={setRole} />;
  }

  const NAV = role === "manager" 
    ? [
        { id: "dashboard", icon: Home, label: "Dashboard" },
        { id: "students", icon: Users, label: "Students" },
        { id: "archive", icon: FileText, label: "Archive" },
      ]
    : [
        { id: "dashboard", icon: Home, label: "Dashboard" },
        { id: "scan", icon: Scan, label: "Scan" },
        { id: "bus-details", icon: Bus, label: `My Bus (${studentAssignedBus})` },
      ];

  return (
    <div style={{ minHeight: "100vh", background: "#010409", fontFamily: "'DM Mono',monospace", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#0d1117", borderRight: "1px solid #21262d", display: "flex", flexDirection: "column", padding: "24px 0", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 100 }}>
        <div style={{ padding: "0 20px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#ffc800", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚌</div>
            <div>
              <div style={{ fontSize: 12, color: "#ffc800", fontWeight: 700, letterSpacing: 2 }}>STI BUS</div>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>{role === "manager" ? "MANAGER PORTAL" : "STUDENT PORTAL"}</div>
            </div>
          </div>
        </div>

        {/* Bus Selector - Only for Manager */}
        {role === "manager" && (
          <div style={{ padding: "0 12px 20px" }}>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 8, paddingLeft: 8 }}>FLEET MONITOR</div>
            {BUSES.map(b => (
              <button key={b} onClick={() => { setActiveBus(b); setView("fleet-map"); }} style={{
                width: "100%", padding: "8px 12px", marginBottom: 4,
                background: (activeBus === b && view === "fleet-map") ? "#ffc80022" : "transparent",
                border: `1px solid ${(activeBus === b && view === "fleet-map") ? "#ffc80055" : "transparent"}`,
                borderRadius: 8, color: (activeBus === b && view === "fleet-map") ? "#ffc800" : "#8b949e",
                cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 12,
                display: "flex", alignItems: "center", gap: 8, textAlign: "left"
              }}>
                <Bus size={13} />{b}
              </button>
            ))}
          </div>
        )}

        {role === "manager" && <div style={{ height: 1, background: "#21262d", margin: "0 16px 20px" }} />}

        {NAV.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{
            margin: "0 12px 4px", padding: "11px 14px",
            background: view === n.id ? (role === "manager" ? "#ffc80022" : "#58a6ff22") : "transparent",
            border: `1px solid ${view === n.id ? (role === "manager" ? "#ffc80033" : "#58a6ff33") : "transparent"}`,
            borderRadius: 8, color: view === n.id ? (role === "manager" ? "#ffc800" : "#58a6ff") : "#8b949e",
            cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 12,
            display: "flex", alignItems: "center", gap: 10, textAlign: "left",
            transition: "all 0.15s"
          }}>
            <n.icon size={14} />{n.label}
          </button>
        ))}

        <div style={{ marginTop: "auto", padding: "0 20px" }}>
          <button 
            onClick={() => setRole(null)}
            style={{ 
              width: "100%", padding: "10px", background: "transparent", border: "1px solid #21262d", 
              borderRadius: 8, color: "#555", fontSize: 10, cursor: "pointer", marginBottom: 16,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}
          >
            <X size={12} /> SWITCH ROLE
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e676", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, color: "#00e676" }}>SYSTEM LIVE</span>
          </div>
          <div style={{ fontSize: 9, color: "#555" }}>STI v1.0.0 · Kigali, RW</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div style={{ height: 58, borderBottom: "1px solid #21262d", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d1117", position: "sticky", top: 0, zIndex: 50 }}>
          <div>
            <div style={{ fontSize: 16, color: "#e6edf3", fontWeight: 700 }}>
              {view === "dashboard" ? "Overview" : view === "scan" ? `Scan — ${activeBus}` : view === "bus-details" ? "Bus Assignment" : view === "fleet-map" ? `Fleet Monitor — ${activeBus}` : "Student Registry"}
            </div>
            <div style={{ fontSize: 10, color: "#8b949e" }}>
              {view === "scan" || view === "fleet-map" ? ROUTES[activeBus] : view === "students" ? `${students.length} registered` : "STI Smart Transport System"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: "#8b949e" }}>{new Date().toLocaleDateString("en-RW", { weekday: "short", day: "numeric", month: "short" })}</div>
            <div style={{ fontSize: 10, color: "#ffc800", background: "#ffc80022", padding: "4px 10px", borderRadius: 6, fontWeight: 700, letterSpacing: 1 }}>{CURRENT_TERM}</div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: role === "manager" ? "#ffc80022" : "#58a6ff22", color: role === "manager" ? "#ffc800" : "#58a6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
              {role === "manager" ? "BM" : "ST"}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          {view === "dashboard" && <Dashboard students={students} boardedLogs={boardedLogs} role={role} setView={setView} setActiveBus={setActiveBus} />}
          {view === "scan" && <ScannerView students={students} activeBus={activeBus} boardedLogs={boardedLogs} usedRefs={usedRefs} onBoard={onBoard} archiveSession={archiveSession} addToast={addToast} />}
          {view === "students" && <StudentsView students={students} setStudents={setStudents} addToast={addToast} />}
          {view === "archive" && <ArchiveView archives={archives} />}
          {view === "bus-details" && <BusDetailsView busName={studentAssignedBus} />}
          {view === "fleet-map" && <FleetMapView busName={activeBus} boardedLogs={boardedLogs} />}
        </div>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
