import { getUserObjects } from "@/api/objectives/objectives";
import { defineStore } from "pinia";
import { showFailToast } from "vant";

/* function planObj<T>(arg: Array<T>):Array<T> {
    return arg
} */

interface objectives {
  total: number;
  list: Array<any>;
}

export const usePlanStore = defineStore("usePlanStore", {
  state: (): objectives => {
    return {
      total: 0,
      list: [],
    };
  },
  actions: {
    getObjectives() {
      getUserObjects().then((res: any) => {
        if (res.code == 200) {
          const { list, total } = res.data;
          this.total = total;
          this.list = list;
        } else {
          showFailToast("网络异常, 信息获取失败");
        }
      });
    },
  },
  getters: {},
});
