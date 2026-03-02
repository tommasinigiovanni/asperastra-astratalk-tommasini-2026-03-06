import type { Request, Response } from 'express';

/**
 * Parses Refine simple-rest query params (_sort, _order, _start, _end)
 * and applies pagination + sorting to a result array.
 * Sets x-total-count header with total record count.
 */
export function applyRefineParams<T extends Record<string, unknown>>(
  req: Request,
  res: Response,
  data: T[],
): T[] {
  const total = data.length;
  res.setHeader('x-total-count', total);

  // Sorting
  const sortField = req.query._sort as string | undefined;
  const sortOrder = (req.query._order as string | undefined)?.toLowerCase();

  if (sortField && sortField in (data[0] ?? {})) {
    data.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return sortOrder === 'desc' ? 1 : -1;
      if (aVal > bVal) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });
  }

  // Pagination
  const start = parseInt(req.query._start as string, 10);
  const end = parseInt(req.query._end as string, 10);

  if (!isNaN(start) && !isNaN(end)) {
    return data.slice(start, end);
  }

  return data;
}
