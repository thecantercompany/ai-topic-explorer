import type { Citation, CombinedCitation, Provider } from "@/lib/types";

const MAX_CITATIONS = 25;

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

  const citations = Array.from(urlMap.values())
    .map(({ title, url, providers }) => ({
      title,
      url,
      domain: extractDomain(url),
      providers: Array.from(providers),
    }))
    .sort((a, b) => {
      // Sort by number of providers (descending), then alphabetically by title
      if (b.providers.length !== a.providers.length) {
        return b.providers.length - a.providers.length;
      }
      return a.title.localeCompare(b.title);
    });

  // Group by domain while preserving provider-count ordering.
  // Walk the sorted list; when we encounter a domain already seen,
  // move the citation right after the last entry for that domain.
  const grouped: CombinedCitation[] = [];
  const domainLastIndex = new Map<string, number>();

  for (const citation of citations) {
    const domain = citation.domain;
    if (domainLastIndex.has(domain)) {
      // Insert after the last citation from this domain
      const insertAt = domainLastIndex.get(domain)! + 1;
      grouped.splice(insertAt, 0, citation);
      // Update indices: everything at insertAt or later shifted by 1
      for (const [d, idx] of domainLastIndex) {
        if (idx >= insertAt) domainLastIndex.set(d, idx + 1);
      }
      domainLastIndex.set(domain, insertAt);
    } else {
      grouped.push(citation);
      domainLastIndex.set(domain, grouped.length - 1);
    }
  }

  return grouped.slice(0, MAX_CITATIONS);
}

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Strip www. prefix for grouping consistency
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
