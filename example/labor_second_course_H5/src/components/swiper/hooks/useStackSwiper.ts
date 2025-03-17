import { debounce } from "@/utils/freqCtrl/freqCtrl";
import { StackSwiperProps } from "../types";
import { CSSProperties } from 'vue'
import { showFailToast } from "vant";

function useStackSwiper(data: StackSwiperProps) {
    const { list, total, activeTab, offset } = toRefs(data)

    const current = ref(activeTab.value)

    const renderList = computed(() => {
        return list.value.map((item, index) => {
            // 卡片索引和当前激活卡片索引的差值, 有正负  
            const indexDiff = index - current.value;
            // 缩放固定0.8
            const COMMON_SCALE = 0.8
            // 第index张卡片距离激活卡片的绝对索引距离
            const absDistance = Math.abs(indexDiff)

            // 层叠上下级等级
            const zIndex = total.value - absDistance

            // 缩放
            const scale = Math.pow(COMMON_SCALE, absDistance)
            const rotateY = absDistance === 0 ? 0 : Math.sign(indexDiff) * 10

            // x轴偏移量
            const translateX = indexDiff * (offset?.value || 150)
            return {
                data: item,
                style: {
                    transform: `scale(${scale}) translateX(${translateX}px) rotateY(${rotateY}deg)`, // 使用translateZ进行3D位移  
                    zIndex,
                },
            };
        })
    })

    const touchState = reactive({
        startPox: {
            _x: 0,
            _y: 0
        },
        moveDistance: 0,
        endPox: {
            _x: 0,
            _y: 0
        }
    })
    const handleTouchStart = (e: TouchEvent) => {
        const { pageX, pageY } = e.changedTouches[0]
        touchState.startPox = {
            _x: +pageX.toFixed(),
            _y: +pageY.toFixed()
        }
    }

    const handleTouchMove = debounce((e: TouchEvent) => {
        // 暂时没什么用
        const { pageX, pageY } = e.changedTouches[0]
        touchState.endPox = {
            _x: +pageX.toFixed(),
            _y: +pageY.toFixed()
        }
        const x = touchState.startPox._x - touchState.endPox._x
        if (x > 10) {
            // 右滑
            current.value = current.value == total.value - 1 ? current.value : current.value + 1
        } else if (-x > 10) {
            // 左滑
            current.value = current.value == 0 ? 0 : current.value - 1
        }
        e.preventDefault()
    }, 100)

    watch(
        () => activeTab.value,
        (newVal) => {
            if (newVal !== current.value) {
                current.value = newVal
            }
        }
    )

    return {
        current,
        renderList,
        handleTouchStart,
        handleTouchMove
    }
}

export default useStackSwiper