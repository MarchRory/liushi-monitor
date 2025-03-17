export interface KingkongTabItem {
    label: string;
    icon: string;
    path: string; // 默认点击跳转到指定path的页面
    dot: boolean; // 是否显示小红点
    customTrigger?: (...args: any[]) => any; // 自定义触发方法
}

export type UserSettingItem = Omit<KingkongTabItem, 'dot'> & { text?: any, forbidJump?: boolean }