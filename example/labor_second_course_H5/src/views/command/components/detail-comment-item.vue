<!-- 先获取维度主题后获取主题词汇 -->
<script setup lang="ts">
import {
  DimensionDetailComment,
  DimensionTopicItem,
  getDimensionTopic,
  getTopicCorpus,
  corpuesTypeMap,
  getTopicList,
  topicsItem,
} from "@/api/dimension";
import { useBoolean } from "@/hooks/common";
import useLoading from "@/hooks/useLoading";
import { TreeSelectItem } from "vant";
import { TreeSelectChild } from "vant/es";

const props = defineProps<{
  mailSelfThreshold: number;
  dimensionId: number;
  content: DimensionDetailComment["topics"];
  courseId: number;
}>();

type TopicItem = DimensionTopicItem & { chosen: boolean };
const XdLoading = defineAsyncComponent(
  () => import("@/components/loading/index.vue")
);

type TopicIdItem = {
  id: string;
  name: string;
};
// 维度主题
const TopicIdList = ref<string[]>([]);
// 评价维度tag列表
const TopicList = ref<topicsItem[]>([]);
// 点击tag
const chooseTopic = (chosenTopic: topicsItem) => {
  console.log(chosenTopic, "chooseTopic");

  chosenTopic.chosen = !chosenTopic.chosen;
  if (chosenTopic.chosen) {
    const { content, icon, description, topicId } = chosenTopic;
    props.content.push({
      id: topicId,
      icon,
      description,
      text: content + "",
      name: content + "",
    });
  } else {
    let dimensionIndex = props.content.findIndex(
      (item) => item.id === chosenTopic.id
    );
    props.content.splice(dimensionIndex, 1);
  }
};
// 随机选取五个元素
const getRandomElement = (arr: topicsItem[], count: number) => {
  const shuffled = arr.slice(0);
  for (let i = 0; i < count; i++) {
    // 生成一个随机索引
    const randomIndex = Math.floor(Math.random() * shuffled.length);
    // 添加随机元素到结果数组
    TopicIdList.value.push(shuffled[randomIndex].id + "");
    // 移除已经选择过的元素以避免重复
    shuffled.splice(randomIndex, 1);
  }
};
// 获取维度主题
const getTopicId = () => {
  getTopicList(props.dimensionId, {
    pageSize: 100,
    pageNum: 1,
    dimensionalityId: props.dimensionId,
    state: 1,
  }).then((res) => {
    const { success, data } = res;
    if (success) {
      if (data.list.length > 5) {
        getRandomElement(data.list, 5);
      } else {
        data.list.forEach((item) => {
          TopicIdList.value.push(item.id + "");
        });
      }
      TopicIdList.value.forEach((item) => initTopics(+item));
    }
  });
};
// 主题词汇
const initTopics = (topicId: number) => {
  return new Promise((resolve) => {
    getDimensionTopic(topicId, {
      pageNum: 1,
      pageSize: 100,
      state: 1,
      courseId: props.courseId,
      type: 1,
    }).then(({ data }) => {
      const { list = [] } = data;
      if (list && list.length) {
        const index = Math.floor(Math.random() * list.length);
        TopicList.value.push({ chosen: false, ...list[index], topicId });
        return list[index];
      }
      // TopicList.value.push({ chosen: false, ...list[index] });
      // list.forEach((item) => {
      //   TopicList.value.push({
      //     value: +item.id,
      //     text: item.content!,
      //   });
      // });
      // if (+total) {
      //   chooseTopic(TopicList.value[0]);
      //   TopicList.value[0].chosen = true;
      // }
      resolve(true);
    });
  });
};
// 删除已经选择的tag
const delEditedDimension = (deleteItem: TopicItem, index: number) => {
  const { id } = deleteItem;

  // 删除编辑框里的维度
  props.content.splice(index, 1);

  // 回显维度选择器中的维度
  const dimensionIndex = TopicList.value.findIndex((item) => item.id === id);
  TopicList.value[dimensionIndex].chosen = false;
};

// corpus相关逻辑
const corpusParams = reactive({
  topicId: "",
  topicName: "",
  chosenContentId: "",
});
const [corpusVisible, setVisible] = useBoolean(false);
const handleOpenCorpus = (id: string, name: string) => {
  corpusParams.topicId = id;
  corpusParams.topicName = name;
  loadCorpus();
  setVisible(true);
};
const corpusTreeSelectItems = ref<TreeSelectItem[]>([]);
const selectActiveTab = ref(0);
const { loading, setLoading } = useLoading(false);
const loadCorpus = () => {
  setLoading(true);
  const requests = [
    getTopicCorpus(corpusParams.topicId, {
      pageNum: 1,
      pageSize: 100,
      type: 2,
      state: 1,
    }),
    getTopicCorpus(corpusParams.topicId, {
      pageNum: 1,
      pageSize: 100,
      type: 1,
      state: 1,
    }),
  ];
  Promise.allSettled(requests)
    .then((res) => {
      res.forEach((item) => {
        if (item.status === "fulfilled") {
          const { list, total } = item.value.data;
          if (total !== "0") {
            const randomList = list.map((corpus) => ({
              id: corpus.id,
              text: corpus.content || "",
            }));
            randomList.sort(() => +Math.random - 0.5);
            const startIndex = Math.floor(
              Math.random() * +(randomList.length / 5).toFixed()
            );
            const endIndex =
              startIndex + 20 > randomList.length - 1
                ? randomList.length
                : startIndex + 20;
            const obj: TreeSelectItem = {
              text: corpuesTypeMap[list[0].type],
              children: randomList
                .slice(startIndex, endIndex)
                .sort(() => Math.random() - 0.5),
            };
            corpusTreeSelectItems.value.push(obj);
          }
        }
      });
    })
    .finally(() => {
      setLoading(false);
    });
};
const handleClickCorpusItem = (corpus: TreeSelectChild) => {
  const topic = props.content.find((item) => item.id === corpusParams.topicId);
  if (typeof topic !== "undefined") {
    topic!.text += corpus.text;
    corpusVisible.value = false;
  }
};

watch(
  () => corpusVisible.value,
  (newVal) => {
    if (!newVal) {
      corpusTreeSelectItems.value = [];
      corpusParams.chosenContentId = "";
      corpusParams.topicId = "";
      corpusParams.topicName = "";
    }
  }
);

const init = () => {
  getTopicId();
};

init();
</script>

<template>
  <div class="dimension-container">
    <!-- <section class="Comment-list">
            <div v-for="(item, index) in content" :key="index">
                <van-field
                    v-model="item.text"
                    rows="1"
                    :label="item.name"
                    autosize
                    type="textarea"
                    :placeholder="item.description"
                    label-align="top"
                >
                    <template #label>
                        <div class="dimention-tag">
                            {{ item.name }}
                            @vue-ignore
                            <van-icon name="clear" v-if="index" style="margin-left: 10px;" @click="delEditedDimension(item, index)" />
                        </div>
                    </template>
                </van-field>
                <t-icon class="corpusTrigger" @click="handleOpenCorpus(item.id as string, item.name)" icon="tabler:align-box-right-top-filled" />
            </div>
        </section> -->
    <section class="dimension-area">
      <!-- <span class="tip">评价维度</span> -->
      <div class="list-container">
        <div class="list">
          <div
            class="tag"
            v-for="(item, index) in TopicList"
            :key="index"
            :style="{
              width: 'max-content',
              marginRight: 'max-content',
              padding: 'max-content',
            }"
          >
            <!-- <van-dropdown-menu>
              <van-dropdown-item
                v-model="topicValue[index]"
                :options="TopicList"
                @open="initTopics(+item.id)"
                teleport="body"
              />
            </van-dropdown-menu> -->
            <div
              @click="chooseTopic(item)"
              :class="[item.chosen ? 'activeTopicBtn' : 'tag']"
            >
              {{ item.content }}
            </div>
          </div>
        </div>
      </div>
    </section>
    <van-popup
      v-model:show="corpusVisible"
      position="right"
      :style="{ width: '80%', height: '100%' }"
    >
      <van-tree-select
        v-model:active-id="corpusParams.chosenContentId"
        v-model:main-active-index="selectActiveTab"
        :items="corpusTreeSelectItems"
        :max="1"
        height="100%"
        @click-item="handleClickCorpusItem"
      >
      </van-tree-select>
    </van-popup>
    <XdLoading :visible="loading" />
  </div>
</template>

<style scoped lang="less">
.dimension-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 95%;
  margin: 30px 0 30px 5%;
  .Comment-list {
    .dimention-tag {
      font-size: 1.1em;
      font-weight: 600;
    }
    .corpusTrigger {
      font-size: 40px;
      color: rgb(26, 185, 151);
      position: relative;
      left: 90%;
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
    // height: 1.6em;
    display: flex;
    line-height: 1.6em;

    .tip {
      font-size: 22px;
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
        flex-wrap: wrap;
        .tag {
          font-size: 22px;
          background-color: rgba(237, 234, 234, 0.811);
          border-radius: 20px;
          margin: 4px;
          div {
            width: 110px;
          }
        }
        .activeTopicBtn {
          font-size: 22px;
          background-color: orange;
          color: white;
          border-radius: 20px;
          margin: 4px;
          div {
            width: 110px;
          }
        }
      }
    }
  }
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
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
:deep(.van-tree-select__item) {
  width: 80%;
  text-indent: 2em;
  line-height: 2.2em;
  margin-top: 35px;
}
:deep(.van-ellipsis) {
  white-space: normal;
}
</style>
