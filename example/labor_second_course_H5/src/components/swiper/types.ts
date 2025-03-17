import { ListResponseModel } from '@/api/types/public/index'
export interface StackSwiperProps<T = any> extends ListResponseModel<T> {
    activeTab: number,
    width: string
    height: string,
    offset?: number
}