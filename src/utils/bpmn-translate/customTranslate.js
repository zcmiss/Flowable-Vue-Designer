import translations from './zh';

export default function customTranslate(template, replacements) {
  replacements = replacements || {};

  // Try exact match
  let translated = translations[template];

  // If not found, try case-insensitive match (robustness)
  if (!translated) {
    const lowerTemplate = template.toLowerCase();
    // Loop through keys to find a case-insensitive match (performance trade-off but safer for small sets)
    const key = Object.keys(translations).find(k => k.toLowerCase() === lowerTemplate);
    if (key) {
      translated = translations[key];
    }
  }

  // Fallback to original
  template = translated || template;

  // Replace parameters
  return template.replace(/{([^}]+)}/g, function(_, key) {
    return replacements[key] || '{' + key + '}';
  });
}