/** Client-safe dot-path setter (objects + numeric array indices). */
export function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const keys = path.split(".");
  const root = structuredClone(obj) as unknown;
  let cursor: unknown = root;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!;
    const nextKey = keys[i + 1]!;
    const nextIsIndex = /^\d+$/.test(nextKey);

    if (Array.isArray(cursor)) {
      const idx = Number(key);
      const arr = cursor as unknown[];
      if (arr[idx] === undefined || arr[idx] === null) {
        arr[idx] = nextIsIndex ? [] : {};
      }
      cursor = arr[idx];
    } else {
      const record = cursor as Record<string, unknown>;
      if (record[key] === undefined || record[key] === null) {
        record[key] = nextIsIndex ? [] : {};
      }
      cursor = record[key];
    }
  }

  const lastKey = keys[keys.length - 1]!;
  if (Array.isArray(cursor)) {
    (cursor as unknown[])[Number(lastKey)] = value;
  } else {
    (cursor as Record<string, unknown>)[lastKey] = value;
  }

  return root as Record<string, unknown>;
}

export function mergeContentWithPatches<T extends Record<string, unknown>>(
  base: T,
  patches: Record<string, unknown>,
): T {
  let merged = structuredClone(base) as Record<string, unknown>;
  for (const [path, value] of Object.entries(patches)) {
    merged = setByPath(merged, path, value);
  }
  return merged as T;
}
