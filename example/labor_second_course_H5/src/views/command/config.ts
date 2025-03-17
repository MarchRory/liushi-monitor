import { BaseProgressNode } from "@/components/progressBar/types";

export const starScoreTextMap = [
  { score: 0, text: "" },
  { score: 1, text: ["平平淡淡", "尚可满意", "还行吧", "些许满意"] },
  { score: 2, text: ["小有收获", "值得一提", "暖心一刻", "微妙惊喜"] },
  { score: 3, text: ["收获颇丰", "满载而归", "丰富体验", "欢乐时光"] },
  { score: 4, text: ["赞不绝口", "极力推荐", "回味无穷", "高度赞扬"] },
  { score: 5, text: ["下次还要来", "顶级体验", "百分百满意", "绝对再来"] },
];

export const tempCommentGoodNodes: BaseProgressNode[] = [
  { thresholdStep: 2, icon: "tabler:coins", tip: "5" },
  { thresholdStep: 4, icon: "tabler:coins", tip: "10" },
];
