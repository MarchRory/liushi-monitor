import { getMailToSelfList } from "@/api/user/user";
import { defineStore } from "pinia";

export const useMailStore = defineStore("useMailStore", {
  state: () => {
    return {
      mailTotal: 0,
    };
  },
  actions: {
    updateMailTotal() {
      getMailToSelfList({ pageSize: 100 }).then(({ data }) => {
        this.mailTotal = Number(data.total);
      });
    },
  },
});
