import { ListResponseModel, TombstoneGeneratedFields } from "../public";

/**
 * 词汇种类的type
 */
export interface vocabularyCategoryType extends TombstoneGeneratedFields {
    type: string
}

/**
 * 词汇项type
 */
export interface vocabularyType extends TombstoneGeneratedFields {
    word: string
    level: number
    typeId: string | number
    partOfSpeech: string
    type: string
}

/**
 * 某分类词汇的API请求数据data type
 */
export type vocabularyResultModel = ListResponseModel<vocabularyType>
export type vocabularyCategoryResultModel = ListResponseModel<vocabularyCategoryType>
/**
 * 获取模板列表、词汇的请求参数
 */
export interface templateListParamsType {
    page: number
    pageSize: number
    level?: number
    typeId?: number | string
    type?: number
    key?: string
}

/**
 * 评价模板项的type
 */
export interface commentTemplate extends TombstoneGeneratedFields {
    templateText: string | string[] // 模板的str
    level: number         // 模板内容对应的分值
    type: number
}
export type commentTemplateResultModel = ListResponseModel<commentTemplate>