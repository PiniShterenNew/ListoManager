export function hexToRGBA(hex: string, alpha: number): string {
    // הסר "#" אם קיים
    const sanitizedHex = hex.replace("#", "");
  
    // תמיכה בפורמט קצר (למשל #abc)
    const fullHex = sanitizedHex.length === 3
      ? sanitizedHex.split("").map(c => c + c).join("")
      : sanitizedHex;
  
    if (fullHex.length !== 6) {
      console.warn(`hexToRGBA: Invalid HEX color: ${hex}`);
      return `rgba(0, 0, 0, ${alpha})`; // fallback
    }
  
    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);
  
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  