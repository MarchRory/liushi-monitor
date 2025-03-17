import { ListResponseModel, TombstoneGeneratedFields, pageParams } from '../public/index'

export interface departmentItem extends TombstoneGeneratedFields {
    departmentName: string
    departmentCover: string
    alias: string[]
}

export type departmentResultModel = ListResponseModel<departmentItem>

export interface majorItem extends TombstoneGeneratedFields {
    majorName: string
    departmentId: string | number
    department: string
}

export type majorResultModel = ListResponseModel<majorItem>

export interface majorPageParmas extends pageParams {
    departmentId: string | number
}