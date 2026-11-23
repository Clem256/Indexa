let currentLang = localStorage.getItem("app_lang") || "en";

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("app_lang", lang);
    const dict = i18n[lang];

    document.documentElement.lang = lang;
    document.title = dict.docTitle;
    document.getElementById("title_text").textContent = dict.title;
    document.getElementById("label_portfolio").textContent = dict.portfolio;
    document.getElementById("label_github").textContent = dict.github;
    document.getElementById("search").placeholder = dict.searchPlaceholder;
    document.getElementById("empty").textContent = dict.empty;
    document.getElementById("lang_toggle").textContent = dict.langSwitchLabel;

    updateThemeButtonText();
    if (typeof window.triggerRender === "function") {
        window.triggerRender();
    }
}

// Light / Dark
function initTheme() {
    updateThemeButtonText();
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app_theme", theme);
    updateThemeButtonText();
}

function updateThemeButtonText() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const dict = i18n[currentLang];
    const isDark = currentTheme === "dark";

    document.getElementById("theme_label").textContent = isDark ? dict.themeLight : dict.themeDark;
    document.getElementById("theme_icon").innerHTML = isDark
        ? '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
}

async function loadConfig() {
    try {
        const res = await fetch('./config.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.portfolio) document.getElementById("portfolio_link").href = data.portfolio;
        if (data.github) document.getElementById("github_link").href = data.github;
    } catch {
    }
}

async function loadProjects() {
    try {
        const res = await fetch('projects.json', { cache: 'no-store' });
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return [
            {

            },
        ];
    }
}

function getTagClass(tag) {
    const clean = tag.toLowerCase().replace(/[^a-z0-9]/g, '');
    const known = ['react', 'reactjs', 'node', 'nodejs', 'postgres', 'postgresql', 'vue', 'vuejs', 'firebase', 'tailwind', 'tailwindcss', 'js', 'javascript', 'openweatherapi', 'api'];
    return known.includes(clean) ? `tag-${clean}` : 'tag-default';
}

const TAG_PALETTE = [
    { text: '#60a5fa', bg: 'rgba(96, 165, 250, 0.16)', border: 'rgba(96, 165, 250, 0.35)' }, // Bleu ciel
    { text: '#34d399', bg: 'rgba(52, 211, 153, 0.16)', border: 'rgba(52, 211, 153, 0.35)' }, // Vert menthe
    { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.16)',  border: 'rgba(251, 191, 36, 0.35)' },  // Ambre / Jaune doré
    { text: '#c084fc', bg: 'rgba(192, 132, 252, 0.16)', border: 'rgba(192, 132, 252, 0.35)' }, // Lilas / Violet clair
    { text: '#fb923c', bg: 'rgba(251, 146, 60, 0.16)',  border: 'rgba(251, 146, 60, 0.35)' },  // Pêche / Orange
    { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.16)',  border: 'rgba(34, 211, 238, 0.35)' },  // Cyan
    { text: '#f472b6', bg: 'rgba(244, 114, 182, 0.16)', border: 'rgba(244, 114, 182, 0.35)' }, // Rose
    { text: '#a3e635', bg: 'rgba(163, 230, 53, 0.16)',  border: 'rgba(163, 230, 53, 0.35)' }   // Lime
];

function getTagColor(tag, lastColorIndex = null) {
    let hash = 0;
    const str = tag.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    let index = Math.abs(hash) % TAG_PALETTE.length;

    if (lastColorIndex !== null && index === lastColorIndex) {
        index = (index + 2) % TAG_PALETTE.length;
    }

    return { color: TAG_PALETTE[index], index };
}

function renderCard(project) {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = project.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const top = document.createElement('div');
    top.className = 'card-top';

    const title = document.createElement('h2');
    title.textContent = project.name || project.slug || 'Projet';

    const linkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    linkIcon.setAttribute('class', 'link-icon');
    linkIcon.setAttribute('viewBox', '0 0 24 24');
    linkIcon.innerHTML = '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>';

    top.appendChild(title);
    top.appendChild(linkIcon);
    a.appendChild(top);

    const descText = (currentLang === 'en' && project.description_en) ? project.description_en : project.description;
    if (descText) {
        const desc = document.createElement('p');
        desc.textContent = descText;
        a.appendChild(desc);
    }

    if (Array.isArray(project.tags) && project.tags.length) {
        const tagsWrap = document.createElement('div');
        tagsWrap.className = 'tags';

        let lastIndex = null;

        project.tags.forEach(t => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = t;

            const { color, index } = getTagColor(t, lastIndex);
            lastIndex = index;

            span.style.color = color.text;
            span.style.backgroundColor = color.bg;
            span.style.borderColor = color.border;

            tagsWrap.appendChild(span);
        });
        a.appendChild(tagsWrap);
    }

    return a;
}

function matches(project, query) {
    if (!query) return true;
    const haystack = [
        project.name,
        project.description,
        project.description_en,
        project.slug,
        ...(project.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();

    return haystack.includes(query.toLowerCase());
}

(async () => {
    initTheme();
    applyLanguage(currentLang);

    document.getElementById("theme_toggle").addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
        setTheme(current === "light" ? "dark" : "light");
    });

    document.getElementById("lang_toggle").addEventListener("click", () => {
        applyLanguage(currentLang === "fr" ? "en" : "fr");
    });

    const [, projects] = await Promise.all([loadConfig(), loadProjects()]);

    const grid = document.getElementById('grid');
    const empty = document.getElementById('empty');
    const count = document.getElementById('count');
    const searchInput = document.getElementById('search');

    function render() {
        const query = searchInput.value.trim();

        const validProjects = projects.filter(p => p && (p.name || p.slug));
        const filtered = validProjects.filter(p => matches(p, query));

        const fragment = document.createDocumentFragment();
        filtered.forEach(p => fragment.appendChild(renderCard(p)));

        grid.innerHTML = '';
        grid.appendChild(fragment);

        count.textContent = i18n[currentLang].count(filtered.length);
        empty.style.display = filtered.length === 0 ? 'block' : 'none';
    }

    window.triggerRender = render;
    searchInput.addEventListener('input', render);
    render();
})();