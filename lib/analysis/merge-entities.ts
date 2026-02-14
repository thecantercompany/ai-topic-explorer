import type { Entity, ExtractedEntities, CombinedEntities, Provider } from "@/lib/types";

function deduplicateEntities(
  entities: { entity: Entity; provider: Provider }[]
): Entity[] {
  const seen = new Map<
    string,
    { entity: Entity; count: number; providers: Set<Provider> }
  >();

  for (const { entity, provider } of entities) {
    const key = entity.name.toLowerCase().trim();
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, {
        entity,
        count: 1,
        providers: new Set([provider]),
      });
    } else {
      existing.count++;
      existing.providers.add(provider);
      if (!existing.entity.url && entity.url) {
        existing.entity = entity;
      }
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => b.count - a.count)
    .map(({ entity, providers }) => ({
      ...entity,
      providers: Array.from(providers),
    }));
}

export function mergeEntities(
  entitiesByProvider: { provider: Provider; entities: ExtractedEntities }[]
): CombinedEntities {
  const allPeople: { entity: Entity; provider: Provider }[] = [];
  const allOrganizations: { entity: Entity; provider: Provider }[] = [];

  for (const { provider, entities } of entitiesByProvider) {
    for (const entity of entities.people) {
      allPeople.push({ entity, provider });
    }
    for (const entity of entities.organizations) {
      allOrganizations.push({ entity, provider });
    }
  }

  return {
    people: deduplicateEntities(allPeople).slice(0, 15),
    organizations: deduplicateEntities(allOrganizations).slice(0, 15),
  };
}
