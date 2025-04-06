export function getStorage(key: string) {
    return localStorage.getItem(key)
}

export function setStorage(key: string, value: any) {
    return localStorage.setItem(key, value)
}

export function removeStorage(key: string) {
    return localStorage.removeItem(key)
}