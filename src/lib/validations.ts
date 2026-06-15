export function noHTML(v: string): boolean {
  return !/[<>&"'`$\\]/.test(v) && !/javascript:/i.test(v) && !/on\w+=/.test(v)
}
