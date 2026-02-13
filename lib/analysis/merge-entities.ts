import type { Entity, ExtractedEntities, CombinedEntities } from "@/lib/types";

function deduplicateEntities(entities: Entity[]): Entity[] {
  const seen = new Map<string, Entity>();

  for (const entity of entities) {
    const key = entity.name.toLowerCase().trim();
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, entity);
    } else if (!existing.url && entity.url) {
      // Prefer the version with a URL
      seen.set(key, entity);
    }
  }

  return Array.from(seen.values());
}

export function mergeEntities(
  ...entityLists: ExtractedEntities[]
): CombinedEntities {
  const allPeople: Entity[] = [];
  const allOrganizations: Entity[] = [];

  for (const entities of entityLists) {
    allPeople.push(...entities.people);
    allOrganizations.push(...entities.organizations);
  }

  return {
    people: deduplicateEntities(allPeople),
    organizations: deduplicateEntities(allOrganizations),
  };
}
