import type { Locale } from "./i18n-config";

const dictionaries: Record<Locale, () => Promise<any>> = {
    en: () => import("../locales/en.json").then((module) => module.default),
    es: () => import("../locales/es.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
    return dictionaries[locale]?.() ?? dictionaries.es();
};
