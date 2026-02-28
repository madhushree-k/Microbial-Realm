import { useState, useEffect, useRef } from "react";

// ============================================================
// DATA
// ============================================================
const CHARACTERS = [
  {
    id: "druid",
    name: "The Druid",
    title: "Microbiologist",
    color: "#4ecdc4",
    accent: "#a8f0ed",
    hp: 90,
    ap: 4,
    role: "Analyst · Support",
    desc: "Identifies bacterial species using portable lab gear. Enables precise antibiotic use.",
    abilities: [
      {
        name: "Analyse Bacteria",
        type: "buff",
        cost: 2,
        desc: "Roll 1d6: 1-2 fail, 3-6 success. Identifies bacteria, enabling Specific Antibiotics (3d20 instead of 1d20).",
        roll: "1d6",
        threshold: 3,
      },
      {
        name: "Companion Bacteria",
        type: "debuff",
        cost: 3,
        desc: "Deploy beneficial bacteria. Reduces enemy AP temporarily. Two debuffs combine into one permanent debuff.",
        roll: "2d6",
        threshold: null,
      },
    ],
    // placeholder image slot
    img: null,
    emoji: "🔬",
  },
  {
    id: "cook",
    name: "The Cook",
    title: "Pharmaceutical Researcher",
    color: "#f7c948",
    accent: "#fde68a",
    hp: 90,
    ap: 3,
    role: "Support · Buffer · Healer",
    desc: "Synthesises chemical enhancers and healing compounds mid-battle.",
    abilities: [
      {
        name: "Attack Buff",
        type: "buff",
        cost: 2,
        desc: "Roll d6: 1-2 random ally, 3-6 chosen ally. Grants +1d6 bonus to target's next attack.",
        roll: "1d20+1d6",
        threshold: null,
      },
      {
        name: "Healing Potion",
        type: "heal",
        cost: 2,
        desc: "Roll d6: 1-2 random ally, 3-6 chosen ally. Restores 1d20+1d6 HP.",
        roll: "1d20+1d6",
        threshold: null,
      },
    ],
    img: null,
    emoji: "⚗️",
  },
  {
    id: "paladin",
    name: "The Paladin",
    title: "Medical Specialist",
    color: "#e05c5c",
    accent: "#fca5a5",
    hp: 70,
    ap: 4,
    role: "Primary Damage · Treatment",
    desc: "Wields antibiotic arsenal. Deploys generic or specific antibiotics depending on identification.",
    abilities: [
      {
        name: "Generic Antibiotics",
        type: "attack",
        cost: 2,
        desc: "Broad-spectrum. Damage: AP + 1d20. No identification needed. Builds resistance faster.",
        roll: "1d20",
        threshold: null,
      },
      {
        name: "Specific Antibiotics",
        type: "attack",
        cost: 3,
        desc: "Requires identified bacteria. Damage: AP + 3d20. MUST complete course or enemy gains +1 RP.",
        roll: "3d20",
        threshold: null,
        requiresId: true,
      },
    ],
    img: null,
    emoji: "💉",
  },
  {
    id: "mage",
    name: "The Mage",
    title: "Public Health Specialist",
    color: "#a855f7",
    accent: "#d8b4fe",
    hp: 80,
    ap: 3,
    role: "Debuffer · Controller · Prevention",
    desc: "Manages population-level resistance. Rewrites turn order and disrupts bacterial evolution.",
    abilities: [
      {
        name: "Bacterial Debuff",
        type: "debuff",
        cost: 2,
        desc: "Reduce target bacteria AP by 2d20. Prevent transmission in zone.",
        roll: "2d20",
        threshold: null,
      },
      {
        name: "Counter Resistance",
        type: "special",
        cost: 3,
        desc: "Permanently reduce target bacteria RP by 1. Disrupt horizontal gene transfer.",
        roll: null,
        threshold: null,
      },
      {
        name: "Change Order",
        type: "special",
        cost: 1,
        desc: "Roll 1d6: on 4-6, rearrange turn order this round.",
        roll: "1d6",
        threshold: 4,
      },
    ],
    img: null,
    emoji: "🧫",
  },
];

const ENEMIES = [
  {
    id: "strep",
    name: "Streptococcus pyogenes",
    nickname: "The Chain Breaker",
    hp: 60,
    ap: 12,
    rp: 1,
    maxRp: 5,
    weakness: "Blue (Beta-lactams)",
    color: "#f97316",
    emoji: "🦠",
    desc: "A common pathogen. Relatively naive to antibiotics. Good training target.",
  },
  {
    id: "staph",
    name: "Staphylococcus aureus",
    nickname: "The Gold Menace",
    hp: 80,
    ap: 18,
    rp: 2,
    maxRp: 5,
    weakness: "Green (Glycopeptides)",
    color: "#eab308",
    emoji: "🔴",
    desc: "Hardier strain. Starts with some resistance. Watch for spread.",
  },
  {
    id: "klebsiella",
    name: "Klebsiella pneumoniae",
    nickname: "The Fortress",
    hp: 100,
    ap: 22,
    rp: 3,
    maxRp: 6,
    weakness: "Yellow (Aminoglycosides)",
    color: "#84cc16",
    emoji: "🟢",
    desc: "High natural resistance. Requires identification before effective treatment.",
  },
  {
    id: "omega7",
    name: "OMEGA-7 Prime",
    nickname: "The Death That Learns",
    hp: 200,
    ap: 35,
    rp: 4,
    maxRp: 8,
    weakness: "All — rotate families",
    color: "#ec4899",
    emoji: "☣️",
    desc: "FINAL BOSS. Adapts every round. Requires all four characters and traditional + modern tactics.",
    isBoss: true,
  },
];

const LOCATIONS = [
  {
    id: "farms",
    name: "The Living Farms",
    icon: "🌾",
    color: "#65a30d",
    desc: "Symbiotic crops and beneficial bacteria. Learn that prevention beats treatment.",
    enemies: ["strep"],
    npc: "Agricultural Expert Thara",
  },
  {
    id: "infirmary",
    name: "The Grand Infirmary",
    icon: "🏥",
    color: "#0ea5e9",
    desc: "Cathedral hospital under siege by resistant strains. Use triage: identify, treat, complete.",
    enemies: ["staph", "klebsiella"],
    npc: "Master Healer Aldric",
  },
  {
    id: "sewers",
    name: "The Sewers",
    icon: "🕳️",
    color: "#7c3aed",
    desc: "Final confrontation. OMEGA-7 has evolved. Combine all you've learned.",
    enemies: ["omega7"],
    npc: null,
  },
];

const ANTIBIOTIC_FAMILIES = [
  { name: "Beta-lactams", color: "#3b82f6", label: "Blue" },
  { name: "Fluoroquinolones", color: "#ef4444", label: "Red" },
  { name: "Aminoglycosides", color: "#eab308", label: "Yellow" },
  { name: "Glycopeptides", color: "#22c55e", label: "Green" },
];

// ============================================================
// HELPERS
// ============================================================
function rollDice(sides, count = 1) {
  let total = 0;
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    total += r;
  }
  return { total, rolls };
}

function parseRoll(str) {
  if (!str) return 0;
  let total = 0;
  const parts = str.split("+");
  for (const part of parts) {
    const m = part.match(/(\d+)d(\d+)/);
    if (m) {
      const { total: t } = rollDice(parseInt(m[2]), parseInt(m[1]));
      total += t;
    }
  }
  return total;
}

// ============================================================
// STYLES
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'Exo 2', sans-serif;
    background: #0a0e1a;
    color: #e2e8f0;
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  .game-root {
    min-height: 100vh;
    background: #0a0e1a;
    position: relative;
  }
  
  /* Scanline overlay */
  .game-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  .screen { display: none; }
  .screen.active { display: flex; flex-direction: column; }

  /* TITLE SCREEN */
  .title-screen {
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at 50% 30%, #1a0a2e 0%, #0a0e1a 70%);
    position: relative;
    overflow: hidden;
    padding: 2rem;
  }
  .title-bg-cells {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .cell {
    position: absolute;
    border-radius: 50%;
    opacity: 0.06;
    animation: float linear infinite;
  }
  @keyframes float {
    0% { transform: translateY(110vh) scale(0.5); opacity: 0; }
    10% { opacity: 0.06; }
    90% { opacity: 0.06; }
    100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
  }
  .title-content {
    text-align: center;
    z-index: 10;
    max-width: 700px;
  }
  .title-eyebrow {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    color: #4ecdc4;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }
  .title-main {
    font-family: 'Rajdhani', sans-serif;
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 700;
    line-height: 1;
    color: #fff;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }
  .title-main span { color: #4ecdc4; }
  .title-sub {
    font-family: 'Rajdhani', sans-serif;
    font-size: clamp(1rem, 3vw, 1.6rem);
    font-weight: 500;
    color: #a855f7;
    letter-spacing: 0.15em;
    margin-bottom: 2rem;
  }
  .title-desc {
    font-size: 0.95rem;
    color: #94a3b8;
    line-height: 1.7;
    margin-bottom: 3rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
  .btn-primary {
    background: linear-gradient(135deg, #4ecdc4, #a855f7);
    color: #fff;
    border: none;
    padding: 1rem 2.5rem;
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: all 0.2s;
    position: relative;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(78,205,196,0.4);
  }
  .btn-secondary {
    background: transparent;
    color: #94a3b8;
    border: 1px solid #334155;
    padding: 0.6rem 1.5rem;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-secondary:hover { border-color: #4ecdc4; color: #4ecdc4; }

  /* CHARACTER SELECT */
  .char-screen {
    min-height: 100vh;
    padding: 2rem;
    background: #0a0e1a;
  }
  .screen-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .screen-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
  }
  .screen-subtitle {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    color: #4ecdc4;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-top: 0.3rem;
  }
  .char-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
    max-width: 1100px;
    margin: 0 auto 2rem;
  }
  .char-card {
    background: #111827;
    border: 1px solid #1e293b;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
  }
  .char-card:hover { border-color: var(--cc); transform: translateY(-3px); }
  .char-card.selected { border-color: var(--cc); background: #1a2332; box-shadow: 0 0 20px rgba(var(--ccr),0.15); }
  .char-card-img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #1e293b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    margin: 0 auto 1rem;
    border: 2px solid var(--cc);
    overflow: hidden;
  }
  .char-card-img img { width: 100%; height: 100%; object-fit: cover; }
  .char-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--cc);
    text-align: center;
  }
  .char-title {
    font-size: 0.75rem;
    color: #64748b;
    text-align: center;
    font-family: 'Share Tech Mono', monospace;
    margin-bottom: 0.8rem;
  }
  .char-role {
    font-size: 0.7rem;
    color: #94a3b8;
    text-align: center;
    margin-bottom: 0.8rem;
    letter-spacing: 0.05em;
  }
  .char-desc {
    font-size: 0.8rem;
    color: #64748b;
    text-align: center;
    line-height: 1.5;
    margin-bottom: 1rem;
  }
  .stat-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #94a3b8;
    font-family: 'Share Tech Mono', monospace;
    border-top: 1px solid #1e293b;
    padding-top: 0.8rem;
  }
  .stat-val { color: var(--cc); font-weight: 600; }
  .ability-list { margin-top: 0.8rem; }
  .ability-tag {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    margin: 0.15rem;
    font-size: 0.65rem;
    font-family: 'Share Tech Mono', monospace;
    border: 1px solid var(--cc);
    color: var(--cc);
    background: rgba(var(--ccr),0.05);
  }
  .selected-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: var(--cc);
    color: #0a0e1a;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.15rem 0.4rem;
    font-family: 'Share Tech Mono', monospace;
  }
  .char-actions {
    text-align: center;
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* GAME LAYOUT */
  .game-layout {
    display: grid;
    grid-template-columns: 260px 1fr 280px;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    gap: 0;
  }
  @media (max-width: 900px) {
    .game-layout {
      grid-template-columns: 1fr;
    }
    .party-panel, .info-panel { display: none; }
  }

  /* TOP BAR */
  .top-bar {
    grid-column: 1 / -1;
    background: #080c18;
    border-bottom: 1px solid #1e293b;
    padding: 0.8rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .top-bar-logo {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #4ecdc4;
    letter-spacing: 0.05em;
  }
  .top-bar-logo span { color: #a855f7; }
  .location-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #111827;
    border: 1px solid #1e293b;
    padding: 0.4rem 0.8rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
    color: #94a3b8;
  }
  .phase-indicator {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    color: #4ecdc4;
    letter-spacing: 0.1em;
  }

  /* PARTY PANEL */
  .party-panel {
    background: #080c18;
    border-right: 1px solid #1e293b;
    padding: 1rem;
    overflow-y: auto;
  }
  .panel-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: #4ecdc4;
    text-transform: uppercase;
    margin-bottom: 1rem;
    border-bottom: 1px solid #1e293b;
    padding-bottom: 0.5rem;
  }
  .party-member {
    background: #111827;
    border: 1px solid #1e293b;
    padding: 0.8rem;
    margin-bottom: 0.8rem;
    cursor: pointer;
    transition: all 0.15s;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
  }
  .party-member:hover { border-color: var(--cc); }
  .party-member.active-turn { border-color: var(--cc); background: #1a2332; }
  .party-member.ko { opacity: 0.4; }
  .member-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
  }
  .member-emoji { font-size: 1.4rem; }
  .member-info { flex: 1; min-width: 0; }
  .member-name {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--cc);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .member-role {
    font-size: 0.65rem;
    color: #64748b;
    font-family: 'Share Tech Mono', monospace;
  }
  .hp-bar-wrap { margin-bottom: 0.3rem; }
  .bar-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.65rem;
    font-family: 'Share Tech Mono', monospace;
    color: #64748b;
    margin-bottom: 0.2rem;
  }
  .bar-track {
    height: 6px;
    background: #1e293b;
    border-radius: 0;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    transition: width 0.4s ease;
  }
  .hp-fill { background: #22c55e; }
  .hp-fill.low { background: #eab308; }
  .hp-fill.critical { background: #ef4444; }
  .ap-dots {
    display: flex;
    gap: 3px;
    margin-top: 0.4rem;
  }
  .ap-dot {
    width: 8px;
    height: 8px;
    background: #1e293b;
    border-radius: 50%;
  }
  .ap-dot.filled { background: #4ecdc4; }

  /* MAIN AREA */
  .main-area {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* NARRATIVE PANEL */
  .narrative-panel {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: #0a0e1a;
    position: relative;
  }
  .narrative-messages {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 720px;
    margin: 0 auto;
  }
  .msg {
    display: flex;
    gap: 1rem;
    animation: msgIn 0.3s ease;
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .msg-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .msg-gm .msg-icon { background: #1e1b4b; border: 1px solid #a855f7; }
  .msg-player .msg-icon { background: #0f2d2a; border: 1px solid #4ecdc4; }
  .msg-system .msg-icon { background: #1c1917; border: 1px solid #64748b; }
  .msg-combat .msg-icon { background: #2d0a0a; border: 1px solid #ef4444; }
  .msg-body { flex: 1; }
  .msg-sender {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    margin-bottom: 0.3rem;
  }
  .msg-gm .msg-sender { color: #a855f7; }
  .msg-player .msg-sender { color: #4ecdc4; }
  .msg-system .msg-sender { color: #64748b; }
  .msg-combat .msg-sender { color: #ef4444; }
  .msg-text {
    font-size: 0.9rem;
    line-height: 1.65;
    color: #cbd5e1;
  }
  .msg-gm .msg-text { color: #e2e8f0; }
  .msg-text em { color: #4ecdc4; font-style: normal; }
  .msg-text strong { color: #fde68a; font-weight: 600; }
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0.5rem 0;
  }
  .dot-pulse {
    width: 6px;
    height: 6px;
    background: #a855f7;
    border-radius: 50%;
    animation: pulse 1.2s ease-in-out infinite;
  }
  .dot-pulse:nth-child(2) { animation-delay: 0.2s; }
  .dot-pulse:nth-child(3) { animation-delay: 0.4s; }
  @keyframes pulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }

  /* ACTION BAR */
  .action-bar {
    background: #080c18;
    border-top: 1px solid #1e293b;
    padding: 1rem 1.5rem;
  }
  .action-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  .action-tab {
    padding: 0.35rem 0.8rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    background: transparent;
    border: 1px solid #1e293b;
    color: #64748b;
    transition: all 0.15s;
  }
  .action-tab.active { border-color: #4ecdc4; color: #4ecdc4; background: rgba(78,205,196,0.05); }
  .action-tab:hover:not(.active) { border-color: #334155; color: #94a3b8; }
  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.5rem;
  }
  .action-btn {
    background: #111827;
    border: 1px solid #1e293b;
    padding: 0.6rem 0.8rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .action-btn:hover:not(:disabled) { border-color: #4ecdc4; background: #1a2332; }
  .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .action-btn-name {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    font-size: 0.85rem;
    color: #e2e8f0;
  }
  .action-btn-meta {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    color: #64748b;
  }
  .action-btn-type {
    font-size: 0.65rem;
    padding: 0.1rem 0.35rem;
    font-family: 'Share Tech Mono', monospace;
    font-weight: 600;
    width: fit-content;
  }
  .type-buff { background: rgba(78,205,196,0.15); color: #4ecdc4; }
  .type-attack { background: rgba(239,68,68,0.15); color: #ef4444; }
  .type-heal { background: rgba(34,197,94,0.15); color: #22c55e; }
  .type-debuff { background: rgba(168,85,247,0.15); color: #a855f7; }
  .type-special { background: rgba(247,201,72,0.15); color: #f7c948; }

  /* INPUT ROW */
  .input-row {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  .story-input {
    flex: 1;
    background: #111827;
    border: 1px solid #1e293b;
    color: #e2e8f0;
    padding: 0.6rem 1rem;
    font-family: 'Exo 2', sans-serif;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.15s;
  }
  .story-input::placeholder { color: #334155; }
  .story-input:focus { border-color: #4ecdc4; }
  .send-btn {
    background: #4ecdc4;
    color: #0a0e1a;
    border: none;
    padding: 0.6rem 1.2rem;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.05em;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
  }
  .send-btn:hover { background: #38bdb4; }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* INFO PANEL */
  .info-panel {
    background: #080c18;
    border-left: 1px solid #1e293b;
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .enemy-section {}
  .enemy-card {
    background: #111827;
    border: 1px solid #1e293b;
    padding: 0.8rem;
    margin-top: 0.5rem;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
  }
  .enemy-name {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }
  .enemy-nickname {
    font-size: 0.65rem;
    font-family: 'Share Tech Mono', monospace;
    color: #64748b;
    margin-bottom: 0.8rem;
  }
  .rp-bar-wrap { margin-top: 0.5rem; }
  .rp-fill { background: #ef4444; }
  .rp-fill.high { background: #ec4899; animation: rpPulse 1s ease-in-out infinite; }
  @keyframes rpPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
  .enemy-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }
  .enemy-stat {
    font-size: 0.7rem;
    font-family: 'Share Tech Mono', monospace;
    color: #64748b;
  }
  .enemy-stat span { color: #94a3b8; }
  .weakness-tag {
    margin-top: 0.5rem;
    font-size: 0.65rem;
    font-family: 'Share Tech Mono', monospace;
    color: #f7c948;
    background: rgba(247,201,72,0.05);
    border: 1px solid rgba(247,201,72,0.2);
    padding: 0.2rem 0.4rem;
  }

  /* DICE LOG */
  .dice-log {
    background: #0d1117;
    border: 1px solid #1e293b;
    padding: 0.8rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    max-height: 200px;
    overflow-y: auto;
  }
  .dice-entry { color: #64748b; margin-bottom: 0.3rem; }
  .dice-entry span { color: #4ecdc4; }
  .dice-entry.crit span { color: #f7c948; }
  .dice-entry.fail span { color: #ef4444; }

  /* REFERENCE */
  .ref-section {}
  .ref-family {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.4rem;
    font-size: 0.75rem;
    font-family: 'Share Tech Mono', monospace;
    color: #94a3b8;
  }
  .fam-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* LOCATION SELECT */
  .location-screen {
    min-height: 100vh;
    padding: 2rem;
    background: #0a0e1a;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .location-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
    max-width: 900px;
    width: 100%;
    margin-top: 2rem;
  }
  .loc-card {
    background: #111827;
    border: 1px solid #1e293b;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
  }
  .loc-card:hover { border-color: var(--lc); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
  .loc-icon { font-size: 3rem; margin-bottom: 1rem; }
  .loc-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--lc);
    margin-bottom: 0.5rem;
  }
  .loc-desc { font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1rem; }
  .loc-enemies {
    font-size: 0.7rem;
    font-family: 'Share Tech Mono', monospace;
    color: #64748b;
  }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #080c18; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: #334155; }
`;

// ============================================================
// COMPONENT
// ============================================================
export default function MicrobialRealm() {
  const [screen, setScreen] = useState("title"); // title | charselect | location | game
  const [selectedChars, setSelectedChars] = useState([]);
  const [partyState, setPartyState] = useState([]);
  const [location, setLocation] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("abilities");
  const [activeCharIdx, setActiveCharIdx] = useState(0);
  const [diceLog, setDiceLog] = useState([]);
  const [identified, setIdentified] = useState({});
  const [battlePhase, setBattlePhase] = useState("explore"); // explore | combat | victory
  const [turn, setTurn] = useState(1);
  const [charImages, setCharImages] = useState({});
  const msgEndRef = useRef(null);
  const narrativeRef = useRef(null);

  useEffect(() => {
    if (msgEndRef.current) msgEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Init party state from selected chars
  useEffect(() => {
    if (partyState.length === 0 && selectedChars.length > 0) {
      setPartyState(selectedChars.map(c => ({ ...c, currentHp: c.hp, currentAp: c.ap, status: "ok" })));
    }
  }, [selectedChars]);

  // === DICE ===
  function logDice(label, rolls, total, type = "normal") {
    setDiceLog(prev => [{
      label,
      rolls: rolls.join(", "),
      total,
      type,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    }, ...prev].slice(0, 20));
  }

  // === MESSAGES ===
  function addMsg(type, sender, text) {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), type, sender, text }]);
  }

  // === AI GM ===
  async function callGM(userPrompt, context = "") {
    setIsLoading(true);
    try {
      const systemPrompt = `You are the Game Master for "Microbial Realm: The Resistance Rising" — an educational D&D-style RPG about Antimicrobial Resistance (AMR) for teens.

WORLD: A dystopian future (Antibiotica) where antibiotic overuse caused a resistance crisis. Players are rogue healer specialists hunting OMEGA-7, a superbug that "learns" resistance.

CHARACTERS in this session:
${partyState.map(c => `- ${c.name} (${c.title}): HP ${c.currentHp}/${c.hp}`).join("\n")}

CURRENT LOCATION: ${location?.name || "Unknown"}
BATTLE PHASE: ${battlePhase}
TURN: ${turn}

CURRENT ENEMIES: ${enemies.map(e => `${e.name} HP:${e.currentHp}/${e.hp} RP:${e.rp}/${e.maxRp}`).join(", ") || "None"}

GAME RULES (simplified):
- Bacteria have HP (population) and RP (resistance points 0-5+)
- RP reduces antibiotic damage. When RP is full, that antibiotic family is useless.
- Identify bacteria first (Druid) → then Paladin uses Specific Antibiotics (3x damage) instead of Generic (1x)
- Incomplete antibiotic courses give +1 RP to that bacteria family
- 4 antibiotic families: Blue (Beta-lactams), Red (Fluoroquinolones), Yellow (Aminoglycosides), Green (Glycopeptides)
- Using same family repeatedly builds resistance faster
- Traditional medicine builds NO resistance but deals lower damage

KEY AMR LESSONS to weave in naturally:
- Why we must complete antibiotic courses
- How overuse in farms/hospitals creates resistance
- Why identification (triage) before prescribing matters
- Horizontal gene transfer between bacteria

TONE: Dramatic, punky, slightly scary. Vivid but age-appropriate. Weave in real science naturally. Short paragraphs, max 3-4 sentences. Use **bold** for important terms. Be engaging and educational.

${context}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...messages.filter(m => m.type === "player" || m.type === "gm").slice(-6).map(m => ({
              role: m.type === "player" ? "user" : "assistant",
              content: m.text
            })),
            { role: "user", content: userPrompt }
          ]
        })
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "The GM is silent...";
      addMsg("gm", "Game Master", text);
    } catch (e) {
      addMsg("system", "System", "⚠ GM connection error. Check network settings.");
    }
    setIsLoading(false);
  }

  // === ACTIONS ===
  function handleAbility(char, ability) {
    const charState = partyState.find(c => c.id === char.id);
    if (!charState || charState.currentAp < ability.cost) {
      addMsg("system", "System", `❌ ${char.name} doesn't have enough AP (needs ${ability.cost}).`);
      return;
    }

    // Deduct AP
    setPartyState(prev => prev.map(c => c.id === char.id ? { ...c, currentAp: Math.max(0, c.currentAp - ability.cost) } : c));

    // Roll dice
    let dmg = 0;
    let rollText = "";
    if (ability.roll) {
      dmg = parseRoll(ability.roll);
      const r = rollDice(20);
      const isCrit = r.total === 20;
      const isFail = r.total === 1;
      logDice(`${char.name}: ${ability.name}`, r.rolls, r.total, isCrit ? "crit" : isFail ? "fail" : "normal");
      rollText = ` (Rolled: ${r.total}${isCrit ? " — CRITICAL!" : isFail ? " — MISS!" : ""})`;
    }

    // Apply to enemies
    if (ability.type === "attack" && enemies.length > 0) {
      const target = enemies[0];
      const rpReduction = target.rp;
      const effectiveDmg = Math.max(0, dmg - rpReduction * 3);
      
      setEnemies(prev => prev.map((e, i) => i === 0 ? {
        ...e,
        currentHp: Math.max(0, e.currentHp - effectiveDmg),
        rp: Math.min(e.maxRp, e.rp + (ability.id === "generic" ? 1 : 0.5))
      } : e));

      addMsg("combat", char.name, `⚔️ **${ability.name}** on ${target.name}${rollText}. Base damage: ${dmg}, reduced by RP(${rpReduction}×3): **${effectiveDmg} damage dealt**. ${rpReduction > 0 ? `Resistance dampened the attack.` : ""}`);

      if (ability.name === "Specific Antibiotics") {
        addMsg("system", "System", `📋 COURSE REMINDER: ${char.name} must complete the antibiotic course! If the bacteria survives this encounter, its family gains +1 RP.`);
      }
      
      callGM(`${char.name} used ${ability.name} on ${target.name} for ${effectiveDmg} effective damage (base ${dmg}, RP reduced by ${rpReduction * 3}). Enemy HP now ${Math.max(0, target.currentHp - effectiveDmg)}/${target.hp}. Narrate the attack result and the bacteria's response. Mention resistance if relevant.`);
    } else if (ability.type === "buff") {
      if (ability.name === "Analyse Bacteria") {
        const r = rollDice(6);
        logDice("Analyse Bacteria", r.rolls, r.total, r.total >= 3 ? "normal" : "fail");
        if (r.total >= 3) {
          setIdentified(prev => ({ ...prev, [enemies[0]?.id]: true }));
          addMsg("combat", char.name, `🔬 **Analyse Bacteria** — Rolled ${r.total} ✓ SUCCESS! **${enemies[0]?.name}** identified. Paladin can now use **Specific Antibiotics** for 3× damage!`);
          callGM(`The Druid rolled ${r.total} and successfully identified ${enemies[0]?.name}. Describe the identification process and what it reveals about the bacteria's vulnerabilities. Mention what proper antibiotic selection means.`);
        } else {
          addMsg("combat", char.name, `🔬 **Analyse Bacteria** — Rolled ${r.total} ✗ FAILED. Bacteria remains unidentified. Generic antibiotics only.`);
        }
      } else {
        addMsg("combat", char.name, `✨ **${ability.name}** activated${rollText}.`);
        callGM(`${char.name} used ${ability.name}. Describe the effect on the battlefield.`);
      }
    } else if (ability.type === "heal") {
      const healTarget = partyState.find(c => c.currentHp < c.hp) || partyState[activeCharIdx];
      if (healTarget) {
        const healed = Math.min(healTarget.hp - healTarget.currentHp, dmg);
        setPartyState(prev => prev.map(c => c.id === healTarget.id ? { ...c, currentHp: Math.min(c.hp, c.currentHp + dmg) } : c));
        addMsg("combat", char.name, `💚 **${ability.name}** — Restored **${healed} HP** to ${healTarget.name}${rollText}`);
      }
    } else if (ability.type === "debuff") {
      if (enemies.length > 0) {
        const debuffAmt = dmg;
        setEnemies(prev => prev.map((e, i) => i === 0 ? { ...e, ap: Math.max(1, e.ap - debuffAmt) } : e));
        addMsg("combat", char.name, `🟣 **${ability.name}** — Reduced ${enemies[0]?.name} AP by ${debuffAmt}${rollText}. ${ability.name === "Counter Resistance" ? "RP permanently reduced by 1!" : ""}`);
        if (ability.name === "Counter Resistance") {
          setEnemies(prev => prev.map((e, i) => i === 0 ? { ...e, rp: Math.max(0, e.rp - 1) } : e));
        }
        callGM(`${char.name} used ${ability.name}. Describe how environmental/public health intervention is weakening the bacteria. Mention horizontal gene transfer if relevant.`);
      }
    } else if (ability.type === "special") {
      addMsg("combat", char.name, `⚡ **${ability.name}** activated!${rollText}`);
      callGM(`${char.name} used ${ability.name}. Describe the strategic impact on the battle.`);
    }

    // Check victory
    if (enemies[0] && enemies[0].currentHp <= 0) {
      setTimeout(() => {
        setBattlePhase("victory");
        addMsg("system", "⚡ VICTORY", `🎉 **${enemies[0].name} defeated!** Resistance overcame — but remember, incomplete courses will haunt future encounters.`);
        callGM(`The players have defeated ${enemies[0].name}! Deliver a triumphant but sobering victory message. Reinforce the AMR lesson learned in this battle. Hint at what comes next.`);
      }, 500);
    }

    // Bacteria counter-attack
    if (battlePhase === "combat" && enemies[0] && enemies[0].currentHp > 0 && Math.random() > 0.5) {
      setTimeout(() => {
        const target = partyState[Math.floor(Math.random() * partyState.length)];
        const rawDmg = enemies[0].ap || 10;
        const actualDmg = Math.floor(rawDmg * (0.7 + Math.random() * 0.6));
        setPartyState(prev => prev.map(c => c.id === target.id ? { ...c, currentHp: Math.max(0, c.currentHp - actualDmg) } : c));
        addMsg("combat", enemies[0].nickname || enemies[0].name, `🦠 Counter-attack on ${target.name} for **${actualDmg} damage**! ${enemies[0].rp >= 3 ? "(Resistance is HIGH — this strain is dangerously adapted)" : ""}`);
      }, 800);
    }
  }

  function handleSend() {
    if (!inputText.trim() || isLoading) return;
    addMsg("player", "Party", inputText);
    callGM(inputText);
    setInputText("");
  }

  function startBattle() {
    if (!location) return;
    const locationData = LOCATIONS.find(l => l.id === location);
    const battleEnemies = locationData.enemies.map(eid => {
      const e = ENEMIES.find(en => en.id === eid);
      return { ...e, currentHp: e.hp };
    });
    setEnemies(battleEnemies);
    setBattlePhase("combat");
    setTurn(1);
    addMsg("system", "⚔️ BATTLE START", `Initiative rolled! Turn ${turn}. Enemies: ${battleEnemies.map(e => e.name).join(", ")}`);
    callGM(`Battle begins at ${locationData.name}! The party encounters ${battleEnemies.map(e => e.name).join(" and ")}. Set the scene dramatically. Mention that bacteria have HP and RP bars. Remind players to identify before prescribing.`,
      `Location context: ${locationData.desc}`);
  }

  function enterLocation(locId) {
    setLocation(locId);
    const loc = LOCATIONS.find(l => l.id === locId);
    setScreen("game");
    setBattlePhase("explore");
    setMessages([]);
    setDiceLog([]);
    addMsg("gm", "Game Master", `*Loading ${loc.name}...*`);
    callGM(`The party arrives at ${loc.name}. ${loc.desc} Set the scene. ${loc.npc ? `They meet ${loc.npc}.` : ""} Give them a brief exploration moment before combat. Keep it to 3-4 sentences.`,
      `Location: ${loc.name}. Enemies waiting: ${loc.enemies.join(", ")}`);
  }

  function toggleCharSelect(char) {
    setSelectedChars(prev =>
      prev.find(c => c.id === char.id)
        ? prev.filter(c => c.id !== char.id)
        : prev.length < 4 ? [...prev, char] : prev
    );
  }

  function endTurn() {
    setTurn(t => t + 1);
    setPartyState(prev => prev.map(c => ({ ...c, currentAp: c.ap })));
    addMsg("system", "System", `🔄 End of Turn ${turn}. AP restored. Turn ${turn + 1} begins.`);
    if (enemies.length > 0 && battlePhase === "combat") {
      callGM(`Turn ${turn} ends. Briefly narrate what the bacteria do (spread, mutate, communicate resistance genes). Keep it to 2 sentences.`);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  const activeChar = partyState[activeCharIdx] || partyState[0];

  return (
    <>
      <style>{css}</style>
      <div className="game-root">

        {/* TITLE */}
        {screen === "title" && (
          <div className="screen active title-screen">
            <div className="title-bg-cells">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="cell" style={{
                  left: `${Math.random() * 100}%`,
                  width: `${20 + Math.random() * 60}px`,
                  height: `${20 + Math.random() * 60}px`,
                  background: i % 3 === 0 ? "#4ecdc4" : i % 3 === 1 ? "#a855f7" : "#ef4444",
                  animationDuration: `${8 + Math.random() * 12}s`,
                  animationDelay: `${Math.random() * 10}s`,
                }} />
              ))}
            </div>
            <div className="title-content">
              <div className="title-eyebrow">// SciGameLab · Educational RPG · AMR Awareness</div>
              <h1 className="title-main">Microbial <span>Realm</span></h1>
              <div className="title-sub">The Resistance Rising</div>
              <p className="title-desc">
                Antibiotics saved the world — until we broke them. Now a superbug called <strong style={{color:"#ef4444"}}>OMEGA-7</strong> laughs 
                at your entire arsenal. As a rogue healer in a world on the brink, you must 
                learn to fight smarter, not harder.
              </p>
              <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap"}}>
                <button className="btn-primary" onClick={() => setScreen("charselect")}>Begin Campaign</button>
                <button className="btn-secondary" onClick={() => setScreen("charselect")}>GM Screen Mode</button>
              </div>
            </div>
          </div>
        )}

        {/* CHARACTER SELECT */}
        {screen === "charselect" && (
          <div className="screen active char-screen">
            <div className="screen-header">
              <h2 className="screen-title">Assemble Your Team</h2>
              <div className="screen-subtitle">// Select 1–4 specialists · No faces. No names. Your identity.</div>
            </div>
            <div className="char-grid">
              {CHARACTERS.map(char => {
                const isSelected = selectedChars.find(c => c.id === char.id);
                return (
                  <div
                    key={char.id}
                    className={`char-card ${isSelected ? "selected" : ""}`}
                    style={{ "--cc": char.color, "--ccr": "78,205,196" }}
                    onClick={() => toggleCharSelect(char)}
                  >
                    {isSelected && <div className="selected-badge">✓ SELECTED</div>}
                    <div className="char-card-img">
                      {charImages[char.id]
                        ? <img src={charImages[char.id]} alt={char.name} />
                        : <span>{char.emoji}</span>}
                    </div>
                    <div className="char-name">{char.name}</div>
                    <div className="char-title">{char.title}</div>
                    <div className="char-role">{char.role}</div>
                    <div className="char-desc">{char.desc}</div>
                    <div className="stat-row">
                      <span>HP <span className="stat-val">{char.hp}</span></span>
                      <span>AP <span className="stat-val">{char.ap}/turn</span></span>
                    </div>
                    <div className="ability-list">
                      {char.abilities.map(a => (
                        <span key={a.name} className="ability-tag">{a.name}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="char-actions">
              <button className="btn-secondary" onClick={() => setScreen("title")}>← Back</button>
              <button
                className="btn-primary"
                disabled={selectedChars.length === 0}
                onClick={() => {
                  setPartyState(selectedChars.map(c => ({ ...c, currentHp: c.hp, currentAp: c.ap, status: "ok" })));
                  setScreen("location");
                }}
              >
                Continue → ({selectedChars.length} selected)
              </button>
            </div>
          </div>
        )}

        {/* LOCATION SELECT */}
        {screen === "location" && (
          <div className="screen active location-screen">
            <div className="screen-header" style={{textAlign:"center"}}>
              <h2 className="screen-title">Choose Your Mission</h2>
              <div className="screen-subtitle">// Three locations · Track down OMEGA-7</div>
            </div>
            <div style={{fontSize:"0.85rem",color:"#64748b",maxWidth:"600px",textAlign:"center",margin:"1rem auto 0",lineHeight:"1.7"}}>
              You grew up in the golden age of antibiotics. Until OMEGA-7 arrived — resistant to everything. Start at the Living Farms and work your way to the Sewers.
            </div>
            <div className="location-grid">
              {LOCATIONS.map((loc, i) => (
                <div
                  key={loc.id}
                  className="loc-card"
                  style={{ "--lc": loc.color, opacity: i > 0 && location !== loc.id ? 0.7 : 1 }}
                  onClick={() => enterLocation(loc.id)}
                >
                  <div className="loc-icon">{loc.icon}</div>
                  <div className="loc-name">{loc.name}</div>
                  <div className="loc-desc">{loc.desc}</div>
                  <div className="loc-enemies">Enemies: {loc.enemies.map(eid => ENEMIES.find(e => e.id === eid)?.nickname).join(", ")}</div>
                  {loc.npc && <div className="loc-enemies" style={{marginTop:"0.3rem"}}>NPC: {loc.npc}</div>}
                  {loc.id === "omega7" && <div style={{color:"#ef4444",fontSize:"0.7rem",fontFamily:"'Share Tech Mono',monospace",marginTop:"0.5rem"}}>⚠ BOSS ENCOUNTER</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GAME SCREEN */}
        {screen === "game" && (
          <div className="screen active" style={{minHeight:"100vh"}}>
            <div className="game-layout">
              {/* TOP BAR */}
              <div className="top-bar">
                <div className="top-bar-logo">Microbial <span>Realm</span></div>
                <div className="location-badge">
                  {LOCATIONS.find(l => l.id === location)?.icon} {LOCATIONS.find(l => l.id === location)?.name || "—"}
                </div>
                <div style={{display:"flex",gap:"1rem",alignItems:"center"}}>
                  <div className="phase-indicator">
                    {battlePhase === "explore" ? "// EXPLORE" : battlePhase === "combat" ? `// COMBAT · TURN ${turn}` : "// VICTORY"}
                  </div>
                  <button className="btn-secondary" style={{fontSize:"0.7rem",padding:"0.3rem 0.6rem"}} onClick={() => setScreen("location")}>◀ Map</button>
                </div>
              </div>

              {/* PARTY PANEL */}
              <div className="party-panel">
                <div className="panel-label">// Party Status</div>
                {partyState.map((char, idx) => {
                  const hpPct = (char.currentHp / char.hp) * 100;
                  return (
                    <div
                      key={char.id}
                      className={`party-member ${idx === activeCharIdx ? "active-turn" : ""} ${char.currentHp <= 0 ? "ko" : ""}`}
                      style={{ "--cc": char.color }}
                      onClick={() => setActiveCharIdx(idx)}
                    >
                      <div className="member-header">
                        <div className="member-emoji">{char.emoji}</div>
                        <div className="member-info">
                          <div className="member-name">{char.name}</div>
                          <div className="member-role">{char.title}</div>
                        </div>
                      </div>
                      <div className="hp-bar-wrap">
                        <div className="bar-label">
                          <span>HP</span>
                          <span>{char.currentHp}/{char.hp}</span>
                        </div>
                        <div className="bar-track">
                          <div className={`bar-fill hp-fill ${hpPct < 30 ? "critical" : hpPct < 60 ? "low" : ""}`} style={{ width: `${hpPct}%` }} />
                        </div>
                      </div>
                      <div className="ap-dots">
                        {[...Array(char.ap)].map((_, i) => (
                          <div key={i} className={`ap-dot ${i < char.currentAp ? "filled" : ""}`} />
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div style={{marginTop:"1rem"}}>
                  <div className="panel-label">// Identified</div>
                  {enemies.map(e => (
                    <div key={e.id} style={{fontSize:"0.7rem",fontFamily:"'Share Tech Mono',monospace",marginBottom:"0.3rem",color: identified[e.id] ? "#4ecdc4" : "#64748b"}}>
                      {identified[e.id] ? "✓" : "?"} {e.name}
                    </div>
                  ))}
                  {enemies.length === 0 && <div style={{fontSize:"0.7rem",color:"#334155",fontFamily:"'Share Tech Mono',monospace"}}>No active enemies</div>}
                </div>
              </div>

              {/* MAIN AREA */}
              <div className="main-area">
                <div className="narrative-panel" ref={narrativeRef}>
                  <div className="narrative-messages">
                    {messages.length === 0 && (
                      <div style={{textAlign:"center",color:"#334155",fontSize:"0.8rem",fontFamily:"'Share Tech Mono',monospace",padding:"3rem 0"}}>
                        // Awaiting GM narration...
                      </div>
                    )}
                    {messages.map(msg => (
                      <div key={msg.id} className={`msg msg-${msg.type}`}>
                        <div className="msg-icon">
                          {msg.type === "gm" ? "🎲" : msg.type === "player" ? "👥" : msg.type === "combat" ? "⚔️" : "⚙️"}
                        </div>
                        <div className="msg-body">
                          <div className="msg-sender">{msg.sender}</div>
                          <div className="msg-text" dangerouslySetInnerHTML={{
                            __html: msg.text
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/\n/g, '<br/>')
                          }} />
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="msg msg-gm">
                        <div className="msg-icon">🎲</div>
                        <div className="msg-body">
                          <div className="msg-sender">Game Master</div>
                          <div className="typing-indicator">
                            <div className="dot-pulse" />
                            <div className="dot-pulse" />
                            <div className="dot-pulse" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={msgEndRef} />
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="action-bar">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem",flexWrap:"wrap",gap:"0.5rem"}}>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:"0.7rem",color:"#64748b"}}>
                      Active: <span style={{color: activeChar?.color}}>{activeChar?.name}</span> · AP: {activeChar?.currentAp}/{activeChar?.ap}
                    </div>
                    <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                      {battlePhase === "explore" && (
                        <button className="btn-primary" style={{padding:"0.4rem 1rem",fontSize:"0.8rem"}} onClick={startBattle}>
                          ⚔️ Initiate Battle
                        </button>
                      )}
                      {battlePhase === "combat" && (
                        <button className="btn-secondary" style={{fontSize:"0.75rem",padding:"0.4rem 0.8rem"}} onClick={endTurn}>
                          End Turn →
                        </button>
                      )}
                      {battlePhase === "victory" && (
                        <button className="btn-primary" style={{padding:"0.4rem 1rem",fontSize:"0.8rem"}} onClick={() => setScreen("location")}>
                          → Next Location
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="action-tabs">
                    {["abilities","party","reference"].map(t => (
                      <button key={t} className={`action-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {activeTab === "abilities" && activeChar && (
                    <div className="action-grid">
                      {activeChar.abilities?.map(ability => (
                        <button
                          key={ability.name}
                          className="action-btn"
                          disabled={activeChar.currentAp < ability.cost || battlePhase === "explore" || battlePhase === "victory" || (ability.requiresId && !identified[enemies[0]?.id])}
                          onClick={() => handleAbility(activeChar, ability)}
                        >
                          <span className={`action-btn-type type-${ability.type}`}>{ability.type.toUpperCase()}</span>
                          <span className="action-btn-name">{ability.name}</span>
                          <span className="action-btn-meta">Cost: {ability.cost} AP · {ability.roll || "—"} {ability.requiresId ? "· REQUIRES ID" : ""}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {activeTab === "party" && (
                    <div className="action-grid">
                      {partyState.map((c, i) => (
                        <button key={c.id} className={`action-btn ${i === activeCharIdx ? "active" : ""}`} style={{"--cc":c.color}} onClick={() => setActiveCharIdx(i)}>
                          <span className="action-btn-name" style={{color:c.color}}>{c.emoji} {c.name}</span>
                          <span className="action-btn-meta">HP {c.currentHp}/{c.hp} · AP {c.currentAp}/{c.ap}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {activeTab === "reference" && (
                    <div style={{fontSize:"0.75rem",fontFamily:"'Share Tech Mono',monospace",color:"#64748b",columns:"2",gap:"1rem"}}>
                      <div style={{marginBottom:"0.5rem",color:"#94a3b8",fontWeight:"600"}}>Antibiotic Families</div>
                      {ANTIBIOTIC_FAMILIES.map(f => (
                        <div key={f.name} className="ref-family">
                          <div className="fam-dot" style={{background:f.color}}/>
                          {f.label}: {f.name}
                        </div>
                      ))}
                      <div style={{marginTop:"0.8rem",marginBottom:"0.5rem",color:"#94a3b8",fontWeight:"600"}}>Key Rules</div>
                      <div style={{marginBottom:"0.3rem"}}>RP reduces antibiotic damage</div>
                      <div style={{marginBottom:"0.3rem"}}>Full RP = antibiotic useless</div>
                      <div style={{marginBottom:"0.3rem"}}>ID first → 3× damage</div>
                      <div style={{marginBottom:"0.3rem"}}>Incomplete course → +1 RP</div>
                      <div>Traditional = no resistance</div>
                    </div>
                  )}
                  <div className="input-row">
                    <input
                      className="story-input"
                      placeholder="Talk to the GM, ask questions, describe actions..."
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSend()}
                    />
                    <button className="send-btn" onClick={handleSend} disabled={isLoading || !inputText.trim()}>SEND</button>
                  </div>
                </div>
              </div>

              {/* INFO PANEL */}
              <div className="info-panel">
                <div className="enemy-section">
                  <div className="panel-label">// Enemies</div>
                  {enemies.length === 0 && (
                    <div style={{fontSize:"0.75rem",color:"#334155",fontFamily:"'Share Tech Mono',monospace"}}>No active encounter</div>
                  )}
                  {enemies.map(e => {
                    const hpPct = ((e.currentHp || e.hp) / e.hp) * 100;
                    const rpPct = (e.rp / e.maxRp) * 100;
                    return (
                      <div key={e.id} className="enemy-card" style={{borderColor: e.isBoss ? "#ec4899" : "#1e293b"}}>
                        <div className="enemy-name" style={{color: e.color}}>{e.isBoss ? "☣️ " : "🦠 "}{e.name}</div>
                        <div className="enemy-nickname">{e.nickname}</div>
                        <div className="hp-bar-wrap">
                          <div className="bar-label"><span>HP (Population)</span><span>{e.currentHp || e.hp}/{e.hp}</span></div>
                          <div className="bar-track">
                            <div className="bar-fill hp-fill" style={{width:`${hpPct}%`,background:e.color}} />
                          </div>
                        </div>
                        <div className="rp-bar-wrap">
                          <div className="bar-label"><span>RP (Resistance)</span><span>{e.rp?.toFixed(1)}/{e.maxRp}</span></div>
                          <div className="bar-track">
                            <div className={`bar-fill rp-fill ${rpPct > 70 ? "high" : ""}`} style={{width:`${rpPct}%`}} />
                          </div>
                        </div>
                        <div className="enemy-stats">
                          <div className="enemy-stat">AP <span>{e.ap}</span></div>
                          <div className="enemy-stat">Status <span>{identified[e.id] ? "ID'd ✓" : "Unknown"}</span></div>
                        </div>
                        <div className="weakness-tag">⚡ Weak: {e.weakness}</div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <div className="panel-label">// Dice Log</div>
                  <div className="dice-log">
                    {diceLog.length === 0 && <div className="dice-entry">// No rolls yet</div>}
                    {diceLog.map((d, i) => (
                      <div key={i} className={`dice-entry ${d.type}`}>
                        <span>{d.label}</span><br/>
                        Rolled [{d.rolls}] = <span>{d.total}</span> @ {d.time}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ref-section">
                  <div className="panel-label">// AMR Reference</div>
                  <div style={{fontSize:"0.72rem",color:"#64748b",lineHeight:"1.7",fontFamily:"'Exo 2',sans-serif"}}>
                    <div style={{marginBottom:"0.5rem"}}><span style={{color:"#4ecdc4"}}>RP</span> = Resistance Points. Bacteria evolve resistance through repeated antibiotic exposure.</div>
                    <div style={{marginBottom:"0.5rem"}}><span style={{color:"#f7c948"}}>Complete courses</span> always — stopping early creates stronger survivors.</div>
                    <div style={{marginBottom:"0.5rem"}}><span style={{color:"#a855f7"}}>Horizontal gene transfer</span> — resistant bacteria share genes with neighbours.</div>
                    <div><span style={{color:"#22c55e"}}>Traditional medicine</span> builds zero resistance but needs knowledge to use well.</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}
