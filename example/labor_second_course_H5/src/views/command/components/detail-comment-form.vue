<script setup lang="ts">
import { DimensionDetailComment, TopicCommentItem } from "@/api/dimension";
import type { CourseDimensionality } from "@/api/types/courses/index";
import { debounce } from "@/utils/freqCtrl/freqCtrl";

const props = defineProps<{
  courseId: number;
  mailSelfThreshold: number;
  courseDimensionInfo: CourseDimensionality[];
}>();

const emits = defineEmits<{
  (e: "onChange", value: TopicCommentItem[], wordsNum: number): void;
}>();

const DimensionTopicCommentItem = defineAsyncComponent(
  () => import("./detail-comment-item.vue")
);
const commentResList = ref<DimensionDetailComment[]>([]);
watch(
  () => props.courseDimensionInfo,
  (newVal) => {
    commentResList.value = newVal.map((dimension) => ({
      dimension_Id: dimension.id,
      dimension_name: dimension.name,
      topics: [],
    }));
  },
  { deep: true, immediate: true }
);

const contentWordsNum = computed(() => {
  return commentResList.value.reduce(
    (acc, cur) => acc + cur.topics.reduce((a, c) => a + c.text.length, 0),
    0
  );
});
watch(
  () => commentResList.value,
  debounce((newVal) => {
    let wordNum = 0;
    const topicComment: TopicCommentItem[] = [];
    for (const dimension of newVal) {
      const { topics } = dimension;
      for (const topic of topics) {
        wordNum += topic.text.length || 0;
        topicComment.push({
          id: topic.id,
          icon: "",
          name: topic.name,
          text: topic.text,
        });
      }
    }
    emits("onChange", topicComment, wordNum);
  }, 500),
  { deep: true }
);
</script>

<template>
  <div class="dimension-container">
    <!-- 原来的按方法与技能等三个模块构建的评价 -->
    <section class="Comment-list">
      <div
        v-for="(dimension, index) in commentResList"
        :key="index"
        class="comment-item"
      >
        <span class="dimention-tag">
          <t-icon icon="tabler:topology-ring-2" />
          {{ dimension.dimension_name }}
        </span>
        <DimensionTopicCommentItem
          :dimensionId="+dimension.dimension_Id"
          :content="dimension.topics"
          :mail-self-threshold="50"
          :courseId="props.courseId"
        />
      </div>
    </section>
    <!-- <section class="words-length-tip">
      <span v-show="contentWordsNum < props.mailSelfThreshold"
        >还差{{
          props.mailSelfThreshold - contentWordsNum
        }}字可填写未来寄语</span
      >
      <span v-show="contentWordsNum >= props.mailSelfThreshold"
        >快去给未来的自己写一点寄语吧</span
      >
    </section> -->
    <!-- <section class="buttonList">
      <div
        class="button-item"
        v-for="(dimension, index) in commentResList"
        :key="index"
      >
        <DimensionTopicCommentItem
          :dimension-id="dimension.dimension_Id"
          :content="dimension.topics"
          :mail-self-threshold="50"
        />
      </div> -->
    <!----<div class="commentText"></div>-->
    <!-- </section> -->
  </div>
</template>

<style scoped lang="less">
.dimension-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  .Comment-list {
    .dimention-tag {
      float: left;
    }
  }
  .buttonList {
    width: 100%;
    border: solid 1px rgb(185, 176, 158);
  }
  .commentText {
    margin-top: -1em;
    width: 100%;
    height: 2em;
    border: solid 1px orange;
    border-radius: 5px;
  }
  .words-length-tip {
    margin-bottom: 15px;
    font-size: 25px;
    width: 100%;
    text-align: right;
    color: rgb(168, 168, 168);
  }
  .dimension-area {
    width: 100%;
    height: 1.6em;
    display: flex;
    line-height: 1.6em;
    .tip {
      width: fit-content;
      margin-right: 15px;
    }
    .list-container {
      flex: 1;
      height: 100%;
      overflow-x: auto;
      .list {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        .tag {
          font-size: 0.85em;
          background-color: rgb(242, 242, 242);
          border-radius: 20px;
          div {
            width: max-content;
          }
        }
      }
    }
  }
}

:deep(.van-cell) {
  padding: 10px 0;
}
:deep(.van-field__body) {
  height: auto;
  .van-field__control {
    font-size: 1.2em;
    font-weight: 400;
  }
}
:deep(textarea) {
  display: flex;
  align-items: flex-start;
  width: 94%;
  text-indent: 2.4em;
  margin: 0 auto;
  min-height: 200px;
  height: auto;
  word-wrap: break-word;
  word-break: break-word;
}
</style>
