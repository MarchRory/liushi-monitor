import { IListModel, ListRequestParamsModel } from "../../types/request";
import requestInstance from "../../utils/request";
import { IHeatBaseMapItem } from "./types";

export function GetHeatBaseMapList(query: ListRequestParamsModel) {
    return requestInstance.get<IListModel<IHeatBaseMapItem>>('heatMap/basePic', query)
}

export function CreateHeatBaseMap(data: Omit<IHeatBaseMapItem, 'id' | "status">) {
    const sendDatas = { ...data }
    if ('fileList' in sendDatas) {
        Reflect.deleteProperty(sendDatas, 'fileList')
    }
    sendDatas['name'] = '#' + sendDatas['name']
    return requestInstance.post('heatMap/basePic', sendDatas)
}

export function GetHeatBaseMapInfoById(id: number) {
    return requestInstance.get<IHeatBaseMapItem>('heatMap/basePic/item', { id })
}

export function UpdateHeatBaseMap(data: IHeatBaseMapItem) {
    const sendDatas = { ...data }
    if ('fileList' in sendDatas) {
        Reflect.deleteProperty(sendDatas, 'fileList')
    }
    sendDatas['name'] = '#' + sendDatas['name']
    return requestInstance.put('heatMap/basePic', sendDatas, { params: { id: +sendDatas.id } })
}

export function DeleteHeatBaseMapById(id: number) {
    return requestInstance.delete('heatMap/basePic', [id])
}

export function GetMeaningfulUserBehaviorUrlsOptions() {
    return requestInstance.get<IListModel<string>>('analysis/userbehavior/urls')
}