<p align="center">
  <img src="public/favicon.svg" alt="LandTrust BD Logo" width="64" height="64" />
</p>

<h1 align="center">🏡 LandTrust BD</h1>

<p align="center">
  <strong>ভূমি লেনদেন যাচাই · Land Transaction Verification</strong><br />
  বাংলা-প্রথম, frontend-only interactive prototype
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Cloudflare_Workers-Ready-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/Built_with-ChatGPT_%2F_OpenAI-10A37F?logo=openai&logoColor=white" alt="Built with ChatGPT OpenAI" />
</p>

---

## 📋 সংক্ষিপ্ত বিবরণ | Overview

**LandTrust BD** হলো একটি **interactive prototype** যা ভূমি লেনদেনে জালিয়াতি শনাক্ত ও প্রতিরোধে স্মার্ট যাচাই ব্যবস্থা দেখায়। 

> 🤖 **AI Assistant:** এই প্রোটোটাইপটি **OpenAI-এর ChatGPT AI Assistant** ব্যবহার করে তৈরি ও সাজানো হয়েছে।  
> ⚠️ **গুরুত্বপূর্ণ:** এটি কোনো সরকারি ওয়েবসাইট, live land-record service বা legal verification tool **নয়**।  
> সব ব্যক্তি, parcel, deed ও audit data সম্পূর্ণ **synthetic/কাল্পনিক**।

---

## ✨ মূল বৈশিষ্ট্য | Key Features

| বৈশিষ্ট্য | বিবরণ |
|-----------|--------|
| 🌐 **দ্বিভাষিক** | বাংলা ↔ English toggle |
| 🔍 **Parcel ও Deed Search** | Parcel ID / Deed ID দিয়ে unified search |
| ⚖️ **Record Comparison** | রেজিস্ট্রি বনাম নামজারি পাশাপাশি তুলনা |
| 🌳 **Ownership Timeline** | Knowledge graph — মালিকানা ও হস্তান্তরের ইতিহাস |
| 🛡️ **Risk Analysis** | Rule-based fraud risk score (95/100) ও ব্যাখ্যা |
| 📄 **Forensic PDF Verify** | Browser-side SHA-256 hash দিয়ে document integrity check |
| 👨‍💼 **Officer Console** | Deed registration ও Parcel ID creation (restricted module) |
| 🔒 **Provisional Lock** | ঝুঁকিপূর্ণ transaction-এ সাময়িক land-lock simulation |
| 📱 **QR Verification Report** | Printable receipt with synthetic QR code |
| 📜 **Audit Ledger** | Tamper-evident-style timestamped event history |
| 🎬 **3-Minute Demo** | Guided walkthrough of the entire fraud detection flow |

---

## 🖥️ Prototype Screens

```
┌─────────────────────────────────────────────────────────────┐
│  1. Home                    → Service overview & hero       │
│  2. Parcel & Deed Search    → Start verification            │
│  3. Record Comparison       → Registry vs Mutation          │
│  4. Ownership Timeline      → Transfer history graph        │
│  5. Risk Analysis           → Score & rule explanation       │
│  6. Forensic PDF Verify     → Document hash comparison      │
│  7. Officer Console         → Deed & Parcel ID management   │
│  8. Provisional Lock        → Hold & officer review         │
│  9. QR Verification Report  → Verification receipt          │
│ 10. Audit Ledger            → Timestamped action history    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Demo Case

| তথ্য | মান |
|------|-----|
| **Parcel Identifier** | `Parcel 105` |
| **Synthetic Deed ID** | `DEED-2026-00105` |
| **Registry Owner** | `Karim-REF-22` |
| **Mutation Owner** | `Rahim-REF-08` |
| **New Buyer Reference** | `Sakib-REF-31` |
| **Risk Score** | `95/100` (Critical) |

> Header-এর **Demo** button চাপলে ৩ মিনিটের guided flow শুরু হবে।

---

## 🚀 চালানোর নিয়ম | Getting Started

### প্রয়োজনীয়তা | Prerequisites

- **Node.js** ≥ 22.13.0
- **npm** (Node.js-এর সঙ্গে আসে)

### ইনস্টল ও চালু করুন | Install & Run

```bash
# Clone the repository
git clone https://github.com/fahimsadik21-pixel/LandTrust-BD.git
cd LandTrust-BD

# Install dependencies
npm install

# Start the development server
npm run dev
```

Browser-এ terminal-এ দেখানো local URL খুলুন (সাধারণত `http://localhost:4173`)।

### Production Build

```bash
# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm test
```

---

## 🏗️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 19](https://react.dev) | UI framework |
| [Next.js 16](https://nextjs.org) | App router & SSR (via vinext) |
| [Vite 8](https://vite.dev) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first CSS |
| [TypeScript 5.9](https://www.typescriptlang.org) | Type safety |
| [Lucide React](https://lucide.dev) | Icon library |
| [Drizzle ORM](https://orm.drizzle.team) | Database schema (future use) |
| [Cloudflare Workers](https://workers.cloudflare.com) | Edge deployment target |
| [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) | Browser-side SHA-256 hashing |

---

## 📁 প্রজেক্ট কাঠামো | Project Structure

```
LandTrust-BD/
├── app/                        # Application source code
│   ├── page.tsx                # Main page — all 10 screens
│   ├── layout.tsx              # Root layout with metadata
│   ├── globals.css             # Tailwind + custom styles
│   └── chatgpt-auth.ts        # OpenAI Sites auth helper
├── build/                      # Build-time plugins
│   └── sites-vite-plugin.ts    # Vite plugin for Sites metadata
├── db/                         # Database layer (Drizzle ORM)
│   ├── schema.ts               # DB schema (empty — frontend-only)
│   └── index.ts                # D1 binding helper
├── drizzle/                    # Drizzle migration files
├── examples/                   # Reference examples
│   └── d1/                     # D1 database usage example
├── public/                     # Static assets
│   ├── images/                 # Hero section photographs
│   │   ├── bangladesh-village.jpg
│   │   ├── dlrms-fields.jpg
│   │   ├── joypurhat-river-fields.jpg
│   │   └── sreemangal-tea.jpg
│   └── favicon.svg
├── tests/                      # Automated tests
│   └── rendered-html.test.mjs  # Server-render smoke test
├── worker/                     # Cloudflare Worker entry point
│   └── index.ts                # Request handler
├── .openai/                    # OpenAI Sites hosting config
│   └── hosting.json
├── package.json                # Dependencies & scripts
├── vite.config.ts              # Vite configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── drizzle.config.ts           # Drizzle Kit configuration
├── eslint.config.mjs           # ESLint configuration
├── postcss.config.mjs          # PostCSS configuration
└── .gitignore
```

---

## 🔒 Privacy & Scope

- ✅ **কোনো backend, API বা database নেই** — সম্পূর্ণ frontend-only prototype
- ✅ **কোনো বাস্তব NID বা ব্যক্তিগত তথ্য ব্যবহৃত হয়নি**
- ✅ PDF digest ব্রাউজারের **Web Crypto API** দিয়ে SHA-256 করা হয়
- ✅ Digital signature, blockchain anchor, land-lock সব **UI simulation**
- ✅ Production design-এ শুধু **digest, event hash, timestamp ও non-PII status** blockchain-এ যাবে

---

## 🤖 স্বীকৃতি ও এআই সহায়তা | Acknowledgements

এই প্রোটোটাইপটি **OpenAI**-এর **ChatGPT (AI Assistant)** ব্যবহার করে পরিকল্পিত, কোড আর্কিটেকচার তৈরি এবং ডেভেলপ করা হয়েছে।

- **AI Model/Platform:** ChatGPT / OpenAI
- **Development Role:** কোডস্ট্রাকচার, UI/UX উপাদান ও প্রোটোটাইপ লজিক জেনারেশন

---

## 📜 License

This project is a hackathon prototype. All data is synthetic. No output constitutes legal proof.

---

<p align="center">
  <strong>LandTrust BD</strong> · সুরক্ষিত ভূমি · স্বচ্ছ লেনদেন<br />
  
</p>


