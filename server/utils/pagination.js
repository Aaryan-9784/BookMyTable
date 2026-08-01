/**
 * Pagination Utility
 * 
 * Provides consistent pagination across all API endpoints.
 */

/**
 * Parse pagination parameters from request
 */
export function parsePaginationParams(req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null,
  };
}

/**
 * Create paginated response
 */
export function paginatedResponse(data, page, limit, total) {
  return {
    success: true,
    data,
    pagination: createPaginationMeta(page, limit, total),
  };
}

export default {
  parsePaginationParams,
  createPaginationMeta,
  paginatedResponse,
};
