<script setup lang="ts">
import { SuggestionContentItem, DimensionCommentItem } from "@/api/dimension";
import { getCommentTopics } from "@/api/courses/courses";
import { debounce } from "@/utils/freqCtrl/freqCtrl";
import { useUserStore } from "@/store/modules/user";

type topicsItem = DimensionCommentItem & { chosen: boolean };

const props = defineProps<{
  courseId: number;
  mailSelfThreshold: number;
}>();

const emits = defineEmits<{
  (e: "onChange", value: SuggestionContentItem[], wordsNum: number): void;
}>();

// 评价维度tag列表
const dimensionList = ref<topicsItem[]>([]);
const initTopics = () => {
  return new Promise((resolve, reject) => {
    const requests = [getCommentTopics(0)];
    // userStore.departmentId && requests.push(getCommentTopics(userStore.departmentId))
    Promise.allSettled(requests)
      .then((res) => {
        const data: topicsItem[] = [];
        res.forEach((item) => {
          // @ts-ignore
          const { status, value } = item;
          if (status === "fulfilled") {
            const { list } = value.data;
            list.forEach((tag) => {
              data.push({
                ...tag,
                chosen: false,
              });
            });
          }
        });
        dimensionList.value = data;
        resolve(true);
      })
      .catch(() => {
        reject();
      });
  });
};

// 用户评论列表
const contentList = ref<SuggestionContentItem[]>([]);

// 选择tag进行评价
const chooseTag = (chosenTag: (typeof dimensionList.value)[0]) => {
  chosenTag.chosen = true;
  contentList.value.push({
    id: chosenTag.id as string,
    course_evaluate_id: +props.courseId,
    name: chosenTag.name,
    text: "",
    icon: chosenTag.icon,
    description: chosenTag.description,
  });
};

// 删除已经选择的tag
const delEditedDimension = (
  deleteItem: SuggestionContentItem,
  index: number
) => {
  const { id } = deleteItem;

  // 删除编辑框里的维度
  contentList.value.splice(index, 1);

  // 回显维度选择器中的维度
  const dimensionIndex = dimensionList.value.findIndex(
    (item) => item.id === id
  );
  dimensionList.value[dimensionIndex].chosen = false;

  const wordNum = contentList.value.reduce(
    (acc, cur) => acc + cur.text.length,
    0
  );
  emits(
    "onChange",
    contentList.value.filter((topic) => topic.text),
    wordNum
  );
};

const contentWordsNum = computed(() => {
  return contentList.value.reduce((acc, cur) => acc + cur.text.length, 0);
});

const updateContent = debounce(() => {
  emits("onChange", contentList.value, contentWordsNum.value);
});

const init = () => {
  initTopics()
    .then(() => {
      // const fir = dimensionList.value.shift();
      // chooseTag(fir as (typeof dimensionList.value)[0]);
    })
    .catch(() => {
      dimensionList.value.push({
        icon: "",
        id: "5",
        departmentId: "0",
        name: "参与体验",
        description: "请描述你在这次课程中的参与感受",
        chosen: true,
      });
    });
};

init();
</script>

<template>
  <div class="dimension-container">
    <section v-if="props.mailSelfThreshold" class="words-length-tip">
      <span v-show="contentWordsNum < props.mailSelfThreshold"
        >还差{{
          props.mailSelfThreshold - contentWordsNum
        }}字可填写未来寄语</span
      >
      <span v-show="contentWordsNum >= props.mailSelfThreshold"
        >快去给未来的自己写一点寄语吧</span
      >
    </section>
    <section class="dimension-area">
      <span class="tip">评价维度</span>
      <div class="list-container">
        <div class="list">
          <div
            class="tag"
            v-for="(item, index) in dimensionList"
            :key="index"
            :style="{
              width: `${!item.chosen ? 'max-content' : '0px'}`,
              marginRight: `${!item.chosen ? 10 : 0}px`,
              padding: `${!item.chosen ? '0 12px' : '0 0'}`,
            }"
          >
            <div class="tag" v-show="!item.chosen" @click="chooseTag(item)">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="Comment-list">
      <div v-for="(item, index) in contentList" :key="index">
        <van-field
          v-model="item.text"
          rows="1"
          :label="item.name"
          autosize
          type="textarea"
          :placeholder="item.description"
          label-align="top"
          @update:model-value="updateContent"
        >
          <template #label>
            <div class="dimention-tag">
              {{ item.name }}
              <van-icon
                name="clear"
                style="margin-left: 10px"
                @click="delEditedDimension(item, index)"
              />
            </div>
          </template>
        </van-field>
      </div>
    </section>
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
      font-size: 1.1em;
      font-weight: 600;
    }
    .confirmBtn {
      float: right;
      width: 100px;
      color: orange;
      border: none;
    }
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
          background-color: rgba(237, 234, 234, 0.811);
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
