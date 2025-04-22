import { RequestBundlePriorityEnum } from "src/common/constant"

export type FELogDto = Partial<Record<RequestBundlePriorityEnum, string[]>>