import { ListResponseModel, TombstoneGeneratedFields } from "../public";

export interface courseObjectiveItem extends TombstoneGeneratedFields {
    objectivesName: string
    semester: string | number
    fixRestrictions: number
    completed: number
}

export type courseObjectivesResultModel = ListResponseModel<courseObjectiveItem>

export interface courseObjectivesDetail {

}