import translations from './zh';

// Pre-compute a Map for faster case-insensitive lookup
const translationMap = new Map();
Object.keys(translations).forEach(key => {
  translationMap.set(key, translations[key]);
  translationMap.set(key.toLowerCase(), translations[key]);
});

export default function customTranslate(template, replacements) {
  replacements = replacements || {};

  // Fast O(1) lookup
  let translated = translationMap.get(template) || translationMap.get(template.toLowerCase());

  // Fallback to original
  template = translated || template;

  // Replace parameters
  return template.replace(/{([^}]+)}/g, function(_, key) {
    return replacements[key] || '{' + key + '}';
  });
}