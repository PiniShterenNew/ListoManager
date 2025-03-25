export function hexToRGBA(hex: string | undefined, alpha: number): string {
  // בדיקה שהקלט תקין
  if (!hex || typeof hex !== 'string') {
    return `rgba(0, 0, 0, ${alpha})`; // ערך ברירת מחדל
  }
  
  // הסר "#" אם קיים
  const sanitizedHex = hex.replace("#", "").trim();
  
  // בדיקה שהקלט הוא HEX תקין
  if (!/^([A-Fa-f0-9]{3}){1,2}$/.test(sanitizedHex)) {
    console.warn(`hexToRGBA: Invalid HEX color: ${hex}`);
    return `rgba(0, 0, 0, ${alpha})`;
  }
  
  // תמיכה בפורמט קצר (למשל #abc)
  const fullHex = sanitizedHex.length === 3
    ? sanitizedHex.split("").map(c => c + c).join("")
    : sanitizedHex;
  
  // המרה ל-RGB
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  
  // בדיקה לערכים תקינים
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.warn(`hexToRGBA: Could not parse color: ${hex}`);
    return `rgba(0, 0, 0, ${alpha})`;
  }
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}