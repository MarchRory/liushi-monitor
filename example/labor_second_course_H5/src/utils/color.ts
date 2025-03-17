/**
 * @description 得到hex值颜色的r、g、b
 * @param hex
 * @returns 
 */
const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}

/**
 * @description 改变hex值颜色的不透明度
 * @param hexColor 
 * @param opacity 
 * @returns 
 */
export const changeColorOpacity = (hexColor: string, opacity: number = 0.05) => {
    const rgbColor = hexToRgb(hexColor);
    const rgbaColor = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${opacity})`;
    return rgbaColor;
}