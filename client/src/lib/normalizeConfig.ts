const ensureArray = (value: unknown, fallback: unknown[] = []) =>
  Array.isArray(value) ? value : fallback;

const normalizeServiceItems = (items: unknown) =>
  ensureArray(items).map((item: any) => {
    if (!item || typeof item !== 'object') return item;
    return {
      ...item,
      questions: ensureArray(item.questions),
    };
  });

/** Normalise la config API pour éviter les .map() sur des valeurs non-tableaux. */
export const normalizeConfig = (config: any) => {
  if (!config || typeof config !== 'object') return config;

  // Parfois la DB stocke services comme tableau directement
  const rawServices = config.services;
  const services =
    Array.isArray(rawServices)
      ? { items: normalizeServiceItems(rawServices) }
      : rawServices && typeof rawServices === 'object'
        ? rawServices
        : {};

  const about = config.about && typeof config.about === 'object' ? config.about : {};
  const hero = config.hero && typeof config.hero === 'object' ? config.hero : {};
  const footer = config.footer && typeof config.footer === 'object' ? config.footer : {};

  const news = ensureArray(config.news).map((n) =>
    typeof n === 'string' ? n : (n && typeof n === 'object' && 'text' in n ? String((n as any).text) : String(n ?? ''))
  );

  return {
    ...config,
    news,
    services: {
      ...services,
      items: normalizeServiceItems(services.items),
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
