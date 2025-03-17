<script setup lang="ts">
/**
 * @description 设置中心里的分类设置模块
 */
import type {UserSettingItem} from './type'
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps<{
    title: string;
    settings: UserSettingItem[]
}>()

const jumpTo = (settingItem: UserSettingItem) => {
    if (settingItem.forbidJump) return;
    // 优先走自定义方法
    if (settingItem.customTrigger) {
        settingItem.customTrigger()
    }else {
        const {path} = settingItem
        router.push({path})
    }
}
</script>

<template>
    <section>
        <div class="setting-part-title">{{ props.title }}</div>
        <ul>
            <li
                v-for="(setting, index) in props.settings"
                :key="index"
            >
                <div class="li-main">
                    <div class="setting-info"><t-icon class="icon" :icon="setting.icon" /><span>{{ setting.label }}</span></div>
                    <div class="right">
                        <slot name="before-action" :item="setting"></slot>
                        <slot name="action" :item="setting">
                            <div v-if="!setting.forbidJump"  class="default-action" @click="jumpTo(setting)">
                                <t-icon class="icon" icon="tabler:chevron-right" />
                            </div>
                        </slot>
                    </div>
                </div>
                <span v-if="index !== props.settings.length-1"  class="split"></span>
            </li>
        </ul>
    </section>
</template>

<style scoped lang="less">
section {
    width: 100%;
    height: auto;
    margin-top: 20px;
    .setting-part-title {
        font-size: 30px;
        font-weight: bold;
        margin-bottom: 20px;
        margin-top: 30px;
    }
    ul {
        list-style-type: none;
        margin: 0;
        width: 100%;
        background-color: white;
        li {
            width: 94%;
            padding: 25px 0;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            overflow-x: hidden;
            .li-main {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .setting-info {
                    display: flex;
                    align-items: center;
                    .icon {
                        font-size: 40px;
                        margin-right: 30px;
                    }
                }
                .right {
                    width: 30%;
                    display: flex;
                    justify-content: flex-end;
                    .icon {
                        font-size: 40px;
                    }
                    .default-action {
                        width: 30%;
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                    }
                }
            }
            .split {
                display: block;
                width: 110%;
                height: 3px;
                transform: translateY(25px);
                background-color: rgb(237, 237, 237);
            }
        }
    }
}
</style>

