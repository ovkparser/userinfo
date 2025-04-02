import express from 'express';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Разрешаем CORS для локальной разработки
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Эндпоинт для проксирования запросов к API OpenVK
app.get('/api/users', async (req, res) => {
    try {
        const { user_ids, fields, access_token } = req.query;
        const apiUrl = new URL('https://ovk.to/method/users.get');
        
        // Добавляем все нужные поля явно
        apiUrl.searchParams.set('access_token', access_token);
        apiUrl.searchParams.set('user_ids', user_ids);
        apiUrl.searchParams.set('fields', [
            'photo_200', 'status', 'city', 'bdate', 'photo_max', 'online',
            'verified', 'sex', 'relation', 'relation_partner',
            'contacts', 'site', 'education', 'universities', 'schools',
            'followers_count', 'counters', 'home_town', 'mobile_phone',
            'home_phone', 'activities', 'interests', 'music', 'movies',
            'tv', 'books', 'games', 'quotes', 'about', 'timezone',
            'screen_name', 'maiden_name', 'occupation', 'personal',
            'connections', 'exports', 'wall_default'
        ].join(','));
        apiUrl.searchParams.set('v', '5.131');

        console.log('Запрос к API OpenVK:', apiUrl.toString());
        
        const response = await fetch(apiUrl.toString());
        const data = await response.json();
        
        console.log('Ответ API OpenVK:', JSON.stringify(data, null, 2));
        
        if (data.error) {
            return res.status(400).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Ошибка сервера:', error);
        res.status(500).json({ error: { error_msg: error.message } });
    }
});

// Хуета для резолва никнейма
app.get('/api/resolve', async (req, res) => {
    try {
        const { screen_name, access_token } = req.query;
        const apiUrl = new URL('https://ovk.to/method/utils.resolveScreenName');
        
        apiUrl.searchParams.set('access_token', access_token);
        apiUrl.searchParams.set('screen_name', screen_name);
        apiUrl.searchParams.set('v', '5.131');

        console.log('Запрос резолва:', apiUrl.toString());
        
        const response = await fetch(apiUrl.toString());
        const data = await response.json();
        
        console.log('Ответ резолва:', data);
        res.json(data);
    } catch (error) {
        console.error('Ошибка резолва:', error);
        res.status(500).json({ error: { error_msg: error.message } });
    }
});

// Добавляем новый эндпоинт для получения записей со стены
app.get('/api/wall.get', async (req, res) => {
    try {
        const { owner_id, count, access_token } = req.query;
        const apiUrl = new URL('https://ovk.to/method/wall.get');
        
        apiUrl.searchParams.set('access_token', access_token);
        apiUrl.searchParams.set('owner_id', owner_id);
        apiUrl.searchParams.set('count', count);
        apiUrl.searchParams.set('extended', '1');
        apiUrl.searchParams.set('v', '5.131');

        const response = await fetch(apiUrl.toString());
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Ошибка получения записей:', error);
        res.status(500).json({ error: { error_msg: error.message } });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
