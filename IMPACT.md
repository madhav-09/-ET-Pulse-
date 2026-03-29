# ET Pulse — Impact Model

## Executive Summary

ET Pulse replaces passive news consumption with active intelligence. The measurable impact falls across three dimensions: **time saved per user**, **engagement revenue unlocked**, and **subscription conversion lift**.

---

## 1. Time Saved Per User

### The Problem (Baseline)
A business professional reading ET today to stay informed on 3–5 topics spends:

| Activity | Time/day |
|---|---|
| Scanning homepage + section pages | 8 min |
| Reading 4–6 articles to understand one story | 18 min |
| Cross-referencing for context (Google, Wikipedia) | 7 min |
| Re-reading in vernacular (if non-English preferred) | 5 min |
| **Total** | **~38 min/day** |

### With ET Pulse
| Activity | Time/day |
|---|---|
| Personalized feed scan (8 relevant cards) | 3 min |
| Deep Briefing for 1 key story | 4 min |
| Follow-up chat (2–3 questions) | 3 min |
| Story Arc check for ongoing story | 2 min |
| **Total** | **~12 min/day** |

### Time Saved
```
38 min − 12 min = 26 min saved per user per day
```

### Scale
```
ET Digital MAU (est.): ~20 million
Daily active readers (15% of MAU): 3,000,000 users/day

Time saved/day: 3,000,000 × 26 min = 78,000,000 min = 1.3M hours/day
Value of time (knowledge worker, ₹500/hr): 1,300,000 × ₹500 = ₹65 crore/day in user value
Annualised: ₹65 crore × 300 working days = ₹19,500 crore (~$2.3B) in user time value
```

**Assumption**: 15% DAU/MAU ratio is conservative for a news app. Value of time at ₹500/hr (~$6/hr) reflects India's urban knowledge worker median.

---

## 2. Engagement Revenue Unlocked

### Baseline Engagement Metrics (Industry Benchmarks)
- Average session duration, news apps: **4.2 min**
- Pages per session: **2.8**
- Ad RPM (news, India): **₹80–120 per 1000 impressions**

### ET Pulse Projected Engagement
Deep Briefing + Chat creates a "rabbit hole" effect:

| Metric | Baseline | ET Pulse | Lift |
|---|---|---|---|
| Session duration | 4.2 min | 9.5 min | +126% |
| Pages per session | 2.8 | 5.2 | +86% |
| Return visits/week | 2.1 | 4.8 | +129% |

**Assumption basis**: Interactive AI tools (Perplexity, ChatGPT) show 2–3× session duration vs. static content. We use a conservative 2.3× lift.

### Revenue Impact
```
Additional session time per DAU: 5.3 min
Additional ad impressions per session: ~2.4 pages × 3 ad slots = 7.2 impressions
Additional impressions/day (3M DAU): 3,000,000 × 7.2 = 21,600,000 impressions
Additional ad revenue/day at ₹100 RPM: 21,600,000 / 1000 × ₹100 = ₹21.6 lakh/day
Annual incremental ad revenue: ₹21.6L × 365 = ₹788 crore/year (~$94M)
```

---

## 3. Subscription Conversion Lift

### ET Prime Context
ET Prime (paid subscription) converts readers who find deep value in ET content. Current conversion rate from free to paid: ~1.2% of MAU (industry benchmark for Indian news).

### ET Pulse as Conversion Driver
The Deep Briefing and Story Arc features are "aha moment" features — they demonstrate value that free static articles cannot match. This is the same mechanic that drove The Athletic's subscription growth (sports deep dives) and Bloomberg's retention (terminal-like intelligence).

```
Current ET Prime subscribers (est.): 20M MAU × 1.2% = 240,000
ET Prime ARPU (est.): ₹999/year

Scenario: ET Pulse lifts conversion rate from 1.2% → 1.8% (+50% relative)
New subscribers from lift: 20M × 0.6% = 120,000 additional subscribers
Annual subscription revenue lift: 120,000 × ₹999 = ₹12 crore/year (~$1.4M)
```

**Assumption**: 50% relative lift in conversion is conservative. Perplexity Pro converts at 3–4× the rate of free AI tools. We apply a 50% lift because ET Pulse is embedded in an existing product, not a standalone subscription.

---

## 4. Vernacular Market Expansion

### The Untapped Opportunity
~500 million Indians are comfortable reading in Hindi, Tamil, Telugu, or Bengali but currently underserved by English-first business news.

```
Hindi-first internet users in India: ~350 million
Currently reading English business news: ~5% = 17.5 million
Addressable new audience with vernacular ET Pulse: 17.5M × 20% reachable = 3.5 million new users

If 10% convert to ET Prime at ₹999/year:
New subscription revenue: 350,000 × ₹999 = ₹35 crore/year (~$4.2M)
```

---

## 5. Summary Table

| Impact Category | Annual Value (INR) | Annual Value (USD) | Confidence |
|---|---|---|---|
| User time saved (social value) | ₹19,500 crore | ~$2.3B | Medium |
| Incremental ad revenue | ₹788 crore | ~$94M | Medium-High |
| ET Prime conversion lift | ₹12 crore | ~$1.4M | Medium |
| Vernacular market expansion | ₹35 crore | ~$4.2M | Low-Medium |
| **Total direct revenue impact** | **₹835 crore** | **~$100M** | **Medium** |

---

## 6. Cost to Build & Operate

### Development Cost (MVP)
```
1 full-stack engineer × 2 weeks = ₹2–3 lakh (at ₹15L/year CTC)
```

### Operating Cost (at scale, 3M DAU)
```
Gemini 2.0 Flash pricing: $0.075 per 1M input tokens, $0.30 per 1M output tokens
Average tokens per AI call: ~800 input + 600 output
AI calls per DAU per day: ~3 (briefing + arc + translate)
Daily AI cost: 3M × 3 × (800×$0.000000075 + 600×$0.0000003) = ~$594/day = ~$217,000/year

NewsAPI: $449/month (Business plan, 250K req/day) = $5,388/year

Total AI + data cost at 3M DAU: ~$222,000/year = ~₹1.85 crore/year
```

### ROI
```
Revenue impact: ₹835 crore/year
Operating cost: ₹1.85 crore/year
ROI: 451× return on operating cost
```

---

## 7. Key Assumptions Summary

| Assumption | Value | Source / Basis |
|---|---|---|
| ET Digital MAU | 20 million | Public estimates, ET Group reports |
| DAU/MAU ratio | 15% | Industry benchmark, news apps |
| Time saved per user | 26 min/day | Timed comparison (manual vs. ET Pulse) |
| Knowledge worker time value | ₹500/hr | India urban median, BLS-equivalent |
| Session duration lift | 2.3× | Conservative vs. Perplexity/ChatGPT benchmarks |
| Ad RPM | ₹100 | India news app industry average |
| ET Prime conversion rate | 1.2% baseline | Industry benchmark |
| Conversion lift from ET Pulse | +50% relative | Conservative; Bloomberg/Athletic precedent |
| ET Prime ARPU | ₹999/year | Publicly listed price |
| Gemini token pricing | $0.075/$0.30 per 1M | Google AI Studio pricing page |

---

## Bottom Line

ET Pulse is a **₹835 crore/year revenue opportunity** built on **₹1.85 crore/year in operating costs** — a 451× ROI ratio. The primary driver is engagement depth (session duration × return frequency), not just reach. The vernacular engine opens a 350M-user market that English-only ET cannot address today.

The MVP was built in under 2 weeks with 2 API keys and zero proprietary infrastructure.
