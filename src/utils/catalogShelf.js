export const shelfIndex = (index, count) => Math.max(0, Math.min(count - 1, index))
export const shelfOffset = (index, step, count) => shelfIndex(index, count) * step
