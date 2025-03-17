/**
 * @description 生成随机颜色, 方便开发期间调试使用
 * @returns 16进制颜色值
 */
export function generateRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
