# 技术栈
- Vue3
- TypeScript
- Pinia
- Vue-router@4
- Vite
- Vant4
- WebSocket
- Axios
- Echarts
- GSAP3

# 开发须知

## 如何本地运行?
- 首先，手机和电脑连接同一个局域网，然后拿到本地局域网的ip。
- 接着去`vite.config.ts`这个文件, 将`host`修改为当前ip
- 如果开发期间要走授权登录, 还需要修改`.env.development`中`VITE_APP_REDIRECT_PATH`内ip为当前ip
- 修改完毕后, `npm run dev`

## 可以不在手机上运行吗?
**不可以! 移动端开发必须去真机运行看效果**，PC只是方便看调试数据，很多移动端的问题、包括系统兼容问题，只有在真机上才会暴露，所以**一切以真机结果为准**


# 图标集

除了Vant4组件提供的图标集外, 项目还使用了 [iconify/tabler](https://icon-sets.iconify.design/tabler/?category=General) 作为另一套图标集, 并使用iconify官方提供的 [iconify/vue](https://iconify.design/docs/icon-components/vue/) 组件进行引入

## 使用示例


```bash
# 首先安装图标组件和图标集
npm i @iconify/vue @iconify/icons-tabler
```

`main.ts`
```ts
// 在入口文件中全局引入 Icon 组件
import { Icon } from '@iconify/vue'

// 然后全局挂载
createApp(App)
  .component('t-icon', Icon)
  .mount("#app")
// 因为我们使用的是tabler图标集, 所以将组件重命名为 t-icon 以便区分
```

`component.vue`
```html
<!-- 然后在iconify/tabler中找到想要引入的图标， 复制name, 传入icon prop -->
<t-icon icon="tabler:4k-bold" />
```

## props
> 详情请见 [官方文档](https://iconify.design/docs/icon-components/vue/#properties), 这里提供中文版

**必填项**
- icon: `iconifyIcon|string`，所选icon的名字, 格式为 `iconset-name:icon-name`，即`图标集名:图标名`, 例如, 本项目中使用的是`tabler`图标集, 我需要使用其中名为`4k-bold`的图标。那么传给组件的icon的值就是`tabler:4k-bold`

> icon值的详细组成详见[官方文档](https://iconify.design/docs/icon-components/vue/#properties)

**常用可选项**
- inline: `boolean`，设置垂直对齐方式为`inline`
- width：`string|number`，图标的宽
- height: `string|number`, 图标的高
- horizontalFlip: `boolean` 水平翻转图标
- verticalFlip: `boolean`，垂直翻转图标
- filp: `string`, 自定义翻转模式，值参考css对应属性
- rotate: `string`, 渲染角度
- color: `string`, 图标颜色
- onLoad: `Functon`, 图标完成加载时触发的回调方法

> 除此之外，图标组件还接收常见的其他属性和原生事件, 例如`onClick (vue中为click)`等。所有传入的属性和事件, 都会被传入给渲染出的`Svg`元素


## 其他
详见项目组的飞书文档