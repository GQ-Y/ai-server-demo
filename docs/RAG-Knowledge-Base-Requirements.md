# RAG 风险质量隐患知识库系统需求文档

**项目：** Risk-Quality-Hazard-Knowledge-RAG  
**版本：** v1.0  
**日期：** 2026-04-01  
**状态：** 规划中

---

## 1. 项目概述

### 1.1 背景
当前隐患检查系统依赖人工录入和静态查询，缺乏智能检索和关联分析能力。通过引入 RAG（Retrieval-Augmented Generation）知识库系统，实现隐患数据的智能化管理、检索和分析。

### 1.2 目标
构建一个基于 RAG 技术的风险质量隐患知识库系统，实现：
- 隐患数据的向量化存储与语义检索
- AI 驱动的智能问答与知识推荐
- 多维度隐患关联分析与风险预警

### 1.3 核心价值
| 维度 | 提升效果 |
|-----|---------|
| 检索效率 | 从关键词匹配升级为语义理解，准确率提升 60%+ |
| 知识复用 | 历史隐患案例自动推荐，减少重复工作 |
| 风险预警 | 基于相似案例的风险等级智能评估 |
| 决策支持 | AI 生成处置建议与规范依据 |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端交互层                                │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ 隐患录入界面  │  │ AI 对话检索框 │  │ 知识图谱可视化      │ │
│  └──────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API 网关层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ /api/query   │  │ /api/chat    │  │ /api/ingest         │ │
│  │ 语义检索接口  │  │ 对话接口      │  │ 数据导入接口        │ │
│  └──────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       RAG 核心层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ 向量数据库    │  │ Embedding    │  │ 重排序(Reranker)   │ │
│  │ (Milvus/    │  │ 模型         │  │ 模型               │ │
│  │  Chroma)    │  │ (BGE/Zhipu)  │  │ (Cross-Encoder)    │ │
│  └──────────────┘  └──────────────┘  └─────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              LLM 推理层 (Gemini/Claude/本地模型)           │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据源层                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ XLSX 隐患库表 │  │ 文档资料     │  │ 规范标准库          │ │
│  │ (历史数据)    │  │ (PDF/Word)  │  │ (行业法规)          │ │
│  └──────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈选型

| 组件 | 选型方案 | 备选方案 |
|-----|---------|---------|
| 向量数据库 | Milvus / Chroma | Pinecone, Weaviate |
| Embedding 模型 | BGE-large-zh | Zhipu-embedding, OpenAI |
| Reranker 模型 | bge-reranker-large | Cross-Encoder |
| LLM | Gemini 1.5 Pro | Claude 3.5, Qwen-72B |
| 框架 | LangChain / LlamaIndex | 自研 RAG Pipeline |
| 后端 | FastAPI (Python) | Node.js + Express |
| 前端 | React (现有项目) | Vue3 |

---

## 3. 功能需求

### 3.1 数据导入模块

#### 3.1.1 XLSX 隐患库导入
**需求描述：**
- 支持标准格式的 XLSX 隐患数据表导入
- 自动解析字段：隐患编号、描述、类型、等级、位置、整改措施、图片等
- 智能分块策略：按隐患记录为单位进行向量化

**接口定义：**
```typescript
POST /api/ingest/xlsx
Content-Type: multipart/form-data

Request:
{
  file: File,              // XLSX 文件
  mapping?: {              // 字段映射（可选）
    hazardId: string,      // 隐患编号字段名
    description: string,   // 隐患描述字段名
    type: string,          // 隐患类型字段名
    level: string,         // 隐患等级字段名
    location: string,      // 位置字段名
    solution: string,      // 整改措施字段名
    images?: string        // 图片字段名
  },
  metadata?: {             // 附加元数据
    projectName: string,
    uploadDate: string,
    source: string
  }
}

Response:
{
  success: boolean,
  imported: number,        // 成功导入记录数
  failed: number,          // 失败记录数
  errors?: Array<{         // 错误详情
    row: number,
    message: string
  }>,
  jobId: string            // 异步任务ID（大数据量）
}
```

#### 3.1.2 文档资料导入
**需求描述：**
- 支持 PDF、Word、TXT 等文档格式
- 自动文本提取和分块
- 支持图文混合内容的处理

**接口定义：**
```typescript
POST /api/ingest/documents
Content-Type: multipart/form-data

Request:
{
  files: File[],           // 多文件上传
  chunkSize?: number,      // 分块大小（默认 500 tokens）
  overlap?: number,        // 重叠大小（默认 50 tokens）
  metadata?: {
    category: string,      // 文档分类
    tags: string[]         // 标签
  }
}
```

### 3.2 AI 对话检索模块

#### 3.2.1 智能问答对话框
**需求描述：**
- 类似 ChatGPT 的对话界面
- 支持上下文多轮对话
- 引用来源展示（可追溯原始隐患记录）

**界面原型：**
```
┌─────────────────────────────────────────────┐
│  🤖 AI 隐患知识助手                          │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 用户：有哪些高处作业的典型案例？      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🤖 根据知识库检索，找到 3 个相关案例：│    │
│  │                                     │    │
│  │ 案例 1：工地脚手架未设置防护栏杆      │    │
│  │ 【来源：隐患编号 H-2024-0032】        │    │
│  │ 风险等级：高风险                       │    │
│  │ 整改措施：立即设置双道防护栏杆...      │    │
│  │                                     │    │
│  │ [查看详情] [相似案例] [生成报告]      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 用户：这些案例的处罚依据是什么？      │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│ 📝 输入问题...                    [发送]    │
└─────────────────────────────────────────────┘
```

**接口定义：**
```typescript
POST /api/chat
Content-Type: application/json

Request:
{
  message: string,         // 用户输入
  conversationId?: string, // 对话ID（新对话不传）
  context?: {              // 上下文配置
    useKnowledgeBase: boolean,  // 是否使用知识库
    filterByProject?: string,   // 按项目筛选
    filterByType?: string[],    // 按隐患类型筛选
    filterByLevel?: string[]    // 按等级筛选
  }
}

Response:
{
  message: string,         // AI 回复
  conversationId: string,  // 对话ID
  sources?: Array<{         // 引用来源
    id: string,            // 隐患/文档ID
    type: 'hazard' | 'document',
    title: string,
    content: string,       // 相关片段
    score: number,         // 相似度得分
    metadata: object       // 完整元数据
  }>,
  suggestions?: string[],    // 建议追问
  actions?: Array<{         // 可执行操作
    type: 'view' | 'generate' | 'compare',
    label: string,
    params: object
  }>
}
```

#### 3.2.2 语义检索接口
**需求描述：**
- 支持自然语言查询（非关键词匹配）
- 混合检索：向量相似度 + 关键词 BM25
- 多路召回 + Reranker 精排

**接口定义：**
```typescript
POST /api/query
Content-Type: application/json

Request:
{
  query: string,           // 查询语句
  topK?: number,           // 返回数量（默认 10）
  useHybrid?: boolean,     // 混合检索（默认 true）
  filters?: {
    project?: string,
    type?: string[],
    level?: string[],
    dateRange?: [string, string]
  },
  rerank?: boolean         // 是否重排序（默认 true）
}

Response:
{
  results: Array<{
    id: string,
    type: 'hazard' | 'document',
    title: string,
    content: string,
    vectorScore: number,   // 向量相似度
    keywordScore?: number, // 关键词得分（混合检索时）
    finalScore: number,    // 最终得分
    metadata: {
      hazardId?: string,
      type?: string,
      level?: string,
      location?: string,
      images?: string[],
      ...
    },
    highlights?: string[]  // 高亮片段
  }>,
  total: number,
  queryTime: number        // 检索耗时(ms)
}
```

### 3.3 知识管理模块

#### 3.3.1 知识图谱可视化
**需求描述：**
- 隐患关联关系图谱
- 支持点击节点查看详情
- 关系类型：相似隐患、同位置隐患、同类型隐患等

#### 3.3.2 知识库统计看板
**需求描述：**
- 隐患类型分布
- 风险等级趋势
- 高频隐患 TOP10
- 知识库覆盖度分析

---

## 4. 数据模型

### 4.1 隐患知识条目 Schema

```typescript
interface HazardKnowledge {
  id: string;                    // 唯一ID (UUID)
  hazardId: string;              // 隐患编号 (业务ID)
  
  // 核心内容（向量化字段）
  content: {
    description: string;         // 隐患描述
    analysis?: string;           // 原因分析
    solution: string;            // 整改措施
    prevention?: string;        // 预防措施
  };
  
  // 结构化字段（过滤/聚合用）
  metadata: {
    type: string;                // 隐患类型 (高处作业/临时用电/机械设备...)
    level: 'low' | 'medium' | 'high' | 'critical';  // 风险等级
    category: string;            // 专业分类
    location: {
      project: string;          // 所属项目
      area?: string;            // 区域/标段
      position?: string;        // 具体位置
    };
    images?: string[];          // 关联图片URL
    documents?: string[];       // 关联文档
    
    // 时间信息
    discoveredAt: string;       // 发现时间
    rectifiedAt?: string;       // 整改完成时间
    
    // 责任信息
    responsible?: {
      unit: string;             // 责任单位
      person?: string;          // 责任人
    };
    
    // 来源信息
    source: {
      type: 'xlsx' | 'manual' | 'api';
      filename?: string;
      uploadDate: string;
    };
    
    // 标签
    tags: string[];
  };
  
  // 向量表示
  embedding?: number[];         // 向量数据（通常不直接返回）
  
  // 关联关系
  relations?: {
    similar?: string[];         // 相似隐患ID
    related?: string[];         // 相关隐患ID
  };
  
  // 系统字段
  createdAt: string;
  updatedAt: string;
  version: number;              // 版本（支持更新）
}
```

### 4.2 对话记录 Schema

```typescript
interface Conversation {
  id: string;
  title: string;                // 对话标题（自动生成或用户设置）
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    sources?: string[];          // 引用的知识ID
    timestamp: string;
  }>;
  context?: object;              // 对话上下文配置
  createdAt: string;
  updatedAt: string;
}
```

---

## 5. 非功能需求

### 5.1 性能指标

| 指标 | 目标值 | 说明 |
|-----|--------|------|
| 检索响应时间 | < 500ms | P95 语义检索 |
| 导入处理速度 | > 100条/秒 | XLSX 批量导入 |
| 并发支持 | > 50 QPS | 对话接口 |
| 向量维度 | 1024 | BGE-large-zh |

### 5.2 准确率目标

| 场景 | 目标准确率 |
|-----|-----------|
| 语义检索 TOP5 | > 85% |
| 问答相关度 | > 80% |
| 意图识别 | > 90% |

### 5.3 安全与权限

- 隐患数据分级访问控制
- 敏感信息脱敏处理
- API 接口鉴权
- 操作审计日志

---

## 6. 实施计划

### 6.1 阶段划分

```
Phase 1: 基础架构 (2周)
├── 向量数据库部署
├── Embedding 服务搭建
└── 基础 API 开发

Phase 2: 数据导入 (1周)
├── XLSX 解析模块
├── 数据清洗与分块
└── 批量导入工具

Phase 3: 检索与对话 (2周)
├── 语义检索接口
├── RAG Pipeline 搭建
└── AI 对话界面

Phase 4: 集成与优化 (1周)
├── 前端集成
├── 性能优化
└── 准确率调优

Phase 5: 测试上线 (1周)
├── 功能测试
├── 用户验收
└── 正式上线
```

### 6.2 待决策事项

| 事项 | 选项 | 建议 |
|-----|------|------|
| 向量数据库 | Milvus vs Chroma | 数据量大选 Milvus |
| Embedding | 本地 vs API | 隐私要求高选本地 |
| LLM | Gemini vs Claude | Gemini 性价比高 |
| 部署 | 本地 vs 云端 | 混合部署 |

---

## 7. 附录

### 7.1 术语表

| 术语 | 说明 |
|-----|------|
| RAG | Retrieval-Augmented Generation，检索增强生成 |
| Embedding | 文本向量化表示 |
| Vector DB | 向量数据库，存储高维向量数据 |
| Reranker | 重排序模型，精排检索结果 |
| Chunking | 文档分块策略 |

### 7.2 参考资源

- [BGE Embedding 模型](https://github.com/FlagOpen/FlagEmbedding)
- [Milvus 向量数据库](https://milvus.io/)
- [LangChain RAG 指南](https://python.langchain.com/docs/use_cases/question_answering/)
- [Gemini API 文档](https://ai.google.dev/docs)

---

**下一步讨论要点：**
1. 向量数据库选型确认（Milvus vs Chroma）
2. Embedding 模型部署方式（本地 vs API）
3. XLSX 数据样例提供
4. 前端界面设计细化
5. 已有隐患数据规模确认
