<script setup lang="ts">
import { useRoute } from "vue-router";
import { showFailToast, showNotify, showSuccessToast } from "vant";
import { defineAsyncComponent } from "vue";
import { useUserStore } from "@/store/modules/user";
import { addFlagApi, createMailToSelf } from "@/api/user/user";
import { commentToCourse } from "@/api/courses/courses";
import type {
  CourseDimensionality,
  commentToCourseObj,
} from "@/api/types/courses/index";
import { deepClone } from "@/utils/dataUtil/common";
import { debounce } from "@/utils/freqCtrl/freqCtrl";
import { starScoreTextMap, tempCommentGoodNodes } from "./config";
import { PointTypeEnum } from "@/api/types/user";
import { TopicCommentItem } from "@/api/dimension";
import { showConfirmDialog } from "vant";

const Suggestion = defineAsyncComponent(
  () => import("./components/suggestion-form.vue")
);
const DimensionDetailComment = defineAsyncComponent(
  () => import("./components/detail-comment-form.vue")
);
const PointGetProgressBar = defineAsyncComponent(
  () => import("@/components/progressBar/index.vue")
);
const XdHeader = defineAsyncComponent(
  () => import("@/components/header/index.vue")
);

const userStore = useUserStore();
const route = useRoute();
const courseId = ref(Number(route.query.courseId));
const isCommentSuccess = ref(false);
const dialogShowtips = ref(0);

const form = ref<commentToCourseObj>({
  score: 0,
  courseId: courseId.value,
  evaluateText: "",
  anonymous: false,
  detailCommand: [],
});
const flag_content = ref("");
// 二选一弹窗提示
const dialogShow = ref(true);
const flagCanWrite = ref(false);
// 心情和未来寄语随机数
const random = ref();

onMounted(() => {
  random.value = Math.random();
});

// 随机评价文案
const scoreText = computed(() => {
  if (form.value.score === 0) return "";
  const arr = starScoreTextMap[form.value.score].text;
  const randomIndex = Math.floor(Math.random() * 4);
  return arr[randomIndex];
});

// 详细评价改变
const handleTopicChange = (detail: TopicCommentItem[], wordsNum: number) => {
  form.value.detailCommand = detail;
  const data = deepClone<typeof detail>(detail);
  form.value.detailCommand = data.map(({ id, text, icon, name }) => ({
    id,
    text,
    icon,
    name,
  }));
  // form.value.detailCommand = JSON.stringify(command);
};

// Flag与心情寄语
const isShow = ref(true);
// 寄语填写逻辑
const mailToSelf = ref("");
const mailSelfThreshold = ref(50);
// 寄语开放填写条件: 没有评价立个Flag
const isMailToSelfCanWrite = ref(false);
// 吐槽字数
const complainTextNum = ref(0);
// 吐槽标题
const complainTitle = ref("吐槽与建议");

// 同步吐槽与建议
const handleComplainChange = (
  detail: commentToCourseObj["detailCommand"],
  wordsNum: number
) => {
  let isComplain = true;
  if (wordsNum) {
    isComplain = true;
  } else {
    isComplain = false;
  }
  const data = deepClone<typeof detail>(detail);
  data.forEach((item) => {
    if (Object.hasOwnProperty.call(data, "description")) {
      delete item.description;
    }
    if (item.text.length == 0) {
      isComplain = false;
    }
  });
  if (isComplain) {
    complainTitle.value = "吐槽与建议 *";
  } else {
    complainTitle.value = "吐槽与建议";
  }
  complainTextNum.value = wordsNum;
  const complain = data.map(({ id, text, icon, name, course_evaluate_id }) => ({
    id,
    text,
    icon,
    name,
    course_evaluate_id,
  }));
  let evaluateText = "";
  complain.forEach((item) => {
    evaluateText += item.text + ",";
  });
  form.value.evaluateText = evaluateText;
};

// 高质量评价认定逻辑, 多给点积分就行了
// 质量最高时的完成步骤数
const totalSteps = ref(4);
// 当前完成步骤数
const currentStep = computed(() => {
  let step = 0;
  const { score, detailCommand } = form.value;
  // 完成评分 +1
  if (score) {
    step += 1;
  }
  // 详细评价+1
  // const detailCommandLength = detailCommand.reduce((acc, cur) => acc + cur.text.length, 0)
  // console.log(detailCommand);
  step += detailCommand.length > 0 ? 1 : 0;
  step += detailCommand.length > 3 ? 1 : 0;
  // 完成吐槽与建议填写至少20字 +1
  // step += complainTextNum.value >= 20 ? 1 : 0;

  if (step >= 3) {
    if (!dialogShow.value) {
      showConfirmDialog({
        message: "恭喜获得隐藏积分的机会！\n(ps:Flag和心情感受只能二选一哦~)",
      }).then(() => {
        isShow.value = true;
        dialogShow.value = true;
      });
    }
  } else {
    isShow.value = false;
    dialogShow.value = false;
  }
  // 完成寄语填写大于20字 +1
  step += mailToSelf.value.length + flag_content.value.length > 20 ? 1 : 0;
  return step;
});

// 能力维度解码
const courseDimensionInfo = computed<CourseDimensionality[]>(() => {
  return JSON.parse(
    decodeURIComponent(route.query.dimensionalityInfo as string)
  );
});

// Flag和心情寄语那块只能二选一
const handleCanWriteChange = () => {
  if (flag_content.value.length || flag_content.value.length) {
    if (dialogShowtips.value == 0) {
      showConfirmDialog({
        message: "Flag和心情感受只能二选一哦~",
      }).then(() => {
        dialogShowtips.value++;
      });
    }
  }
  isMailToSelfCanWrite.value = flag_content.value.length > 0;
  flagCanWrite.value = mailToSelf.value.length > 0;
};

// 提交逻辑
const submit = debounce(() => {
  if (!form.value.score) {
    showFailToast("先给课程打个分吧");
    return;
  }
  if (!form.value.detailCommand.length) {
    showFailToast("请先填写详细评价吧");
    return;
  }
  // 认定高质量评价
  const query =
    currentStep.value > tempCommentGoodNodes[0].thresholdStep
      ? {
          departmentId: +userStore.departmentId,
          type: PointTypeEnum.goodCommend,
          // point:
          //   currentStep.value > tempCommentGoodNodes[1].thresholdStep ? 10 : 5,
          origin: "评价课程时完成高质量评价",
        }
      : {
          departmentId: +userStore.departmentId,
          type: PointTypeEnum.completeCommend,
          origin: "完成评价",
        };
  // const dimensionalityScore = form.value.detailCommand.map(
  //   ({ id, text, icon, name }) => {
  //     let idNumber = +id;
  //     return {
  //       id: idNumber,
  //       text,
  //       icon,
  //       name,
  //     };
  //   }
  // );
  const formValue = JSON.parse(JSON.stringify(form.value));

  commentToCourse(formValue, query)
    .then(({ success }) => {
      if (success) {
        showSuccessToast("评价成功");
        isCommentSuccess.value = true;
      } else {
        showFailToast("请稍后重试");
      }
    })
    .catch((e) => {
      showFailToast(e);
    });

  flag_content.value &&
    addFlagApi(flag_content.value, 0)
      .then(({ success }) => {
        if (!success) {
          showNotify({
            type: "danger",
            message: "服务器异常, 立Flag失败",
            duration: 2 * 1000,
          });
        }
      })
      .catch(() => {
        showNotify({
          type: "danger",
          message: "网络异常, 立Flag失败, 请稍后再试",
          duration: 2 * 1000,
        });
      });

  mailToSelf.value &&
    userStore.userId &&
    createMailToSelf({
      uid: userStore.userId,
      courseId: courseId.value + "",
      content: mailToSelf.value,
    }).catch(() => {
      showFailToast({
        message: "网络异常, 寄语创建失败, 请稍后再试",
        duration: 2 * 1000,
      });
    });
}, 500);

onMounted(() => {
  $liushiMonitor.sendSpaLoadPerformance()
})
</script>

<template>
  <div class="container">
    <van-sticky :offset-top="0">
      <header>
        <XdHeader title="课程评价">
          <template v-if="!isCommentSuccess" #right>
            <div class="seat">
              <van-switch
                v-model="form.anonymous"
                :size="20"
                active-color="#ffac40"
              />
              <span>匿名</span>
            </div>
          </template>
        </XdHeader>
        <div class="progressBar">
          <PointGetProgressBar
            v-if="!isCommentSuccess"
            :current-step="currentStep"
            :total-steps="totalSteps"
            :nodes="tempCommentGoodNodes"
          />
        </div>
      </header>
    </van-sticky>

    <div class="main" v-if="!isCommentSuccess">
      <section class="score firstSection">
        <span class="form-title">课程评分 *</span>
        <div class="scoreArea">
          <div>
            <van-rate
              v-model="form.score"
              :size="35"
              color="#ffae0d"
              void-color="#eee"
            />
          </div>
          <div class="scoreText">{{ scoreText }}</div>
        </div>
      </section>
      <section class="dimensionComment">
        <span class="form-title">详细评价 *</span>
        <div class="content-area">
          <div class="complainTips">只需点击按钮即可作为评价内容哦~</div>
          <!--@vue-ignore-->
          <DimensionDetailComment
            :course-id="courseId"
            :mail-self-threshold="mailSelfThreshold"
            :course-dimension-info="courseDimensionInfo"
            @on-change="handleTopicChange"
          />
        </div>
      </section>
      <!-- 吐槽与建议 -->
      <section class="suggestion">
        <span class="form-title">{{ complainTitle }}</span>
        <div class="content-area">
          <div class="complainTips">点击评价维度可以进行吐槽哦~</div>
          <Suggestion
            :course-id="courseId"
            :mail-self-threshold="0"
            @on-change="handleComplainChange"
          />
        </div>
      </section>
      <section class="flag" v-show="isShow">
        <span class="form-title">立个Flag</span>
        <div class="content-area">
          <van-field
            v-model="flag_content"
            :disabled="flagCanWrite"
            rows="1"
            autosize
            type="textarea"
            placeholder="先立一个小目标, 比如：我这学期要点亮所有勋章！"
            label-align="top"
            @click-input="handleCanWriteChange"
          />
        </div>
      </section>
      <!-- 寄语未来/心情感受 -->
      <section class="flag" v-show="isShow">
        <span class="form-title">{{
          random > 0.5 ? "寄语未来" : "心情感受"
        }}</span>
        <div class="content-area">
          <van-field
            v-model="mailToSelf"
            :disabled="isMailToSelfCanWrite"
            rows="1"
            autosize
            type="textarea"
            placeholder="完成本次活动，想要急切记录的心情，遇见的有趣灵魂~"
            label-align="top"
            @click-input="handleCanWriteChange"
          />
        </div>
      </section>
      <div
        :style="{
          backgroundColor:
            form.score !== 0 && form.detailCommand.length > 0
              ? '#ffac40'
              : '#ffd9a9',
        }"
        class="submitBtn"
        @click="submit"
      >
        发布评价
      </div>
    </div>

    <div class="res" v-else>
      <div class="resText">
        <div style="font-size: 30px; font-weight: 300; color: #9e9e9e">
          感谢你的宝贵意见
        </div>
        <div style="color: #9e9e9e">您的任何意见</div>
        <div style="color: #9e9e9e">都是二课不断优化的动力</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f4f5f5;
  header {
    overflow-x: hidden;
    width: 100vw;
    background-color: white;
    .seat {
      height: 100%;
      width: 100px;
      background-color: #ffff;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      span {
        margin-top: 5px;
        font-size: 0.8em;
        font-weight: 700;
        color: gray;
      }
    }
    .progressBar {
      // width: 160px;
    }
  }

  .main {
    width: 100%;
    flex: 1;
    height: max-content;
    overflow-y: auto;
    section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 6px;
      padding: 40px 30px;
      background-color: #ffff;
      .content-area {
        width: 100%;
        :deep(textarea) {
          display: flex;
          align-items: flex-start;
          width: 94%;
          text-indent: 2.2em;
          margin: 0 auto;
          min-height: 200px;
          height: auto;
          word-wrap: break-word;
          word-break: break-word;
        }
        .complainTips {
          position: relative;
          top: -2.2em;
          right: -5em;
          color: #afafaf;
        }
      }
      .form-title {
        font-size: 1.1em;
        font-weight: 600;
        color: #242a33;
        font-family: PingFangSC-Medium;
      }
      div {
        padding: 10px 0;
      }
    }
    .firstSection {
      padding-top: 30px;
    }
    .score {
      .scoreArea {
        padding: 25px 0;
        margin: 0 auto;
        .scoreText {
          height: 1.1em;
          color: #b8b8b8;
          margin-top: 20px;
          font-size: 1.1em;
          font-weight: 400;
        }
      }
    }
    .flag {
      &::after {
        display: block;
        content: "";
        position: relative;
        width: 100%;
        height: 200px;
      }
    }
    .submitBtn {
      display: block;
      position: fixed;
      width: fit-content;
      padding: 20px 120px;
      border-radius: 20px;
      font-weight: 600;
      color: rgb(255, 255, 255);
      font-size: 1em;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
    }

    :deep(.van-image__img) {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 10px;
      border: 1px solid #b8b8b8;
      margin-bottom: 20px;
    }

    :deep(.van-cell-group--inset) {
      border: 1px solid #afafaf;
    }

    :deep(.van-image--round) {
      border: 10px solid #c0e2ff;
    }

    .anonymous {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      position: relative;
      left: 68%;
    }
  }

  .res {
    position: absolute;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .speFont {
      color: black;
      font-weight: 500;
    }
  }

  :deep(.van-button--warning) {
    border-radius: 16px;
    width: 92%;
  }
}
:deep(.van-switch) {
  display: flex;
  align-items: center;
  font-size: 22px;
  height: 20px;
  background-color: rgb(247, 237, 232);
  width: 70px;

  .van-switch__node {
    top: -12px;
    left: 0;
    background: #e3562a;
    width: 30px;
    height: 30px;
    border: 6px solid #f8f2ee;
  }
}
</style>
