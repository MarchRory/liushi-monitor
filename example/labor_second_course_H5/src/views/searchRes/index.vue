<script setup lang="ts">
import { getCourses } from '@/api/courses/courses';
import { useBoolean } from '@/hooks/common'
import { CourseStateEnum } from '@/api/types/public';
import { HeaderDefaultAction } from '@/components/header/types';
import { showFailToast } from 'vant';
import { debounce } from '@/utils/freqCtrl/freqCtrl';
import { registerTimingLog } from '@/utils/logger/hooks';

const XdHeader = defineAsyncComponent(() => import('@/components/header/index.vue'))
const SearchResWaterfall = defineAsyncComponent(() => import('@/components/waterFall/index.vue'))

const searchParams = ref({
  title: '',
  state: CourseStateEnum.all,
  reviewed: 0,
})

const [isSearch, setSearchState] = useBoolean(false)
const keywords = ref('')

const handleInput = debounce((e: Event) => {
  keywords.value = (e.target as HTMLInputElement).value
  if (!keywords.value) {
    setSearchState(false)
  }
})
const search = () => {
  if (keywords.value) {
    searchParams.value.title = keywords.value
    setSearchState(true)
  }else {
    showFailToast('请先输入查询关键词')
  }
}
const actions: HeaderDefaultAction[] = [
  { icon: 'tabler:search', trigger: search}
]

registerTimingLog()
</script>

<template>
  <div class="search-container">
    <XdHeader :actions="actions">
      <template #center>
        <input type="text" @input="handleInput" placeholder="课程名查询">
      </template>
    </XdHeader>
    <main>
      <!--占位, 未来有可能换成别的, 比如推荐、榜单啥的, 到时候换成组件就行-->
      <div 
        v-if="!isSearch"
        class="search-seat"
      >
      输入关键词开始搜索吧
      </div>
      <SearchResWaterfall v-else="isSearch" :request-api="getCourses" :other-request-params="searchParams" />
    </main>
  </div>
</template>

<style scoped lang="less">
.search-container {
  padding: 0 20px;
  width: calc(100% - 40px);
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  main {
    width: 100%;
    flex: 1;
    overflow-y: scroll;
    .search-seat {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: gray;
    }
  }
}
input {
  display: flex;
  align-items: center;
  flex: 1;
  width: auto;
  height: 50px;
  padding-left: 20px;
  border-radius: 15px;
  background-color: #f1f1f1;
  border: 0px;
  font-size: 1em;
  color: rgb(167, 167, 167);
}
</style>