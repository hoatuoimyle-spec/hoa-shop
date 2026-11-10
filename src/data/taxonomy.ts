// src/data/taxonomy.ts — Danh mục sản phẩm (dùng chung với backend qua shared/taxonomy.json)
import raw from '../../shared/taxonomy.json';

export type SubCategory = { slug: string; name: string };
export type Category = { slug: string; name: string; short: string; desc: string; children: SubCategory[] };

export const TAXONOMY = raw as Category[];

export function findCategory(slug: string): { top: Category; sub: SubCategory | null } | null {
  const top = TAXONOMY.find((c) => c.slug === slug);
  if (top) return { top, sub: null };
  for (const t of TAXONOMY) {
    const sub = t.children.find((c) => c.slug === slug);
    if (sub) return { top: t, sub };
  }
  return null;
}
