export const cleanStringArray = (input?: string, separator = ",") => {
  if (!input) return [];
  return input.split(separator).map(s => s.trim()).filter(Boolean);
};