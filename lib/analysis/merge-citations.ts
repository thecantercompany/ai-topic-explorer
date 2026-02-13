import type { Citation, CombinedCitation, Provider } from "@/lib/types";

export function mergeCitations(
  citationsByProvider: { provider: Provider; citations: Citation[] }[]
): CombinedCitation[] {
  const urlMap = new Map<
    string,
    { title: string; url: string; providers: Set<Provider> }
  >();

  for (const { provider, citations } of citationsByProvider) {
    for (const citation of citations) {
      const normalizedUrl = citation.url.toLowerCase().replace(/\/+$/, "");
      const existing = urlMap.get(normalizedUrl);

      if (existing) {
        existing.providers.add(provider);
      } else {
        urlMap.set(normalizedUrl, {
          title: citation.title,
          url: citation.url,
          providers: new Set([provider]),
        });
      }
    }
  }

  return Array.from(urlMap.values())
    .map(({ title, url, providers }) => ({
      title,
      url,
      providers: Array.from(providers),
    }))
    .sort((a, b) => {
      // Sort by number of providers (descending), then alphabetically by title
      if (b.providers.length !== a.providers.length) {
        return b.providers.length - a.providers.length;
      }
      return a.title.localeCompare(b.title);
    });
}
