export function getFnParamNames(fn: Function): string[] {
  const fnStr = fn.toString();
  const arrowMatch = fnStr.match(/\(?[^]*?\)?\s*=>/);
  if (arrowMatch) return arrowMatch[0].replace(/[()\s]/gi,'').replace('=>','').split(',');
  const match = fnStr.match(/\([^]*?\)/);
  return match ? match[0].replace(/[()\s]/gi,'').split(',') : [];
}