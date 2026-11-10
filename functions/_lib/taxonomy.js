import TAX from '../../shared/taxonomy.json';

export const TAXONOMY = TAX;
export const topBySlug = (slug) => TAX.find((c) => c.slug === slug) || null;

// Trả về { top, sub } nếu slug là danh mục (cấp 1 hoặc con), ngược lại null.
export function findCategory(slug) {
  const top = topBySlug(slug);
  if (top) return { top, sub: null };
  for (const t of TAX) {
    const sub = t.children.find((c) => c.slug === slug);
    if (sub) return { top: t, sub };
  }
  return null;
}

export function validCategory(category, subcategory) {
  const top = topBySlug(category);
  if (!top) return false;
  if (!subcategory) return true;
  return top.children.some((c) => c.slug === subcategory);
}
