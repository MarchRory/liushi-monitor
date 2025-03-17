<script setup lang="ts">
import { useUserStore } from "@/store/modules/user/index";
import { reactive } from "vue";
import router from "@/router";
import { showNotify } from "vant";
import { evaluationsCheckAll, getEvalutionsList } from "@/api/courses/courses";
import { EvalutionItem } from "@/api/types/courses";
import { formatCover } from "@/utils/course";
import { registerTimingLog } from "@/utils/logger/hooks";

defineOptions({
  name: "evalutions"
})

const XdHeader = defineAsyncComponent(() => import('@/components/header/index.vue'))
const EvalutionItem = defineAsyncComponent(() => import('./components/evaluation-card.vue'))
const defaultCover = ref("");
(async () => {
  let dc = await import("@/assets/imgs/Cool-Kids-Discussion.png");
  defaultCover.value = dc.default;
})();
const themeVars = reactive({
  navBarTextColor: "#e1562a",
  navBarIconColor: "#e1562a",
});
const EvaluationList = ref<EvalutionItem[]>([]);
const hasTotal = ref(-1);
const page = ref(1);
const pageSize = ref(10); // 关于刷新的Size选择, 先留着，后面看有没有什么对Size的一些处理需求
const reLoad = ref(false);
const listLoading = ref(false);
const loading = ref(false);
const finished = ref(false);
const userStore = useUserStore();
const openDetail = (courseId: string) => {
  router.push({ path: "/detail", query: { courseId } });
};
const readAll = () => {
    evaluationsCheckAll().then(({success}) => {
      if (success) {
        userStore.hasEvaluateUnRead = false;
        EvaluationList.value.forEach((item: EvalutionItem, index: number) => {
          if (!item.checked) {
            EvaluationList.value[index].checked = true;
          }
        });
        showNotify({
          type: "success",
          message: "一键已读完成",
          duration: 1 * 1000,
        });
      }
    });
};
const getEvalutionList = () => {
  if (!finished.value) {
    loading.value = true;
    getEvalutionsList({
      page: page.value,
      pageSize: pageSize.value,
    })
      .then((res) => {
        if (res.code == 200) {
          const { list, total } = res.data;
          hasTotal.value = total;

          // 没有考评消息
          if (total == 0) {
            finished.value = true;
            loading.value = false;
            return;
          }

          // 有考评消息
          if (EvaluationList.value.length < total) {
            list.forEach((item) => {
              item.score = 5 * (item.score / 100);
              EvaluationList.value.push({
                ...item,
                cover: formatCover(item.cover as unknown as string)
              });
            });
          }
        }
      })
      .then(() => {
        if (EvaluationList.value.length >= hasTotal.value) {
          finished.value = true;
        }
      })
      .finally(() => {
        loading.value = false;
      });
  }
};
getEvalutionList();

const refreshList = () => {
  page.value = 1;
  EvaluationList.value = [];
  finished.value = false;
  reLoad.value = true;
  (async () => {
    getEvalutionList();
  })().finally(() => {
    setTimeout(() => {
      reLoad.value = false;
    }, 400);
  });
};

const needReadAll = computed(() => {
  return EvaluationList.value.some((item) => !item.checked)
})

registerTimingLog()
</script>

<template>
  <div class="container">
    <van-config-provider :theme-vars="themeVars">
      <XdHeader title="考评信息">
        <template #right>
          <span v-if="needReadAll" @click="readAll">全部已读</span>
        </template>
      </XdHeader>
      <van-skeleton v-if="listLoading" id="reFreashSke">
        <template #template>
          <div
            :style="{
              display: 'flex',
              width: '90vw',
              justifyContent: 'flex-start',
              flexDirection: 'column',
            }"
          >
            <div style="display: flex">
              <div :style="{ flex: 1 }">
                <van-skeleton-paragraph
                  row-width="100%"
                  v-for="index in 3"
                  :key="index"
                />
              </div>
            </div>
          </div>
        </template>
      </van-skeleton>
      <div class="mainBox" v-else>
        <van-empty v-if="!hasTotal" description="当前暂无考评消息" />
        <div v-else class="list">
          <van-skeleton v-show="reLoad" id="reFreashSke">
            <template #template>
              <div
                :style="{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'flex-start',
                  flexDirection: 'column',
                }"
              >
                <van-skeleton-paragraph
                  row-width="100%"
                  v-for="index in 3"
                  :key="index"
                />
              </div>
            </template>
          </van-skeleton>
          <van-pull-refresh
            v-show="!reLoad"
            v-model="reLoad"
            @refresh="refreshList"
          >
            <van-list
              v-model:loading="loading"
              :finished="finished"
              finished-text="没有更多了"
              @load="getEvalutionList"
            >
              <van-cell
                v-for="(item, index) in EvaluationList"
                :key="index"
                @click="openDetail(item.courseId)"
                :style="{
                  backgroundColor: item.checked ? '#f1f1f1' : '#ffffff',
                }"
              >
              <EvalutionItem :evalution="item" />
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </div>
      </div>
    </van-config-provider>
  </div>
</template>

<style lang="less" scoped>
.container {
  width: 100vw;
  background: linear-gradient(to bottom, white 40%, rgb(245, 246, 248));
  .mainBox {
    width: 100vw;
    height: 100%;
    background-color: #f5f6f8;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    :deep(.van-pull-refresh) {
      overflow-y: auto;
      height: 100%;
    }

    .list {
      #reFreashSke {
        margin-top: 30px;
      }
    }
  }
}

:deep(.van-cell) {
  padding: 0;
}

:deep(.van-skeleton-paragraph) {
  background-color: #f1f1f1;
  width: 100%;
  height: calc((96.5vh - @xd-header-height) / 3);
  border-radius: 15px;
}
</style>
