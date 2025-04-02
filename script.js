document.addEventListener('DOMContentLoaded', () => {
    const fetchBtn = document.getElementById('fetchBtn');
    const userUrl = document.getElementById('userUrl');
    const userData = document.getElementById('userData');
    const skeleton = document.querySelector('.skeleton');
    const userName = document.getElementById('userName');
    const userDetails = document.getElementById('userDetails');
    const userAvatar = document.getElementById('userAvatar');

    // Добавляем дефолтную аватарку как base64
    const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFMEUwRTAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyMCIgZmlsbD0iI0JEQkRCRCIvPjxwYXRoIGQ9Ik0yMCA4MEMyMCA2MCAzMCA1MCA1MCA1MEM3MCA1MCA4MCA2MCA4MCA4MEw4MCA5MEwyMCA5MEwyMCA4MFoiIGZpbGw9IiNCREJEQkQiLz48L3N2Zz4=';

    // Конфигурация API
    const API_TOKEN = '18343-01ca04d6-a6170c58-1dc48515-919bdfdd-e8d7f1a5-c9dcffb3-3ae898e3-bc2d4731-d5b208d8-jill';
    const API_VERSION = '5.131';
    // Обновляем на более стабильный CORS-прокси
    const CORS_PROXY = 'https://proxy.cors.sh/';
    const API_BASE_URL = 'https://ovk.to/method';

    // Функция для выполнения запросов к API
    async function makeApiRequest(method, params) {
        const apiUrl = new URL(`${API_BASE_URL}/${method}`);
        const fullParams = {
            ...params,
            access_token: API_TOKEN,
            v: API_VERSION
        };

        // Добавляем параметры в URL
        Object.keys(fullParams).forEach(key => 
            apiUrl.searchParams.append(key, fullParams[key])
        );

        try {
            const proxyUrl = CORS_PROXY + apiUrl.toString();
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'x-cors-api-key': 'temp_f534228c740dfb260194d1c151074b91', // Добавляем ключ для cors.sh
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.error_msg || 'API Error');
            }
            
            return data.response;
        } catch (error) {
            console.error(`Error in ${method}:`, error);
            throw error;
        }
    }

    // Функция для форматирования деталей пользователя
    function formatUserDetails(user) {
        const relationStatus = {
            1: 'Не женат/Не замужем',
            2: 'Есть друг/Есть подруга',
            3: 'Помолвлен/Помолвлена',
            4: 'Женат/Замужем',
            5: 'Всё сложно',
            6: 'В активном поиске',
            7: 'Влюблён/Влюблена',
            8: 'В гражданском браке'
        };

        // Основная информация
        const details = [
            { icon: '👤', label: 'Статус профиля', value: user.verified ? '✓ Подтверждённый' : 'Обычный' },
            { icon: user.is_closed ? '🔒' : '🌐', label: 'Доступ', value: user.is_closed ? 'Закрытый профиль' : 'Открытый профиль' },
            { icon: user.online ? '🟢' : '⚪', label: 'Онлайн', value: user.online ? 'В сети' : 'Не в сети' },
            user.status && { icon: '💭', label: 'Статус', value: user.status },
            user.bdate && { icon: '🎂', label: 'День рождения', value: user.bdate },
            user.home_town && { icon: '🏠', label: 'Родной город', value: user.home_town },
            user.city?.title && { icon: '🌆', label: 'Текущий город', value: user.city.title },
            user.sex && { icon: user.sex === 1 ? '👩' : '👨', label: 'Пол', value: user.sex === 1 ? 'Женский' : 'Мужской' },
            user.relation && { icon: '❤️', label: 'Семейное положение', value: relationStatus[user.relation] || 'Не указано' },
            user.relation_partner && { 
                icon: '💑', 
                label: 'Партнёр', 
                value: `${user.relation_partner.first_name} ${user.relation_partner.last_name}`
            }
        ].filter(Boolean);

        // Статистика
        const stats = [];
        if (user.counters) {
            const countersMap = {
                friends: { icon: '👥', label: 'Друзья' },
                followers: { icon: '👥', label: 'Подписчики' },
                photos: { icon: '📸', label: 'Фотографии' },
                videos: { icon: '🎥', label: 'Видео' },
                audios: { icon: '🎵', label: 'Аудио' },
                notes: { icon: '📝', label: 'Заметки' },
                groups: { icon: '👥', label: 'Группы' },
                albums: { icon: '📁', label: 'Альбомы' },
                gifts: { icon: '🎁', label: 'Подарки' },
                wall: { icon: '📝', label: 'Записи' }
            };

            // Добавляем значения счетчиков, если они существуют
            for (const [key, value] of Object.entries(user.counters)) {
                const counter = countersMap[key];
                if (counter && value !== null && value !== undefined) {
                    stats.push({
                        icon: counter.icon,
                        label: counter.label,
                        value: value.toLocaleString()
                    });
                }
            }
        }

        // Контактная информация
        const contacts = [
            user.mobile_phone && { icon: '📱', label: 'Телефон', value: user.mobile_phone },
            user.home_phone && { icon: '☎️', label: 'Доп. телефон', value: user.home_phone },
            user.site && { 
                icon: '🌐', 
                label: 'Сайт', 
                value: `<a href="${user.site}" target="_blank">${user.site}</a>` 
            }
        ].filter(Boolean);

        // Добавляем социальные сети из connections
        if (user.connections) {
            const socialNetworks = {
                telegram: { icon: '📨', label: 'Telegram', url: 'https://t.me/' },
                skype: { icon: '💬', label: 'Skype' },
                instagram: { icon: '📸', label: 'Instagram', url: 'https://instagram.com/' },
                twitter: { icon: '🐦', label: 'Twitter', url: 'https://twitter.com/' }
            };

            for (const [network, value] of Object.entries(user.connections)) {
                if (value && socialNetworks[network]) {
                    const social = socialNetworks[network];
                    contacts.push({
                        icon: social.icon,
                        label: social.label,
                        value: social.url ? 
                            `<a href="${social.url}${value}" target="_blank">@${value}</a>` : 
                            value
                    });
                }
            }
        }

        // Личная информация
        const personal = [];
        if (user.personal) {
            const personalFields = {
                alcohol: { icon: '🍷', label: 'Алкоголь' },
                smoking: { icon: '🚬', label: 'Курение' },
                life_main: { icon: '⭐', label: 'Главное в жизни' },
                people_main: { icon: '👥', label: 'Главное в людях' },
                political: { icon: '🗳️', label: 'Полит. предпочтения' },
                religion: { icon: '🕊️', label: 'Мировоззрение' },
                inspired_by: { icon: '✨', label: 'Источники вдохновения' }
            };

            for (const [key, data] of Object.entries(user.personal)) {
                if (data && personalFields[key]) {
                    personal.push({
                        icon: personalFields[key].icon,
                        label: personalFields[key].label,
                        value: data
                    });
                }
            }
        }

        // Интересы
        const interests = [
            user.interests && { 
                icon: '⭐', 
                label: 'Интересы', 
                value: user.interests,
                fullWidth: true 
            },
            user.music && { 
                icon: '🎵', 
                label: 'Музыка', 
                value: user.music,
                fullWidth: true 
            },
            user.movies && { 
                icon: '🎬', 
                label: 'Фильмы', 
                value: user.movies,
                fullWidth: true 
            },
            user.tv && { 
                icon: '📺', 
                label: 'ТВ', 
                value: user.tv,
                fullWidth: true 
            },
            user.books && { 
                icon: '📚', 
                label: 'Книги', 
                value: user.books,
                fullWidth: true 
            }
        ].filter(Boolean);

        // Группируем по секциям
        const sections = {
            'Основное': details,
            'Статистика': stats,
            'Контактная информация': contacts,
            'Личная информация': personal,
            'Образование': [
                user.university_name && { icon: '🎓', label: 'Университет', value: user.university_name },
                user.faculty_name && { icon: '📚', label: 'Факультет', value: user.faculty_name }
            ].filter(Boolean),
            'Интересы': interests
        };

        const container = document.createElement('div');
        container.className = 'user-details';

        Object.entries(sections).forEach(([title, items]) => {
            if (items && items.length > 0) {
                const section = document.createElement('div');
                section.className = 'detail-section';
                
                const sectionTitle = document.createElement('h3');
                sectionTitle.className = 'section-title';
                sectionTitle.textContent = title;
                section.appendChild(sectionTitle);

                items.forEach(detail => {
                    const row = document.createElement('div');
                    row.className = `detail-row${detail.fullWidth ? ' full-width' : ''}`;
                    if (detail.value.includes('<a')) {
                        row.innerHTML = `
                            <span class="detail-icon">${detail.icon}</span>
                            <span class="detail-label">${detail.label}:</span>
                            <span class="detail-value">${detail.value}</span>
                        `;
                    } else {
                        row.innerHTML = `
                            <span class="detail-icon">${detail.icon}</span>
                            <span class="detail-label">${detail.label}:</span>
                            <span class="detail-value">${escapeHtml(detail.value)}</span>
                        `;
                    }
                    section.appendChild(row);
                });

                container.appendChild(section);
            }
        });

        // Добавляем функцию для безопасного экранирования HTML
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Обновляем отображение никнейма
        if (user.screen_name && user.screen_name !== `id${user.id}`) {
            const nickname = document.createElement('a');
            nickname.className = 'user-nickname';
            nickname.href = `https://ovk.to/${user.screen_name}`;
            nickname.target = '_blank';
            nickname.textContent = `@${user.screen_name}`;
            userDetails.appendChild(nickname);
        }

        // Обновляем кнопку "Открыть в OpenVK"
        const openVkButton = document.createElement('a');
        openVkButton.href = `https://ovk.to/${user.screen_name || `id${user.id}`}`;
        openVkButton.target = '_blank';
        openVkButton.className = 'open-vk-button';
        openVkButton.innerHTML = `
            <span class="button-content">
                <span>Открыть в</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 8C10 9.65685 9.10457 11 8 11C6.89543 11 6 9.65685 6 8C6 6.34315 6.89543 5 8 5C9.10457 5 10 6.34315 10 8Z" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M4 0C1.79086 0 0 1.79086 0 4V12C0 14.2091 1.79086 16 4 16H12C14.2091 16 16 14.2091 16 12V4C16 1.79086 14.2091 0 12 0H4ZM8 13C10.7614 13 13 10.7614 13 8C13 5.23858 10.7614 3 8 3C5.23858 3 3 5.23858 3 8C3 10.7614 5.23858 13 8 13ZM10 8C10 9.65685 9.10457 11 8 11C6.89543 11 6 9.65685 6 8C6 6.34315 6.89543 5 8 5C9.10457 5 10 6.34315 10 8Z" fill="white"/>
                </svg>
                <strong>OpenVK</strong>
            </span>
        `;
        container.appendChild(openVkButton);

        return container;
    }

    async function resolveScreenName(userId) {
        try {
            const data = await makeApiRequest('utils.resolveScreenName', {
                screen_name: userId
            });
            return data?.object_id;
        } catch (error) {
            console.error('Ошибка резолва:', error);
            return null;
        }
    }

    async function loadUserPosts(userId) {
        try {
            const data = await makeApiRequest('wall.get', {
                owner_id: userId,
                count: 5,
                extended: 1
            });
            
            if (data?.items) {
                const profiles = data.profiles || [];
                const groups = data.groups || [];
                
                const profilesMap = new Map(profiles.map(p => [p.id, p]));
                const groupsMap = new Map(groups.map(g => [g.id, g]));
                
                return {
                    items: data.items,
                    profiles: profilesMap,
                    groups: groupsMap
                };
            }
            return { items: [], profiles: new Map(), groups: new Map() };
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);
            return { items: [], profiles: new Map(), groups: new Map() };
        }
    }

    function displayPosts({ items: posts, profiles, groups }, userId) {
        const postsSection = document.createElement('div');
        postsSection.className = 'posts-section detail-section';
        
        const title = document.createElement('h3');
        title.className = 'section-title';
        title.textContent = 'Последние записи';
        postsSection.appendChild(title);

        posts.forEach(post => {
            const postElement = document.createElement('a');
            postElement.href = `https://ovk.to/wall${userId}_${post.id}`;
            postElement.target = '_blank';
            postElement.className = 'post-preview';

            const isRepost = post.copy_history && post.copy_history.length > 0;
            let postContent = '';

            if (isRepost) {
                const originalPost = post.copy_history[0];
                const fromId = originalPost.from_id;
                let authorName = 'Неизвестный источник';
                
                if (fromId > 0) {
                    const profile = profiles.get(fromId);
                    if (profile) {
                        authorName = `${profile.first_name} ${profile.last_name}`;
                    }
                } else {
                    const group = groups.get(Math.abs(fromId));
                    if (group) {
                        authorName = group.name;
                    }
                }
                
                postContent += `<div class="post-repost">🔄 Репост записи от ${authorName}</div>`;
            }

            postContent += `<div class="post-text">${post.text.substring(0, 100)}${post.text.length > 100 ? '...' : ''}</div>`;

            if (post.attachments && post.attachments.length > 0) {
                const attachments = {
                    photo: 0,
                    video: 0,
                    audio: 0,
                    doc: 0
                };

                post.attachments.forEach(att => {
                    if (attachments.hasOwnProperty(att.type)) {
                        attachments[att.type]++;
                    }
                });

                postContent += '<div class="post-attachments">';
                if (attachments.photo > 0) {
                    postContent += `<span class="post-attachment">📷 ${attachments.photo} фото</span>`;
                }
                if (attachments.video > 0) {
                    postContent += `<span class="post-attachment">🎥 ${attachments.video} видео</span>`;
                }
                if (attachments.audio > 0) {
                    postContent += `<span class="post-attachment">🎵 ${attachments.audio} аудио</span>`;
                }
                if (attachments.doc > 0) {
                    postContent += `<span class="post-attachment">📎 ${attachments.doc} файл(ов)</span>`;
                }
                postContent += '</div>';
            }

            postContent += `
                <div class="post-info">
                    <span class="post-info-item">📅 ${new Date(post.date * 1000).toLocaleString()}</span>
                    <span class="post-info-item">❤️ ${post.likes?.count || 0}</span>
                    <span class="post-info-item">💬 ${post.comments?.count || 0}</span>
                    <span class="post-info-item">↪️ ${post.reposts?.count || 0}</span>
                    <span class="post-info-item">👁️ ${post.views?.count || 0}</span>
                </div>
            `;

            postElement.innerHTML = postContent;
            postsSection.appendChild(postElement);
        });

        return postsSection;
    }

    // Функция для обновления favicon
    async function updateFavicon(type = 'default') {
        try {
            const iconPath = `assets/icons/${type}.svg`;
            const response = await fetch(iconPath);
            const svgContent = await response.text();
            const base64Icon = btoa(svgContent);
            
            const link = document.querySelector("link[rel~='icon']");
            link.href = `data:image/svg+xml;base64,${base64Icon}`;
        } catch (error) {
            console.error('Ошибка загрузки иконки:', error);
        }
    }

    // Инициализация дефолтной иконки при загрузке страницы
    updateFavicon('default');

    fetchBtn.addEventListener('click', async () => {
        const url = userUrl.value.trim();
        if (!url) {
            showError('Пожалуйста, введите ссылку на профиль OpenVK');
            return;
        }

        if (!API_TOKEN) {
            showError('Необходимо указать токен API OpenVK');
            return;
        }

        userData.classList.add('hidden');
        skeleton.classList.remove('hidden');

        try {
            updateFavicon('loading');
            const userId = extractUserId(url);
            
            if (!userId) {
                throw new Error('Неверный формат ссылки. Используйте формат: https://ovk.to/id123 или https://ovk.to/username');
            }

            let finalUserId = userId;
            
            if (!/^\d+$/.test(userId)) {
                const resolvedId = await resolveScreenName(userId);
                if (resolvedId) {
                    finalUserId = resolvedId;
                }
            }

            const data = await makeApiRequest('users.get', {
                user_ids: finalUserId,
                fields: [
                    'photo_200', 'status', 'city', 'bdate', 'photo_max', 'online',
                    'verified', 'sex', 'relation', 'relation_partner', 'connections',
                    'contacts', 'site', 'education', 'universities', 'schools',
                    'followers_count', 'counters', 'home_town', 'mobile_phone',
                    'home_phone', 'activities', 'interests', 'music', 'movies',
                    'tv', 'books', 'games', 'quotes', 'about', 'timezone',
                    'screen_name', 'occupation', 'personal'
                ].join(',')
            });

            if (!data || !data[0]) {
                throw new Error('Пользователь не найден или профиль недоступен');
            }

            const user = data[0];
            console.log('User data:', user);

            if (!user.id || user.deactivated) {
                const reason = user.deactivated === 'deleted' ? 'удален' : 
                             user.deactivated === 'banned' ? 'заблокирован' : 
                             'недоступен';
                throw new Error(`Профиль ${reason}`);
            }

            userAvatar.onerror = () => {
                userAvatar.src = DEFAULT_AVATAR;
            };
            
            const avatarUrl = user.photo_max || user.photo_200 || DEFAULT_AVATAR;
            userAvatar.src = avatarUrl;

            const firstName = user.first_name || 'Неизвестно';
            const lastName = user.last_name || '';
            userName.textContent = `${firstName} ${lastName}`.trim();
            
            // Обновляем отображение деталей
            userDetails.innerHTML = '';
            userDetails.appendChild(formatUserDetails(user));

            const posts = await loadUserPosts(finalUserId);
            const postsSection = displayPosts(posts, finalUserId);
            userDetails.appendChild(postsSection);

            skeleton.classList.add('hidden');
            userData.classList.remove('hidden');
            updateFavicon('success');

        } catch (error) {
            updateFavicon('error');
            console.error('Ошибка:', error);
            let errorMessage;
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Не удалось подключиться к API OpenVK. Возможно, проблема с прокси или соединением.';
            } else if (error.message.includes('access_token')) {
                errorMessage = 'Ошибка авторизации. Проверьте токен доступа.';
            } else {
                errorMessage = error.message;
            }
            
            showError(errorMessage);
            skeleton.classList.add('hidden');
        }
    });

    function showError(message) {
        userData.classList.add('hidden');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.color = '#d83b01';
        errorElement.style.padding = '16px';
        errorElement.style.marginTop = '16px';
        errorElement.style.background = 'rgba(216, 59, 1, 0.1)';
        errorElement.style.borderRadius = '4px';
        errorElement.textContent = message;

        const oldError = document.querySelector('.error-message');
        if (oldError) {
            oldError.remove();
        }

        document.querySelector('.result-container').appendChild(errorElement);
    }

    function extractUserId(url) {
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname.split('/').filter(Boolean);
            const lastSegment = path[path.length - 1];
            
            if (lastSegment.startsWith('id')) {
                return lastSegment.substring(2);
            }
            return lastSegment;
        } catch {
            const matches = url.match(/(?:\/id(\d+))|(?:\/([^\/]+)$)/);
            return matches ? matches[1] || matches[2] : null;
        }
    }
});
