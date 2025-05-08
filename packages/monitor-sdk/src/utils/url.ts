export function getCurrentUrl() {
    return location.pathname === '/' ? location.hash.split('?')[0] : location.pathname
}