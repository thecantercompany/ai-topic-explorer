import type { Entity, ExtractedEntities, CombinedEntities } from "@/lib/types";

function deduplicateEntities(entities: Entity[]): Entity[] {
  const seen = new Map<string, { entity: Entity; count: number }>();

  for (const entity of entities) {
    const key = entity.name.toLowerCase().trim();
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, { entity, count: 1 });
    } else {
      existing.count++;
      if (!existing.entity.url && entity.url) {
        existing.entity = entity;
      }
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => b.count - a.count)
    .map(({ entity }) => entity);
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
    people: deduplicateEntities(allPeople).slice(0, 15),
    organizations: deduplicateEntities(allOrganizations).slice(0, 15),
  };
}
