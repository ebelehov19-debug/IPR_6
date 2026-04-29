const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');

const app = express();

// 1. CORS: разрешаем только запросы с нашего домена (или оставьте '*' для разработки)
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// 2. Подключение к БД с пулом соединений
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'appdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'secret',
});

// 3. Подключение к Redis
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

// 4. Функция инициализации БД с повторными попытками
const initDB = async (retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS tasks (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    completed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Database initialized');
            return;
        } catch (err) {
            console.error(`DB init attempt ${i + 1} failed:`, err.message);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error('Could not connect to database after several retries');
            }
        }
    }
};

// 5. Подключение к Redis с повторными попытками
const connectRedis = async (retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await redisClient.connect();
            // Проверка связи
            await redisClient.ping();
            console.log('Redis connected');
            return;
        } catch (err) {
            console.error(`Redis connection attempt ${i + 1} failed:`, err.message);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error('Could not connect to Redis after several retries');
            }
        }
    }
};

// 6. Graceful shutdown (корректное завершение)
const gracefulShutdown = async () => {
    console.log('SIGTERM/SIGINT received, shutting down gracefully...');
    try {
        await redisClient.quit();
        console.log('Redis connection closed');
    } catch (err) {
        console.error('Error closing Redis:', err);
    }
    try {
        await pool.end();
        console.log('Database pool closed');
    } catch (err) {
        console.error('Error closing DB pool:', err);
    }
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// 7. Маршруты API

// Liveness probe (проверка, что процесс жив)
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Readiness probe (готов принимать трафик – зависят от БД и Redis)
app.get('/api/ready', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        await redisClient.ping();
        res.json({ status: 'ready' });
    } catch (err) {
        res.status(503).json({ status: 'not ready', error: err.message });
    }
});

app.get('/api/tasks', async (req, res) => {
    try {
        const cached = await redisClient.get('tasks');
        if (cached) {
            return res.json({ tasks: JSON.parse(cached), source: 'cache' });
        }

        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
        await redisClient.setEx('tasks', 30, JSON.stringify(result.rows));

        res.json({ tasks: result.rows, source: 'database' });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const result = await pool.query(
            'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
            [title]
        );

        await redisClient.del('tasks');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding task:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;
        const result = await pool.query(
            'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
            [completed, id]
        );

        await redisClient.del('tasks');

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        await redisClient.del('tasks');
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: err.message });
    }
});

// 8. Запуск сервера только после успешного подключения ко всем зависимостям
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await initDB();
        await connectRedis();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Backend server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
})();