const ensureArray = (value: unknown, fallback: unknown[] = []) =>
  Array.isArray(value) ? value : fallback;

/** Normalise la config API pour éviter les .map() sur des valeurs non-tableaux. */
export const normalizeConfig = (config: any) => {
  if (!config || typeof config !== 'object') return config;

  const services = config.services && typeof config.services === 'object' ? config.services : {};
  const about = config.about && typeof config.about === 'object' ? config.about : {};
  const hero = config.hero && typeof config.hero === 'object' ? config.hero : {};
  const footer = config.footer && typeof config.footer === 'object' ? config.footer : {};

  return {
    ...config,
    news: ensureArray(config.news),
    services: {
      ...services,
      items: ensureArray(services.items),
    },
    about: {
      ...about,
      methodology: ensureArray(about.methodology),
    },
    hero: {
      ...hero,
      stats: ensureArray(hero.stats),
      title: typeof hero.title === 'string' ? hero.title : String(hero.title ?? ''),
    },
    footer: {
      ...footer,
      links: ensureArray(footer.links),
    },
  };
};

export const normalizeTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
};
