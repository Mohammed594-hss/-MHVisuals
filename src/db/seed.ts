import "dotenv/config";
import { randomUUID } from "crypto";
import { db } from "./index";
import { users, projects, media, likes, bookmarks, comments, follows } from "./schema";
import { hashPassword } from "@/lib/password";

const avatar = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=200&h=200`;
const cover = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;
const banner = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=1600`;

type SeedUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string | null;
  location: string;
  website: string;
  socials: Record<string, string>;
  skills: string[];
};

const usersData: SeedUser[] = [
  {
    id: "u-mona",
    username: "mona",
    email: "mona@mhvisuals.com",
    displayName: "Mona Haddad",
    bio: "Founder of MH Visuals. Multidisciplinary designer obsessed with packaging systems, 3D rendering and the automation tools that power a modern studio.",
    avatarUrl: avatar(5725145),
    bannerUrl: banner(37848030),
    location: "Dubai, UAE",
    website: "https://monahaddad.design",
    socials: { instagram: "https://instagram.com/mona.haddad", behance: "https://behance.net/monahaddad", dribbble: "https://dribbble.com/monahaddad" },
    skills: ["Illustrator", "Blender", "ExtendScript", "Packaging", "Branding"],
  },
  {
    id: "u-karim",
    username: "karim",
    email: "karim@mhvisuals.com",
    displayName: "Karim El-Sayed",
    bio: "3D artist crafting abstract renders and material studies. Cinema 4D and Octane are my home turf.",
    avatarUrl: avatar(16881939),
    bannerUrl: banner(5393438),
    location: "Cairo, Egypt",
    website: "https://karim3d.studio",
    socials: { instagram: "https://instagram.com/karim.renders", artstation: "https://artstation.com/karim" },
    skills: ["Blender", "Cinema 4D", "Octane", "Substance"],
  },
  {
    id: "u-layla",
    username: "layla",
    email: "layla@mhvisuals.com",
    displayName: "Layla Mansour",
    bio: "Brand strategist and identity designer. I turn messy ideas into confident, scalable visual systems.",
    avatarUrl: avatar(20272960),
    bannerUrl: banner(9616964),
    location: "Amman, Jordan",
    website: "https://laylamansour.co",
    socials: { linkedin: "https://linkedin.com/in/laylamansour", behance: "https://behance.net/layla" },
    skills: ["Illustrator", "Figma", "Brand Strategy", "Art Direction"],
  },
  {
    id: "u-yusuf",
    username: "yusuf",
    email: "yusuf@mhvisuals.com",
    displayName: "Yusuf Rahman",
    bio: "Design technologist. I write ExtendScript and Python tools that automate the boring parts of production.",
    avatarUrl: avatar(10836222),
    bannerUrl: banner(15977090),
    location: "Berlin, Germany",
    website: "https://yusuf.codes",
    socials: { github: "https://github.com/yusufrahman", twitter: "https://x.com/yusufrahman" },
    skills: ["ExtendScript", "Python", "JSX", "Node.js"],
  },
  {
    id: "u-noor",
    username: "noor",
    email: "noor@mhvisuals.com",
    displayName: "Noor Saleh",
    bio: "Product designer focused on fintech and mobile UX. I believe great interfaces should feel invisible.",
    avatarUrl: avatar(33680700),
    bannerUrl: banner(5582587),
    location: "Doha, Qatar",
    website: "https://noorsaleh.design",
    socials: { linkedin: "https://linkedin.com/in/noorsaleh", dribbble: "https://dribbble.com/noorsaleh" },
    skills: ["Figma", "Framer", "Prototyping", "Design Systems"],
  },
  {
    id: "u-adam",
    username: "adam",
    email: "adam@mhvisuals.com",
    displayName: "Adam Karim",
    bio: "Printmaker and poster artist exploring color, rhythm and typography on paper.",
    avatarUrl: avatar(14950779),
    bannerUrl: null,
    location: "Beirut, Lebanon",
    website: "https://adamkarim.print",
    socials: { instagram: "https://instagram.com/adam.prints" },
    skills: ["Photoshop", "InDesign", "Risograph", "Screen Printing"],
  },
  {
    id: "u-sara",
    username: "sara",
    email: "sara@mhvisuals.com",
    displayName: "Sara Nasser",
    bio: "Packaging specialist. I design sustainable, shelf-stopping packaging that people keep on their counter.",
    avatarUrl: avatar(7717254),
    bannerUrl: null,
    location: "Riyadh, Saudi Arabia",
    website: "https://saranasser.design",
    socials: { behance: "https://behance.net/saranasser", instagram: "https://instagram.com/sara.packs" },
    skills: ["Illustrator", "Keyshot", "Dielines", "Sustainable Design"],
  },
  {
    id: "u-tarek",
    username: "tarek",
    email: "tarek@mhvisuals.com",
    displayName: "Tarek Aziz",
    bio: "3D generalist dabbling in branding. I like where the render meets the logo.",
    avatarUrl: avatar(38740728),
    bannerUrl: banner(8086373),
    location: "Istanbul, Turkey",
    website: "https://tarekaziz.xyz",
    socials: { artstation: "https://artstation.com/tarek", twitter: "https://x.com/tarek_aziz" },
    skills: ["Blender", "Illustrator", "Motion Design"],
  },
];

const projectsData = [
  {
    id: "p-noir", slug: "noir-skincare", userId: "u-sara",
    title: "NOIR — Minimal Skincare Packaging System",
    description: "A monochrome, tactile packaging line for a fictional skincare house. Matte finishes, debossed logotype and a single gold accent carry the whole system.",
    coverUrl: cover(8015895), discipline: "packaging",
    tools: ["Illustrator", "Keyshot", "Photoshop"], palette: ["#111111", "#F5F2EC", "#C9A227"],
    tags: ["minimal", "skincare", "identity"], viewCount: 8421,
  },
  {
    id: "p-cloth", slug: "cloth-co-sustainable-mailers", userId: "u-sara",
    title: "Cloth Co. — Sustainable Mailer Series",
    description: "Recycled cardboard mailers with a bold, single-color type system. Designed to be beautiful enough to keep, then compost.",
    coverUrl: cover(9594428), discipline: "packaging",
    tools: ["Illustrator", "InDesign"], palette: ["#F2B705", "#7A5C2E", "#2B2B2B"],
    tags: ["sustainable", "mailer", "type"], viewCount: 5120,
  },
  {
    id: "p-halo", slug: "halo-dispenser-identity", userId: "u-sara",
    title: "Halo — Pump Bottle Identity",
    description: "Clean dispensing hardware wrapped in a soft, premium identity for the bath & body category.",
    coverUrl: cover(8015792), discipline: "packaging",
    tools: ["Illustrator", "Keyshot"], palette: ["#EDEDED", "#9AA5A0", "#1F3A2D"],
    tags: ["bath", "premium", "clean"], viewCount: 3811,
  },
  {
    id: "p-ritual", slug: "ritual-cosmetics-flatlay", userId: "u-mona",
    title: "Ritual — Cosmetics Brand Kit",
    description: "A complete brand-in-a-box: flat-lay art direction, typography and color for a ritual-inspired cosmetics range.",
    coverUrl: cover(6167400), discipline: "packaging",
    tools: ["Illustrator", "Photoshop", "Lightroom"], palette: ["#E8DCC8", "#C96F4A", "#5C3A2E"],
    tags: ["cosmetics", "art-direction", "flatlay"], viewCount: 12400,
  },
  {
    id: "p-neonvoid", slug: "neon-void", userId: "u-karim",
    title: "Neon Void — Abstract 3D Study",
    description: "An exploration of glowing geometry suspended in darkness. Pure material and light studies rendered in Octane.",
    coverUrl: cover(29506609), discipline: "3d",
    tools: ["Cinema 4D", "Octane", "After Effects"], palette: ["#00F0FF", "#12002B", "#FF2E8A"],
    tags: ["abstract", "neon", "render"], viewCount: 19230,
  },
  {
    id: "p-prism", slug: "prism-blocks", userId: "u-karim",
    title: "Prism Blocks — Neon Material Series",
    description: "Reflective blocks catching colored light. A technical dive into refractive materials and caustics.",
    coverUrl: cover(28551572), discipline: "3d",
    tools: ["Cinema 4D", "Octane"], palette: ["#0052FF", "#00F0FF", "#0A0A0A"],
    tags: ["refraction", "neon", "study"], viewCount: 9870,
  },
  {
    id: "p-geodream", slug: "geometric-dreamscape", userId: "u-tarek",
    title: "Geometric Dreamscape",
    description: "A colorful abstract composition built from primitives — balance, depth and a soft neon finish.",
    coverUrl: cover(29237420), discipline: "3d",
    tools: ["Blender", "Cycles"], palette: ["#FF5DA2", "#7B61FF", "#00E0C6"],
    tags: ["abstract", "color", "primitives"], viewCount: 15310,
  },
  {
    id: "p-luminous", slug: "luminous-geometry", userId: "u-tarek",
    title: "Luminous Geometry",
    description: "Dark, luminous geometric forms — a moodboard turned into a rendered series.",
    coverUrl: cover(29450016), discipline: "3d",
    tools: ["Blender", "Octane"], palette: ["#0E0E12", "#3B82F6", "#22D3EE"],
    tags: ["dark", "geometry", "mood"], viewCount: 6740,
  },
  {
    id: "p-brandframe", slug: "brand-identity-framework", userId: "u-layla",
    title: "Brand Identity Framework",
    description: "A repeatable framework for defining voice, color, type and motion — distilled into a clean deck.",
    coverUrl: cover(7661590), discipline: "branding",
    tools: ["Figma", "Illustrator"], palette: ["#111111", "#F4F4F5", "#FF4D00"],
    tags: ["strategy", "framework", "identity"], viewCount: 4210,
  },
  {
    id: "p-logostickers", slug: "logotype-sticker-system", userId: "u-layla",
    title: "Logotype Sticker System",
    description: "A modular sticker language that scales a single logotype across print, packaging and merch.",
    coverUrl: cover(12802261), discipline: "branding",
    tools: ["Illustrator", "InDesign"], palette: ["#6E2A00", "#F7F0E6", "#E4572E"],
    tags: ["logotype", "modular", "merch"], viewCount: 7890,
  },
  {
    id: "p-emblem", slug: "emblem-monogram-study", userId: "u-layla",
    title: "Emblem & Monogram Study",
    description: "Automotive-inspired emblems and monograms — precision linework and metal finishes.",
    coverUrl: cover(13916683), discipline: "branding",
    tools: ["Illustrator", "Photoshop"], palette: ["#FF7A00", "#1A1A1A", "#C0C0C0"],
    tags: ["emblem", "monogram", "automotive"], viewCount: 3350,
  },
  {
    id: "p-wallet", slug: "wallet-fintech-app", userId: "u-noor",
    title: "Wallet — Fintech Mobile App",
    description: "A calm, trustworthy mobile wallet. Focused flows, big type, and micro-interactions that build confidence.",
    coverUrl: cover(6406691), discipline: "uiux",
    tools: ["Figma", "Framer", "After Effects"], palette: ["#0052FF", "#0B1B3A", "#16C784"],
    tags: ["fintech", "mobile", "design-system"], viewCount: 22100,
  },
  {
    id: "p-iconsuite", slug: "app-icon-suite", userId: "u-noor",
    title: "App Icon Suite",
    description: "A cohesive suite of app icons built on a shared grid, weight and corner radius.",
    coverUrl: cover(5678243), discipline: "uiux",
    tools: ["Figma", "Illustrator"], palette: ["#0A0A0A", "#FF5A5F", "#2EC4B6"],
    tags: ["icons", "grid", "suite"], viewCount: 9980,
  },
  {
    id: "p-dash", slug: "analytics-dashboard", userId: "u-noor",
    title: "Analytics Dashboard Concept",
    description: "A monochrome analytics dashboard concept focused on legibility and dense data storytelling.",
    coverUrl: cover(29502368), discipline: "uiux",
    tools: ["Figma", "Framer"], palette: ["#0052FF", "#0A0F1E", "#E5E7EB"],
    tags: ["dashboard", "data", "monochrome"], viewCount: 7540,
  },
  {
    id: "p-colorfield", slug: "color-field-posters", userId: "u-adam",
    title: "Color Field Poster Series",
    description: "A series of silkscreened color-field posters exploring bold geometry and vibrant palettes.",
    coverUrl: cover(15423104), discipline: "poster",
    tools: ["Photoshop", "InDesign"], palette: ["#FF3D00", "#FFD700", "#00A8E8"],
    tags: ["poster", "screen-print", "color"], viewCount: 4520,
  },
  {
    id: "p-keepcalm", slug: "keep-calm-typography", userId: "u-adam",
    title: "Keep Calm — Typographic Series",
    description: "A modern riff on the classic Keep Calm poster — quiet typography with contemporary color.",
    coverUrl: cover(4108233), discipline: "poster",
    tools: ["Photoshop", "InDesign"], palette: ["#0052FF", "#F4F4F5", "#0E0E12"],
    tags: ["typography", "poster", "minimal"], viewCount: 6010,
  },
  {
    id: "p-batchexport", slug: "illustrator-batch-exporter", userId: "u-yusuf",
    title: "Illustrator Batch Exporter — ExtendScript",
    description: "An ExtendScript tool that batch-exports artboards to multiple formats and sizes with one click. Saves our studio hours every week.",
    coverUrl: cover(37848030), discipline: "automation",
    tools: ["ExtendScript", "JavaScript", "Illustrator"], palette: ["#0052FF", "#FF9500", "#1C1C1E"],
    tags: ["extendscript", "automation", "tool"], viewCount: 11100,
  },
  {
    id: "p-dops", slug: "design-ops-pipeline", userId: "u-yusuf",
    title: "Design Ops Pipeline",
    description: "A Python pipeline that turns source files into automatically optimized, renamed and organized exports for handoff.",
    coverUrl: cover(9616964), discipline: "automation",
    tools: ["Python", "Node.js", "GitHub Actions"], palette: ["#0E0E12", "#00E0C6", "#FF5DA2"],
    tags: ["python", "pipeline", "devops"], viewCount: 3890,
  },
];

const blocksData = [
  { id: "b-noir-1", projectId: "p-noir", type: "text", content: "The brief asked for a packaging line that felt as expensive as the product it protects — without screaming. We leaned into restraint: matte black cartons, a single serif, and one warm gold accent that appears only where it matters.", caption: "The brief" },
  { id: "b-noir-2", projectId: "p-noir", type: "image", url: cover(8015473), caption: "Primary range — box, brush and bottle" },
  { id: "b-noir-3", projectId: "p-noir", type: "image", url: cover(8049849), caption: "Refill pouch system" },

  { id: "b-neon-1", projectId: "p-neonvoid", type: "image", url: cover(28494632), caption: "Variant 02 — blue spectrum" },
  { id: "b-neon-2", projectId: "p-neonvoid", type: "text", content: "Each frame is a single light set-up with no post work. The color comes from physically accurate emission materials and a low F-stop, which is why the falloff feels natural.", caption: "Process" },
  { id: "b-neon-3", projectId: "p-neonvoid", type: "image", url: cover(29355993), caption: "Variant 03 — full spectrum" },

  { id: "b-wallet-1", projectId: "p-wallet", type: "text", content: "Wallet started as a weekend prototype. The core principle: every screen should answer 'how much' and 'what next' in under a second.", caption: "Concept" },
  { id: "b-wallet-2", projectId: "p-wallet", type: "image", url: cover(33384205), caption: "Onboarding and key flows" },
  { id: "b-wallet-3", projectId: "p-wallet", type: "image", url: cover(4549418), caption: "Real-device testing" },

  { id: "b-export-1", projectId: "p-batchexport", type: "text", content: "The tool walks the active document, discovers every artboard, and writes PNG + SVG + PDF variants into a dated folder structure. No dialogs, no clicking.", caption: "How it works" },
  { id: "b-export-2", projectId: "p-batchexport", type: "code", caption: "ExtendScript", content: `// Batch export all artboards to multiple formats
var doc = app.activeDocument;
var out = new Folder("~/Desktop/MH_Exports");

var opts = new ExportOptionsPNG24();
opts.antiAliasing = true;
opts.artBoardClipping = true;

for (var i = 0; i < doc.artboards.length; i++) {
  doc.artboards.setActiveArtboardIndex(i);
  var file = new File(out.fsName + "/" + doc.artboards[i].name + ".png");
  doc.exportFile(file, ExportType.PNG24, opts);
}
alert("Exported " + doc.artboards.length + " artboards.");` },
  { id: "b-export-3", projectId: "p-batchexport", type: "image", url: cover(15977090), caption: "The setup that runs it" },

  { id: "b-ritual-1", projectId: "p-ritual", type: "image", url: cover(6958425), caption: "Unboxing moment" },
  { id: "b-ritual-2", projectId: "p-ritual", type: "text", content: "Art direction leaned into warm, editorial photography — linen textures, soft shadows and a palette pulled from raw clay and spice.", caption: "Art direction" },
];

const commentTexts = [
  "This is stunning — the color story is so cohesive.",
  "Absolutely love the attention to detail here.",
  "Bookmarking this for inspiration. Incredible work!",
  "The lighting in the render is unreal.",
  "Clean, minimal, and extremely well executed.",
  "Would love to see the process behind this.",
  "This deserves way more attention. Great job!",
  "The typography choices are spot on.",
  "How long did the whole system take to produce?",
  "Instant follow. Your consistency is everything.",
];

async function main() {
  console.log("Seeding MH Visuals…");

  await db.delete(follows);
  await db.delete(comments);
  await db.delete(bookmarks);
  await db.delete(likes);
  await db.delete(media);
  await db.delete(projects);
  await db.delete(users);

  await db.insert(users).values(
    usersData.map((u) => ({
      ...u,
      passwordHash: hashPassword("password123"),
    })),
  );

  await db.insert(projects).values(
    projectsData.map((p, i) => ({
      ...p,
      createdAt: new Date(Date.now() - i * 3 * 86400_000),
    })),
  );

  await db.insert(media).values(blocksData);

  const userIds = usersData.map((u) => u.id);

  // Likes
  const likesRows = projectsData.flatMap((p, pi) => {
    const count = 3 + (pi % 6);
    const out = [];
    for (let k = 0; k < count; k++) {
      const uid = userIds[(pi + k * 3 + 1) % userIds.length];
      if (uid === p.userId) continue;
      out.push({
        id: randomUUID(),
        projectId: p.id,
        userId: uid,
        createdAt: new Date(Date.now() - (k + 1) * 3600_000),
      });
    }
    return out;
  });
  await db.insert(likes).values(likesRows);

  // Bookmarks
  const bookmarksRows = projectsData.flatMap((p, pi) => {
    const out = [];
    const b1 = userIds[(pi + 2) % userIds.length];
    const b2 = userIds[(pi + 5) % userIds.length];
    for (const uid of [b1, b2]) {
      if (uid === p.userId) continue;
      out.push({ id: randomUUID(), projectId: p.id, userId: uid });
    }
    return out;
  });
  await db.insert(bookmarks).values(bookmarksRows);

  // Comments
  const commentsRows = projectsData.flatMap((p, pi) => {
    const count = pi % 4; // 0..3
    const out = [];
    for (let k = 0; k < count; k++) {
      const uid = userIds[(pi + k * 2 + 3) % userIds.length];
      out.push({
        id: randomUUID(),
        projectId: p.id,
        userId: uid,
        body: commentTexts[(pi * 3 + k) % commentTexts.length],
        createdAt: new Date(Date.now() - (k + 1) * 7200_000),
      });
    }
    return out;
  });
  await db.insert(comments).values(commentsRows);

  // Follows
  const followsRows = [
    ["u-karim", "u-mona"],
    ["u-layla", "u-mona"],
    ["u-noor", "u-mona"],
    ["u-sara", "u-mona"],
    ["u-yusuf", "u-mona"],
    ["u-adam", "u-mona"],
    ["u-tarek", "u-mona"],
    ["u-mona", "u-karim"],
    ["u-mona", "u-layla"],
    ["u-mona", "u-noor"],
    ["u-noor", "u-karim"],
    ["u-layla", "u-noor"],
  ].map(([followerId, followingId]) => ({
    id: randomUUID(),
    followerId,
    followingId,
  }));
  await db.insert(follows).values(followsRows);

  console.log(`Seeded ${usersData.length} users, ${projectsData.length} projects.`);
  await db.$client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
