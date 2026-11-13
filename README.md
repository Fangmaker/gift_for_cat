# 小猫的大理旅行助手

## 这是什么

大理自由行 AI 助手。纯前端单文件实现（`index.html` + `assets/` 素材），不依赖后端，打开网址输入访问密码即可使用。卫星底图上可看大理州行政区划、查天气、走路线、找美食住宿、排行程，还有一只沿屏幕边缘走动的桌面小猫「小咪」陪你聊天。

## 怎么打开

线上地址：https://fangmaker.github.io/gift_for_cat/

访问密码：`716`

页面设置面板里可填入自己的阿里云百炼 API Key，用于启用「小咪」的 AI 对话与语音朗读。

## 技术栈与目录

- Leaflet 卫星底图，州界与 12 个县市边界使用 GeoJSON，本地同源加载（`assets/dali_boundary_532900.json`、`assets/dali_counties_532900.json`），不依赖跨域接口
- 单文件 HTML/JS/CSS 实现，无构建步骤、无框架
- AI 对话接入阿里云百炼千问 API，Key 由使用者在页面设置里自行填写，只存浏览器 localStorage，不入库
- 根目录下的 `*.ps1` 与 `trans_patch.json` 是开发期补丁脚本，与运行无关，可忽略
