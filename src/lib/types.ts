export const disciplines = ["marketing", "graphic-design", "photography", "ui-ux"] as const;
export type Discipline = typeof disciplines[number];
export const pageDisciplines: readonly Discipline[] = disciplines.filter(discipline => discipline !== "ui-ux");
export type BlockKind = "text" | "image" | "gallery" | "video" | "columns" | "quote" | "comparison" | "embed" | "statistics";
export type Block = { id: string; kind: BlockKind; content: { title?: string; text?: string; url?: string; urls?: string[]; alt?: string; caption?: string; secondUrl?: string; rightText?: string; layout?: string } };
export type Project = { id: string; slug: string; title: string; discipline: Discipline; year: string; client: string; description: string; cover: string; coverAlt: string; coverX?: number; coverY?: number; coverScale?: number; featured: boolean; placeholder: boolean; published: boolean; position: number; version: number; categories: string[]; blocks: Block[] };
export type SiteContent = {
 name: string; mark: string; role: string; availability: string; heroLine1: string; heroLine2: string; heroLine3: string; intro: string;
 portrait: string; portraitAlt: string; portraitX: number; portraitY: number; portraitScale: number; composition: "rings" | "orbital" | "minimal"; decorations: boolean;
 workTitle: string; aboutTitle: string; aboutText: string; services: string[]; cvUrl: string; contactTitle: string; contactText: string; email: string;
 socials: { label: string; url: string }[]; seoTitle: string; seoDescription: string;
 nav: { home: string; marketing: string; "graphic-design": string; photography: string; "ui-ux": string; contact: string };
 labels: { work: string; contact: string; scroll: string; about: string; cv: string; explore: string; all: string; back: string; send: string; name: string; email: string; subject: string; message: string; copyright: string };
 pages: Record<Discipline, { title: string; subtitle: string; categories: string[] }>;
};
export type PortfolioData = { site: SiteContent; projects: Project[]; version: number; owner: boolean; configured: boolean };