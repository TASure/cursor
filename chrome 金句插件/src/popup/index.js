class CardGenerator {
    constructor() {
        this.cardContainer = document.getElementById('cardContainer');
        this.quoteText = document.getElementById('quoteText');
        this.currentStyle = {
            theme: 'simple',
            background: '#F5F5F5',
            font: 'Microsoft YaHei'
        };
        this.initializeEventListeners();
        this.loadSelectedText();
    }

    initializeEventListeners() {
        // 主题选择
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target;
                this.setTheme(target.dataset.theme || 'simple');
                this.updateActiveButton('.theme-btn', target);
            });
        });

        // 背景颜色选择
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target;
                const color = target.dataset.color;
                const gradient = target.dataset.gradient;
                this.setBackground(gradient || color || '#F5F5F5');
                this.updateActiveButton('.color-btn', target);
            });
        });

        // 字体选择
        document.querySelectorAll('.font-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target;
                this.setFont(target.dataset.font || 'Microsoft YaHei');
                this.updateActiveButton('.font-btn', target);
            });
        });

        // 导出按钮
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportCard();
        });

        // 质量滑块
        const qualityRange = document.getElementById('qualityRange');
        const qualityValue = document.getElementById('qualityValue');
        qualityRange.addEventListener('input', (e) => {
            const value = e.target.value;
            qualityValue.textContent = `${Math.round(parseFloat(value) * 100)}%`;
        });
    }

    async loadSelectedText() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' }, (response) => {
                if (response && response.selectedText) {
                    this.quoteText.textContent = response.selectedText;
                }
            });
        }
    }

    setTheme(theme) {
        this.currentStyle.theme = theme;
        this.cardContainer.className = `card ${theme}-theme`;
    }

    setBackground(background) {
        this.currentStyle.background = background;
        this.cardContainer.style.background = background;
    }

    setFont(font) {
        this.currentStyle.font = font;
        this.cardContainer.style.fontFamily = font;
    }

    updateActiveButton(selector, activeButton) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    async exportCard() {
        const format = document.getElementById('formatSelect').value;
        const quality = parseFloat(document.getElementById('qualityRange').value);

        try {
            // 使用原生 Canvas API 导出
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const width = this.cardContainer.offsetWidth;
            const height = this.cardContainer.offsetHeight;
            
            canvas.width = width * 2;
            canvas.height = height * 2;
            ctx.scale(2, 2);

            // 绘制背景
            ctx.fillStyle = this.currentStyle.background;
            ctx.fillRect(0, 0, width, height);

            // 绘制文字
            ctx.font = `16px ${this.currentStyle.font}`;
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const text = this.quoteText.textContent;
            const lines = this.getLines(ctx, text, width - 40);
            const lineHeight = 24;
            const totalHeight = lines.length * lineHeight;
            const startY = (height - totalHeight) / 2;

            lines.forEach((line, index) => {
                ctx.fillText(line, width / 2, startY + index * lineHeight + lineHeight / 2);
            });

            const link = document.createElement('a');
            link.download = `quote-card.${format}`;
            link.href = canvas.toDataURL(`image/${format}`, quality);
            link.click();
        } catch (error) {
            console.error('导出失败:', error);
        }
    }

    getLines(ctx, text, maxWidth) {
        const words = text.split('');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + word).width;
            if (width < maxWidth) {
                currentLine += word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new CardGenerator();
}); 