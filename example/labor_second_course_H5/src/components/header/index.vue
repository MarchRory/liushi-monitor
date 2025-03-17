<script setup lang="ts">
/**
 * @description 全局通用header, 不可用于tabbar页面。图标集目前只支持tabler, 需要其他的可以自行引入, 但要注意大小
 * @link tabler图标集 https://icon-sets.iconify.design/tabler/?category=General
 */
import { HeaderDefaultAction } from './types'
import { debounce } from '@/utils/freqCtrl/freqCtrl'
import { useRouter } from 'vue-router';
interface Props {
    hidenBack?: boolean
    title?: string
    actions?: HeaderDefaultAction[] // 建议最多三个
    bgColor?: string
    fontColor?: string
    backPath?: string  // 预防页面中存在较多子路由跳转, 还有携带query跳转后再回去导致query不搭发生白屏的问题
    customBack?: (...args: any[]) => any
}

const props = withDefaults(defineProps<Props>(), {
    hidenBack: false,
    bgColor: 'white',
    fontColor: '#3f3f3f'
})

const handleAction = debounce((action: HeaderDefaultAction) => {
    action.trigger && action.trigger()  
})

const router = useRouter()
const handleDefaultBack = () => {
    if (props.customBack) {
        props.customBack()
        return;
    }
    if (props.backPath) {
        router.push({path: props.backPath})
    }else {
        router.back()
    }
}

</script>

<template>
    <header 
        class="header-container" 
        :style="{
            backgroundColor: props.bgColor,
            color: props.fontColor
        }"
    >
        <!--左区域、包括默认返回按钮和左插槽, 二者互斥-->
        <section class="left-area">
            <slot name="left">
                <!--默认内容为一个返回按钮-->
                <t-icon v-if="!props.hidenBack" class="header-icon" icon="tabler:chevron-left" @click="handleDefaultBack" />
            </slot>
        </section>
        <!--中央区域, 目前只是title, 如果设置了左插槽, 那么title不显示-->
        <section class="center-area">
            <slot name="center">
                <span class="title">{{ props.title || '' }}</span>
            </slot>
        </section>
        <!--右区域, 默认为icon-list组成的拓展操作区-->
        <section class="right-area">
            <slot name="right">
                <template v-if="props.actions && props.actions.length">
                    <ul class="default-header-actions">
                        <li
                            v-for="(action, index) in props.actions"
                            :key="index"
                            @click="handleAction(action)"
                        >
                            <t-icon class="action-icon" :icon="action.icon" />
                        </li>
                    </ul>
                </template>
            </slot>
        </section>
    </header>
</template>

<style scoped lang="less">
header {
    margin: 0 auto;
    padding: 0 20px;
    width: calc(100% - 40px);
    height: @xd-header-height;
    display: flex;
    align-items: center;
    justify-content: space-around;
    section {
        display: flex;
        align-items: center;
        height: 100%;
        flex: 1;
    }
    .left-area, .center-area, .right-area {
        width: 33%;
        max-width: 33%;
    }
    .center-area {
        justify-content: center;
        .title {
            font-size: 30px;
            font-weight: bold;
        }
    }
    .right-area {
        justify-content: flex-end;
        font-weight: bold;
        font-size: 30px;
    }
    .default-header-actions {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        list-style-type: none;
        margin: 0;
        li {
            display: flex;
            margin-left: 15px;
            .action-icon {
                font-size: 45px;
            }
        }
    }
}
.header-icon {
    font-size: 50px;
}
</style>