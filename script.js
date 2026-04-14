// ========== ИГРОВОЕ СОСТОЯНИЕ ==========
let gameState = {
    money: 50000,
    reputation: 50,
    developers: 3,
    studioLevel: 1,
    day: 1,
    projects: [],
    completedGames: [], // для анализа
    nextProjectId: 1
};

let settings = {
    sound: true,
    animations: true,
    autosave: true
};

let gameInterval = null;
let currentGameId = null;

// ========== ЗАСТАВКА И ЗАГРУЗКА ==========
window.addEventListener('DOMContentLoaded', () => {
    startSplashAndMenu();
});

function startSplashAndMenu() {
    const splash = document.getElementById('splashScreen');
    const loadingBar = document.getElementById('loadingBar');
    const splashText = document.getElementById('splashText');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            loadingBar.style.width = '100%';
            splashText.textContent = 'Готово! Добро пожаловать в DEVZ!';
            setTimeout(() => {
                splash.style.opacity = '0';
                setTimeout(() => {
                    splash.classList.add('hidden');
                    showMainMenu();
                }, 800);
            }, 500);
        }
        loadingBar.style.width = progress + '%';
        if (progress < 30) splashText.textContent = 'Загрузка движка...';
        else if (progress < 70) splashText.textContent = 'Инициализация AI анализатора...';
        else splashText.textContent = 'Почти готово...';
    }, 80);
}

// ========== ГЛАВНОЕ МЕНЮ ==========
function showMainMenu() {
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('gameContainer').classList.add('hidden');
}

function startNewGame() {
    gameState = {
        money: 50000,
        reputation: 50,
        developers: 3,
        studioLevel: 1,
        day: 1,
        projects: [],
        completedGames: [],
        nextProjectId: 1
    };
    
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');
    
    if (gameInterval) clearInterval(gameInterval);
    startGameLoop();
    updateUI();
    addNews("Добро пожаловать в DEVZ! Начните с создания первой игры!");
}

function loadGame() {
    const saved = localStorage.getItem('devz_save');
    if (saved) {
        gameState = JSON.parse(saved);
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
        if (gameInterval) clearInterval(gameInterval);
        startGameLoop();
        updateUI();
        addNews("Игра загружена! Продолжаем разработку!");
    } else {
        alert("Нет сохранённой игры!");
    }
}

function saveGame() {
    localStorage.setItem('devz_save', JSON.stringify(gameState));
    addNews("Игра сохранена!");
}

// ========== ИГРОВОЙ ЦИКЛ ==========
function startGameLoop() {
    gameInterval = setInterval(() => {
        gameTick();
    }, 3000);
}

function gameTick() {
    if (gameState.projects.length === 0) return;
    
    let speed = gameState.developers * (0.7 + gameState.studioLevel * 0.1);
    speed = Math.min(25, speed);
    
    let anyProgress = false;
    for (let project of gameState.projects) {
        let increment = Math.floor(speed + Math.random() * 8);
        project.progress = Math.min(project.maxProgress, project.progress + increment);
        anyProgress = true;
        
        if (project.progress >= project.maxProgress && !project.completed) {
            completeProject(project);
        }
    }
    
    if (anyProgress) {
        updateUI();
    }
    
    if (settings.autosave && gameState.day % 3 === 0) {
        saveGame();
    }
}

function completeProject(project) {
    project.completed = true;
    const reward = Math.floor(project.expectedReward * (1 + gameState.reputation / 200));
    const repGain = project.bonusRep + Math.floor(gameState.studioLevel / 2);
    
    gameState.money += reward;
    gameState.reputation += repGain;
    
    gameState.completedGames.unshift({
        id: project.id,
        name: project.name,
        genre: project.genre,
        complexity: project.maxProgress,
        reward: reward,
        repGain: repGain,
        dayCompleted: gameState.day
    });
    
    addNews(`🏆 Игра "${project.name}" завершена! +${reward}$, +${repGain} репутации!`);
    
    const index = gameState.projects.findIndex(p => p.id === project.id);
    if (index !== -1) gameState.projects.splice(index, 1);
    
    updateUI();
}

function createNewGame(name, genre, complexity) {
    const maxSlots = 2 + Math.floor(gameState.studioLevel / 2);
    if (gameState.projects.length >= maxSlots) {
        addNews("❌ Нет свободных слотов! Улучшите студию!", true);
        return false;
    }
    
    const baseReward = Math.floor(complexity * 2.5 + Math.random() * 200);
    const baseRep = Math.floor(complexity / 15) + 5;
    
    const newProject = {
        id: gameState.nextProjectId++,
        name: name || `Игра #${gameState.nextProjectId}`,
        genre: genre,
        progress: 0,
        maxProgress: complexity,
        expectedReward: baseReward,
        bonusRep: baseRep,
        completed: false
    };
    
    gameState.projects.push(newProject);
    addNews(`✨ Новый проект: "${newProject.name}" (${genre}), сложность ${complexity}`);
    updateUI();
    return true;
}

// ========== AI АНАЛИЗ ==========
function analyzeGame(gameId) {
    const game = gameState.completedGames.find(g => g.id == gameId);
    if (!game) {
        document.getElementById('analysisResult').innerHTML = "❌ Игра не найдена!";
        return;
    }
    
    let quality = "🌟 ШЕДЕВР!";
    let advice = "Эта игра войдёт в историю!";
    let rating = Math.floor(Math.random() * 30 + 70);
    
    if (game.complexity > 200 && game.reward > 800) {
        quality = "🏆 БЛОКБАСТЕР!";
        advice = "Отличная работа! Игроки в восторге!";
        rating = 95;
    } else if (game.reward < 300) {
        quality = "⚠️ СРЕДНЯК";
        advice = "Попробуйте увеличить сложность или выбрать другой жанр.";
        rating = 55;
    } else if (game.genre === "RPG" && game.reward > 500) {
        quality = "🎲 КУЛЬТОВАЯ RPG!";
        advice = "RPG всегда в топе! Продолжайте в том же духе!";
        rating = 88;
    } else {
        rating = 65 + Math.floor(Math.random() * 25);
    }
    
    const analysisHTML = `
        <strong>🤖 AI Анализ:</strong><br>
        📊 Качество: ${quality}<br>
        ⭐ Рейтинг: ${rating}/100<br>
        💡 Совет: ${advice}<br>
        🎮 Жанр ${game.genre} показал себя ${rating > 75 ? "отлично" : "неплохо"}.
    `;
    document.getElementById('analysisResult').innerHTML = analysisHTML;
    addNews(`AI проанализировал "${game.name}": ${quality}`);
}

function generateNews() {
    const newsList = [
        "🎮 Новый хит от конкурентов!",
        "🤖 AI предсказывает рост рынка инди-игр",
        "💥 Студия N признана лучшей в этом месяце!",
        "📈 Продажи игр выросли на 20%",
        "⚡ Новая технология ускоряет разработку",
        "🌟 Ваша студия в топе новостей!"
    ];
    return newsList[Math.floor(Math.random() * newsList.length)];
}

function refreshNews() {
    const newsItem = generateNews();
    addNews(newsItem);
    const newsFeed = document.getElementById('newsFeed');
    const newNews = document.createElement('div');
    newNews.className = 'news-item';
    newNews.innerHTML = `📰 ${newsItem}`;
    newsFeed.prepend(newNews);
    if (newsFeed.children.length > 5) newsFeed.removeChild(newsFeed.lastChild);
}

function addNews(text, isError = false) {
    const newsFeed = document.getElementById('newsFeed');
    const newNews = document.createElement('div');
    newNews.className = 'news-item';
    newNews.style.color = isError ? '#ffaa88' : '#bbddff';
    newNews.innerHTML = `${isError ? '⚠️' : '📰'} ${text}`;
    newsFeed.prepend(newNews);
    if (newsFeed.children.length > 6) newsFeed.removeChild(newsFeed.lastChild);
}

function getAITip() {
    const tips = [
        "💡 Нанимайте разработчиков - они ускоряют создание игр!",
        "🎯 Улучшайте студию для большего количества проектов",
        "📊 Сложные игры приносят больше денег и репутации",
        "🤖 AI анализирует ваши игры - используйте это!",
        "💰 Маркетинг повышает репутацию студии",
        "⭐ Высокая репутация = больше денег за игры",
        "🎮 RPG и Стратегии часто приносят больше наград"
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('aiTips').innerHTML = tip;
}

// ========== ДЕЙСТВИЯ СТУДИИ ==========
function hireDeveloper() {
    const cost = 2000;
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.developers++;
        addNews(`👨‍💻 Нанят разработчик! Теперь их ${gameState.developers}`);
        updateUI();
    } else {
        addNews("💰 Не хватает денег на найм!", true);
    }
}

function upgradeStudio() {
    const cost = 5000 + gameState.studioLevel * 1000;
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.studioLevel++;
        addNews(`🏢 Студия улучшена до уровня ${gameState.studioLevel}! Слотов: ${2 + Math.floor(gameState.studioLevel/2)}`);
        updateUI();
    } else {
        addNews(`💰 Не хватает ${cost}$ на апгрейд!`, true);
    }
}

function doMarketing() {
    const cost = 1000;
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.reputation += 8 + Math.floor(Math.random() * 10);
        addNews(`📢 Маркетинг повысил репутацию! +${8}⭐`);
        updateUI();
    } else {
        addNews("💰 Не хватает на маркетинг!", true);
    }
}

// ========== UI ОБНОВЛЕНИЕ ==========
function updateUI() {
    document.getElementById('money').innerText = Math.floor(gameState.money);
    document.getElementById('reputation').innerText = Math.floor(gameState.reputation);
    document.getElementById('devCount').innerText = gameState.developers;
    document.getElementById('projectCount').innerText = gameState.projects.length;
    document.getElementById('day').innerText = gameState.day;
    document.getElementById('studioLvl').innerText = gameState.studioLevel;
    document.getElementById('maxSlots').innerText = 2 + Math.floor(gameState.studioLevel / 2);
    
    const speed = (gameState.developers * (0.7 + gameState.studioLevel * 0.1)).toFixed(1);
    document.getElementById('devSpeed').innerText = Math.min(25, speed);
    
    // Обновление списка проектов
    const projectsList = document.getElementById('projectsList');
    if (gameState.projects.length === 0) {
        projectsList.innerHTML = '<div class="empty-projects">Нет проектов. Создайте игру!</div>';
    } else {
        projectsList.innerHTML = '';
        for (let p of gameState.projects) {
            const percent = (p.progress / p.maxProgress) * 100;
            projectsList.innerHTML += `
                <div class="project-card">
                    <div class="project-name">🎮 ${escapeHtml(p.name)} (${p.genre})</div>
                    <div class="project-progress"><div class="progress-fill" style="width: ${percent}%"></div></div>
                    <div style="font-size:0.7rem;">${Math.floor(p.progress)}/${p.maxProgress} | Награда: ~${p.expectedReward}$</div>
                </div>
            `;
        }
    }
    
    // Обновление селекта для анализа
    const select = document.getElementById('gameToAnalyze');
    if (gameState.completedGames.length === 0) {
        select.innerHTML = '<option value="">Нет завершённых игр</option>';
    } else {
        select.innerHTML = '<option value="">-- Выберите игру --</option>' + 
            gameState.completedGames.map(g => `<option value="${g.id}">${escapeHtml(g.name)} (${g.genre})</option>`).join('');
    }
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== НАСТРОЙКИ ==========
function toggleSound() { settings.sound = !settings.sound; updateSettingsButton(); }
function toggleAnimations() { settings.animations = !settings.animations; updateSettingsButton(); }
function toggleAutosave() { settings.autosave = !settings.autosave; updateSettingsButton(); }

function updateSettingsButton() {
    const soundBtn = document.getElementById('toggleSoundBtn');
    const animBtn = document.getElementById('toggleAnimationsBtn');
    const autoBtn = document.getElementById('toggleAutosaveBtn');
    if (soundBtn) soundBtn.innerText = settings.sound ? "Включен" : "Выключен";
    if (animBtn) animBtn.innerText = settings.animations ? "Включены" : "Выключены";
    if (autoBtn) autoBtn.innerText = settings.autosave ? "Включено" : "Выключено";
}

function resetGame() {
    if (confirm("ВСЕ ДАННЫЕ БУДУТ УДАЛЕНЫ! Вы уверены?")) {
        localStorage.removeItem('devz_save');
        startNewGame();
        document.getElementById('settingsModal').classList.add('hidden');
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ ==========
function initEventListeners() {
    document.getElementById('newGameBtn').onclick = () => startNewGame();
    document.getElementById('loadGameBtn').onclick = () => loadGame();
    document.getElementById('settingsMenuBtn').onclick = () => document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('creditsBtn').onclick = () => document.getElementById('creditsModal').classList.remove('hidden');
    document.getElementById('menuFromGameBtn').onclick = () => showMainMenu();
    document.getElementById('hireDevBtn').onclick = () => hireDeveloper();
    document.getElementById('upgradeStudioBtn').onclick = () => upgradeStudio();
    document.getElementById('marketingBtn').onclick = () => doMarketing();
    document.getElementById('createGameBtn').onclick = () => document.getElementById('createGameModal').classList.remove('hidden');
    document.getElementById('analyzeGameBtn').onclick = () => {
        const select = document.getElementById('gameToAnalyze');
        if (select.value) analyzeGame(parseInt(select.value));
        else alert("Выберите игру для анализа!");
    };
    document.getElementById('refreshNewsBtn').onclick = () => refreshNews();
    document.getElementById('getTipBtn').onclick = () => getAITip();
    
    // Модальные окна
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = function() { this.closest('.modal').classList.add('hidden'); };
    });
    
    document.getElementById('toggleSoundBtn').onclick = toggleSound;
    document.getElementById('toggleAnimationsBtn').onclick = toggleAnimations;
    document.getElementById('toggleAutosaveBtn').onclick = toggleAutosave;
    document.getElementById('resetGameBtn').onclick = resetGame;
    
    // Создание игры
    document.getElementById('confirmCreateGame').onclick = () => {
        const name = document.getElementById('gameName').value || "Безымянный проект";
        const genre = document.getElementById('gameGenre').value;
        const complexity = parseInt(document.getElementById('gameComplexity').value);
        createNewGame(name, genre, complexity);
        document.getElementById('createGameModal').classList.add('hidden');
        document.getElementById('gameName').value = '';
    };
    
    document.getElementById('gameComplexity').oninput = function() {
        document.getElementById('complexityValue').innerText = this.value;
    };
}

initEventListeners();
updateSettingsButton();
