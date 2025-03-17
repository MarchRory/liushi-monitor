import { ref, onUnmounted } from 'vue'
import { useBoolean } from '@/hooks/common'
enum platformEnum {
    ios = 1,
    android = 2,
}

/**
 * @description IOS监听软键盘弹起
 */
function useIOSMonitor() {
    // IOS系统, 软键盘弹起和收起会自动时输入框聚焦、失焦
    // 获取初始高度
    const [visible, setVisible] = useBoolean(false)
    function onIOSKeyBoardVisible(visibleState: boolean) {
        setVisible(visibleState)
    }
    window.addEventListener('focusin', () => onIOSKeyBoardVisible(true))
    window.addEventListener('focusout', () => onIOSKeyBoardVisible(false))
    onUnmounted(() => {
        window.removeEventListener('focusin', () => onIOSKeyBoardVisible(true))
        window.removeEventListener('focusout', () => onIOSKeyBoardVisible(false))
    })
    return {
        visible
    }
}

/**
 * @description 安卓设备监听软键盘弹起
 */
function useAndroidMonitor() {
    const initHeight = window.innerHeight
    const [visible, setVisible] = useBoolean(false)
    function onAndroidKeyBoardVisible() {
        // 按理说, 安卓应该会在软键盘弹起时导致页面高度变化, 但是不知道为什么实测并没有, 暂未排查出原因
        const resizeHeight = window.innerHeight
        const visibleState = initHeight - resizeHeight > 200
        setVisible(visibleState)
    }
    window.addEventListener('resize', onAndroidKeyBoardVisible)
    onUnmounted(() => {
        window.removeEventListener('resize', onAndroidKeyBoardVisible)
    })
    return {
        visible
    }
}

/**
 * @description 监听软键盘是否弹起, 已在App.vue注入, 其他组件内使用Inject引入即可
 * @returns 
 */
function useKeyBoardMonitor() {
    // 获取移动端设备系统类型
    const platForm = ref<platformEnum>()
    const userAgent = typeof window === 'object' ? window.navigator.userAgent : ''
    if (/iPhone|iPod|iPad/i.test(userAgent)) {
        platForm.value = platformEnum.ios
    } else if (/android/i.test(userAgent)) {
        platForm.value = platformEnum.android
    }
    const keyboardMonitor = platForm.value === platformEnum.ios ? useIOSMonitor : useAndroidMonitor
    const { visible: keyboardVisible } = keyboardMonitor()
    watch(
        () => keyboardVisible.value,
        (newVal) => {
            console.log(newVal)
        }
    )

    return {
        keyboardVisible
    }
}

export default useKeyBoardMonitor