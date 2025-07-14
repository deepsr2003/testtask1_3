
// For future: dot product, normalization, filtering, etc.
export function dot(a, b) {
  return a.reduce((acc, val, i) => acc + val * b[i], 0);
}
