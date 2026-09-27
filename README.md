# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。

## 主备控交接台（舞台预览 `/preview`）

演出时主控电脑卡死、备用电脑不知演到哪里的问题，由「主备控交接台」解决：

- **双控台状态**：主控台 / 备控台各自展示当前场景、播放时刻、同步批次。
- **落后标记**：主控调整场景或播放时刻后同步批次 +1，备控自动标出「落后 N 批」。
- **同步备控**：主控点击「同步备控」，两侧场景、时刻、批次取齐，备控解除锁定。
- **接管校验**：批次不一致时拒绝接管，并指出哪台控台落后、落后几个批次；批次一致才允许接管。
- **接管锁定**：接管成功后原主控暂时失去控制，再次同步前无法操作。
- **持久化**：交接状态与交接记录写入 localStorage，离开页面再回来仍在；多标签页通过 storage 事件实时同步，可开两个窗口模拟主备两台电脑。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20113>



## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`



## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Redux Toolkit + IndexedDB |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`


## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FixtureType: constants/FixtureType、types/FixtureType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- CueStatus: constants/CueStatus、types/CueStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ChannelMode: constants/ChannelMode、types/ChannelMode、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ConsoleRole: constants/ConsoleRole、types/ConsoleRole、constructors/HandoverConstructor、services/handoverService、stores/HandoverStore、components/common/ConsolePanel、pages（舞台预览交接台）均有引用。
- 交接日志模板: constants/handoverLogTemplates（BOOT/ADJUST/SYNC/TAKEOVER/TAKEOVER_REJECTED/RESET），被 constructors、services、stores、components/common/HandoverLogList 引用。
- 交接错误码: constants/errorCodes 与 constants/errorMessages 中的 HANDOVER_* 条目，由 services/handoverService 抛出、stores/HandoverStore 包装提示。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
