const Reg = {
    filterHTMLInCommand: /<input[^>]*?value=[\"\'](.*?)[\"\'][^>]*>/i
}

/**
 * 使用正则过滤掉评价中包含的html，提取出value的值
 * @param originCommand 原始的, 包含html的字符串
 * @returns 
 */
export function filterHTMLInCommand(originCommand: string) {
    return originCommand.replace(Reg.filterHTMLInCommand, '$1')
}