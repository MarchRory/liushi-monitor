<template>
  <div class="container">
    <header><strong>家长问卷调查</strong></header>
    <div class="questionInfo">
      <van-tag color="#ffe1e1" text-color="#ad0000"
        >学号:{{ studentId }}</van-tag
      >
      <van-tag color="#ffe1e1" text-color="#ad0000"
        >课程名{{ courseName }}</van-tag
      >
    </div>
    <main v-if="!initLoading" class="mainContainer">
      <van-form
        ><van-cell-group inset>
          <van-field
            v-model="createBy"
            name="家长姓名"
            label="家长姓名"
            placeholder="请填写家长姓名"
            :rules="[{ required: true, message: '请填写家长姓名' }]"
          />
          <van-field
            v-model="relation"
            name="身份"
            label="身份"
            placeholder="请填写与学生的关系"
            :rules="[{ required: true, message: '请填写与学生的关系' }]"
          />
          <van-field
            label-width="110"
            label="实践活动满意度"
            :rules="[{ required: true, message: '请填写实践活动满意度评分' }]"
          >
            <template #input>
              <van-rate v-model="satisfaction" />
            </template>
          </van-field>
          <van-field
            :rules="[{ required: true, message: '请填写评价' }]"
            v-model="activityMessage"
            rows="4"
            autosize
            label="实践活动评价"
            type="textarea"
            maxlength="100"
            placeholder="对此次实践活动的评价"
            show-word-limit
          />
          <van-field
            label-width="110"
            label="学生满意度"
            :rules="[{ required: true, message: '请填写学生满意度评分' }]"
          >
            <template #input>
              <van-rate v-model="completeness" />
            </template> </van-field
          ><van-field
            :rules="[{ required: true, message: '请填写评价' }]"
            v-model="studentMessage"
            rows="4"
            autosize
            label="对学生的评价"
            type="textarea"
            maxlength="100"
            placeholder="对学生的评价"
            show-word-limit
          />
          <van-field
            v-model="message"
            rows="4"
            autosize
            label="对活动及学生的意见与建议（可选）"
            type="textarea"
            maxlength="100"
            placeholder="学生在此次课程中的表现如何或者对本次课程的建议或反馈等"
            show-word-limit
          />
          <van-field name="uploader" label="评价证明材料（可选）">
            <template #input>
              <van-uploader v-model="img" :after-read="afterRead" />
            </template>
          </van-field> </van-cell-group
      ></van-form>

      <div style="margin-top: 50px">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          @click="onSubmit"
        >
          提交
        </van-button>
      </div>
    </main>
    <XdLoading :visible="initLoading" />
  </div>
</template>

<script lang="ts" setup>
import useLoading from "@/hooks/useLoading";
import { useRoute } from "vue-router";
import { getCourseDetail } from "@/api/courses/courses";
import { addEvaluateApi, evaluateText } from "@/api/questionnaire/index.ts";
import { showSuccessToast, showFailToast } from "vant";
import upload from "@/api/upload/upload.ts";

const XdLoading = defineAsyncComponent(
  () => import("@/components/loading/index.vue")
);

const { loading: initLoading } = useLoading(false);
const route = useRoute();

const createBy = ref<string>("");
// 活动满意度
const satisfaction = ref<number>(0);
// 学生满意度
const completeness = ref<number>(0);
const studentId = ref<string>("");
const courseName = ref<string>("");
const courseId = ref<string>("");
// 活动评价
const activityMessage = ref<string>("");
// 学生评价
const studentMessage = ref<string>("");
const relation = ref<string>("");
// 建议与反馈
const message = ref<string>("");
const img = ref();
const proofPicture = ref<string>("");

// 筛选路由
const getQueryParam = (url: string, param: string) => {
  const regex = new RegExp("[?&]" + param + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

// 文件上传
const afterRead = (file: never) => {
  showFailToast("正在上传，请稍等");
  upload.setAvatar(file.file).then((res: any) => {
    if (res.code == 200) {
      proofPicture.value = res.data;
      showSuccessToast("上传成功");
    }
  });
};

const init = () => {
  studentId.value = getQueryParam(route.fullPath, "uid")!;
  courseId.value = getQueryParam(route.fullPath, "courseId")!;
  getCourseDetail(courseId.value).then((res) => {
    if (res.code == 200) {
      courseName.value = res.data.title;
    }
  });
};

const onSubmit = () => {
  const form: evaluateText = {
    createBy: createBy.value,
    courseId: +courseId.value,
    studentId: studentId.value,
    relation: relation.value,
    proofPicture: proofPicture.value,
    completeness: completeness.value,
    satisfaction: satisfaction.value,
    items: [
      { title: "实践活动评价", text: activityMessage.value },
      { title: "学生评价", text: studentMessage.value },
      { title: "反馈与建议", text: message.value },
    ],
  };
  addEvaluateApi(form).then((res) => {
    if (res.code == 200) {
      showSuccessToast("提交成功");
    }
  });
};
init();
</script>

<style scoped lang="less">
header {
  margin: 10px;
}
.questionInfo {
  margin-top: 20px;
  width: 80%;
  display: flex;
  justify-content: space-around;
}
.mainContainer {
  margin-top: 50px;
}
</style>
