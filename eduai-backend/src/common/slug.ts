import slugify from 'slugify';

export function toSlug(input: string): string {
  return slugify(input ?? '', {
    lower: true,
    strict: true,
    trim: true,
  });
}

export async function makeUniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const normalizedBase = toSlug(base);
  if (!normalizedBase) return '';

  let candidate = normalizedBase;
  let suffix = 2;

  while (await isTaken(candidate)) {
    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
