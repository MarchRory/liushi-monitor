export interface badgeItem {
  type: string;
  name: string;
  isGain: boolean;
  icon: string;
  minPoint: number;
  condition: string;
  activeColor: string;
  imgSrc?: string;
}

export const tempBadgeList: badgeItem[] = [
  {
    type: "积分",
    name: "初出茅庐",
    icon: "ph:sword",
    isGain: false,
    minPoint: 0,
    condition: "新用户创建",
    activeColor: "#bda272",
  },
  {
    type: "积分",
    name: "勤劳笃志",
    icon: "vaadin:sword",
    isGain: false,
    minPoint: 100,
    condition: "积分达到100",
    activeColor: "#29c224",
  },
  {
    type: "积分",
    name: "劳碌奋发",
    icon: "game-icons:winged-sword",
    isGain: false,
    minPoint: 200,
    condition: "积分达到200",
    activeColor: "#5099e7",
  },
  {
    type: "积分",
    name: "劳心者成",
    icon: "humbleicons:crown",
    isGain: false,
    minPoint: 260,
    condition: "积分达到260",
    activeColor: "#23beb8",
  },
  {
    type: "积分",
    name: "劳动之星",
    icon: "game-icons:queen-crown",
    isGain: false,
    minPoint: 300,
    condition: "积分达到300",
    activeColor: "#f27e2c",
  },
  {
    type: "积分",
    name: "劳动之星",
    icon: "emojione-monotone:crown",
    isGain: false,
    minPoint: 400,
    condition: "积分达到400",
    activeColor: "#f27e2c",
  },
  {
    type: "Flag",
    name: "坚持不渝",
    icon: "mynaui:leaf",
    isGain: false,
    minPoint: 5,
    condition: "完成5个课程Flag",
    activeColor: "#1ba784",
  },
  {
    type: "Flag",
    name: "持之以恒",
    icon: "icon-park-outline:sapling",
    isGain: false,
    minPoint: 10,
    condition: "完成10个课程Flag",
    activeColor: "#ee4863",
  },
  {
    type: "Flag",
    name: "超世之才",
    icon: "game-icons:bonsai-tree",
    isGain: false,
    minPoint: 15,
    condition: "完成15个课程Flag",
    activeColor: "#bda272",
  },
  {
    type: "Mail",
    name: "未来可期",
    icon: "lucide:fish",
    isGain: false,
    minPoint: 3,
    condition: "已发送3个时光信件",
    activeColor: "#b78b26",
  },
  {
    type: "Mail",
    name: "似水流年",
    icon: "fluent-emoji-high-contrast:shark",
    isGain: false,
    minPoint: 5,
    condition: "已发送5个时光信件",
    activeColor: "#5698c3",
  },
  {
    type: "Mail",
    name: "锦绣前程",
    icon: "game-icons:sperm-whale",
    isGain: false,
    minPoint: 10,
    condition: "已发送10个时光信件",
    activeColor: "#c08eaf",
  },
];
