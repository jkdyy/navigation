// AI Tools List - Main JavaScript

class AIToolsList {
    constructor() {
        this.tools = [];
        this.filteredTools = [];
        this.categories = {
            'AI聊天': 'ai-chat-tools',
            'AI写作': 'ai-writing-tools',
            'AI绘画': 'ai-art-tools',
            'AI编程': 'ai-coding-tools',
            'AI音频': 'ai-audio-tools',
            'AI视频': 'ai-video-tools'
        };
        this.init();
    }

    async init() {
        await this.loadTools();
        this.setupEventListeners();
        this.renderTools();
        this.hideLoading();
        this.renderCategoryNav();
        setTimeout(() => this.renderFeaturedTools(), 0);
    }

    async loadTools() {
        try {
            const response = await fetch('letsview_tools.json');
            this.tools = await response.json();
            this.filteredTools = [...this.tools];
        } catch (error) {
            console.error('Error loading tools:', error);
            this.showError('加载工具数据时出错，请刷新页面重试。');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Close mobile menu when clicking on links
        const mobileMenuLinks = mobileMenu?.querySelectorAll('a');
        if (mobileMenuLinks) {
            mobileMenuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                });
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        const featuredSection = document.querySelector('section .grid#featured-tools')?.parentElement?.parentElement;
        const searchMsg = document.getElementById('search-empty-msg');
        const main = document.querySelector('main');
        if (searchMsg) searchMsg.style.display = 'none';
        if (searchTerm === '') {
            this.filteredTools = [...this.tools];
            if (featuredSection) featuredSection.style.display = '';
            if (main) main.style.display = '';
        } else {
            this.filteredTools = this.tools.filter(tool => 
                tool.name.toLowerCase().includes(searchTerm) ||
                tool.info.toLowerCase().includes(searchTerm) ||
                tool.catname.toLowerCase().includes(searchTerm)
            );
            if (featuredSection) featuredSection.style.display = 'none';
        }
        this.renderTools();
        const hasResult = this.filteredTools.length > 0;
        if (!hasResult && searchTerm) {
            if (main) main.style.display = 'none';
            if (searchMsg) searchMsg.style.display = '';
        } else {
            if (main) main.style.display = '';
            if (searchMsg) searchMsg.style.display = 'none';
        }
    }

    renderTools() {
        // Clear all category containers
        Object.values(this.categories).forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });

        // Group tools by category
        const toolsByCategory = {};
        this.filteredTools.forEach(tool => {
            if (!toolsByCategory[tool.catname]) {
                toolsByCategory[tool.catname] = [];
            }
            toolsByCategory[tool.catname].push(tool);
        });

        // 判断是否所有分类都无结果
        const allEmpty = Object.keys(this.categories).every(cat => !(toolsByCategory[cat] && toolsByCategory[cat].length));
        let emptyMsgShown = false;

        // Render tools for each category
        Object.entries(this.categories).forEach(([category, containerId], idx) => {
            const container = document.getElementById(containerId);
            if (container) {
                const tools = toolsByCategory[category] || [];
                if (tools.length === 0) {
                    // 只在第一个分类区显示提示
                    if (allEmpty && !emptyMsgShown) {
                        const emptyDiv = document.createElement('div');
                        emptyDiv.className = 'text-center text-gray-400 py-8 col-span-4';
                        emptyDiv.textContent = '你搜索的工具暂时还没有收录！';
                        container.appendChild(emptyDiv);
                        emptyMsgShown = true;
                    }
                } else {
                    // 只显示前11条
                    const showTools = tools.slice(0, 11);
                    showTools.forEach(tool => {
                        const toolCard = this.createToolCard(tool);
                        container.appendChild(toolCard);
                    });
                    // 第12格为查看更多
                    if (tools.length > 11) {
                        const moreCard = document.createElement('a');
                        moreCard.href = `/category/${this.getCategoryEn(category)}.html`;
                        moreCard.className = 'block tool-card bg-white rounded-lg shadow-md overflow-hidden flex items-center justify-center text-blue-600 font-bold text-lg hover:bg-blue-50 transition-colors duration-300';
                        moreCard.innerHTML = '查看更多' + category + '工具 →';
                        container.appendChild(moreCard);
                    }
                }
            }
        });

        // Show/hide empty categories
        this.toggleEmptyCategories();
    }

    createToolCard(tool) {
        // 英文名生成逻辑（与后端一致，遇到'-'只取前半部分）
        function toolEnName(tool) {
            let name = tool.name || '';
            if (name.includes('-')) {
                name = name.split('-')[0].trim();
            }
            let en = name.match(/[a-zA-Z0-9\- ]+/g)?.join('') || '';
            en = en.trim().replace(/\s+/g, '-').toLowerCase();
            if (!en || /[\u4e00-\u9fa5]/.test(name)) {
                let cat = tool.catname || 'ai';
                en = cat.replace('AI', '').replace('ai', '').trim().toLowerCase();
                if (!en) en = 'ai';
                en = 'ai-' + en + '-' + (tool.id || tool.name || Math.random().toString(36).slice(2,8));
            }
            if (en.length > 40) en = en.slice(0, 40) + '-' + (tool.id || Math.random().toString(36).slice(2,8));
            return en;
        }
        const enName = toolEnName(tool);
        const card = document.createElement('a');
        card.href = `/tool/${enName}.html`;
        card.className = 'block tool-card bg-white rounded-lg border-2 border-gray-300 shadow-md overflow-hidden hover:shadow-2xl hover:border-blue-400 transition-shadow transition-colors duration-300 group';
        card.style.fontFamily = "'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Arial', 'sans-serif'";
        // Get image path
        const imagePath = this.getImagePath(tool);
        card.innerHTML = `
            <div class="p-6">
                <div class="flex items-center mb-3">
                    <div class="w-6 h-6 mr-3 flex-shrink-0">
                        <img src="${imagePath}" 
                             alt="${tool.name} logo" 
                             class="tool-image w-full h-full rounded-lg object-contain"
                             loading="lazy"
                             onerror="this.src='images/default-icon.png'">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600" style="font-size:15px;color:#1a202c;">${tool.name}</h3>
                    </div>
                </div>
                <p class="text-gray-800 text-xs mb-4 line-clamp-3" style="font-size:13px;min-height:4.5em;max-height:4.5em;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;color:#2d3748;">${tool.info}</p>
                <div class="flex justify-between items-center">
                    <span class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors z-10" style="cursor:pointer;color:#2563eb;font-size:13px;" onclick="event.stopPropagation();window.open('${tool.url}','_blank');return false;">
                        访问网站
                        <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                    </span>
                    <span class="text-xs text-gray-700 font-semibold" style="font-size:13px;color:#1a202c;">--</span>
                </div>
            </div>
        `;
        return card;
    }

    getImagePath(tool) {
        // If tool has a local image, use it
        if (tool.img && tool.img.startsWith('images/')) {
            return tool.img;
        }
        
        // If tool has an external image URL, try to get local version
        if (tool.img) {
            const localImagePath = this.getLocalImagePath(tool.img);
            // Check if local file exists by trying to load it
            return localImagePath;
        }
        
        // Default fallback
        return 'images/default-icon.png';
    }

    getLocalImagePath(originalUrl) {
        // Extract filename from URL
        const urlParts = originalUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        // Clean filename (remove query parameters and hash)
        const cleanFilename = filename.split('?')[0].split('#')[0];
        
        return `images/${cleanFilename}`;
    }

    toggleEmptyCategories() {
        Object.entries(this.categories).forEach(([category, containerId]) => {
            const container = document.getElementById(containerId);
            const section = container?.closest('section');
            
            if (container && section) {
                const hasTools = container.children.length > 0;
                section.style.display = hasTools ? 'block' : 'none';
            }
        });
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        const main = document.querySelector('main');
        if (main) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8';
            errorDiv.innerHTML = `
                <strong class="font-bold">错误！</strong>
                <span class="block sm:inline">${message}</span>
            `;
            main.insertBefore(errorDiv, main.firstChild);
        }
    }

    renderCategoryNav() {
        // 分类英文映射，需与后端脚本一致
        const categoryEnMap = {
            'AI绘画': 'ai-art',
            'AI写作': 'ai-writing',
            'AI音频': 'ai-audio',
            'AI视频': 'ai-video',
            'AI编程': 'ai-coding',
            'AI聊天': 'ai-chat',
            'AI办公': 'ai-office',
            'AI翻译': 'ai-translate',
            'AI教育': 'ai-edu',
            'AI设计': 'ai-design',
            'AI搜索': 'ai-search',
            'AI简历': 'ai-resume',
            'AI营销': 'ai-marketing',
            'AI生产力': 'ai-productivity',
            'AI工具': 'ai-tools',
        };
        // 动态收集所有分类
        const cats = {};
        this.tools.forEach(t => {
            if (t.catname && !cats[t.catname]) {
                cats[t.catname] = true;
                if (!categoryEnMap[t.catname]) {
                    // 兜底：去掉AI，转英文
                    let tail = t.catname.replace('AI', '').replace('ai', '').trim();
                    if (!tail) tail = t.catname;
                    let en = tail.normalize('NFD').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
                    if (!en) en = 'ai-other';
                    categoryEnMap[t.catname] = 'ai-' + en;
                }
            }
        });
        // 生成HTML
        let navHtml = '';
        Object.keys(cats).forEach(cat => {
            navHtml += `<a href="/category/${categoryEnMap[cat]}.html">${cat}</a>`;
        });
        // head区
        const nav = document.querySelector('header nav');
        if (nav) {
            nav.innerHTML = '<a href="/">首页</a>' + navHtml;
        }
        // 移动端
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.innerHTML = '<a href="/">首页</a>' + navHtml;
        }
    }

    renderFeaturedTools() {
        // 8个最热门工具名
        const featuredNames = [
            'ChatGPT',
            'Midjourney',
            'GitHub Copilot',
            'Notion AI',
            'Grammarly',
            'Jasper.ai',
            'Poe',
            'Stable Diffusion 3'
        ];
        const featured = [];
        const used = new Set();
        for (const name of featuredNames) {
            const tool = this.tools.find(t => t.name === name && !used.has(t.name + t.url));
            if (tool) {
                featured.push(tool);
                used.add(tool.name + tool.url);
            }
        }
        // 不足8个则补足
        if (featured.length < 8) {
            for (const tool of this.tools) {
                if (!used.has(tool.name + tool.url)) {
                    featured.push(tool);
                    used.add(tool.name + tool.url);
                    if (featured.length === 8) break;
                }
            }
        }
        const container = document.getElementById('featured-tools');
        if (container) {
            container.innerHTML = '';
            featured.forEach(tool => {
                const card = this.createToolCard(tool);
                container.appendChild(card);
            });
        }
    }

    getCategoryEn(category) {
        const map = {
            'AI聊天': 'ai-chat',
            'AI写作': 'ai-writing',
            'AI绘画': 'ai-art',
            'AI编程': 'ai-coding',
            'AI音频': 'ai-audio',
            'AI视频': 'ai-video'
        };
        return map[category] || 'ai';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIToolsList();
});

// Service Worker for PWA support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 