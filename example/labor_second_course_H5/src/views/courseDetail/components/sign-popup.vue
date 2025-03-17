<script setup lang="ts">
import { PointTypeEnum } from '@/api/types/user';
import { sign } from '@/api/courses/courses'
import { throttle } from 'echarts';
import { showFailToast, showSuccessToast } from 'vant';

interface Props {
    visible: boolean,
    courseId: string,
    userDepartmentId: string
}

const props = withDefaults(defineProps<Props>(), {
    visible: false
})

const emits = defineEmits<{
    (e: 'onSuccess'): void
    (e: 'onClose'): void
}>()

const signCode = ref()
const signCourse = throttle(() => {
  if (!signCode.value) {
    showFailToast("还没有输入签到码哦");
    return;
  }
  sign({
    courseId: Number(props.courseId),
    code: signCode.value,
  }, {
    origin: '学生完成课程签到',
    departmentId: props.userDepartmentId,
    type: PointTypeEnum.completeSign,
    state: 1
  }).then(({success}) => {
    if (success) {
      showSuccessToast("签到成功");
      emits('onClose')
      setTimeout(() => {
        emits('onSuccess')
      }, 500)
    }
  });
}, 500)

const handleClose = () => {
    emits('onClose')
}

</script>

<template>
    <van-popup
        v-model:show="props.visible"
        round
        :style="{ padding: 'px', overflow: 'hidden' }"
        :transition-appear="true"
        :close-on-click-overlay="false"
    >
        <div class="signBox">
        <div class="signTitle">签到码签到</div>
        <div class="inputArea">
            <van-field
            v-model="signCode"
            size="large"
            type="text"
            label="签到码"
            />
        </div>
        <div class="tools">
            <div @click="handleClose">取消</div>
            <div class="signUp" @click="signCourse">签到</div>
        </div>
        </div>
    </van-popup>
</template>

<style scoped lang="less">
  .signBox {
    width: 550px;
    height: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;

    .signTitle {
      font-size: 36px;
      font-weight: 600;
    }

    .inputArea {
      :deep(.van-field) {
        flex-wrap: wrap;
        border: 1px solid #f7a660;
        //padding: 20px 25px;
        width: 400px;
        border-radius: 10px;

        .van-field__label {
          width: 130px;
          border-right: 2px solid #efbf81;
        }

        #van-field-1-label {
          color: #f79823;
        }
      }
    }
}
    .tools {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      border-top: 2px solid rgb(243, 139, 60);
      overflow: hidden;
      position: relative;
      top: 60px;

      div {
        padding: 20px;
        width: 240px;
        font-weight: 600;
        letter-spacing: 5px;
        font-size: 35px;
      }

      .signUp {
        color: white;
        background-color: #fba665;
      }
    }
</style>