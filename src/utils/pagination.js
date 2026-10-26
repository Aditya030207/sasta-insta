function pagination(query) {
  const rawPage = query.page ?? '1';
  const rawLimit = query.limit ?? '10';
  const page = Number(rawPage);
  const requestedLimit = Number(rawLimit);
  if (typeof rawPage !== 'string' || typeof rawLimit !== 'string' ||
      !/^\d+$/.test(rawPage) || !/^\d+$/.test(rawLimit) ||
      !Number.isSafeInteger(page) || page < 1 ||
      !Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
    const error = new Error('page and limit must be positive integers');
    error.status = 400;
    throw error;
  }
  const limit = Math.min(requestedLimit, 50);
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = pagination;
