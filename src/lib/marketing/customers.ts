/**
 * Case studies / testimonials. Intentionally empty until real, approved customer
 * content exists — we never invent testimonials. Populate this array (or back it
 * with the CMS/DB) as real stories are gathered.
 */

export type CaseStudy = {
  slug: string;
  customer: string;
  logo?: string;
  summary: string;
  problem: string;
  previousWorkflow: string;
  clientfoldWorkflow: string;
  result: string;
  quote?: { text: string; author: string; role: string };
  metrics?: { label: string; before: string; after: string }[];
};

export const CASE_STUDIES: CaseStudy[] = [];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
