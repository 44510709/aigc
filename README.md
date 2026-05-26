# AI Studio Frontend

轻量 Vue3 + Vite 前端项目，内置中英文切换、基础路由、Axios 请求层和 Element Plus 按需导入。

## 技术栈

- Vue 3
- Vite
- Vue Router
- Vue I18n
- Axios
- Element Plus

## 目录结构

```text
src/
  api/              Axios 实例和业务接口模块
  components/       通用组件
  i18n/             中英文语言包
  layouts/          页面布局
  pages/            路由页面
  router/           路由配置
  utils/            演示数据和纯工具
```

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址为 `http://127.0.0.1:5173/`。

## 构建

```bash
npm run build
```

## 接口配置

复制 `.env.example` 为 `.env.local`，按环境修改接口地址：

```bash
VITE_API_BASE_URL=https://api.example.com
```

请求实例在 `src/api/http.js`，业务接口按模块放在 `src/api/modules/`。
