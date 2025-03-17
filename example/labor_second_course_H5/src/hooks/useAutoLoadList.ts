import { ListResponseModel, pageParams } from "@/api/types/public"
import { Response } from "@/utils/http/types"
import useLoading from "./useLoading"

interface configParams<T extends object, R extends object> {
    requestApi: (...args: any[]) => Promise<Response<ListResponseModel<T>>>,
    otherRequestParms?: Omit<R, keyof pageParams>
}

interface listLoadData<T> {
    listData: T[]
    isFinished: boolean
    currentTotal: number
}

type listPageParams<T> = pageParams & T

/**
 * @description 和van-list搭配使用的hooks
 * @param config 
 * @returns 
 */
function useAutoLoadList<T extends object, R extends object = {}>(config: configParams<T, R>) {
    const { requestApi, otherRequestParms = {} } = config
    const { loading, setLoading } = useLoading(false)

    const listRequiredData = reactive<listLoadData<T>>({
        listData: [],
        isFinished: false,
        currentTotal: 0
    })

    const totalAll = ref(0)
    const isRefreash = ref(false)
    const pageParams = ref<listPageParams<R>>({
        pageNum: 1,
        pageSize: 20,
        ...(otherRequestParms as R)
    })

    /**
     * @description 列表数据加载
     */
    const loadList = async () => {
        if (listRequiredData.isFinished) return;
        setLoading(true)
        requestApi(pageParams.value)
            .then(({ data }) => {
                const { list, total } = data
                totalAll.value = +total
                list.forEach((item) => {
                    // @ts-ignore
                    listRequiredData.listData.push(item)
                })
                if (listRequiredData.listData.length >= total) {
                    listRequiredData.isFinished = true
                }
                pageParams.value.pageNum! += 1
            })
            .finally(() => {
                setLoading(false)
            })
    }

    /**
     * @description 下拉刷新
     */
    const onRefresh = async () => {
        isRefreash.value = true
        // @ts-ignore
        pageParams.value = {
            pageNum: 1,
            pageSize: 20,
            ...(otherRequestParms as R)
        }
        await loadList()
        isRefreash.value = false
    }

    return {
        ...toRefs(listRequiredData),
        isRefreash,
        totalAll,
        pageParams,
        loading,
        setLoading,
        loadList,
        onRefresh
    }
}


export default useAutoLoadList