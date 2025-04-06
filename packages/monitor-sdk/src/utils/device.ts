export function detectDevice(ua: string) {
    const isAndroid = /android/i.test(ua);
    const isIphone = /iPhone/.test(ua);
    // iPad 的判断兼容 iOS 13+ 的情况
    const isIpad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const os = isAndroid ? 'Android' : ((isIpad || isIphone) ? "iOS" : "Unknown")
    const deviceType = isAndroid ? 'Android' : (isIphone ? "iPhone" : (isIpad ? "iPad" : "Unknown"))
    return {
        os,
        deviceType
    };
}