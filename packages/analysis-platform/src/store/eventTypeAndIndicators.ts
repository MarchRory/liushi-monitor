import { create } from 'zustand'
import { IEventListItem, IIndicator } from '../apis/track/types'
import { GetEventTypeList, GetIndicatorsList } from '../apis/track/index'
import { SelectProps } from 'antd'
import { IResponseCodeEnum } from '../types/request'
import { SEARCH_ALL_VALUE } from '../utils/constant'

type EventTypesAndIndicatorsState = {
    eventTypesList: IEventListItem[]
    eventTypeSelectOptions: SelectProps<IEventListItem>["options"]

    indicatorList: IIndicator[]
}

type Actions = {
    updateEventTypes: () => Promise<void>
    updateIndicators: () => Promise<void>
    init: () => Promise<Pick<EventTypesAndIndicatorsState, 'eventTypesList' | "indicatorList">>
}

const useEventAndIndicatorsStore = create<EventTypesAndIndicatorsState & Actions>((set, get) => ({
    eventTypesList: [],
    eventTypeSelectOptions: [],

    indicatorList: [],

    updateEventTypes: async () => {
        const { code, data } = await GetEventTypeList({ pageNum: 1, pageSize: 50 })
        if (code === IResponseCodeEnum.SUCCESS) {
            set(() => {
                return {
                    eventTypesList: data.list,
                    eventTypeSelectOptions: data.list.map(({ id, eventTypeCn }) => ({ label: eventTypeCn, value: +id }))
                }
            })
        }
        return

    },
    updateIndicators: async () => {
        const { code, data } = await GetIndicatorsList({ pageNum: 1, pageSize: 50, eventTypeId: SEARCH_ALL_VALUE })
        if (code === IResponseCodeEnum.SUCCESS) {
            set(() => {
                return {
                    indicatorList: data.list,
                }
            })
        }
        return
    },
    init: async () => {
        const { updateEventTypes, updateIndicators, eventTypesList, indicatorList } = get();
        if (!eventTypesList.length || !indicatorList.length) {
            await updateEventTypes();
            await updateIndicators();
        }
        return { eventTypesList, indicatorList }
    },
}))

export default useEventAndIndicatorsStore