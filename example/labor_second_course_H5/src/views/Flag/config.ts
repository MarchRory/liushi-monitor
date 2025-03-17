/**
 * flag 状态枚举
 */
export enum FlagStateEnum {
    beforeStart = 1,
    ing = 2,
    complete = 3,
    fail = 4
}

type FlagStateMap = {
    [key in FlagStateEnum]: {
        icon: string;
        iconColor: string;
        label: string;
    }
}

export const flagStateMap: Partial<FlagStateMap> = {
    [FlagStateEnum.ing]: {
        icon: 'tabler:flag-3-filled',
        iconColor: '#11a2f7',
        label: '正在进行的小目标'
    },
    [FlagStateEnum.complete]: {
        icon: 'tabler:mood-happy',
        iconColor: '#e2760f',
        label: 'Flag达成!'
    },
    [FlagStateEnum.fail]: {
        icon: 'tabler:mood-sad-squint',
        iconColor: '#6a71be',
        label: 'Flag卒'
    }
}