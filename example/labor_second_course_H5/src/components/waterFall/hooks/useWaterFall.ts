import { WaterFallCard, WaterFallListProps, WaterfallCardRect, WaterfallColumnQueue, WaterfallRenderItem, WaterfallScrollState } from "../types";
import useLoading from "@/hooks/useLoading";
import { formatCover } from "@/utils/course";
import { sleep, throttle } from "@/utils/freqCtrl/freqCtrl";
import { useBoolean } from '@/hooks/common'
import { showFailToast } from "vant";
import { CSSProperties, UnwrapNestedRefs } from "vue";

/**
 * @description 计算DOM中渲染列表的两列高度
 * @param queue 
 * @returns 
 */
function useListHeight(queueState: UnwrapNestedRefs<{ queue: WaterfallColumnQueue[], len: number }>) {
    return computed(() => {
        let minIndex = 0, minHeight = Infinity, maxHeight = -Infinity
        queueState.queue.forEach(({ height }, index) => {
            if (height < minHeight) {
                minHeight = height
                minIndex = index
            } else {
                maxHeight = height
            }
        })
        return {
            minHeight,
            minIndex,
            maxHeight
        }
    })
}

/**
 * @description 处理数据, 生成瀑布流中每一张卡片的尺寸以及布局信息
 * @param rectInfoMap 
 * @param item 
 * @param beforeItem 
 * @param minIndex 
 * @param gap 
 * @returns 
 */
function generateWaterFallItem(rectInfoMap: ComputedRef<Map<WaterFallCard['id'], WaterfallCardRect>>, item: WaterFallCard, beforeItem: WaterfallRenderItem, minIndex: number, gap: number): WaterfallRenderItem {
    const rect = rectInfoMap.value.get(item.id)
    const { width, height } = rect as WaterfallCardRect
    let posY = 0
    if (beforeItem) {
        posY = beforeItem._y + beforeItem._height + gap
    }

    return {
        item,
        _y: posY,
        _height: height,
        style: {
            width: width + 'px',
            height: height + 'px',
            transform: `translate(${minIndex === 0 ? 0 : (width + gap) * minIndex}px, ${posY}px)`
        }
    }
}

/**
 * 因为瀑布流里涉及了许多中间过程的操作, 所以就不使用useAutoList那个搭配van-list使用的hooks了
 * @description 虚拟瀑布流核心逻辑
 * @param containerDom 瀑布流容器
 * @param data 瀑布流组件的props
 */
function useWaterFall(containerDom: Ref<HTMLDivElement | null>, data: WaterFallListProps) {
    const {
        requestApi,
        column = 2,
        gap = 15,
        pageSize = 20,
        otherRequestParams = {}
    } = data

    // 列表加载
    const { loading, setLoading } = useLoading(false)
    // 是否加载完毕
    const [isFinish, setFinish] = useBoolean(false)
    // 当前展示的页码
    const curPage = ref(1)
    // 完整的列表数据, 真正的数据源
    const listData = ref<WaterFallCard[]>([])
    // 滑动操作相关状态
    const scrollState = reactive<WaterfallScrollState>({
        viewWidth: 0,
        viewHeight: 0,
        start: 0
    })
    // 可视窗口中最后元素的索引
    const end = computed(() => scrollState.viewHeight + scrollState.start)

    // 瀑布流抽象二维数据, 需要用到这个来计算虚拟列表的最大高度
    const queueState = reactive({
        queue: new Array(column).fill(0).map<WaterfallColumnQueue>(() => ({ list: [], height: 0 })),
        len: 0
    })
    const renderListHeight = useListHeight(queueState)

    const renderedListStyle = computed<CSSProperties>(() => ({
        height: renderListHeight.value.maxHeight + 'px'
    }))

    // 一维待渲染的列表数据, 便于计算
    const cardList = computed<WaterfallRenderItem[]>(() => (
        queueState.queue.reduce<WaterfallRenderItem[]>((pre, { list }) => pre.concat(list), [])
    ))

    // 实际渲染在视口的列表数据
    const renderedList = computed<WaterfallRenderItem[]>(() => {
        return cardList.value.filter(item => {
            // 触发虚拟列表自动加载的底部多延伸一点, 提前加载模拟无缝, 同时解决两列等长时无法触发加载的bug
            return item._height + item._y > scrollState.start && (item._y < end.value + 150)
        })
    }


    )

    // 动态计算待渲染的的卡片宽高
    const toRenderCardInfo = computed(() => {
        return listData.value.reduce<Map<WaterFallCard['id'], WaterfallCardRect>>((pre, cur) => {
            // 计算渲染出来的卡片宽度
            const renderedCardWidth = Math.floor((scrollState.viewWidth - (column - 1) * gap) / column)
            // 计算宽高比, 宽小于高的图片需要增加高度, 否则高度无法容纳下方预览信息
            const ratio = +(cur.cover.width / cur.cover.height).toFixed(1)
            const preHeight = Math.floor((renderedCardWidth * cur.cover.height) / cur.cover.width)
            pre.set(cur.id, {
                width: renderedCardWidth,
                height: ratio < 1 ? preHeight * 1.2 : preHeight * 2
            })
            return pre
        }, new Map())
    })

    // 请求数据后, 新数据经过处理后进入抽象瀑布流队列
    // 该操作即新增元素的DOM布局
    const addInQueue = (dataSize: number) => {
        for (let i = 0; i < dataSize; i++) {
            const minIndex = renderListHeight.value.minIndex
            const curColumn = queueState.queue[minIndex]
            const before = curColumn.list[curColumn.list.length - 1] || null
            const dataItem = listData.value[queueState.len]
            const cardItem = generateWaterFallItem(toRenderCardInfo, dataItem, before, minIndex, gap)
            curColumn.list.push(cardItem)
            curColumn.height += cardItem._height
            queueState.len++
        }
    }

    // 数据请求逻辑
    const loadList = (): Promise<number> => {
        return new Promise(async (resolve) => {
            if (isFinish.value) {
                resolve(listData.value.length)
            }
            setLoading(true)
            try {
                const { list, total } = (await requestApi({ pageNum: curPage.value, pageSize, ...otherRequestParams })).data
                const hasImgInfoList = list.map(item => {
                    const { cover } = item
                    const coverObj = formatCover(cover as unknown as string)
                    return {
                        ...item,
                        cover: coverObj
                    }
                })
                listData.value.push(...hasImgInfoList)
                if (listData.value.length === +total || !list.length) {
                    setFinish(true)
                } else {
                    curPage.value++
                }
                setLoading(false)
                resolve(list.length)
            } catch {
                setLoading(false)
                resolve(listData.value.length)
            }
        })
    }

    // 初始化虚拟列表容器
    const initScrollState = () => {
        scrollState.viewWidth = containerDom.value?.clientWidth
        scrollState.viewHeight = containerDom.value?.clientHeight
        scrollState.start = containerDom.value?.scrollTop
    }

    // 响应式, 暂时不做, 感觉不太需要, 毕竟是直接在手机上用, 控制一下column就行
    // const reComputed = () => {
    //     queueState.queue = new Array(column).fill(0).map<WaterfallColumnQueue>(() => ({ list: [], height: 0 }))
    //     queueState.len = 0
    //     addInQueue(listData.value.length)
    // }
    // const handleResize = () => {
    //     initScrollState()
    //     reComputed()
    // }
    // const resizeObserver = new ResizeObserver(debounce(function () {
    //     handleResize()
    // }))

    // 初始化操作
    const init = async (isInit: boolean = true) => {
        // 400ms延迟, 应对初次登录时, 首页无法及时获取wapper宽高, 导致的白屏现象
        isInit && await sleep(400)
        initScrollState()
        try {
            const len = await loadList()
            len && addInQueue(len)
        } catch {
            showFailToast("服务器异常")
        }

        // containerDom.value && resizeObserver.observe(containerDom.value)
    }

    // 触底加载逻辑, 这里要使用节流, 并且一次分页尽量多拿点数据, 节流的时间后人把控一下, 看什么时间长度效果比较好
    const handleScroll = throttle(() => {
        const { scrollTop, clientHeight } = containerDom.value!
        scrollState.start = scrollTop
        if (isFinish.value) {
            return
        }

        if (scrollTop + clientHeight >= renderListHeight.value.minHeight * 0.7) {
            !loading.value && loadList().then((len) => { len && addInQueue(len) })
            // todo: 打点 
        }
    }, 50)

    onMounted(() => {
        // 因为涉及DOM操作, 所以必须在挂载后进行
        init()
    })


    // 请求的参数发生变化时, 清空已有状态, 重新加载
    const reload = async () => {
        listData.value = []
        queueState.queue = new Array(column).fill(0).map<WaterfallColumnQueue>(() => ({ list: [], height: 0 }))
        queueState.len = 0
        curPage.value = 1
        setFinish(false)
        init(false)
    }
    watch(
        () => otherRequestParams,
        () => {
            reload()
        },
        { deep: true }
    )
    onUnmounted(() => {
        // containerDom.value && resizeObserver && resizeObserver.disconnect()
    })

    return {
        isFinish,
        loading,
        curPage,
        listData,
        totalLength: listData.value.length,
        end,
        renderedListStyle,
        renderedList,
        handleScroll,
        reload
    }
}

export default useWaterFall