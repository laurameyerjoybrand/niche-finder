import { UtmParams } from "@/hooks/useUtmParams";

export function appendUtms(url: string, utms: UtmParams): string {
  if (!Object.keys(utms).length) return url;
  const base = new URL(url, "https://placeholder.com");
  Object.entries(utms).forEach(([k, v]) => {
    if (v) base.searchParams.set(k, v);
  });
  // Return just pathname+search if relative, full URL if absolute
  return url.startsWith("http") ? base.toString() : base.pathname + base.search;
}
