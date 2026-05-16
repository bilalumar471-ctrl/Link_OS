# LinkOS — Frontend Design Requirements
**For use with:** Stitch MCP Server  
**Framework:** React 18 + TypeScript + Tailwind CSS  
**Version:** 1.1.0

---

## Design Language

### Colour Palette
```
Primary:       #4F46E5  (Indigo 600)  — buttons, active states, links
Primary Dark:  #3730A3  (Indigo 800)  — hover states
Secondary:     #7C3AED  (Violet 600)  — agent tags, AI indicators
Accent:        #06B6D4  (Cyan 500)    — live indicators, streaming text
Success:       #10B981  (Emerald 500) — completed status, high scores
Warning:       #F59E0B  (Amber 500)   — at-risk flags, medium scores
Danger:        #EF4444  (Red 500)     — dropped, failed, low scores
Neutral:       #1E293B  (Slate 800)   — primary text
Surface:       #F8FAFC  (Slate 50)    — page background
Card:          #FFFFFF                — card backgrounds
Border:        #E2E8F0  (Slate 200)   — card borders, dividers
```

### Typography
```
Font Family:   Inter (Google Fonts)
Heading 1:     32px, weight 700, color #1E293B
Heading 2:     24px, weight 600, color #1E293B
Heading 3:     18px, weight 600, color #1E293B
Body:          14px, weight 400, color #475569
Body Small:    12px, weight 400, color #64748B
Label:         12px, weight 600, color #64748B, uppercase, letter-spacing 0.05em
Code/Mono:     13px, font-family JetBrains Mono
```

### Component Tokens
```
Border Radius:  Card: 12px | Button: 8px | Badge: 999px | Input: 8px
Shadow:         Card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)
Shadow Hover:   0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
Transition:     all 150ms ease
Spacing Unit:   4px base (Tailwind default)
```

---

## Page & Screen Inventory

### 1. DASHBOARD — Main Overview (`/`)

**Purpose:** Command centre for the admin. Shows ecosystem health at a glance.

**Layout:** Full-width sidebar layout
- Left sidebar: 240px fixed, navigation
- Main content: fluid, starts at `ml-60`
- Top header bar: 64px fixed, full width

---

#### 1.1 Sidebar Navigation

**Element:** Vertical nav panel  
**Background:** `#1E293B` (Slate 800)  
**Width:** 240px fixed, full viewport height

**Logo area** (top, 64px height):
- Logo mark: rounded square `#4F46E5` background, white `L` icon
- Text: "LinkOS" in white, weight 700, 18px
- Tagline: "Ecosystem Intelligence" in `#94A3B8`, 11px

**Navigation items** (each 44px height):
```
Icon + Label layout — 16px icon, 14px label
Padding: 12px horizontal, 10px vertical
Active state:  #4F46E5 background, white text, left border 3px #818CF8
Hover state:   #334155 background, white text
Default state: #94A3B8 text, transparent background

Navigation items (in order):
1. LayoutDashboard icon  — "Dashboard"       → /
2. Users icon            — "Actors"          → /actors
3. Link icon             — "Linkages"        → /linkages
4. GitBranch icon        — "Programmes"      → /programmes
5. Zap icon              — "Match Engine"    → /match     [badge: "AI"]
6. TrendingUp icon       — "Trajectories"    → /trajectories  [badge: "AI"] ← NEW
7. Terminal icon         — "Agent Logs"      → /logs
8. BarChart2 icon        — "Analytics"       → /analytics
9. Settings icon         — "Settings"        → /settings  [bottom of sidebar]
```

**Status indicator** (bottom of sidebar):
- Green pulse dot + "System Online" text in `#10B981`
- Sub-text: "Gemini 2.0 Flash · Vertex AI" in `#64748B`, 11px

---

#### 1.2 Top Header Bar

**Element:** Sticky header  
**Background:** white, border-bottom `#E2E8F0`  
**Height:** 64px

**Left:** Page title (dynamic — shows current page name) — 20px, weight 600  
**Center:** Global search input (if on desktop)  
- Placeholder: "Search actors, linkages, programmes..."
- Icon: Search (left inside input)
- Width: 320px
- Background: `#F1F5F9`, border: none, border-radius 8px

**Right (in order):**
1. Bell icon button — notification count badge (red, 16px)
2. "Run Matching" primary button — `#4F46E5` background, white text, Zap icon left, 14px, border-radius 8px
3. Avatar circle — 36px, initials, `#4F46E5` background

---

#### 1.3 Dashboard KPI Cards Row

**Layout:** 4 cards in a row, equal width, `gap-4`  
**Each card:** white background, 12px border-radius, 1px border `#E2E8F0`, 20px padding

**Card 1 — Total Actors**
- Icon: Users, 20px, `#4F46E5`, in 40px circle with `#EEF2FF` background
- Label: "Total Actors" — 12px, uppercase, `#64748B`
- Value: "24" — 28px, weight 700, `#1E293B`
- Sub-text: "6 mentors · 12 companies · 4 partners · 2 programmes" — 12px, `#64748B`

**Card 2 — Active Linkages**
- Icon: Link2, `#10B981`, `#D1FAE5` background circle
- Value: "18"
- Sub-text: "↑ 3 from last cohort"
- Trend chip: "+20%" in `#10B981` background light

**Card 3 — Avg Match Score**
- Icon: Target, `#7C3AED`, `#EDE9FE` background circle
- Value: "84.2"
- Sub-text: "Across 18 active linkages"
- Progress bar below value: `#7C3AED` fill, 8px height, border-radius 4px

**Card 4 — At-Risk Engagements**
- Icon: AlertTriangle, `#F59E0B`, `#FEF3C7` background circle
- Value: "2"
- Sub-text: "Require admin review"
- Action link: "View alerts →" in `#4F46E5`

---

#### 1.4 Active Linkages Table

**Layout:** Full width, below KPI cards, `mt-6`  
**Header:** "Active Linkages" (16px, weight 600) + "View All →" link (right-aligned)

**Table columns:**
```
Mentor       Company       Programme    Score    Status      Health      Trajectory    Actions
[avatar+name] [name+stage] [name]      [badge]  [chip]      [bar]       [chip]        [buttons]
```

**Score badge:**
- 80–100: `#D1FAE5` background, `#065F46` text, "87"
- 60–79: `#FEF3C7` background, `#92400E` text
- <60: `#FEE2E2` background, `#991B1B` text

**Status chip:**
- proposed: `#E0E7FF` bg, `#3730A3` text, "Proposed"
- active: `#D1FAE5` bg, `#065F46` text, "Active"
- dropped: `#FEE2E2` bg, `#991B1B` text, "Dropped"

**Health bar:**
- Thin progress bar (6px height), green for high attendance, amber for mid, red for low
- Tooltip on hover: "Session attendance: 8/10"

**Trajectory chip (NEW — F11):**
```
improving:  #D1FAE5 bg, #065F46 text,  ↑ icon,  "Improving"
stable:     #F1F5F9 bg, #475569 text,  → icon,  "Stable"
declining:  #FEF3C7 bg, #92400E text,  ↓ icon,  "Declining · 78%"
critical:   #FEE2E2 bg, #991B1B text,  ⚠ icon,  "Critical · Wk 6"
```
- All chips: `text-xs font-semibold px-2.5 py-0.5 rounded-full border`
- For declining/critical: show drop probability percentage inline
- Tooltip on hover: shows `trajectory_reason` from prediction

**Action buttons (per row):**
- "View" — ghost button, 12px, border `#E2E8F0`
- "Confirm" — only shown if status = proposed, `#4F46E5` filled button

---

#### 1.5 Recent Agent Activity Feed

**Layout:** Right column (if two-column layout) or below table (single column)  
**Header:** "Agent Activity" + live green pulse dot

**Feed item:**
```
[AgentIcon] [Agent Name]  •  [Timestamp]
[Action description in one line]
[Optional: mini score chip or outcome chip]
```

**Agent colour coding:**
- Orchestrator: `#4F46E5`
- Mentor Agent: `#7C3AED`
- Company Agent: `#06B6D4`
- Programme Agent: `#10B981`
- Partner Agent: `#F59E0B`
- Trajectory Predictor: `#EF4444` (red — signals urgency when alerting)  ← NEW

**Trajectory alert feed item (NEW):**
```
[⚠ TrendingDown icon, red]  Trajectory Predictor  •  2 mins ago
Engagement [Mentor A ↔ Company B] predicted to drop at Week 6
with 78% confidence. Immediate admin action recommended.
[View Engagement →]  ← tappable link
```
Background: `#FFF1F2` (light red tint) to distinguish from normal feed items.

---

### 2. MATCH ENGINE PAGE (`/match`)

**Purpose:** The primary demo page — where admins trigger matching and watch agents think in real time.

**This is the most important page in the entire application.**

---

#### 2.1 Match Configuration Panel (Left, 380px)

**Header:** "Configure Match Run" — 16px, weight 600

**Form elements:**

**Programme selector:**
- Label: "Select Programme"
- Dropdown input, full width
- Option format: "[Programme Name] · [Sector] · [Cohort N]"

**Matching parameters:**
- Label: "Max Matches to Propose"
- Number input, range 1–20, default 5
- Helper: "Top N mentor-company pairs will be proposed"

**Matching strategy radio group:**
- "Balanced" (semantic + history weighted equally) — default
- "History-first" (heavily weight past performance)
- "Semantic-first" (heavily weight profile similarity)

**Advanced filters (collapsible "Advanced" section):**
- Sector filter — multi-select checkboxes
- Stage filter — multi-select (Pre-seed, Seed, Series A, Series B)
- Region filter — multi-select
- Minimum score threshold — slider (0–100, default 60)
- Exclude mentors with failure patterns — toggle (default: on)

**Run button:**
- Full width, 48px height, `#4F46E5` background, white text
- Icon: Zap (left)
- Label: "Run AI Matching"
- Loading state: spinner + "Agents thinking..." text
- Disabled state when matching is running

**Replay mode button:**
- Below run button, ghost style
- Icon: RotateCcw
- Label: "Replay Last Run"
- Visible only when last run cache exists

---

#### 2.2 Live Agent Reasoning Log (Center, fluid)

**Header row:**
- "Agent Reasoning Log" — 16px, weight 600
- Live indicator: green pulse dot + "LIVE" text in `#10B981`
- Clear button (top right): ghost, "Clear"

**Log container:**
- Background: `#0F172A` (dark)
- Border-radius: 12px
- Height: calc(100vh - 200px), overflow-y scroll
- Padding: 20px
- Font: JetBrains Mono, 13px

**Log entry types:**

*System message:*
```
[SYSTEM]  14:23:01  Matching cycle started for Programme: MyHack Fintech Cohort 3
```
Color: `#64748B`

*Orchestrator message:*
```
[ORCHESTRATOR]  14:23:01  Broadcasting criteria to 6 mentor agents...
                           Criteria embedding computed: 768-dim vector
                           Sector: Fintech | Stage: Series A | Region: KL
```
Color: `#818CF8` (indigo light)

*Mentor agent thinking:*
```
[MENTOR AGENT: Azri Hassan]  14:23:02
  → Reading profile and history from Firestore...
  → Semantic similarity to criteria: 0.84
  → Performance check: avg_rating=4.3, completion_rate=0.92
  → Checking failure patterns: none applicable
  → Adjusting score for 3 successful fintech matches in history: +8 pts
  → Final fit score: 91 / 100
  → Reasoning: Strong semantic and historical match. No failure flags.
```
Color: `#A78BFA` (violet light)

*Risk flag:*
```
[RISK AGENT]  14:23:03  ⚠ Mentor Lim Wei has 2 dropped pre-seed engagements
                         Flagging: reduce priority for pre-seed companies
```
Color: `#FCD34D` (amber)

*Trajectory Predictor message (NEW):*
```
[TRAJECTORY PREDICTOR]  14:23:06
  → Analysing session trend for Linkage: Azri Hassan ↔ DataCo KL
  → Session ratings: 4.5 → 3.8 → 3.1  (trend: declining)
  → Response time trend: 12h → 18h → 31h  (trend: slower)
  → Matching against mentor failure patterns: MATCH FOUND
    "Consistently lower ratings after session 3 in pre-seed engagements"
  → Predicted outcome: DROP
  → Drop probability: 78%   Predicted drop week: 6
  → Action urgency: IMMEDIATE
  → Writing prediction to Firestore...
```
Color: `#F87171` (red 400 — signals urgency, distinct from other agents)

*Orchestrator ranking:*
```
[ORCHESTRATOR]  14:23:04  Ranking complete. Top 3 proposals:
                           1. Azri Hassan ↔ TechVenture MY  · Score: 91
                           2. Priya Nair  ↔ TechVenture MY  · Score: 84
                           3. Lim Wei     ↔ DataCo KL       · Score: 77  ⚠ risk flag
                           Creating linkage entities in Firestore...
```
Color: `#67E8F9` (cyan)

*Completion:*
```
[SYSTEM]  14:23:05  ✓ Matching complete. 3 proposals created. Awaiting admin review.
```
Color: `#34D399` (green)

**Animation:** Each new entry slides in from bottom with 200ms ease. Scroll auto-follows latest entry.

---

#### 2.3 Match Proposals Panel (Right, 360px)

**Header:** "Proposed Matches" + count badge

**Each proposal card:**
- White background, 12px border-radius, 1px border `#E2E8F0`
- Padding: 16px
- Bottom margin: 12px

**Card layout:**
```
[Score badge — large, top right corner]
Mentor: [Avatar] [Name] [Expertise chips]
Company: [Icon] [Name] [Stage chip]
Programme: [Name]
────────────────
Reasoning: [2-3 line text, `#475569`]
Risk flags: [amber chip if any]
────────────────
[Confirm button]  [Reject button]  [View Details]
```

**Score badge (large, positioned top-right):**
- Circle, 52px diameter
- 80+: `#10B981` background, white text, weight 700, 20px
- 60–79: `#F59E0B` background
- <60: `#EF4444` background

**Confirm button:**
- `#10B981` background, white, "Confirm Match" label, CheckCircle icon
**Reject button:**
- `#FEE2E2` background, `#EF4444` text, "Reject" label, X icon

---

### 3. ACTORS PAGE (`/actors`)

**Purpose:** Browse and manage all entities — mentors, companies, partners, programmes.

---

#### 3.1 Tabs

Four tabs across the top: Mentors | Companies | Partners | Programmes  
Active tab: bottom border `#4F46E5`, `#4F46E5` text  
Inactive: `#64748B` text

---

#### 3.2 Mentor Cards Grid

**Layout:** 3-column grid on desktop, 2-column on tablet  
**Filter bar above grid:**
- Search input (left)
- Sector filter dropdown
- Stage filter dropdown
- "Add Mentor" button (right, primary style)

**Each mentor card:**
```
[Avatar — 48px circle, initials, #4F46E5 bg]  [Name — 16px, 600]  [Region chip]
[Expertise tags — up to 3 shown, then "+N more"]

Performance row:
⭐ [avg_rating]  ✓ [completion_rate%]  📅 [total_engagements] engagements

Strength tags: [green chips]
Weakness tags: [red chips, if any]

[View Profile button]  [View History button]
```

**Card hover:** box-shadow increases, "View Profile" button appears if hidden

---

#### 3.3 Mentor Profile Modal / Drawer

**Trigger:** Click "View Profile" on any mentor card  
**Layout:** Right-side drawer, 480px width, slides in from right

**Sections (scrollable):**

*Header:*
- Large avatar (64px)
- Name (24px, 700)
- Role / Bio (2 lines, `#64748B`)
- Region + stage preference chips

*Performance Summary:*
- 4 metric boxes in 2x2 grid:
  - Avg Rating (star icon + number)
  - Completion Rate (check icon + %)
  - Session Attendance (calendar icon + %)
  - Domain Match Score (target icon + %)

*Strength / Weakness Tags:*
- Two rows of chips, green = strength, red = weakness

*Failure Patterns (if any):*
- Warning box, amber background `#FEF3C7`
- Each pattern as a bullet point, `#92400E` text
- Header: "Known Failure Patterns" with AlertTriangle icon

*Engagement History (last 5):*
- Each as a compact row:
  - Company name + programme name
  - Period (start–end dates)
  - Outcome chip (completed / dropped)
  - Rating stars
  - Expand arrow → shows notes

*Action buttons (bottom, sticky):*
- "Edit Profile" — secondary
- "View Full History" — ghost
- "Close" — icon button top-right corner

---

### 4. LINKAGES PAGE (`/linkages`)

**Purpose:** View and manage all relationship linkages across the ecosystem.

---

#### 4.1 Filters Bar
- Status filter: All | Proposed | Active | Completed | Dropped
- Type filter: All | Mentor-Company | Company-Programme | Partner-Initiative
- Trajectory filter (NEW): All | Improving | Stable | Declining | Critical
- Programme filter: dropdown
- Date range: start + end date pickers
- Search: by mentor name or company name

---

#### 4.2 Linkages Table

**Columns:**
```
Type    Entity A    Entity B    Programme    Score    Status    Trajectory    Health    Created    Actions
```

**Trajectory column (NEW):**
- Same chip design as Dashboard linkages table
- Sortable — click column header to sort by trajectory severity
- Declining and Critical rows have a subtle left border `#EF4444` (2px) for visual urgency

**Expandable rows:** Click a row to expand and see:
- Full reasoning text
- Risk flags
- Trajectory prediction summary (NEW)
- Post-mortem (if closed)
- Feedback ratings

**Bulk actions bar** (appears when rows are selected):
- "Confirm Selected" button
- "Export CSV" button
- Selection count: "3 selected"

---

#### 4.3 Linkage Detail Modal

**Trigger:** "View Details" action on any row  
**Layout:** Centered modal, 600px wide

**Sections:**
1. Entity A card (left half) + Entity B card (right half) — mini profile cards
2. Match Details: Score (large), Fit Score breakdown bar chart (semantic % + history %), Reasoning paragraph
3. Risk Report: list of flags with severity (if Risk Agent ran)
4. Timeline: status history with timestamps
5. Feedback section (editable if status = completed): rating stars + notes textarea
6. Post-mortem (if dropped): lessons generated by AI, displayed in amber warning box

**Trajectory Panel (NEW — F11, appears when status = active and sessions exist):**
```
┌─────────────────────────────────────────────────────┐
│  🔮 Relationship Trajectory              [AI badge] │
│                                                     │
│  Status:              DECLINING        ↓            │
│  Predicted outcome:   DROP                          │
│  Drop probability:    78%                           │
│  Estimated drop:      Week 6                        │
│  Confidence:          HIGH                          │
│                                                     │
│  "Ratings fallen 4.5→3.1 across 3 sessions with    │
│   increasing response time, matching pattern of 2   │
│   prior drops for this mentor."                     │
│                                                     │
│  ⚡ Recommended Action  [IMMEDIATE badge]            │
│  Schedule admin check-in within 48 hours.           │
│  Consider reassignment if next rating < 3.0         │
│                                                     │
│  [Schedule Check-in]    [Flag for Review]           │
└─────────────────────────────────────────────────────┘
```
- Background: `#FFF1F2` (light red) for declining/critical, `#F0FDF4` (light green) for improving
- `trajectory_reason` text in italic, `#475569`
- Recommended action in bold, `#1E293B`
- Action urgency badge: IMMEDIATE = red, THIS_WEEK = amber, MONITOR = slate

**Evolution Forecast Panel (NEW — F12, appears when status = completed and forecast exists):**
```
┌─────────────────────────────────────────────────────┐
│  📈 Cross-Cohort Evolution Forecast      [AI badge] │
│                                                     │
│  Cohort Fit Score Projection:                       │
│  C3 ████████████████████ 84  ← current             │
│  C4 ████████████░░░░░░░░ 61  ← predicted           │
│  C5 ████████░░░░░░░░░░░░ 43  ← predicted           │
│                                                     │
│  ⚠ Mismatch predicted at Cohort 4                   │
│  "Company scaling to Series B; mentor track record  │
│   strongest at Seed stage."                         │
│                                                     │
│  Recommendation: Introduce Series B specialist      │
│  as co-mentor in Cohort 3.                         │
└─────────────────────────────────────────────────────┘
```
- Progress bars: solid = historical, dashed/lighter = predicted
- Mismatch cohort highlighted in amber

---

### 5. TRAJECTORIES PAGE (`/trajectories`) ← NEW PAGE

**Purpose:** Dedicated view of all active engagement trajectories — the predictive intelligence dashboard.

---

#### 5.1 Trajectory Summary Cards Row

Four summary cards:
- **Improving:** count of linkages with improving trajectory — emerald icon
- **Stable:** count of stable linkages — slate icon
- **Declining:** count of declining linkages — amber icon, clickable shortcut
- **Critical:** count of critical linkages — red icon, pulse animation on card border

---

#### 5.2 Trajectory Table

Full-width table of all active linkages with trajectory data.

**Columns:**
```
Mentor    Company    Sessions    Current Rating    Trend    Drop Prob    Est. Drop    Action Urgency    Actions
```

**Trend column:**
- Sparkline mini chart (5 data points max) — recharts `<LineChart>` inline, 80px wide
- Green line = improving, red line = declining

**Drop probability column:**
- Shown as percentage + thin progress bar
- Red fill when > 60%, amber when 40–60%, green when < 40%

**Action Urgency column:**
- IMMEDIATE: red pill badge, pulsing
- THIS_WEEK: amber pill badge
- MONITOR: slate pill badge

**Actions column:**
- "Log Session" button — opens session log modal
- "View Details" — opens linkage detail modal

---

#### 5.3 Session Log Modal

**Trigger:** "Log Session" button on any active linkage  
**Layout:** Centered modal, 480px wide

**Form fields:**
- Session number (auto-incremented, read-only display)
- Date picker — defaults to today
- Attended toggle (Yes / No) — default Yes
- Rating slider: 1–5 with star display
- Response time input: "Hours between last message and reply" — number input
- Notes textarea — optional

**Submit button:**
- "Log Session + Run Trajectory Analysis"
- On submit: saves session → triggers Trajectory Predictor → result appears in modal after ~3 seconds
- Loading state: "Analysing trajectory..." with spinner

**Post-submit result display:**
- Trajectory result appears inline below form after prediction returns
- Same panel design as Linkage Detail Modal trajectory panel
- Close button to dismiss

---

### 6. AGENT LOGS PAGE (`/logs`)

**Purpose:** Full audit trail of all agent activity — for transparency and debugging.

---

#### 6.1 Full Log Viewer

**Same dark terminal styling as the reasoning log on Match Engine page** but persistent — shows historical runs.

**Top filter bar:**
- Date range selector
- Agent type filter (All | Orchestrator | Mentor | Company | Programme | Partner | Risk | NL Interface | Trajectory Predictor)
- Matching run selector (dropdown of past runs by timestamp)
- Search in logs input

**Log entries:** Same format as Match Engine reasoning log  
**Export button:** "Export Log" → downloads as .txt

---

### 7. ANALYTICS PAGE (`/analytics`)

**Purpose:** Programme-level insights and trend charts.

---

#### 7.1 Charts Layout

**Row 1 — two charts side by side:**

*Chart 1: Match Score Distribution (Bar Chart)*
- X axis: score ranges (60–70, 70–80, 80–90, 90–100)
- Y axis: count of linkages
- Bar color: gradient from amber to green
- Recharts `<BarChart>` component

*Chart 2: Completion Rate by Sector (Horizontal Bar)*
- Y axis: sectors (Fintech, EdTech, HealthTech, etc.)
- X axis: completion rate %
- Color: `#4F46E5` bars

**Row 2 — two charts side by side:**

*Chart 3: Mentor Performance Over Time (Line Chart)*
- X axis: programme cycles (Cohort 1, 2, 3...)
- Y axis: avg rating
- One line per top-5 mentor, different colors
- Recharts `<LineChart>` with legend

*Chart 4: Engagement Health Heatmap (Grid)*
- Rows: mentors
- Columns: months
- Cell color: green (healthy) → amber → red (at-risk or dropped)
- Click cell: opens linkage detail

**Row 3 — new chart (NEW — F12):**

*Chart 5: Cross-Cohort Evolution Forecast (Line Chart)*
- X axis: cohort numbers (C1, C2, C3, C4, C5)
- Y axis: fit score (0–100)
- Solid lines = historical actual scores
- Dashed lines = predicted future scores
- One line per active mentor-company pairing
- Legend: mentor + company name pair
- Recharts `<LineChart>` with `strokeDasharray` for predicted segments
- Tooltip: shows full reasoning on hover of predicted data point

---

### 8. GLOBAL UI COMPONENTS

#### 8.1 Status Chips

```
proposed:   bg-indigo-100  text-indigo-800   border-indigo-200   "Proposed"
active:     bg-emerald-100 text-emerald-800  border-emerald-200  "Active"
completed:  bg-slate-100   text-slate-700    border-slate-200    "Completed"
dropped:    bg-red-100     text-red-800      border-red-200      "Dropped"
at-risk:    bg-amber-100   text-amber-800    border-amber-200    "At Risk"
```

All chips: `text-xs font-semibold px-2.5 py-0.5 rounded-full border`

#### 8.2 Trajectory Chips (NEW)

```
improving:  bg-emerald-100  text-emerald-800  border-emerald-200  "↑ Improving"
stable:     bg-slate-100    text-slate-700    border-slate-200    "→ Stable"
declining:  bg-amber-100    text-amber-800    border-amber-200    "↓ Declining · [X]%"
critical:   bg-red-100      text-red-800      border-red-200      "⚠ Critical · Wk [N]"
```

All trajectory chips: same base as status chips.  
Declining and Critical chips include dynamic data (probability % or week number) rendered inline.

#### 8.3 AI Badge

Used to tag anything AI-generated:
- Background: linear-gradient(`#4F46E5`, `#7C3AED`)
- Text: white, 10px, uppercase, "AI"
- Sparkle icon (4px, white)
- Applied to: match scores, reasoning text headers, agent log entries, trajectory panels, evolution forecasts

#### 8.4 Empty States

Each table/grid has a designed empty state:
- Illustration: SVG icon (network graph, search, etc.)
- Heading: context-specific ("No matches proposed yet")
- Sub-text: action guidance
- CTA button if applicable

#### 8.5 Loading States

- Skeleton loaders (not spinners) for card grids and table rows
- Skeleton: `animate-pulse`, `bg-slate-200` blocks matching the content layout
- Reasoning log uses a blinking cursor at the end of the last line
- Trajectory prediction loading state: "Analysing trajectory..." spinner inside the trajectory panel

#### 8.6 Toast Notifications

Position: top-right corner, 320px wide  
Stack: newest on top, max 3 visible

```
Success: #10B981 left border, CheckCircle icon, "Match confirmed successfully"
Error:   #EF4444 left border, XCircle icon,    "Agent timeout — retry?"
Info:    #4F46E5 left border, Info icon,       "Matching cycle started"
Warning: #F59E0B left border, AlertTriangle,   "2 engagements flagged at-risk"
Urgent:  #EF4444 left border, TrendingDown icon, "Engagement predicted to drop — act now"  ← NEW
```

Auto-dismiss: 4 seconds. Manual dismiss: × button.  
Urgent trajectory toasts: 8 seconds (longer dismiss — requires attention).

---

### 9. RESPONSIVE BREAKPOINTS

```
Mobile  (<768px):  Sidebar collapses to bottom tab bar (5 tabs)
                   Cards stack to 1-column
                   Reasoning log: 60vh, scrollable
                   Trajectory panel: full-width below match details

Tablet  (768–1024): Sidebar collapses to icon-only (60px)
                    Cards: 2-column grid
                    Match Engine: single column, log below proposals
                    Trajectory table: horizontal scroll

Desktop (>1024px): Full 240px sidebar
                   Match Engine: 3-column layout
                   3-column card grids
                   Trajectory panel: inline in detail modal
```

---

### 10. ANIMATION & INTERACTION SPECS

- **Route transitions:** 150ms fade (opacity 0→1)
- **Modal/Drawer open:** 200ms slide-in from right (drawer) or scale-up from center (modal)
- **Reasoning log entries:** 180ms slide-up + fade-in per entry
- **Score badge:** count-up animation from 0 to final value over 600ms (on match results)
- **Status chip change:** background color transitions smoothly 300ms
- **Card hover:** translateY(-2px) + shadow increase, 150ms
- **Trajectory chip change:** background and text color transitions 400ms (slower — draws attention)
- **Critical trajectory card border:** pulsing red border, 1.5s ease-in-out infinite

---

### 11. STITCH MCP PROMPT HINTS

When generating components via Stitch MCP, use these descriptors:

> "Design a dark terminal-style log panel with monospace font, indigo/violet/cyan/red color-coded agent messages streaming from bottom to top, with a live green pulse indicator in the header"

> "Design a proposal card with a large circular score badge (green/amber/red) in the top-right corner, two entity mini-profiles side by side, a reasoning text paragraph, and confirm/reject action buttons at the bottom"

> "Design a sidebar navigation with a dark slate background, icon + label nav items, active state with indigo background and lighter left border, and an AI status indicator at the bottom"

> "Design a KPI card with a colored icon in a light circle, a large metric number, a descriptive sub-label, and an optional trend chip — clean white card with subtle border shadow"

> "Design a mentor actor card with avatar, name, expertise chips, performance metrics row with icons, strength/weakness tag rows, and two ghost action buttons at the bottom"

> "Design a trajectory prediction panel with a soft red background, a status row showing trajectory direction with arrow icon, a drop probability percentage, an estimated drop week, a confidence badge, an italic reason sentence, and two action buttons at the bottom — all inside a rounded card within a modal"

> "Design a cross-cohort evolution forecast panel showing a horizontal bar chart with solid bars for historical cohorts and dashed/lighter bars for predicted future cohorts, with a mismatch warning in amber below the chart and a recommendation sentence"

> "Design a session log modal with a rating slider showing star icons, a response time number input, an attended toggle, a notes textarea, and a submit button that transitions to a loading spinner then reveals a trajectory prediction panel inline after submission"
