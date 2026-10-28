const toClientPoint = (point) => ({
  id: point.id,
  type: point.type,
  destination: point.destination,
  offers: [...point.offers],
  basePrice: point.base_price,
  dateFrom: point.date_from,
  dateTo: point.date_to,
  isFavorite: point.is_favorite,
});

const toServerPoint = (point) => ({
  ...(point.id ? {id: point.id} : {}),
  type: point.type,
  destination: point.destination,
  offers: [...point.offers],
  'base_price': point.basePrice,
  'date_from': point.dateFrom,
  'date_to': point.dateTo,
  'is_favorite': point.isFavorite,
});

export {toClientPoint, toServerPoint};
