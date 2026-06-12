import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const UTM_KEYS = [
  "utm_source",
  "utm_medium", 
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export function useUtmParams(): UtmParams {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const params: UtmParams = {};
    UTM_KEYS.forEach((key) => {
      const val = searchParams.get(key);
      if (val) params[key] = val;
    });
    return params;
  }, [searchParams]);
}
