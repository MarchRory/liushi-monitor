/**
 * px转rem
 * @param pxNum 像素值 
 * @returns rem值
 */
export function pxToRem(pxNum: number): number {
    let devicePixelRatio = window.devicePixelRatio;  // 获取设备像素密度
    return pxNum / devicePixelRatio
}