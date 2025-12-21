export function expectedScore(ratingA: number, ratingB: number) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function updateRating(rating: number, expected: number, score: number, k = 32) {
  return Math.round(rating + k * (score - expected));
}
