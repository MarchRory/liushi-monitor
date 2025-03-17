<script setup lang="ts">
/**
 * @description 通用评论触发器
 */
import { useToggle } from '@vant/use';
import { HeaderDefaultAction } from '../header/types';
import { debounce } from '@/utils/freqCtrl/freqCtrl';
import { showFailToast } from 'vant';
const props = defineProps<{
    placeholderIcon?: string;
    placeholder?: string;
    barActions?: HeaderDefaultAction[] // 建议最多三个
    commentActions?: HeaderDefaultAction[]
    submitText?: string
}>()
const emits = defineEmits<{
    (e: 'submit', content: string): void
}>()


const [commendVisible, commentToggle] = useToggle(false)
const handleAction = debounce((action: HeaderDefaultAction) => {
    action.trigger && action.trigger()  
})

const content = ref('')
const textarea = ref<HTMLInputElement>()
// const keyboardVisible = inject('keyboardState') as Ref<boolean>
const beginComment = () => {
    commentToggle(true)
    nextTick(() => {
        textarea.value && textarea.value.focus()
    })
}
const handleChange = debounce((e: Event) => {
    content.value = (e.target as HTMLInputElement).value
}, 200)

const submit = () => {
    if (!content.value) {
        showFailToast('还没有填写内容')
        return;
    }
    emits('submit', content.value)
}

const clear = () => {
    if (textarea.value) {
        textarea.value.value = ''
    }
}

defineExpose({
    clear
})
</script>

<template>
    <div class="comment-trigger-bar">
        <div class="visual-input-bar" @click="beginComment">
            <t-icon class="input-icon" :icon="props.placeholderIcon || 'tabler:edit'" />
            <span>{{ props.placeholder || '写点什么...' }}</span>
        </div>
        <div class="comment-trigger-actions">
            <slot name="bar-actions">
                <template v-if="props.barActions && props.barActions.length">
                    <ul class="default-actions">
                        <li
                            v-for="(action, index) in props.barActions"
                            :key="index"
                            @click="handleAction(action)"
                        >
                            <t-icon class="comment-trigger-icon" :icon="action.icon" />
                        </li>
                    </ul>
                </template>
                <t-icon v-else class="comment-trigger-icon" icon="tabler:message-2" color="#969696" @click="beginComment" />
            </slot>
        </div>
    </div>
    <van-popup
        v-model:show="commendVisible"
        round
        position="bottom"
        safe-area-inset-bottom
        duration="0.1"
    >
        <div class="comment-area" @touchmove.stop>
            <textarea 
                ref="textarea" 
                cols="30" 
                rows="10" 
                placeholder="发表评论..." 
                @input="handleChange" 
            />
            <div class="comment-actions-bar">
                <slot name="commnet-actions">
                    <ul class="commnet-actions">
                        <li
                            v-for="(action, index) in props.barActions"
                            :key="index"
                            @click="handleAction(action)"
                        >
                            <t-icon class="comment-trigger-icon" :icon="action.icon" />
                        </li>
                    </ul>
                </slot>
                <span class="submit-btn" @click="submit" :style="{
                    backgroundColor: `${content ? '#ffac40' : '#ffd9a9'}`
                }">{{ props.submitText || '评论' }}</span>
            </div>
        </div>
    </van-popup>
</template>

<style lang="less">
.comment-trigger-icon {
    font-size: 50px;
}
.comment-trigger-bar {
    display: flex;
    width: 94%;
    height: auto;
    align-items: center;
    justify-content: space-around;
    .visual-input-bar {
        display: flex;
        align-items: center;
        flex: 1;
        height: 60px;
        padding-left: 20px;
        border-radius: 10px;
        background-color: #f1f1f1;
        .input-icon {
            margin-right: 15px;
        }
        span {
            font-size: 20px;
        }
    }
    .comment-trigger-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 40px;
        margin-left: 30px;
        .default-actions {
            display: flex;
            justify-content: flex-end;
            width: 100%;
            list-style-type: none;
            margin: 0;
            li {
                display: flex;
                margin-right: 15px;
            }
        }
    }
}

.comment-area {
    padding: 30px 0 0 0;
    width: 100%;
    height: max-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    textarea {
        width: 86%;
        height: 150px;
        overflow: auto;
        border-color: transparent;
        background-color: #f1f1f1;
        color: #5a5a5a;
        padding: 0px 10px;
        border-radius: 10px;
    }
    .comment-actions-bar {
        margin-top: 10px;
        width: 88%;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .submit-btn {
            text-align: center;
            padding: 5px 20px;
            font-size: 25px;
            color: white;
            font-weight: 600;
            letter-spacing: 3px;
            border-radius: 10px;
        }
    }
}
</style>