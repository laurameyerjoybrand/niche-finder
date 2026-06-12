export function appendUtms(url: string): string {
  if (typeof window === "undefined") return url;
  
  const currentParams = new URLSearchParams(window.location.search);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  
  const base = new URL(url);
  
  utmKeys.forEach((key) => {
    const val = currentParams.get(key);
    if (val) base.searchParams.set(key, val);
  });
  
  return base.toString();
}
