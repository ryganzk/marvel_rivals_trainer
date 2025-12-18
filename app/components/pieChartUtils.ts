// Shared utilities for pie chart components

export interface PieSlice {
  label: string;
  path: string;
  color: string;
  count: number;
  percent: number;
}

/**
 * Converts polar coordinates to Cartesian coordinates
 */
export const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

/**
 * Creates an SVG arc path for a pie chart slice
 */
export const createArc = (startAngle: number, endAngle: number) => {
  // Handle full circle (360 degrees) - draw as two semicircles
  if (endAngle - startAngle >= 360) {
    const mid = startAngle + 180;
    const start = polarToCartesian(100, 100, 80, startAngle);
    const middle = polarToCartesian(100, 100, 80, mid);
    return [
      'M', 100, 100,
      'L', start.x, start.y,
      'A', 80, 80, 0, 0, 1, middle.x, middle.y,
      'A', 80, 80, 0, 0, 1, start.x, start.y,
      'Z'
    ].join(' ');
  }
  
  const start = polarToCartesian(100, 100, 80, endAngle);
  const end = polarToCartesian(100, 100, 80, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
  return [
    'M', 100, 100,
    'L', start.x, start.y,
    'A', 80, 80, 0, largeArcFlag, 0, end.x, end.y,
    'Z'
  ].join(' ');
};

/**
 * Capitalizes each word in a string
 */
export const capitalizeWords = (text: string) => {
  return text.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};
