"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  BadgeCheck,
  FileCheck2,
  GitBranch,
  Home as HomeIcon,
  LockKeyhole,
  Menu,
  MapPinned,
  Play,
  QrCode,
  ScanSearch,
  ScrollText,
  Search,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  UserRound,
  UserRoundCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Language = "bn" | "en";
type ScreenKey =
  | "home"
  | "citizen"
  | "search"
  | "comparison"
  | "timeline"
  | "risk"
  | "forensic"
  | "officer"
  | "lock"
  | "review"
  | "report"
  | "ledger";

type DemoScenario = "corrupted" | "clean";
type AuthMode = "login" | "register";

type AuthFormState = {
  name: string;
  age: string;
  mobile: string;
  password: string;
  confirmPassword: string;
};

type StoredUser = {
  name: string;
  age: string;
  mobile: string;
  passwordHash: string;
  createdAt: string;
};

type AuthSession = Pick<StoredUser, "name" | "age" | "mobile">;

const AUTH_USERS_KEY = "landtrust-bd-demo-users";
const AUTH_SESSION_KEY = "landtrust-bd-demo-session";

type AuditEvent = {
  id: string;
  time: string;
  titleBn: string;
  titleEn: string;
  actor: string;
  hash: string;
  tone: "green" | "amber" | "red" | "blue";
};

const screenItems: Array<{
  key: ScreenKey;
  icon: LucideIcon;
  bn: string;
  en: string;
  shortBn: string;
  shortEn: string;
}> = [
  { key: "home", icon: HomeIcon, bn: "হোম", en: "Home", shortBn: "সেবার পরিচিতি", shortEn: "Service overview" },
  { key: "citizen", icon: ShieldCheck, bn: "নাগরিক সেবা", en: "Citizen Services", shortBn: "সমস্যা ও সুবিধা", shortEn: "Problems & benefits" },
  { key: "search", icon: Search, bn: "পার্সেল ও দলিল অনুসন্ধান", en: "Parcel & Deed Search", shortBn: "যাচাই শুরু", shortEn: "Start verification" },
  { key: "comparison", icon: ArrowLeftRight, bn: "রেকর্ড তুলনা", en: "Record Comparison", shortBn: "রেজিস্ট্রি বনাম নামজারি", shortEn: "Registry vs mutation" },
  { key: "timeline", icon: GitBranch, bn: "মালিকানা টাইমলাইন", en: "Ownership Timeline", shortBn: "হস্তান্তরের ইতিহাস", shortEn: "Transfer history" },
  { key: "risk", icon: ShieldAlert, bn: "ঝুঁকি বিশ্লেষণ", en: "Risk Analysis", shortBn: "স্কোর ও ব্যাখ্যা", shortEn: "Score & explanation" },
  { key: "forensic", icon: FileCheck2, bn: "ফরেনসিক PDF যাচাই", en: "Forensic PDF Verify", shortBn: "ডকুমেন্ট হ্যাশ", shortEn: "Document hash" },
  { key: "officer", icon: UserRoundCog, bn: "কর্মকর্তা কনসোল", en: "Officer Console", shortBn: "পার্সেল আইডি ও দলিল", shortEn: "Parcel ID & deeds" },
  { key: "lock", icon: LockKeyhole, bn: "সাময়িক ভূমি-লক", en: "Provisional Lock", shortBn: "হোল্ড ও পর্যালোচনা", shortEn: "Hold & review" },
  { key: "review", icon: ShieldCheck, bn: "ঊর্ধ্বতন পর্যালোচনা", en: "Senior Review", shortBn: "প্রশাসনিক সিদ্ধান্ত", shortEn: "Administrative decision" },
  { key: "report", icon: QrCode, bn: "QR যাচাই প্রতিবেদন", en: "QR Verification Report", shortBn: "যাচাই রসিদ", shortEn: "Verification receipt" },
  { key: "ledger", icon: ScrollText, bn: "অডিট লেজার", en: "Audit Ledger", shortBn: "সময়ভিত্তিক ইতিহাস", shortEn: "Timestamped history" },
];

const demoSteps: Array<{ screen: ScreenKey; time: string; bn: string; en: string }> = [
  { screen: "search", time: "0:00–0:25", bn: "Parcel 105 খুঁজে সরকারি রেকর্ড প্রস্তুত", en: "Find Parcel 105 and prepare the official record" },
  { screen: "comparison", time: "0:25–0:55", bn: "রেজিস্ট্রি ও নামজারির মালিকানা অমিল দেখান", en: "Reveal the registry–mutation ownership mismatch" },
  { screen: "risk", time: "0:55–1:30", bn: "দ্বৈত বিক্রয় শনাক্ত করে ৯৫/১০০ ঝুঁকি দেখান", en: "Trigger double-sale detection and a 95/100 risk score" },
  { screen: "lock", time: "1:30–2:00", bn: "সাময়িক লক দিয়ে কর্মকর্তার রিভিউ দেখান", en: "Place a provisional lock for officer review" },
  { screen: "review", time: "2:00–2:35", bn: "ঊর্ধ্বতন কর্মকর্তা যাচাই করে প্রশাসনিক সিদ্ধান্ত দেন", en: "Senior officer reviews the evidence and records an administrative decision" },
  { screen: "report", time: "2:35–3:00", bn: "QR রসিদ ও অডিট হ্যাশ দিয়ে যাচাই শেষ", en: "Finish with a QR receipt and audit hash" },
];

const cleanDemoSteps: Array<{ screen: ScreenKey; time: string; bn: string; en: string }> = [
  { screen: "search", time: "0:00–0:30", bn: "একটি পরিষ্কার Parcel 208 যাচাই শুরু", en: "Start verification for clean Parcel 208" },
  { screen: "comparison", time: "0:30–1:00", bn: "দুই সরকারি রেকর্ডে একই মালিক দেখা যায়", en: "Confirm the same owner across official records" },
  { screen: "risk", time: "1:00–1:35", bn: "নিম্ন ঝুঁকি ও সব নিয়ম উত্তীর্ণ দেখান", en: "Show low risk with all checks passed" },
  { screen: "report", time: "1:35–2:00", bn: "স্বাভাবিক প্রক্রিয়ার জন্য পরিষ্কার ফলাফল দিন", en: "Finish with a clear result for normal processing" },
];

const initialEvents: AuditEvent[] = [
  { id: "EVT-4105", time: "10:42:09", titleBn: "Parcel 105 অনুসন্ধান করা হয়েছে", titleEn: "Parcel 105 searched", actor: "নাগরিক পোর্টাল", hash: "a81f…92c0", tone: "blue" },
  { id: "EVT-4106", time: "10:42:11", titleBn: "রেজিস্ট্রি–নামজারি অমিল শনাক্ত", titleEn: "Registry–mutation mismatch detected", actor: "নিয়ম বিশ্লেষণ", hash: "b774…09de", tone: "amber" },
  { id: "EVT-4107", time: "10:42:13", titleBn: "সম্ভাব্য দ্বৈত বিক্রয় শনাক্ত", titleEn: "Possible double sale detected", actor: "ঝুঁকি বিশ্লেষণ", hash: "d29e…ff18", tone: "red" },
];

const registeredDocumentHash = "9423a6f06cd09ba74d3ae84f9fe6dff01d66a2f587fa69f76542bc94c829df04";

const heroSlides = [
  { src: "/images/dlrms-fields.jpg", altBn: "বাংলাদেশের সবুজ কৃষিজমির আকাশচিত্র", altEn: "Aerial view of green farmland in Bangladesh", placeBn: "বাংলাদেশের কৃষিজমি", placeEn: "Agricultural land of Bangladesh" },
  { src: "/images/bangladesh-village.jpg", altBn: "বাংলাদেশের গ্রামীণ জমি ও বসতির আকাশচিত্র", altEn: "Aerial view of rural land and settlements in Bangladesh", placeBn: "গ্রামীণ ভূমি ও বসতি", placeEn: "Rural land and settlements" },
  { src: "/images/sreemangal-tea.jpg", altBn: "শ্রীমঙ্গলের চা বাগান", altEn: "Tea garden in Sreemangal", placeBn: "শ্রীমঙ্গল, সিলেট", placeEn: "Sreemangal, Sylhet" },
];

function bilingual(language: Language, bn: string, en: string) {
  return language === "bn" ? bn : en;
}

function shortHash(value: string) {
  return value.length > 20 ? `${value.slice(0, 12)}…${value.slice(-10)}` : value;
}

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`landtrust-mark ${compact ? "compact" : ""}`} aria-hidden="true">
      <span className="mark-sun" />
      <span className="mark-fields"><i /><i /><i /></span>
      <span className="mark-check">✓</span>
      <span className="mark-glint" />
    </span>
  );
}

function ScreenGlyph({ icon: Icon, size = 18 }: { icon: LucideIcon; size?: number }) {
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}

function QrPattern() {
  const cells = useMemo(() => {
    const pattern: boolean[] = [];
    for (let row = 0; row < 21; row += 1) {
      for (let col = 0; col < 21; col += 1) {
        const finder =
          ((row < 7 && col < 7) || (row < 7 && col > 13) || (row > 13 && col < 7)) &&
          (row === 0 || row === 6 || col === 0 || col === 6 || (row > 1 && row < 5 && col > 1 && col < 5));
        const data = ((row * 7 + col * 11 + row * col) % 5 < 2) && !((row < 8 && col < 8) || (row < 8 && col > 12) || (row > 12 && col < 8));
        pattern.push(finder || data);
      }
    }
    return pattern;
  }, []);

  return (
    <div className="qr-shell" aria-label="Synthetic verification QR code">
      <div className="qr-grid">
        {cells.map((filled, index) => <span key={index} className={filled ? "filled" : ""} />)}
      </div>
      <div className="scan-beam" />
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("bn");
  const [active, setActive] = useState<ScreenKey>("home");
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("Parcel 105");
  const [searched, setSearched] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const [demoScenario, setDemoScenario] = useState<DemoScenario>("corrupted");
  const [riskScore, setRiskScore] = useState(0);
  const [lockStatus, setLockStatus] = useState<"clear" | "locked" | "review">("clear");
  const [computedHash, setComputedHash] = useState("");
  const [registeredHash, setRegisteredHash] = useState(registeredDocumentHash);
  const [fileName, setFileName] = useState("");
  const [hashBusy, setHashBusy] = useState(false);
  const [forensicScenario, setForensicScenario] = useState<DemoScenario>("corrupted");
  const [deedCreated, setDeedCreated] = useState(false);
  const [officerTool, setOfficerTool] = useState<"deed" | "parcel">("deed");
  const [parcelStatus, setParcelStatus] = useState<"idle" | "checking" | "created">("idle");
  const [events, setEvents] = useState<AuditEvent[]>(initialEvents);
  const [heroSlide, setHeroSlide] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authUser, setAuthUser] = useState<AuthSession | null>(null);
  const [authForm, setAuthForm] = useState<AuthFormState>({ name: "", age: "", mobile: "", password: "", confirmPassword: "" });
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const tx = (bn: string, en: string) => bilingual(language, bn, en);
  const activeItem = screenItems.find((item) => item.key === active) ?? screenItems[0];
  const visibleScreenItems = screenItems.filter((item) => !["citizen", "officer"].includes(item.key));
  const activeDemoSteps = demoScenario === "clean" ? cleanDemoSteps : demoSteps;
  const hashMatch = Boolean(computedHash) && computedHash === registeredHash;

  useEffect(() => {
    try {
      const savedSession = window.localStorage.getItem(AUTH_SESSION_KEY);
      if (savedSession) setAuthUser(JSON.parse(savedSession) as AuthSession);
    } catch {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    if (active !== "risk") return;
    let score = 0;
    const timer = window.setInterval(() => {
      score = Math.min(score + 5, demoScenario === "clean" ? 10 : 95);
      setRiskScore(score);
      if (score === (demoScenario === "clean" ? 10 : 95)) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [active, demoScenario]);

  useEffect(() => {
    if (active !== "home") return;
    const timer = window.setInterval(() => setHeroSlide((current) => (current + 1) % heroSlides.length), 5200);
    return () => window.clearInterval(timer);
  }, [active]);

function normalizeBangladeshMobile(value: string) {
  const banglaDigits = "০১২৩৪৫৬৭৮৯";
  const digits = value
    .replace(/[০-৯]/g, (digit) => String(banglaDigits.indexOf(digit)))
    .replace(/\D/g, "");
    if (digits.startsWith("8801")) return `0${digits.slice(3)}`;
    return digits;
  }

  function isValidBangladeshMobile(value: string) {
    return /^01[3-9]\d{8}$/.test(value);
  }

  function readStoredUsers(): StoredUser[] {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(AUTH_USERS_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed as StoredUser[] : [];
    } catch {
      return [];
    }
  }

  function updateAuthField(field: keyof AuthFormState, value: string) {
    setAuthForm((current) => ({ ...current, [field]: value }));
    setAuthError("");
    setAuthNotice("");
  }

  function openAuth(mode: AuthMode = "login") {
    setAuthMode(mode);
    setAuthOpen(true);
    setAuthError("");
    setAuthNotice("");
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function switchAuthMode(mode: AuthMode) {
    setAuthMode(mode);
    setAuthError("");
    setAuthNotice("");
    setAuthForm((current) => ({ ...current, password: "", confirmPassword: "" }));
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");
    const name = authForm.name.trim();
    const mobile = normalizeBangladeshMobile(authForm.mobile);
    const age = Number(authForm.age);
    if (!name || !authForm.age || !mobile || !authForm.password || !authForm.confirmPassword) {
      setAuthError(tx("সব প্রয়োজনীয় ঘর পূরণ করুন।", "Please complete every required field."));
      return;
    }
    if (!isValidBangladeshMobile(mobile)) {
      setAuthError(tx("সঠিক বাংলাদেশি মোবাইল নম্বর দিন—যেমন ০১৭XXXXXXXX।", "Enter a valid Bangladesh mobile number, for example 017XXXXXXXX."));
      return;
    }
    if (!Number.isInteger(age) || age < 18 || age > 120) {
      setAuthError(tx("বয়স ১৮ থেকে ১২০ বছরের মধ্যে দিন।", "Enter an age between 18 and 120."));
      return;
    }
    if (authForm.password.length < 6) {
      setAuthError(tx("পাসওয়ার্ডে কমপক্ষে ৬টি অক্ষর দিন।", "Use at least 6 characters for the password."));
      return;
    }
    if (authForm.password !== authForm.confirmPassword) {
      setAuthError(tx("দুটি পাসওয়ার্ড এক নয়।", "The two passwords do not match."));
      return;
    }
    const users = readStoredUsers();
    if (users.some((user) => user.mobile === mobile)) {
      setAuthError(tx("এই মোবাইল নম্বর দিয়ে ইতিমধ্যে নিবন্ধন করা হয়েছে।", "This mobile number is already registered."));
      return;
    }
    setAuthBusy(true);
    const passwordHash = await digestText(authForm.password);
    const user: StoredUser = { name, age: String(age), mobile, passwordHash, createdAt: new Date().toISOString() };
    window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify([...users, user]));
    setAuthForm({ name, age: String(age), mobile, password: "", confirmPassword: "" });
    setAuthMode("login");
    setAuthNotice(tx("নিবন্ধন সফল হয়েছে। এখন মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।", "Registration successful. Now sign in with your mobile number and password."));
    setAuthBusy(false);
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");
    const mobile = normalizeBangladeshMobile(authForm.mobile);
    if (!isValidBangladeshMobile(mobile) || !authForm.password) {
      setAuthError(tx("সঠিক মোবাইল নম্বর ও পাসওয়ার্ড দিন।", "Enter a valid mobile number and password."));
      return;
    }
    setAuthBusy(true);
    const passwordHash = await digestText(authForm.password);
    const user = readStoredUsers().find((candidate) => candidate.mobile === mobile && candidate.passwordHash === passwordHash);
    if (!user) {
      setAuthError(tx("মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়। আগে নিবন্ধন করে নিন।", "The mobile number or password is incorrect. Register first if needed."));
      setAuthBusy(false);
      return;
    }
    const session: AuthSession = { name: user.name, age: user.age, mobile: user.mobile };
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    setAuthUser(session);
    setAuthBusy(false);
    setAuthOpen(false);
    setAuthNotice("");
  }

  function logout() {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    setAuthUser(null);
    setAuthMode("login");
    setAuthForm((current) => ({ ...current, password: "", confirmPassword: "" }));
    setAuthNotice(tx("আপনি সফলভাবে বের হয়েছেন।", "You have been signed out successfully."));
    setAuthOpen(true);
  }

  function AuthScreen() {
    const isRegister = authMode === "register";
    return (
      <div className="auth-screen">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <div className="auth-grid-lines" />
        <header className="auth-topbar">
          <button className="auth-brand" onClick={() => setAuthOpen(false)} aria-label={tx("প্রোটোটাইপে ফিরুন", "Back to prototype")}>
            <LogoMark compact />
            <span><strong>LandTrust BD</strong><small>{tx("সুরক্ষিত ভূমি · স্বচ্ছ লেনদেন", "Secure land · transparent transactions")}</small></span>
          </button>
          <div className="auth-top-actions">
            <button className="language-toggle" onClick={() => setLanguage(language === "bn" ? "en" : "bn")} aria-label={tx("ভাষা বদলান", "Change language")}><span className={language === "bn" ? "active" : ""}>বাং</span><i /><span className={language === "en" ? "active" : ""}>EN</span></button>
            <button className="auth-back" onClick={() => setAuthOpen(false)}><ArrowLeftRight size={14} />{tx("প্রোটোটাইপে ফিরুন", "Back to prototype")}</button>
          </div>
        </header>
        <main className="auth-layout">
          <section className="auth-story">
            <div className="auth-story-kicker"><span className="pulse-dot" />{tx("নিরাপদ ডিজিটাল প্রবেশ", "SECURE DIGITAL ACCESS")}</div>
            <h1>{tx("ভূমি যাচাই শুরু হোক আপনার পরিচয় দিয়ে।", "Start a trusted land check with your identity.")}</h1>
            <p>{tx("একটি সহজ অ্যাকাউন্ট তৈরি করে পার্সেল, দলিল ও ঝুঁকি বিশ্লেষণের ডেমো সেবা নিজের জায়গা থেকে ব্যবহার করুন।", "Create a simple account to use the parcel, deed and risk-analysis demo services from one place.")}</p>
            <div className="auth-benefits">
              <div><span>১</span><div><b>{tx("সহজ নিবন্ধন", "Simple registration")}</b><small>{tx("বাংলাদেশি মোবাইল নম্বর দিয়ে শুরু করুন", "Start with a Bangladesh mobile number")}</small></div></div>
              <div><span>২</span><div><b>{tx("এক জায়গায় যাচাই", "One place to verify")}</b><small>{tx("রেকর্ড, দলিল ও ঝুঁকির ফলাফল দেখুন", "View records, deeds and risk results")}</small></div></div>
              <div><span>৩</span><div><b>{tx("স্পষ্ট পরবর্তী ধাপ", "A clear next step")}</b><small>{tx("নাগরিক সেবা বা কর্মকর্তার পথ বুঝে নিন", "Understand the citizen or officer path")}</small></div></div>
            </div>
            <div className="auth-trust-note"><ShieldCheck size={17} /><span><b>{tx("ডেমো গোপনীয়তা", "Demo privacy")}</b>{tx("এই prototype-এ তথ্য শুধু আপনার browser-এ থাকে।", "Your demo profile stays only in this browser.")}</span></div>
          </section>
          <section className="auth-card" aria-labelledby="auth-title">
            <div className="auth-card-glow" />
            <div className="auth-card-head"><div className="auth-card-icon"><UserRound size={20} /></div><div><p className="eyebrow">LANDTRUST ACCOUNT</p><h2 id="auth-title">{isRegister ? tx("নতুন অ্যাকাউন্ট তৈরি করুন", "Create an account") : tx("আপনার অ্যাকাউন্টে প্রবেশ করুন", "Sign in to your account")}</h2></div></div>
            <div className="auth-tabs" role="tablist" aria-label={tx("অ্যাকাউন্টের ধরন", "Account action")}><button role="tab" aria-selected={!isRegister} className={!isRegister ? "active" : ""} onClick={() => switchAuthMode("login")}>{tx("প্রবেশ", "Sign in")}</button><button role="tab" aria-selected={isRegister} className={isRegister ? "active" : ""} onClick={() => switchAuthMode("register")}>{tx("নিবন্ধন", "Register")}</button></div>
            {authNotice && <div className="auth-message success" role="status"><BadgeCheck size={16} /><span>{authNotice}</span></div>}
            {authError && <div className="auth-message error" role="alert"><ShieldAlert size={16} /><span>{authError}</span></div>}
            {isRegister ? <form className="auth-form" onSubmit={handleRegister}>
              <div className="auth-field-row"><label className="auth-field"><span>{tx("পূর্ণ নাম", "Full name")} <i>*</i></span><input value={authForm.name} onChange={(event) => updateAuthField("name", event.target.value)} placeholder={tx("আপনার নাম লিখুন", "Enter your name")} autoComplete="name" required /></label><label className="auth-field"><span>{tx("বয়স", "Age")} <i>*</i></span><input type="number" min="18" max="120" value={authForm.age} onChange={(event) => updateAuthField("age", event.target.value)} placeholder="১৮" autoComplete="bday" required /></label></div>
              <label className="auth-field"><span>{tx("বাংলাদেশি মোবাইল নম্বর", "Bangladesh mobile number")} <i>*</i></span><div className="auth-input-wrap"><span className="country-code">+৮৮০</span><input inputMode="tel" value={authForm.mobile} onChange={(event) => updateAuthField("mobile", event.target.value)} placeholder="০১৭XXXXXXXX" autoComplete="tel" required /></div><small>{tx("১১ সংখ্যার নম্বর, যেমন ০১৭১২৩৪৫৬৭৮", "11 digits, for example 01712345678")}</small></label>
              <label className="auth-field"><span>{tx("পাসওয়ার্ড", "Password")} <i>*</i></span><div className="auth-input-wrap"><input type={showPassword ? "text" : "password"} value={authForm.password} onChange={(event) => updateAuthField("password", event.target.value)} placeholder={tx("কমপক্ষে ৬টি অক্ষর", "At least 6 characters")} autoComplete="new-password" required /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword((current) => !current)}>{showPassword ? tx("লুকান", "Hide") : tx("দেখুন", "Show")}</button></div></label>
              <label className="auth-field"><span>{tx("পাসওয়ার্ড আবার লিখুন", "Confirm password")} <i>*</i></span><div className="auth-input-wrap"><input type={showConfirmPassword ? "text" : "password"} value={authForm.confirmPassword} onChange={(event) => updateAuthField("confirmPassword", event.target.value)} placeholder={tx("পাসওয়ার্ড মিলিয়ে দিন", "Repeat your password")} autoComplete="new-password" required /><button type="button" className="auth-password-toggle" onClick={() => setShowConfirmPassword((current) => !current)}>{showConfirmPassword ? tx("লুকান", "Hide") : tx("দেখুন", "Show")}</button></div></label>
              <button className="auth-submit" disabled={authBusy}>{authBusy ? tx("অ্যাকাউন্ট তৈরি হচ্ছে…", "Creating account…") : tx("নিবন্ধন সম্পন্ন করুন", "Complete registration")} <ArrowRight size={17} /></button>
            </form> : <form className="auth-form" onSubmit={handleLogin}>
              <label className="auth-field"><span>{tx("মোবাইল নম্বর", "Mobile number")} <i>*</i></span><div className="auth-input-wrap"><span className="country-code">+৮৮০</span><input inputMode="tel" value={authForm.mobile} onChange={(event) => updateAuthField("mobile", event.target.value)} placeholder="০১৭XXXXXXXX" autoComplete="tel" required /></div></label>
              <label className="auth-field"><span>{tx("পাসওয়ার্ড", "Password")} <i>*</i></span><div className="auth-input-wrap"><input type={showPassword ? "text" : "password"} value={authForm.password} onChange={(event) => updateAuthField("password", event.target.value)} placeholder={tx("আপনার পাসওয়ার্ড", "Enter your password")} autoComplete="current-password" required /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword((current) => !current)}>{showPassword ? tx("লুকান", "Hide") : tx("দেখুন", "Show")}</button></div></label>
              <div className="auth-form-meta"><span><ShieldCheck size={14} />{tx("ডেমো সেশন নিরাপদভাবে চালু হবে", "Demo session starts securely")}</span></div>
              <button className="auth-submit" disabled={authBusy}>{authBusy ? tx("প্রবেশ করা হচ্ছে…", "Signing in…") : tx("নিরাপদে প্রবেশ করুন", "Sign in securely")} <ArrowRight size={17} /></button>
            </form>}
            <p className="auth-switch">{isRegister ? tx("আগে থেকেই অ্যাকাউন্ট আছে?", "Already have an account?") : tx("নতুন ব্যবহারকারী?", "New to LandTrust?")} <button onClick={() => switchAuthMode(isRegister ? "login" : "register")}>{isRegister ? tx("প্রবেশ করুন", "Sign in") : tx("নিবন্ধন করুন", "Create one")}</button></p>
            {authUser && <div className="auth-session"><div><span className="session-avatar">{authUser.name.slice(0, 1)}</span><span><b>{authUser.name}</b><small>{authUser.mobile}</small></span></div><button onClick={logout}><LogOut size={14} />{tx("বের হন", "Sign out")}</button></div>}
          </section>
        </main>
        <footer className="auth-footer"><span>LandTrust BD</span><span>{tx("কাল্পনিক ডেমো · বাস্তব সরকারি অ্যাকাউন্ট নয়", "Synthetic demo · not a real government account")}</span></footer>
      </div>
    );
  }

  function goTo(screen: ScreenKey) {
    if (screen === "risk") setRiskScore(0);
    setActive(screen);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addEvent(event: AuditEvent) {
    setEvents((current) => [event, ...current]);
  }

  function selectDemoScenario(scenario: DemoScenario, reveal = true) {
    setDemoScenario(scenario);
    setQuery(scenario === "clean" ? "Parcel 208" : "Parcel 105");
    setSearched(reveal);
    setLockStatus(scenario === "clean" ? "clear" : "locked");
  }

  function runSearch(event?: FormEvent) {
    event?.preventDefault();
    const nextScenario: DemoScenario = /208/.test(query) ? "clean" : "corrupted";
    selectDemoScenario(nextScenario);
    setSearched(true);
    addEvent({
      id: `EVT-${4200 + events.length}`,
      time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
      titleBn: `${query || "Parcel 105"} যাচাই শুরু হয়েছে`,
      titleEn: `Verification started for ${query || "Parcel 105"}`,
      actor: "Citizen Portal",
      hash: "f112…81ac",
      tone: "blue",
    });
  }

  function startDemo(scenario: DemoScenario = demoScenario) {
    const steps = scenario === "clean" ? cleanDemoSteps : demoSteps;
    setDemoStep(0);
    selectDemoScenario(scenario);
    goTo(steps[0].screen);
  }

  function nextDemo() {
    if (demoStep < 0) {
      startDemo();
      return;
    }
    const steps = demoScenario === "clean" ? cleanDemoSteps : demoSteps;
    if (demoStep === steps.length - 1) {
      setDemoStep(-1);
      goTo("home");
      return;
    }
    const next = demoStep + 1;
    setDemoStep(next);
    if (demoScenario === "corrupted" && next === 3) setLockStatus("locked");
    if (demoScenario === "corrupted" && next === 4) setLockStatus("review");
    goTo(steps[next].screen);
  }

  async function digestBytes(bytes: ArrayBuffer) {
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function digestText(value: string) {
    return digestBytes(new TextEncoder().encode(value).buffer);
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setHashBusy(true);
    setFileName(file.name);
    const hash = await digestBytes(await file.arrayBuffer());
    setComputedHash(hash);
    setRegisteredHash(forensicScenario === "clean" ? hash : registeredDocumentHash);
    setHashBusy(false);
  }

  function chooseForensicScenario(scenario: DemoScenario) {
    setForensicScenario(scenario);
    if (computedHash) setRegisteredHash(scenario === "clean" ? computedHash : registeredDocumentHash);
  }

  async function loadDemoDocument() {
    setHashBusy(true);
    const bytes = new TextEncoder().encode("LandTrust BD synthetic deed DEED-2026-00105 | Parcel 105 | approved demo copy");
    const hash = await digestBytes(bytes.buffer);
    setRegisteredHash(hash);
    setComputedHash(hash);
    setForensicScenario("clean");
    setFileName("DEED-2026-00105_demo.pdf");
    setHashBusy(false);
  }

  function registerDeed() {
    setDeedCreated(true);
    addEvent({
      id: "EVT-4212",
      time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
      titleBn: "কাল্পনিক দলিলের খসড়া ও QR তৈরি", titleEn: "Synthetic deed draft and QR created",
      actor: "কর্মকর্তা কনসোল", hash: "72ef…912a", tone: "green",
    });
  }

  function createParcel(event: FormEvent) {
    event.preventDefault();
    if (parcelStatus !== "idle") return;
    setParcelStatus("checking");
    window.setTimeout(() => {
      setParcelStatus("created");
      addEvent({
        id: "EVT-P0106",
        time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        titleBn: "কাল্পনিক সরকারি পার্সেল আইডি তৈরি হয়েছে",
        titleEn: "Synthetic official Parcel ID created",
        actor: "অনুমোদিত কর্মকর্তা কনসোল",
        hash: "4ab1…c906",
        tone: "green",
      });
    }, 850);
  }

  function updateLock(status: "clear" | "locked" | "review") {
    setLockStatus(status);
    const labels = {
      clear: ["লক অবমুক্ত করা হয়েছে", "Provisional lock released"],
      locked: ["Parcel 105-এ সাময়িক লক দেওয়া হয়েছে", "Provisional lock placed on Parcel 105"],
      review: ["ঊর্ধ্বতন পর্যালোচনায় পাঠানো হয়েছে", "Escalated for senior review"],
    } as const;
    addEvent({
      id: `EVT-${4210 + events.length}`,
      time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
      titleBn: labels[status][0], titleEn: labels[status][1],
      actor: "Officer Rahman", hash: "ce91…4c22", tone: status === "clear" ? "green" : "red",
    });
  }

  function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
    return (
      <div className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="case-chip"><span /> {tx("সক্রিয় কেস", "Active case")}: <strong>Parcel 105</strong></div>
      </div>
    );
  }

  function CitizenScreen() {
    const citizenItems = visibleScreenItems.filter((item) => !["home", "citizen", "officer", "review", "ledger"].includes(item.key));
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("জনগণের জন্য ভূমি সেবা", "LAND SERVICES FOR CITIZENS")} title={tx("নাগরিক সেবায় কী সুবিধা পাবেন?", "What does Citizen Services solve?")} description={tx("জমি কেনা, উত্তরাধিকার বা দলিল যাচাইয়ের আগে সহজ ভাষায় রেকর্ড, ঝুঁকি ও পরবর্তী করণীয় বুঝে নিন।", "Before buying, inheriting or verifying land, understand the records, risks and next step in plain language.")} />
        <div className="citizen-hero"><div className="citizen-hero-mark"><ShieldCheck size={28} /></div><div><p className="eyebrow">{tx("সহজ, নিরাপদ, ব্যাখ্যাযোগ্য", "SIMPLE, SAFE, EXPLAINABLE")}</p><h2>{tx("জমি নিয়ে অনিশ্চয়তা কমান", "Reduce uncertainty before a land transaction")}</h2><p>{tx("একই জমি একাধিকবার বিক্রি, রেজিস্ট্রি ও নামজারির অমিল, নথির পরিবর্তন এবং ভুল তথ্য—এই সমস্যাগুলো আগে থেকেই বোঝার জন্য LandTrust BD আপনাকে ধাপে ধাপে সাহায্য করে।", "LandTrust BD helps you understand double-selling, registry–mutation mismatch, altered documents and inconsistent information before they become a bigger problem.")}</p></div></div>
        <div className="citizen-benefit-grid"><article><span>১</span><div><b>{tx("কেনার আগে যাচাই", "Verify before buying")}</b><p>{tx("পার্সেল আইডি বা দলিল আইডি দিয়ে আগের হস্তান্তর ও রেকর্ড মিলিয়ে দেখুন।", "Check prior transfers and records with a Parcel ID or Deed ID.")}</p></div></article><article><span>২</span><div><b>{tx("ঝুঁকির কারণ বুঝুন", "Understand the risk")}</b><p>{tx("শুধু স্কোর নয়—কোন রেকর্ডে কী অমিল, তা সহজ ভাষায় দেখুন।", "See which record conflicts and why, not just a score.")}</p></div></article><article><span>৩</span><div><b>{tx("পরবর্তী পদক্ষেপ জানুন", "Know the next step")}</b><p>{tx("কখন কর্মকর্তা পর্যালোচনা দরকার এবং কখন স্বাভাবিক প্রক্রিয়া চলবে, তা বুঝুন।", "Know when officer review is needed and when normal processing can continue.")}</p></div></article></div>
        <section className="citizen-paths"><div className="section-heading"><div><p className="eyebrow">{tx("সেবা বেছে নিন", "CHOOSE A SERVICE")}</p><h2>{tx("কোন যাচাই দিয়ে শুরু করবেন?", "Where would you like to start?")}</h2></div><p>{tx("নিচের যেকোনো সেবা বেছে নিলে একই সেবা মেনুর ধাপে নিয়ে যাবে।", "Choose any service below to continue into the same sidebar integration.")}</p></div><div className="citizen-path-grid">{citizenItems.map((item, index) => <button key={item.key} className="citizen-path" style={{ "--delay": `${index * 65}ms` } as React.CSSProperties} onClick={() => goTo(item.key)}><span><ScreenGlyph icon={item.icon} size={19} /></span><b>{language === "bn" ? item.bn : item.en}</b><small>{language === "bn" ? item.shortBn : item.shortEn}</small><ArrowRight size={15} /></button>)}</div></section>
        <div className="notice info"><span>i</span><p>{tx("সব তথ্য কাল্পনিক প্রোটোটাইপের; কোনো বাস্তব এনআইডি, ফোন নম্বর বা সরকারি রেকর্ড এখানে ব্যবহার করা হয়নি।", "All data is synthetic prototype data; no real NID, phone number or government record is used here.")}</p></div>
      </div>
    );
  }

  function HomeScreen() {
    return (
      <div className="screen-enter" key={active}>
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker"><ScanSearch size={14} strokeWidth={1.8} />{tx("ভূমি জালিয়াতি প্রতিরোধে স্মার্ট যাচাই", "Smart verification against land fraud")}</div>
            <h1>{tx("আপনার জমি ও দলিল", "Verify your land and deed")} <em>{tx("সহজে যাচাই করুন", "with confidence")}</em></h1>
            <p>{tx(
              "শুধু পার্সেল আইডি অথবা দলিল আইডি লিখুন। LandTrust BD রেজিস্ট্রি, নামজারি ও আগের হস্তান্তরের তথ্য মিলিয়ে ঝুঁকি সহজ ভাষায় দেখাবে।",
              "Enter a Parcel ID or Deed ID. LandTrust BD compares registry, mutation and transfer history, then explains any risk in plain language."
            )}</p>
            <div className="hero-actions">
              <button className="btn primary glow" onClick={() => goTo("search")}>{tx("জমি যাচাই শুরু করুন", "Start land verification")} <ArrowRight size={15} /></button>
              <button className="btn glass" onClick={startDemo}><Play className="play" size={13} fill="currentColor" />{tx("দেখে শিখুন", "Watch how it works")}</button>
            </div>
            <div className="trust-row"><span><ShieldCheck size={13} />{tx("ব্যক্তিগত তথ্য সুরক্ষিত", "Privacy protected")}</span><span><FileCheck2 size={13} />{tx("ফলাফল সহজ ভাষায়", "Plain-language result")}</span></div>
          </div>
          <div className="hero-visual">
            <div className="hero-slides">
              {heroSlides.map((slide, index) => <img key={slide.src} src={slide.src} alt={language === "bn" ? slide.altBn : slide.altEn} className={heroSlide === index ? "active" : ""} decoding="async" draggable={false} />)}
              <div className="hero-photo-shade" />
            </div>
            <div className="photo-caption"><span>{String(heroSlide + 1).padStart(2, "0")}</span><div><small>{tx("ভূমির গল্প", "LANDSCAPES")}</small><b>{language === "bn" ? heroSlides[heroSlide].placeBn : heroSlides[heroSlide].placeEn}</b></div></div>
            <div className="slide-controls">
              <button aria-label={tx("আগের ছবি", "Previous image")} onClick={() => setHeroSlide((heroSlide - 1 + heroSlides.length) % heroSlides.length)}>‹</button>
              <div>{heroSlides.map((slide, index) => <button key={slide.src} aria-label={`${tx("ছবি", "Image")} ${index + 1}`} className={heroSlide === index ? "active" : ""} onClick={() => setHeroSlide(index)} />)}</div>
              <button aria-label={tx("পরের ছবি", "Next image")} onClick={() => setHeroSlide((heroSlide + 1) % heroSlides.length)}>›</button>
            </div>
          </div>
        </section>

        <section className="impact-strip simple-journey">
          <div><span className="journey-number">১</span><span><b>{tx("নম্বর লিখুন", "Enter an ID")}</b><small>{tx("পার্সেল আইডি অথবা দলিল আইডি", "Parcel ID or Deed ID")}</small></span></div>
          <i />
          <div><span className="journey-number">২</span><span><b>{tx("রেকর্ড মিলিয়ে দেখুন", "Compare records")}</b><small>{tx("রেজিস্ট্রি, নামজারি ও ইতিহাস", "Registry, mutation and history")}</small></span></div>
          <i />
          <div><span className="journey-number">৩</span><span><b>{tx("সহজ ফলাফল পান", "Get a clear result")}</b><small>{tx("ঝুঁকি, কারণ ও পরবর্তী করণীয়", "Risk, reasons and next step")}</small></span></div>
        </section>

        <section className="scenario-section">
          <div className="section-heading"><div><p className="eyebrow">{tx("দুটি ডেমো কেস", "TWO DEMO CASES")}</p><h2>{tx("দুই ধরনের ফলাফল দেখুন", "See both possible outcomes")}</h2></div><p>{tx("একটি ঝুঁকিপূর্ণ রেকর্ড কীভাবে পর্যালোচনায় যায় এবং একটি পরিষ্কার রেকর্ড কীভাবে স্বাভাবিক প্রক্রিয়ায় থাকে—দুটিই দেখানো যাবে।", "Show how a risky record goes to review while a clean record continues to normal processing.")}</p></div>
          <div className="scenario-grid">
            <button className="scenario-card corrupted" onClick={() => startDemo("corrupted")}><span className="scenario-icon">!</span><span><b>{tx("সমস্যাযুক্ত পার্সেল / দলিল", "Corrupted parcel / deed")}</b><small>{tx("অমিল, দ্বৈত বিক্রয় ও ঊর্ধ্বতন পর্যালোচনা", "Mismatch, double sale and senior review")}</small></span><ArrowUpRight size={16} /></button>
            <button className="scenario-card clean" onClick={() => startDemo("clean")}><span className="scenario-icon">✓</span><span><b>{tx("পরিষ্কার পার্সেল / দলিল", "Clean parcel / deed")}</b><small>{tx("সব রেকর্ড মিলে গেলে কম ঝুঁকির ফলাফল", "Low-risk result when records agree")}</small></span><ArrowUpRight size={16} /></button>
          </div>
        </section>

        <section className="services-section">
          <div className="section-heading"><div><p className="eyebrow">{tx("আপনার প্রয়োজন বেছে নিন", "CHOOSE A SERVICE")}</p><h2>{tx("আপনি কোন কাজটি করতে চান?", "What would you like to do?")}</h2></div><p>{tx("প্রতিটি সেবায় ধাপে ধাপে নির্দেশনা আছে। ভুল হলেও আগের ধাপে ফিরে যেতে পারবেন।", "Every service provides step-by-step guidance, and you can always go back.")}</p></div>
          <div className="service-grid">
            {visibleScreenItems.slice(1).filter((item) => item.key !== "citizen").map((item, index) => (
              <button key={item.key} className="service-card" style={{ "--delay": `${index * 55}ms` } as React.CSSProperties} onClick={() => goTo(item.key)}>
                <span className="service-icon"><ScreenGlyph icon={item.icon} size={20} /></span><span><b>{language === "bn" ? item.bn : item.en}</b><small>{language === "bn" ? item.shortBn : item.shortEn}</small></span><ArrowUpRight className="service-arrow" size={16} />
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function SearchScreen() {
    const cleanCase = demoScenario === "clean";
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("ধাপ ০১ · নাগরিক সেবা", "STEP 01 · CITIZEN SERVICE")} title={tx("পার্সেল ও দলিল অনুসন্ধান", "Parcel & Deed Search")} description={tx("পার্সেল শনাক্তকারী অথবা কাল্পনিক দলিল আইডি দিয়ে একীভূত যাচাই শুরু করুন।", "Start a unified verification with a parcel identifier or synthetic deed ID.")} />
        <div className="notice info"><span>i</span><p><b>{tx("ডেমো তথ্য:", "Demo data:")}</b> {tx("‘Parcel 105’ বা ‘DEED-2026-00105’ লিখুন। কোনো বাস্তব ব্যক্তিগত তথ্য ব্যবহার করবেন না।", "Use ‘Parcel 105’ or ‘DEED-2026-00105’. Do not enter real personal data.")}</p></div>
        <div className="search-scenario-selector">
          <div className="search-scenario-heading">
            <span className="eyebrow">{tx("ডেমো পথ বেছে নিন", "CHOOSE A DEMO PATH")}</span>
            <b>{tx("একই পাতায় দুই ধরনের যাচাই প্রক্রিয়া দেখুন", "Preview both verification pipelines on this page")}</b>
          </div>
          <div className="search-scenario-options">
            <button type="button" className={`search-scenario-option danger ${!cleanCase ? "active" : ""}`} onClick={() => selectDemoScenario("corrupted")}>
              <span className="scenario-mini-icon">!</span>
              <span><strong>Parcel 105</strong><small>{tx("ঝুঁকিপূর্ণ প্রক্রিয়া · পর্যালোচনা প্রয়োজন", "Risk pipeline · review required")}</small></span>
              <i>→</i>
            </button>
            <button type="button" className={`search-scenario-option safe ${cleanCase ? "active" : ""}`} onClick={() => selectDemoScenario("clean")}>
              <span className="scenario-mini-icon">✓</span>
              <span><strong>Parcel 208</strong><small>{tx("ঝুঁকিমুক্ত প্রক্রিয়া · স্বাভাবিক প্রক্রিয়া", "Clean pipeline · normal processing")}</small></span>
              <i>→</i>
            </button>
          </div>
        </div>
        <form className="search-panel" onSubmit={runSearch}>
          <div className="search-type">
            <label className="radio active"><span>●</span>{tx("পার্সেল আইডি", "Parcel ID")}</label>
            <label className="radio"><span>○</span>{tx("দলিল আইডি", "Deed ID")}</label>
          </div>
          <div className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} aria-label={tx("পার্সেল বা দলিল আইডি", "Parcel or deed ID")} placeholder={tx("Parcel 105 অথবা DEED-2026-00105", "Parcel 105 or DEED-2026-00105")} /><button>{tx("যাচাই করুন", "Verify now")} <i>→</i></button></div>
          <div className="example-row"><span>{tx("উদাহরণ", "Try")}</span><button type="button" onClick={() => setQuery("Parcel 105")}>Parcel 105</button><button type="button" onClick={() => setQuery("DEED-2026-00105")}>DEED-2026-00105</button></div>
        </form>
        {searched && <div className="result-card reveal" data-scenario={cleanCase ? "clean" : "corrupted"}>
          <div className="result-top"><div className="success-mark">✓</div><div><p className="eyebrow">{tx("কাল্পনিক রেকর্ড পাওয়া গেছে", "SYNTHETIC RECORD FOUND")}</p><h2>{cleanCase ? "Parcel 208" : "Parcel 105"}</h2><p>{tx("সাভার মডেল জোন · ঢাকা · ডেমো মৌজা ০৭", "Savar Model Zone · Dhaka · Demo Mouza 07")}</p></div><span className={`risk-pill ${cleanCase ? "low" : "high"}`}>{cleanCase ? tx("নিম্ন ঝুঁকি", "LOW RISK") : tx("উচ্চ ঝুঁকি", "HIGH RISK")}</span></div>
          <div className="record-grid"><div><span>{tx("দলিল আইডি", "Deed ID")}</span><b>{cleanCase ? "DEED-2026-00208" : "DEED-2026-00105"}</b></div><div><span>{tx("খতিয়ান", "Khatian")}</span><b>{cleanCase ? "RS-5208" : "RS-4405"}</b></div><div><span>{tx("জমির পরিমাণ", "Land area")}</span><b>12.50 {tx("শতক", "decimal")}</b></div><div><span>{tx("বর্তমান অবস্থা", "Current status")}</span><b className={cleanCase ? "green-text" : "red-text"}>{cleanCase ? tx("নিয়মিত প্রক্রিয়া", "Normal processing") : tx("পর্যালোচনা প্রয়োজন", "Review required")}</b></div></div>
          <div className="pipeline" data-scenario={cleanCase ? "clean" : "corrupted"}>
            {[tx("ইনপুট", "Input"), tx("স্বাভাবিকীকরণ", "Normalize"), "SHA-256", tx("রেকর্ড মিল", "Cross-match"), tx("ঝুঁকি বিশ্লেষণ", "Risk")].map((label, index) => <div className="pipe-step" key={label} style={{ "--delay": `${index * 160}ms` } as React.CSSProperties}><span>{index < 4 || cleanCase ? "✓" : "!"}</span><small>{label}</small></div>)}
          </div>
          <button className="btn primary next-action" onClick={() => goTo("comparison")}>{tx("রেকর্ড তুলনা দেখুন", "View record comparison")} <span>→</span></button>
        </div>}
      </div>
    );
  }

  function ComparisonScreen() {
    const cleanCase = demoScenario === "clean";
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("ধাপ ০২ · রেকর্ড সমন্বয়", "STEP 02 · RECORD RECONCILIATION")} title={tx("রেজিস্ট্রি ও নামজারি রেকর্ড তুলনা", "Registry & Mutation Comparison")} description={tx("একই পার্সেলের দুই উৎস পাশাপাশি দেখে অমিলটি ব্যাখ্যা করা হচ্ছে।", "Two sources for the same parcel are compared side-by-side with an explanation of every mismatch.")} />
        <div className="comparison-layout">
            <article className="record-source registry slide-left"><div className="source-header"><div className="source-icon">R</div><div><span>{tx("সাব-রেজিস্ট্রি রেকর্ড", "SUB-REGISTRY RECORD")}</span><h3>{tx("নিবন্ধিত দলিল", "Registered deed")}</h3></div><i className="verified">✓ {tx("যাচাইকৃত", "Verified")}</i></div>
            <dl><div><dt>{tx("দলিল নং", "Deed no.")}</dt><dd>{cleanCase ? "DEED-2026-00208" : "DEED-2026-00105"}</dd></div><div><dt>{tx("গ্রহীতা / মালিক", "Buyer / owner")}</dt><dd className="highlight-ok">Karim-REF-22</dd></div><div><dt>{tx("বিক্রেতা", "Seller")}</dt><dd>Rahim-REF-08</dd></div><div><dt>{tx("নিবন্ধনের তারিখ", "Registration date")}</dt><dd>12 Oct 2026</dd></div><div><dt>{tx("জমির পরিমাণ", "Land area")}</dt><dd>12.50 {tx("শতক", "decimal")}</dd></div></dl>
          </article>
          <div className={cleanCase ? "mismatch-core match-core" : "mismatch-core"}><span>{cleanCase ? "✓" : "≠"}</span><b>{cleanCase ? tx("রেকর্ড মিলেছে", "RECORDS MATCH") : tx("মালিকানা অমিল", "OWNER MISMATCH")}</b><small>{cleanCase ? tx("সব ঘর সামঞ্জস্যপূর্ণ", "All fields consistent") : tx("২টি ঘরে অমিল", "2 conflicting fields")}</small></div>
          <article className="record-source mutation slide-right"><div className="source-header"><div className="source-icon">M</div><div><span>{tx("নামজারি রেকর্ড", "MUTATION RECORD")}</span><h3>{tx("বর্তমান নামজারি", "Current mutation")}</h3></div><i className={cleanCase ? "verified" : "stale"}>{cleanCase ? "✓" : "!"} {cleanCase ? tx("সিঙ্ক হয়েছে", "Synced") : tx("পুরোনো", "Stale")}</i></div>
            <dl><div><dt>{tx("কেস নং", "Case no.")}</dt><dd>{cleanCase ? "MUT-2026-8208" : "MUT-2025-7781"}</dd></div><div><dt>{tx("নামজারি মালিক", "Mutation owner")}</dt><dd className={cleanCase ? "highlight-ok" : "highlight-bad"}>{cleanCase ? "Karim-REF-22" : "Rahim-REF-08"}</dd></div><div><dt>{tx("সর্বশেষ হালনাগাদ", "Last updated")}</dt><dd className={cleanCase ? "highlight-ok" : "highlight-bad"}>{cleanCase ? "12 Oct 2026" : "03 Dec 2025"}</dd></div><div><dt>{tx("অবস্থা", "Status")}</dt><dd>{tx("নিষ্পন্ন", "Completed")}</dd></div><div><dt>{tx("জমির পরিমাণ", "Land area")}</dt><dd>12.50 {tx("শতক", "decimal")}</dd></div></dl>
          </article>
        </div>
          <div className={`explanation-card ${cleanCase ? "clean-explanation" : ""}`}><span className="explain-icon">{cleanCase ? "✓" : "!"}</span><div><p className="eyebrow">{cleanCase ? "OFFICIAL_RECORD_SYNC" : "RULE-02 · OWNER_SYNC_MISMATCH"}</p><h3>{cleanCase ? tx("রেজিস্ট্রি ও নামজারিতে একই মালিক", "Registry and mutation show the same owner") : tx("রেজিস্ট্রিতে নতুন মালিক, কিন্তু নামজারিতে পুরোনো মালিক", "Registry shows the new owner; mutation still shows the previous owner")}</h3><p>{cleanCase ? tx("এই ডেমো রেকর্ডে মালিকানা, জমির পরিমাণ ও হালনাগাদের তারিখ সামঞ্জস্যপূর্ণ। স্বাভাবিক প্রক্রিয়া চালানো যায়।", "Ownership, area and update date are consistent in this demo record. Normal processing can continue.") : tx("এটি নিজে অপরাধের চূড়ান্ত প্রমাণ নয়। তবে একই পার্সেল পুনরায় বিক্রির চেষ্টা হলে এটি গুরুত্বপূর্ণ ঝুঁকি সংকেত।", "This is not conclusive proof of fraud by itself, but it becomes a critical signal if another sale is attempted for the same parcel.")}</p></div><button className="text-button" onClick={() => goTo(cleanCase ? "risk" : "timeline")}>{tx(cleanCase ? "ঝুঁকি ফলাফল দেখুন" : "টাইমলাইন দেখুন", cleanCase ? "View risk result" : "Open timeline")} →</button></div>
      </div>
    );
  }

  function TimelineScreen() {
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("ধাপ ০৩ · মালিকানা জ্ঞানচিত্র", "STEP 03 · OWNERSHIP KNOWLEDGE GRAPH")} title={tx("মালিকানা ও হস্তান্তর টাইমলাইন", "Ownership & Transfer Timeline")} description={tx("পার্সেল, ব্যক্তি, দলিল ও সময়ের সম্পর্ক এক চিত্রে দেখানো হয়েছে।", "Parcel, people, deeds and time are connected in one explainable view.")} />
        <div className="graph-card">
          <div className="graph-tools"><span className="live-indicator"><i />{tx("সম্পর্ক বিশ্লেষণ সক্রিয়", "Relationship analysis active")}</span><div><button>−</button><button>+</button><button>⤢</button></div></div>
          <div className="ownership-graph">
            <div className="graph-node person old"><span>R</span><b>Rahim-REF-08</b><small>{tx("পূর্ববর্তী মালিক", "Previous owner")}</small></div>
            <div className="edge edge-one"><span>12 Oct 2026 · DEED-00105</span></div>
            <div className="graph-node parcel-node"><span>▦</span><b>Parcel 105</b><small>12.50 {tx("শতক", "decimal")}</small></div>
            <div className="edge edge-two valid"><span>{tx("বৈধ হস্তান্তর", "Valid transfer")}</span></div>
            <div className="graph-node person current"><span>K</span><b>Karim-REF-22</b><small>{tx("নিবন্ধিত গ্রহীতা", "Registered buyer")}</small></div>
            <div className="edge edge-three danger"><span>{tx("নতুন বিক্রয় চেষ্টা", "New sale attempt")}</span></div>
            <div className="graph-node person blocked"><span>S</span><b>Sakib-REF-31</b><small>{tx("দ্বিতীয় ক্রেতা", "Second buyer")}</small></div>
            <div className="collision-pulse">!</div>
          </div>
          <div className="timeline-strip"><div className="time-point done"><span>✓</span><b>03 Dec 2025</b><small>{tx("নামজারি", "Mutation")}</small></div><i /><div className="time-point done"><span>✓</span><b>12 Oct 2026</b><small>{tx("প্রথম বিক্রয়", "First sale")}</small></div><i className="danger-line" /><div className="time-point alert"><span>!</span><b>17 Oct 2026</b><small>{tx("দ্বিতীয় বিক্রয় চেষ্টা", "Second sale attempt")}</small></div></div>
        </div>
          <div className="notice danger pulse-notice"><span>!</span><p><b>{tx("সম্ভাব্য দ্বৈত বিক্রয়:", "Possible double sale:")}</b> {tx("নিবন্ধিত হস্তান্তরের ৫ দিন পর একই বিক্রেতা একই পার্সেল নতুন ক্রেতার কাছে হস্তান্তরের চেষ্টা করেছেন।", "Five days after a registered transfer, the same seller attempted to transfer the same parcel to another buyer.")}</p><button onClick={() => goTo("risk")}>{tx("ঝুঁকি দেখুন", "View risk")}</button></div>
      </div>
    );
  }

  function RiskScreen() {
    const cleanCase = demoScenario === "clean";
    const ringStyle = { "--score": `${riskScore * 3.6}deg` } as React.CSSProperties;
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("ধাপ ০৪ · ব্যাখ্যাযোগ্য বিশ্লেষণ", "STEP 04 · EXPLAINABLE ANALYSIS")} title={tx("জালিয়াতি ঝুঁকি বিশ্লেষণ", "Fraud Risk Analysis")} description={tx("প্রতিটি নিয়মের সংকেত, তার ওজন ও করণীয় আলাদাভাবে দেখুন।", "See every rule hit, its weight and the recommended action.")} />
        <div className="risk-dashboard">
          <div className={`score-card ${cleanCase ? "safe" : "critical"}`}><div className="score-ring" style={ringStyle}><div><strong>{riskScore}</strong><span>/100</span></div></div><p className="eyebrow">{tx("সমন্বিত ঝুঁকি স্কোর", "COMPOSITE RISK SCORE")}</p><h2>{cleanCase ? tx("নিম্ন ঝুঁকি", "LOW RISK") : tx("অতি উচ্চ ঝুঁকি", "CRITICAL RISK")}</h2><p>{cleanCase ? tx("সব প্রধান রেকর্ড যাচাই উত্তীর্ণ হয়েছে; স্বাভাবিক প্রক্রিয়া চলতে পারে।", "All major record checks passed; normal processing can continue.") : tx("স্বয়ংক্রিয় অনুমোদন বন্ধ করে কর্মকর্তার পর্যালোচনা প্রয়োজন।", "Automatic approval is paused; officer review is required.")}</p><div className="confidence"><span>{tx("বিশ্লেষণ আস্থা", "Analysis confidence")}</span><b>{cleanCase ? "99%" : "98%"}</b><i><em /></i></div></div>
          <div className="rules-card"><div className="card-title"><div><p className="eyebrow">{tx("নিয়মভিত্তিক ব্যাখ্যা", "RULE-BASED EXPLANATION")}</p><h3>{cleanCase ? tx("সব প্রধান সংকেত পাস", "All major checks passed") : tx("৩টি প্রধান সংকেত শনাক্ত", "3 major signals detected")}</h3></div><span>{cleanCase ? "3 / 3" : "3 / 8"}</span></div>
            {cleanCase ? <><div className="rule-hit green"><span className="rule-index">✓</span><div><b>RULE-01 · OFFICIAL_RECORD_MATCH</b><p>{tx("রেজিস্ট্রি ও নামজারি রেকর্ডে একই মালিক, জমির পরিমাণ ও হালনাগাদের তথ্য পাওয়া গেছে।", "Registry and mutation show the same owner, area and update information.")}</p></div><strong>{tx("উত্তীর্ণ", "PASS")}</strong></div><div className="rule-hit green"><span className="rule-index">✓</span><div><b>RULE-02 · NO_TRANSFER_OVERLAP</b><p>{tx("এই পার্সেলের জন্য কোনো বিরোধপূর্ণ হস্তান্তর পাওয়া যায়নি।", "No conflicting transfer was found for this parcel.")}</p></div><strong>{tx("উত্তীর্ণ", "PASS")}</strong></div><div className="rule-hit green"><span className="rule-index">✓</span><div><b>RULE-05 · SELLER_AUTHORITY_OK</b><p>{tx("বিক্রেতার পরিচিতি সর্বশেষ সরকারি মালিকের সঙ্গে মিলে গেছে।", "Seller reference matches the latest official owner.")}</p></div><strong>{tx("উত্তীর্ণ", "PASS")}</strong></div><div className="formula"><span>{tx("ফলাফল", "Result")}</span><code>3 checks passed = LOW RISK</code><small>{tx("নিয়মভিত্তিক ডেমো — যন্ত্রশিক্ষার পূর্বাভাস নয়", "Rule-based demo — not an ML prediction")}</small></div></> : <><div className="rule-hit red"><span className="rule-index">01</span><div><b>RULE-01 · DOUBLE_SALE_OVERLAP</b><p>{tx("একই পার্সেলের পূর্ববর্তী হস্তান্তর সক্রিয় থাকা অবস্থায় নতুন বিক্রয়ের অভিপ্রায় পাওয়া গেছে।", "A new sale intent was found while a prior transfer for the same parcel remains active.")}</p></div><strong>+55</strong></div><div className="rule-hit amber"><span className="rule-index">02</span><div><b>RULE-02 · OWNER_SYNC_MISMATCH</b><p>{tx("রেজিস্ট্রি মালিক Karim-REF-22; নামজারি মালিক Rahim-REF-08।", "Registry owner is Karim-REF-22; mutation owner is Rahim-REF-08.")}</p></div><strong>+25</strong></div><div className="rule-hit amber"><span className="rule-index">03</span><div><b>RULE-05 · SELLER_AUTHORITY_FAIL</b><p>{tx("নতুন হস্তান্তরের বিক্রেতা সর্বশেষ নিবন্ধিত মালিক নন।", "The seller in the new transfer is not the latest registered owner.")}</p></div><strong>+15</strong></div><div className="formula"><span>{tx("স্কোর", "Score")}</span><code>55 + 25 + 15 = 95</code><small>{tx("নিয়মভিত্তিক ডেমো — যন্ত্রশিক্ষার পূর্বাভাস নয়", "Rule-based demo — not an ML prediction")}</small></div></>}
          </div>
        </div>
        <div className={`recommended-action ${cleanCase ? "safe-action" : ""}`}><div className="shield-icon">{cleanCase ? "✓" : "◆"}</div><div><p className="eyebrow">{tx("প্রস্তাবিত সিদ্ধান্ত", "RECOMMENDED DECISION")}</p><h3>{cleanCase ? tx("স্বাভাবিক প্রক্রিয়া চালিয়ে যান", "Continue normal processing") : tx("লেনদেন সাময়িকভাবে স্থগিত করুন", "Temporarily hold the transaction")}</h3><p>{cleanCase ? tx("কোনো ঊর্ধ্বতন পর্যালোচনা বা সাময়িক লক প্রয়োজন নেই; ফলাফলটি রসিদ হিসেবে প্রকাশ করা যাবে।", "No senior review or provisional lock is needed; the result can be issued as a receipt.") : tx("মূল দলিল, নামজারি কেস এবং বিক্রেতার বর্তমান কর্তৃত্ব কর্মকর্তা যাচাই করবেন।", "An officer should verify the original deed, mutation case and the seller’s current authority.")}</p></div><button className={cleanCase ? "btn primary" : "btn danger-btn"} onClick={() => cleanCase ? goTo("report") : (updateLock("locked"), goTo("lock"))}>{cleanCase ? tx("পরিষ্কার প্রতিবেদন দেখুন", "View clear report") : tx("সাময়িক লক দিন", "Place provisional lock")} <span>▣</span></button></div>
      </div>
    );
  }

  function ForensicScreen() {
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("প্রাতিষ্ঠানিক যাচাই", "INSTITUTIONAL VERIFICATION")} title={tx("ফরেনসিক PDF যাচাই", "Forensic PDF Verification")} description={tx("ব্রাউজারেই PDF-এর SHA-256 ডাইজেস্ট হিসাব করে নিবন্ধিত ডাইজেস্টের সঙ্গে তুলনা করা হয়।", "The browser computes a PDF SHA-256 digest and compares it with the registered digest.")} />
        <div className="forensic-scenarios"><div><b>{tx("ডেমোর ফলাফল বেছে নিন", "Choose demo outcome")}</b><small>{tx("যেকোনো PDF দিলে নির্বাচিত পরিস্থিতি অনুযায়ী ফলাফল দেখাবে।", "Any PDF will receive the selected demo outcome.")}</small></div><div><button className={forensicScenario === "corrupted" ? "active danger" : ""} onClick={() => chooseForensicScenario("corrupted")}>! {tx("সমস্যাযুক্ত", "Corrupted")}</button><button className={forensicScenario === "clean" ? "active safe" : ""} onClick={() => chooseForensicScenario("clean")}>✓ {tx("পরিষ্কার", "Clean")}</button></div></div>
        <div className="forensic-grid">
          <div className="upload-card"><div className="upload-zone"><div className="upload-icon">⇧</div><h3>{tx("দলিল PDF এখানে দিন", "Drop the deed PDF here")}</h3><p>{tx("শুধু ডেমো/কাল্পনিক নথি ব্যবহার করুন · সর্বোচ্চ ১০ MB", "Use demo/synthetic documents only · Up to 10 MB")}</p><label className="btn primary">{tx("PDF নির্বাচন করুন", "Choose PDF")}<input type="file" accept="application/pdf" onChange={handleFile} /></label><span>{tx("অথবা", "or")}</span><button className="text-button" onClick={loadDemoDocument}>{tx("নিরাপদ ডেমো নথি চালান", "Load safe demo document")}</button></div>{fileName && <div className="file-row"><span>PDF</span><div><b>{fileName}</b><small>{hashBusy ? tx("হ্যাশ হিসাব হচ্ছে…", "Computing hash…") : tx("SHA-256 প্রস্তুত", "SHA-256 ready")}</small></div><i>✓</i></div>}</div>
          <div className="hash-card"><p className="eyebrow">{tx("অখণ্ডতা যাচাই", "INTEGRITY CHECK")}</p><h3>{tx("নথির ডিজিটাল ছাপ তুলনা", "Document fingerprint comparison")}</h3><div className="hash-row"><span>{tx("গণনা করা হ্যাশ", "Computed hash")}</span><code>{computedHash ? shortHash(computedHash) : "—"}</code></div><div className="hash-divider"><i /><span>{computedHash ? (hashMatch ? "=" : "≠") : "?"}</span><i /></div><div className="hash-row"><span>{tx("নিবন্ধিত হ্যাশ", "Registered hash")}</span><code>{shortHash(registeredHash)}</code></div><div className={`hash-verdict ${computedHash ? (hashMatch ? "match" : "mismatch") : "waiting"}`}><span>{computedHash ? (hashMatch ? "✓" : "!") : "…"}</span><div><b>{computedHash ? (hashMatch ? tx("অপরিবর্তিত নথি", "Document intact") : tx("সম্ভাব্য পরিবর্তন", "Possible tampering")) : tx("নথির অপেক্ষায়", "Waiting for document")}</b><small>{computedHash ? (hashMatch ? tx("দুটি ডিজিটাল ছাপ হুবহু মিলেছে।", "Both fingerprints match exactly.") : tx("ডাইজেস্ট না মেলায় হাতে পর্যালোচনা প্রয়োজন।", "Digest mismatch requires manual review.")) : tx("আপলোড করলে তুলনা শুরু হবে।", "Upload to start comparison.")}</small></div></div></div>
        </div>
        <div className="notice info"><span>i</span><p>{tx("গোপনীয়তা: নথি সার্ভারে পাঠানো হচ্ছে না; প্রোটোটাইপে হ্যাশ ব্রাউজারের মেমোরিতে তৈরি হয়। বাস্তব ব্যবস্থাতেও ব্যক্তিগত তথ্য ব্লকচেইনে রাখা হবে না।", "Privacy note: the file is not sent to a server; this prototype computes the hash in browser memory. Personal data would never be stored on-chain in production.")}</p></div>
      </div>
    );
  }

  function OfficerScreen() {
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("সুরক্ষিত প্রশাসনিক মডিউল · অনুকরণ", "RESTRICTED ADMINISTRATIVE MODULE · SIMULATION")} title={tx("কর্মকর্তা কনসোল", "Officer Console")} description={tx("শুধু অনুমোদিত কর্মকর্তা ও অ্যাডমিনের জন্য পার্সেল আইডি তৈরি এবং কাল্পনিক দলিল নিবন্ধনের প্রোটোটাইপ।", "A prototype for Parcel ID creation and synthetic deed registration, available only to authorized officers and administrators.")} />
        <div className="officer-access-note"><LockKeyhole size={17} /><div><b>{tx("নাগরিক প্রবেশ বন্ধ", "Citizen access disabled")}</b><span>{tx("বাস্তব ব্যবস্থায় ভূমিকা-ভিত্তিক লগইন ছাড়া এই মেনু ও পথ দেখা যাবে না। প্রোটোটাইপ পর্যালোচনার জন্য অনুমোদিত সেশন দেখানো হচ্ছে।", "In production, this menu and route remain hidden without role-based login. An authorized session is shown for prototype review.")}</span></div><strong>{tx("অ্যাডমিন / কর্মকর্তা", "ADMIN / OFFICER ONLY")}</strong></div>
        <div className="officer-banner"><div className="avatar">MR</div><div><b>{tx("মোঃ রহমান · ডেমো কর্মকর্তা", "Md Rahman · Demo Officer")}</b><span>{tx("অনুমোদিত ভূমি রেকর্ড কর্মকর্তা · সাভার মডেল জোন", "Authorized Land Records Officer · Savar Model Zone")}</span></div><i><BadgeCheck size={12} /> {tx("ভূমিকা যাচাই হয়েছে", "Role verified")}</i></div>
        <div className="officer-tool-tabs" role="tablist" aria-label={tx("কর্মকর্তার কাজ নির্বাচন", "Choose officer task")}>
          <button role="tab" aria-selected={officerTool === "deed"} className={officerTool === "deed" ? "active" : ""} onClick={() => setOfficerTool("deed")}><ScrollText size={16} /><span><b>{tx("দলিল নিবন্ধন", "Deed registration")}</b><small>{tx("ডাইজেস্ট, স্বাক্ষর ও QR", "Digest, signature & QR")}</small></span></button>
          <button role="tab" aria-selected={officerTool === "parcel"} className={officerTool === "parcel" ? "active" : ""} onClick={() => setOfficerTool("parcel")}><MapPinned size={16} /><span><b>{tx("পার্সেল আইডি তৈরি", "Create Parcel ID")}</b><small>{tx("সরকারি পার্সেল প্রোফাইল", "Official parcel profile")}</small></span></button>
        </div>
        {officerTool === "deed" ? <div key="deed-tool" className="console-grid">
          <form className="deed-form" onSubmit={(e) => { e.preventDefault(); registerDeed(); }}><div className="card-title"><div><p className="eyebrow">{tx("নতুন লেনদেনের খসড়া", "NEW TRANSACTION DRAFT")}</p><h3>{tx("কাল্পনিক দলিলের তথ্য", "Synthetic deed details")}</h3></div><span className="step-badge">1 / 3</span></div>
            <div className="field-grid"><label><span>{tx("পার্সেল আইডি", "Parcel ID")}</span><input defaultValue="Parcel 105" /></label><label><span>{tx("দলিল আইডি", "Deed ID")}</span><input defaultValue="DEED-2026-00105-B" /></label><label><span>{tx("বিক্রেতার পরিচিতি", "Seller reference")}</span><input defaultValue="Rahim-REF-08" /></label><label><span>{tx("ক্রেতার পরিচিতি", "Buyer reference")}</span><input defaultValue="Sakib-REF-31" /></label><label><span>{tx("জমির পরিমাণ", "Land area")}</span><input defaultValue="12.50 decimal" /></label><label><span>{tx("লেনদেনের ধরন", "Transaction type")}</span><select defaultValue="sale"><option value="sale">{tx("বিক্রয়", "Sale")}</option></select></label></div>
            <label className="consent"><input type="checkbox" defaultChecked /><span><b>{tx("এটি কেবল কাল্পনিক ডেমো লেনদেন", "This is a synthetic demo transaction")}</b><small>{tx("এখানে কোনো বাস্তব এনআইডি, নাম বা সরকারি রেকর্ড নেই।", "No real NID, identity or government record is used.")}</small></span></label>
            <button className="btn primary full">{tx("ডাইজেস্ট, স্বাক্ষর ও QR তৈরি করুন", "Generate digest, signature & QR")} <span>→</span></button>
          </form>
            <div className={`signature-panel ${deedCreated ? "signed" : ""}`}><div className="seal"><span>{deedCreated ? "✓" : "◆"}</span><i /></div><p className="eyebrow">{tx("ক্রিপ্টোগ্রাফিক সিল", "CRYPTOGRAPHIC SEAL")}</p><h3>{deedCreated ? tx("ডেমো স্বাক্ষর প্রস্তুত", "Demo signature ready") : tx("স্বাক্ষরের অপেক্ষায়", "Awaiting signature")}</h3><p>{tx("সরকারি তথ্য থেকে হ্যাশ তৈরি করে ডেমো কর্মকর্তার কী-এর স্বাক্ষর দেখানো হবে।", "A hash of official metadata will be shown with a simulated officer-key signature.")}</p><dl><div><dt>{tx("নথির ডাইজেস্ট", "Document digest")}</dt><dd>{deedCreated ? "c401…8fd2" : "—"}</dd></div><div><dt>{tx("স্বাক্ষর", "Signature")}</dt><dd>{deedCreated ? "0x98bd…23ea" : "—"}</dd></div><div><dt>{tx("অডিট অ্যাঙ্কর", "Audit anchor")}</dt><dd>{deedCreated ? "SIM-BLOCK-0091" : "—"}</dd></div></dl>{deedCreated && <button className="text-button" onClick={() => goTo("report")}>{tx("QR রসিদ দেখুন", "View QR receipt")} →</button>}</div>
        </div> : <div key="parcel-tool" className="console-grid parcel-console">
          <form className="deed-form parcel-form" onSubmit={createParcel}><div className="card-title"><div><p className="eyebrow">{tx("সরকারি পার্সেল নথিভুক্তি", "OFFICIAL PARCEL ONBOARDING")}</p><h3>{tx("নতুন পার্সেল আইডির তথ্য", "New Parcel ID details")}</h3></div><span className="step-badge">1 / 3</span></div>
            <div className="field-grid"><label><span>{tx("জেলা", "District")}</span><input defaultValue={tx("ঢাকা", "Dhaka")} /></label><label><span>{tx("উপজেলা", "Upazila")}</span><input defaultValue={tx("সাভার", "Savar")} /></label><label><span>{tx("মৌজা", "Mouza")}</span><input defaultValue={tx("মডেল মৌজা ০৫", "Model Mouza 05")} /></label><label><span>{tx("জে.এল. নম্বর", "JL Number")}</span><input defaultValue="JL-057" /></label><label><span>{tx("খতিয়ান নম্বর", "Khatian number")}</span><input defaultValue="KH-2048" /></label><label><span>{tx("দাগ নম্বর", "Dag / Plot number")}</span><input defaultValue="DG-0106" /></label><label><span>{tx("জমির পরিমাণ", "Land area")}</span><input defaultValue="18.25 decimal" /></label><label><span>{tx("রেকর্ডের উৎস", "Record source")}</span><select defaultValue="survey"><option value="survey">{tx("কাল্পনিক জরিপ রেকর্ড", "Synthetic survey record")}</option></select></label></div>
            <div className="parcel-steps"><span className="done">1<small>{tx("তথ্য পূরণ", "Enter data")}</small></span><i /><span className={parcelStatus !== "idle" ? "done" : ""}>2<small>{tx("পুনরাবৃত্তি পরীক্ষা", "Duplicate check")}</small></span><i /><span className={parcelStatus === "created" ? "done" : ""}>3<small>{tx("আইডি তৈরি", "Create ID")}</small></span></div>
            <label className="consent"><input type="checkbox" defaultChecked /><span><b>{tx("শুধু কাল্পনিক পার্সেল রেকর্ড", "Synthetic parcel record only")}</b><small>{tx("এটি সরকারি দাগ/খতিয়ান নম্বর পরিবর্তন করে না; শুধু LandTrust-এর সরকারি পরিচিতি তৈরি করে।", "This does not alter official Dag/Khatian numbers; it creates only a LandTrust official reference.")}</small></span></label>
            <button className="btn primary full" disabled={parcelStatus !== "idle"}>{parcelStatus === "checking" ? tx("পুনরাবৃত্তি রেকর্ড পরীক্ষা চলছে…", "Checking for duplicate records…") : parcelStatus === "created" ? tx("পার্সেল আইডি তৈরি হয়েছে", "Parcel ID created") : tx("পুনরাবৃত্তি পরীক্ষা করে পার্সেল আইডি তৈরি করুন", "Check duplicates and create Parcel ID")} <span>→</span></button>
          </form>
          <div className={`signature-panel parcel-preview ${parcelStatus}`}><div className="parcel-id-mark">{parcelStatus === "created" ? <BadgeCheck size={33} /> : <MapPinned size={33} />}</div><p className="eyebrow">{tx("তৈরি করা সরকারি আইডি", "GENERATED OFFICIAL ID")}</p><h3>{parcelStatus === "created" ? "LTB-DHK-SAV-M05-P0106" : parcelStatus === "checking" ? tx("রেকর্ড পরীক্ষা চলছে", "Checking records") : tx("পার্সেল আইডির নমুনা", "Parcel ID preview")}</h3><p>{parcelStatus === "created" ? tx("অনুমোদিত কর্মকর্তা কাল্পনিক পার্সেল প্রোফাইল তৈরি করেছেন। এটি অডিট লেজারে নথিভুক্ত হয়েছে।", "An authorized officer created the synthetic parcel profile, and the event was recorded in the audit ledger.") : tx("মৌজা, জে.এল., খতিয়ান ও দাগের অনন্য সমন্বয় যাচাইয়ের পর আইডি তৈরি হবে।", "The ID will be created after validating the unique Mouza, JL, Khatian and Dag combination.")}</p><dl><div><dt>{tx("অবস্থা", "Status")}</dt><dd>{parcelStatus === "created" ? tx("সক্রিয়", "ACTIVE") : parcelStatus === "checking" ? tx("যাচাই চলছে", "VALIDATING") : tx("খসড়া", "DRAFT")}</dd></div><div><dt>{tx("তৈরিকারী ভূমিকা", "Creator role")}</dt><dd>LAND_RECORD_OFFICER</dd></div><div><dt>{tx("অডিট হ্যাশ", "Audit hash")}</dt><dd>{parcelStatus === "created" ? "4ab1…c906" : "—"}</dd></div></dl>{parcelStatus === "created" && <button className="text-button" onClick={() => setParcelStatus("idle")}>{tx("আরেকটি পার্সেল নথি তৈরি করুন", "Create another parcel entry")} →</button>}</div>
        </div>}
      </div>
    );
  }

  function LockScreen() {
    const isLocked = lockStatus !== "clear";
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("প্রতিরোধমূলক নিয়ন্ত্রণ · অনুকরণ", "PREVENTIVE CONTROL · SIMULATION")} title={tx("সাময়িক ভূমি-লক", "Provisional Land Lock")} description={tx("ঝুঁকিপূর্ণ হস্তান্তর চূড়ান্ত হওয়ার আগে পার্সেলে সাময়িক স্থগিতাদেশ ও প্রশাসনিক পর্যালোচনা দেখানো হচ্ছে।", "A temporary hold and administrative review are simulated before a risky transfer can be finalized.")} />
        <div className={`lock-hero ${isLocked ? "is-locked" : ""}`}><div className="lock-visual"><div className="lock-body"><span>{isLocked ? "▣" : "▢"}</span><i /></div><div className="lock-ripple r1" /><div className="lock-ripple r2" /></div><div className="lock-copy"><p className="eyebrow">PARCEL 105 · DEED-2026-00105-B</p><h2>{lockStatus === "clear" ? tx("লেনদেনের জন্য উন্মুক্ত", "Open for transaction") : lockStatus === "review" ? tx("ঊর্ধ্বতন পর্যালোচনায়", "Under senior review") : tx("সাময়িকভাবে লক করা হয়েছে", "Provisionally locked")}</h2><p>{isLocked ? tx("নতুন নিবন্ধন চূড়ান্ত করা যাবে না; বর্তমান মালিকানা ও দলিল কর্মকর্তা যাচাই করবেন।", "No new registration can be finalized while an officer verifies current ownership and the original deed.") : tx("বর্তমানে কোনো সক্রিয় বাধা নেই।", "There is currently no active restriction.")}</p><div className="lock-meta"><span><small>{tx("কারণ", "Reason")}</small><b>CRITICAL_RISK_95</b></span><span><small>{tx("মেয়াদ", "Duration")}</small><b>72 {tx("ঘণ্টা", "hours")}</b></span><span><small>{tx("কেস আইডি", "Case ID")}</small><b>LOCK-105-26</b></span></div></div></div>
        <div className="review-grid"><div className="review-checklist"><div className="card-title"><div><p className="eyebrow">{tx("কর্মকর্তার করণীয়", "OFFICER CHECKLIST")}</p><h3>{tx("পর্যালোচনা ধাপ", "Review steps")}</h3></div><span>2 / 4</span></div>{[
          [tx("মূল দলিলের ডাইজেস্ট যাচাই", "Verify original deed digest"), true],
          [tx("সর্বশেষ নিবন্ধিত মালিক নিশ্চিত", "Confirm latest registered owner"), true],
          [tx("নামজারি কেসের অবস্থা যাচাই", "Review mutation case status"), false],
          [tx("উভয় পক্ষের বক্তব্য নথিভুক্ত", "Record statements from both parties"), false],
        ].map(([label, done], index) => <div className={`check-row ${done ? "done" : ""}`} key={String(label)}><span>{done ? "✓" : index + 1}</span><b>{label}</b><small>{done ? tx("সম্পন্ন", "Done") : tx("অপেক্ষমাণ", "Pending")}</small></div>)}</div>
          <div className="decision-card"><p className="eyebrow">{tx("প্রশাসনিক ব্যবস্থা", "ADMINISTRATIVE ACTION")}</p><h3>{tx("সিদ্ধান্ত নির্বাচন করুন", "Choose a decision")}</h3><p>{tx("প্রতিটি ব্যবস্থা অডিট লেজারে দায়িত্বপ্রাপ্ত ব্যক্তি, সময় ও হ্যাশসহ যোগ হবে।", "Every action is added to the audit ledger with actor, time and hash.")}</p><button className="btn danger-btn full" onClick={() => updateLock("locked")}>▣ {tx("সাময়িক লক সক্রিয়", "Activate provisional lock")}</button><button className="btn secondary full" onClick={() => { updateLock("review"); goTo("review"); }}>↗ {tx("ঊর্ধ্বতন পর্যালোচনায় পাঠান", "Escalate for senior review")}</button><button className="btn ghost full" onClick={() => updateLock("clear")}>✓ {tx("যাচাই শেষে লক ছাড়ুন", "Release after verification")}</button><small className="simulation-note">{tx("প্রোটোটাইপ অনুকরণ — কোনো সরকারি রেকর্ড পরিবর্তিত হয় না", "Prototype simulation — no government record is changed")}</small></div>
        </div>
      </div>
    );
  }

  function SeniorReviewScreen() {
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("ধাপ ০৫ · প্রশাসনিক ব্যবস্থাপনা", "STEP 05 · ADMINISTRATIVE HANDLING")} title={tx("ঊর্ধ্বতন কর্মকর্তার পর্যালোচনা", "Senior Officer Review")} description={tx("ঝুঁকিপূর্ণ ফলাফল সরাসরি আইনি রায় নয়; প্রমাণ, নোটিশ, শুনানি ও দায়িত্বপ্রাপ্ত কর্তৃপক্ষের সিদ্ধান্তের জন্য কেস পাঠানো হয়।", "A risk result is not a legal verdict; the case is routed for evidence review, notice, hearing and a decision by the responsible authority.")} />
        <div className="senior-review-hero"><div className="senior-review-icon"><ShieldAlert size={24} /></div><div><p className="eyebrow">{tx("ঊর্ধ্বতন কেস · Parcel 105", "ESCALATED CASE · PARCEL 105")}</p><h2>{tx("চূড়ান্ত নিবন্ধন সাময়িকভাবে আটকে আছে", "Final registration is provisionally paused")}</h2><p>{tx("কর্মকর্তা রেকর্ডের মিল, মূল দলিল, নামজারির অবস্থা ও সংশ্লিষ্ট পক্ষের বক্তব্য যাচাই না করা পর্যন্ত নতুন হস্তান্তর চূড়ান্ত হবে না।", "A new transfer is not finalized until the officer reviews record matches, the original deed, mutation status and statements from concerned parties.")}</p></div><span className="review-status">{tx("পর্যালোচনা চলমান", "IN REVIEW")}</span></div>
        <div className="senior-review-grid"><article className="senior-flow"><div className="card-title"><div><p className="eyebrow">{tx("ঊর্ধ্বতন কর্মকর্তার কার্যপ্রবাহ", "SENIOR OFFICER WORKFLOW")}</p><h3>{tx("কীভাবে কেস পরিচালিত হবে", "How the case is handled")}</h3></div><span>{tx("৪ ধাপ", "4 steps")}</span></div><div className="senior-step"><span>1</span><div><b>{tx("রেফারেল গ্রহণ ও সাময়িক স্থগিতাদেশ", "Accept referral and keep the provisional hold")}</b><small>{tx("অডিট হ্যাশ, ঝুঁকির কারণ ও উৎস রেকর্ড সংরক্ষণ করা হয়।", "Preserve the audit hash, risk reasons and source records.")}</small></div></div><div className="senior-step"><span>2</span><div><b>{tx("সরকারি রেকর্ড ও মূল দলিল যাচাই", "Verify official records and original deed")}</b><small>{tx("নামজারি কেস, খতিয়ান, দাগ, দলিল ও বিক্রেতার কর্তৃত্ব মিলিয়ে দেখা হয়।", "Check mutation case, khatian, dag, deed and seller authority.")}</small></div></div><div className="senior-step"><span>3</span><div><b>{tx("নোটিশ / শুনানির জন্য পাঠানো", "Send for notice / hearing")}</b><small>{tx("প্রয়োজন হলে আবেদনকারী ও সংশ্লিষ্ট পক্ষের বক্তব্য নেওয়া হয়।", "Where required, obtain statements from the applicant and concerned parties.")}</small></div></div><div className="senior-step"><span>4</span><div><b>{tx("কারণসহ প্রশাসনিক সিদ্ধান্ত নথিভুক্ত", "Record a reasoned administrative decision")}</b><small>{tx("লক রাখা, অবমুক্ত করা বা উপযুক্ত কর্তৃপক্ষের কাছে পাঠানো—কারণসহ লেজারে লেখা হয়।", "Keep the hold, release it or refer to the competent authority with reasons in the ledger.")}</small></div></div></article><aside className="senior-decision"><p className="eyebrow">{tx("ঊর্ধ্বতন সিদ্ধান্ত", "SENIOR DECISION")}</p><h3>{tx("পরবর্তী ব্যবস্থা", "Next action")}</h3><p>{tx("এটি প্রোটোটাইপের প্রশাসনিক অনুকরণ; কোনো আদালতের রায় বা সরকারি চূড়ান্ত আদেশ নয়।", "This is an administrative simulation, not a court judgment or final government order.")}</p><button className="btn danger-btn full" onClick={() => updateLock("locked")}>{tx("স্থগিতাদেশ বজায় রাখুন", "Keep hold")}</button><button className="btn secondary full" onClick={() => updateLock("review")}>{tx("উপযুক্ত কর্তৃপক্ষের কাছে পাঠান", "Refer to competent authority")}</button><button className="btn ghost full" onClick={() => { updateLock("clear"); goTo("report"); }}>{tx("যাচাই শেষে অবমুক্ত করুন", "Release after verification")}</button></aside></div>
        <div className="notice info"><span>i</span><p>{tx("বাংলাদেশের ই-নামজারি কার্যপ্রবাহের মতো অনুসন্ধান, শুনানি ও সিদ্ধান্তের ধাপ এখানে ধারণাগতভাবে দেখানো হয়েছে। বাস্তব কেসে প্রযোজ্য আইন, এখতিয়ার ও সরকারি নির্দেশনা অনুসরণ করতে হবে।", "This concept mirrors the investigation, hearing and decision stages used in Bangladesh’s e-Mutation workflow. A real case must follow applicable law, jurisdiction and government SOPs.")}</p></div>
      </div>
    );
  }

  function ReportScreen() {
    const cleanCase = demoScenario === "clean";
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("জনসাধারণের যাচাই", "PUBLIC VERIFICATION")} title={tx("QR যাচাই প্রতিবেদন", "QR Verification Report")} description={tx("যাচাই আইডি, বর্তমান অবস্থা ও পরিবর্তন-প্রমাণযোগ্য অডিট হ্যাশসহ মুদ্রণযোগ্য রসিদ।", "A printable receipt with verification ID, current status and a tamper-evident audit hash.")} />
        <div className="receipt-wrap">
          <article className="receipt" id="verification-receipt"><div className="receipt-header"><div className="receipt-brand"><LogoMark compact /><div><b>LandTrust BD</b><span>{tx("ভূমি লেনদেন যাচাই সেবা", "Land transaction verification service")}</span></div></div><span className="prototype-stamp">{tx("কাল্পনিক প্রোটোটাইপ", "SYNTHETIC PROTOTYPE")}</span></div>
            <div className={`receipt-status ${cleanCase ? "receipt-clear" : ""}`}><div className="status-shield">{cleanCase ? "✓" : "!"}</div><div><p>{tx("যাচাইয়ের ফলাফল", "VERIFICATION RESULT")}</p><h2>{cleanCase ? tx("যাচাই সফল", "VERIFIED") : tx("সাময়িকভাবে স্থগিত", "PROVISIONALLY HELD")}</h2><span>{cleanCase ? tx("সব সরকারি রেকর্ড মিলে গেছে", "All official records match") : tx("ঊর্ধ্বতন কর্মকর্তার পর্যালোচনা প্রয়োজন", "Senior officer review required")}</span></div><strong>{cleanCase ? "10" : "95"}<small>/100</small></strong></div>
            <div className="receipt-main"><div className="receipt-details"><dl><div><dt>{tx("যাচাই আইডি", "Verification ID")}</dt><dd>{cleanCase ? "VFY-BD-2026-00208" : "VFY-BD-2026-00105"}</dd></div><div><dt>{tx("পার্সেল আইডি", "Parcel ID")}</dt><dd>{cleanCase ? "Parcel 208" : "Parcel 105"}</dd></div><div><dt>{tx("দলিল আইডি", "Deed ID")}</dt><dd>{cleanCase ? "DEED-2026-00208" : "DEED-2026-00105"}</dd></div><div><dt>{tx("যাচাইয়ের সময়", "Verified at")}</dt><dd>17 Oct 2026 · 10:42 BST</dd></div></dl><div className="audit-hash"><span>{tx("অডিট হ্যাশ", "Audit hash")}</span><code>{cleanCase ? "0x7ac4b8120e1f…c208" : "0x9f2a7c48b17d993e…c82105fd"}</code><small>SHA-256 · SIM-BLOCK-0091</small></div></div><div className="qr-area"><QrPattern /><b>{tx("যাচাই করতে স্ক্যান করুন", "Scan to verify")}</b><small>verify.landtrust.demo/v/{cleanCase ? "00208" : "00105"}</small></div></div>
            <div className="receipt-footer"><span>◆ {tx("এটি হ্যাকাথন প্রোটোটাইপ; সরকারি সনদ নয়।", "Hackathon prototype; not a government certificate.")}</span><b>{tx("LandTrust BD দ্বারা তৈরি", "Generated by LandTrust BD")}</b></div>
          </article>
          <div className="receipt-actions"><button className="btn primary" onClick={() => window.print()}>▤ {tx("রসিদ প্রিন্ট / PDF", "Print / save PDF")}</button><button className="btn secondary" onClick={() => goTo("ledger")}>≡ {tx("অডিট লেজার দেখুন", "View audit ledger")}</button></div>
        </div>
      </div>
    );
  }

  function LedgerScreen() {
    return (
      <div className="screen-enter" key={active}>
        <PageHeading eyebrow={tx("স্বচ্ছতা ও জবাবদিহি", "TRANSPARENCY & ACCOUNTABILITY")} title={tx("অডিট লেজার", "Audit Ledger")} description={tx("প্রোটোটাইপে সম্পন্ন প্রতিটি ব্যবস্থার পরিবর্তন-প্রমাণযোগ্য সময়ভিত্তিক ইতিহাস।", "A tamper-evident-style, timestamped history of every action performed in the prototype.")} />
        <div className="ledger-summary"><div><span className="summary-icon">≡</span><div><b>{events.length + 4}</b><small>{tx("মোট ঘটনা", "Total events")}</small></div></div><div><span className="summary-icon green">✓</span><div><b>{events.filter((event) => event.tone === "green").length + 3}</b><small>{tx("যাচাইকৃত ব্যবস্থা", "Verified actions")}</small></div></div><div><span className="summary-icon red">!</span><div><b>{events.filter((event) => event.tone === "red").length + 1}</b><small>{tx("ঝুঁকির ঘটনা", "Risk events")}</small></div></div><div className="chain-health"><i /><span><b>{tx("ডেমো লেজার সচল", "Demo ledger healthy")}</b><small>Last anchor: SIM-BLOCK-0091</small></span></div></div>
        <div className="ledger-card"><div className="ledger-head"><span>{tx("সময়", "Time")}</span><span>{tx("ঘটনা ও দায়িত্বপ্রাপ্ত ব্যক্তি", "Event & actor")}</span><span>{tx("ঘটনা আইডি", "Event ID")}</span><span>{tx("অডিট হ্যাশ", "Audit hash")}</span><span>{tx("অবস্থা", "Status")}</span></div>{events.map((event, index) => <div className="ledger-row" key={`${event.id}-${index}`}><time>{event.time}<small>17 Oct 2026</small></time><div className="event-name"><i className={event.tone} /><span><b>{language === "bn" ? event.titleBn : event.titleEn}</b><small>{event.actor}</small></span></div><code>{event.id}</code><code>{event.hash}</code><span className="ledger-ok">✓ {tx("সংরক্ষিত", "Anchored")}</span></div>)}<div className="ledger-row"><time>10:41:58<small>17 Oct 2026</small></time><div className="event-name"><i className="green" /><span><b>{tx("সরকারি রেকর্ড তৈরি", "Official record created")}</b><small>Records Engine</small></span></div><code>EVT-4104</code><code>990a…172e</code><span className="ledger-ok">✓ {tx("সংরক্ষিত", "Anchored")}</span></div></div>
        <div className="notice info"><span>◆</span><p>{tx("বাস্তব ব্যবস্থার নকশায় ব্লকচেইনে শুধু নথির হ্যাশ, ঘটনার হ্যাশ, সময় ও ব্যক্তিগত-তথ্যবিহীন অবস্থা রাখা হবে—নাম, এনআইডি, দলিলের পূর্ণ তথ্য বা PDF নয়।", "In the production design, blockchain stores only document hashes, event hashes, timestamps and non-PII status—not names, NIDs, full deed data or PDFs.")}</p></div>
      </div>
    );
  }

  function renderScreen() {
    switch (active) {
      case "citizen": return CitizenScreen();
      case "search": return SearchScreen();
      case "comparison": return ComparisonScreen();
      case "timeline": return TimelineScreen();
      case "risk": return RiskScreen();
      case "forensic": return ForensicScreen();
      case "officer": return OfficerScreen();
      case "lock": return LockScreen();
      case "review": return SeniorReviewScreen();
      case "report": return ReportScreen();
      case "ledger": return LedgerScreen();
      default: return HomeScreen();
    }
  }

  if (authOpen) return <AuthScreen />;

  return (
    <div className={`app language-${language}`}>
      <div className="prototype-bar"><span><CalendarDays size={12} />{tx("১৭ অক্টোবর ২০২৬", "17 October 2026")}</span></div>
      <header className="top-header"><button className="menu-button" onClick={() => setMobileNav(!mobileNav)} aria-label={tx("মেনু খুলুন", "Toggle menu")}><Menu size={22} /></button><button className="brand" onClick={() => goTo("home")}><LogoMark /><span><strong>LandTrust BD</strong><small>{tx("সুরক্ষিত ভূমি · স্বচ্ছ লেনদেন", "Secure land · transparent transactions")}</small></span></button><nav className="top-nav"><button className={active === "home" ? "active" : ""} onClick={() => goTo("home")}>{tx("হোম", "Home")}</button><button className={active === "citizen" ? "active" : ""} onClick={() => goTo("citizen")}>{tx("নাগরিক সেবা", "Citizen")}</button><button className={`restricted-entry ${active === "officer" ? "active" : ""}`} onClick={() => goTo("officer")}><LockKeyhole size={11} />{tx("কর্মকর্তা প্রবেশ", "Officer access")}</button></nav><div className="header-actions"><button className="account-button" onClick={() => openAuth()}><UserRound size={14} />{authUser ? tx("আমার অ্যাকাউন্ট", "My account") : tx("প্রবেশ / নিবন্ধন", "Sign in / Register")}</button><button className="language-toggle" onClick={() => setLanguage(language === "bn" ? "en" : "bn")}><span className={language === "bn" ? "active" : ""}>বাং</span><i /><span className={language === "en" ? "active" : ""}>EN</span></button><button className="demo-button" onClick={startDemo}><Play size={12} fill="currentColor" />{tx("ডেমো", "Demo")}</button></div></header>

      <div className="workspace">
        <aside className={`sidebar ${mobileNav ? "open" : ""}`}><div className="side-label">{tx("সেবা মেনু", "SERVICE MENU")}</div>{visibleScreenItems.map((item) => <button key={item.key} className={active === item.key ? "active" : ""} onClick={() => goTo(item.key)}><span className="nav-icon"><ScreenGlyph icon={item.icon} size={17} /></span><span><b>{language === "bn" ? item.bn : item.en}</b><small>{language === "bn" ? item.shortBn : item.shortEn}</small></span>{active === item.key && <i />}</button>)}<div className="privacy-card"><ShieldCheck size={17} /><b>{tx("নকশাতেই গোপনীয়তা", "Privacy by design")}</b><p>{tx("কোনো বাস্তব এনআইডি বা ব্যক্তিগত তথ্য ব্যবহৃত হয়নি।", "No real NID or personal data is used.")}</p></div></aside>
        {mobileNav && <button className="nav-overlay" aria-label="Close menu" onClick={() => setMobileNav(false)} />}
        <main className="main-content"><div className="breadcrumb"><button onClick={() => goTo("home")}>LandTrust BD</button><span>›</span><b>{language === "bn" ? activeItem.bn : activeItem.en}</b></div>{renderScreen()}<footer><div><b>LandTrust BD</b><span>{tx("ভূমি লেনদেন যাচাইয়ের ইন্টারঅ্যাক্টিভ প্রোটোটাইপ", "Interactive land-verification prototype")}</span></div><p>{tx("সব তথ্য কাল্পনিক · কোনো সিদ্ধান্ত আইনগত প্রমাণ নয়", "All data is synthetic · No output is legal proof")}</p></footer></main>
      </div>

      {demoStep >= 0 && <div className="demo-dock"><div className="demo-progress"><i style={{ width: `${((demoStep + 1) / activeDemoSteps.length) * 100}%` }} /></div><div className="demo-step-number"><span>{demoStep + 1}</span><small>/ {activeDemoSteps.length}</small></div><div className="demo-copy"><p>{tx("ডেমো পরিস্থিতি", "DEMO SCENARIO")} · {activeDemoSteps[demoStep].time}</p><b>{language === "bn" ? activeDemoSteps[demoStep].bn : activeDemoSteps[demoStep].en}</b></div><button onClick={nextDemo}>{demoStep === activeDemoSteps.length - 1 ? tx("শেষ করুন", "Finish") : tx("পরবর্তী ধাপ", "Next step")} <span>→</span></button><button className="close-demo" onClick={() => setDemoStep(-1)} aria-label={tx("ডেমো বন্ধ করুন", "Close demo")}>×</button></div>}
    </div>
  );
}
