import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = parseInt(process.env.SERVER_PORT || '3001', 10);

app.use(cors({ origin: '*' }));
app.use(express.json());

// 请求日志中间件
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/chat', chatRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[server] Express API 运行在 http://localhost:${PORT}`);
});
