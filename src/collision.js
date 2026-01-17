/**
 * Determines if a point is inside a polygon using the ray casting algorithm
 * @param {number} x - X coordinate of the point
 * @param {number} y - Y coordinate of the point
 * @param {Float32Array|Array} vertices - Flat array of polygon vertices [x1, y1, x2, y2, ...]
 * @returns {boolean} - True if the point is inside the polygon, false otherwise
 */
export const point_in_polygon = (x, y, vertices) => {
  if (!vertices || vertices.length < 6) {
    return false // Need at least 3 points (6 values) for a polygon
  }

  let inside = false
  const vertexCount = vertices.length / 2

  for (let i = 0, j = vertexCount - 1; i < vertexCount; j = i++) {
    const xi = vertices[i * 2]
    const yi = vertices[i * 2 + 1]
    const xj = vertices[j * 2]
    const yj = vertices[j * 2 + 1]

    // Check if point is on an edge that crosses the horizontal ray from the point
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi)

    if (intersect) {
      inside = !inside
    }
  }

  return inside
}
