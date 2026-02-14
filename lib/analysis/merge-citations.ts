import type { Citation, CombinedCitation, Provider } from "@/lib/types";

const PRIMARY_COUNT = 10;

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

  // Select top 10 as primary citations, then pull in same-domain companions.
  const primaries = citations.slice(0, PRIMARY_COUNT);
  const rest = citations.slice(PRIMARY_COUNT);

  // Collect domains from primaries
  const primaryDomains = new Set(primaries.map((c) => c.domain));

  // Find companions: remaining citations whose domain matches a primary
  const companions = rest.filter((c) => primaryDomains.has(c.domain));

  // Build final list: walk primaries in order, grouping all same-domain
  // primaries together and inserting companions after the first occurrence.
  const result: CombinedCitation[] = [];
  const processedDomains = new Set<string>();

  for (const primary of primaries) {
    if (processedDomains.has(primary.domain)) continue;
    processedDomains.add(primary.domain);

    // Add this primary
    result.push(primary);

    // Add other primaries from the same domain
    for (const other of primaries) {
      if (other !== primary && other.domain === primary.domain) {
        result.push(other);
      }
    }

    // Add companions from this domain
    for (const companion of companions) {
      if (companion.domain === primary.domain) {
        result.push(companion);
      }
    }
  }

  return result;
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
