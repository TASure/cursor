import html2canvas from 'html2canvas';

interface CardStyle {
    theme: string;
    background: string;
    font: string;
}

class CardGenerator {
    private cardContainer: HTMLElement;
    private quoteText: HTMLElement;
    private currentStyle: CardStyle = {
        theme: 'simple',
        background: '#F5F5F5',
        font: 'Microsoft YaHei'
    };

    constructor() {
        this.cardContainer = document.getElementById('cardContainer') as HTMLElement;
        this.quoteText = document.getElementById('quoteText') as HTMLElement;
        this.initializeEventListeners();
        this.loadSelectedText();
    }

    private initializeEventListeners(): void {
        // 主题选择
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                this.setTheme(target.dataset.theme || 'simple');
                this.updateActiveButton('.theme-btn', target);
            });
        });

        // 背景颜色选择
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const color = target.dataset.color;
                const gradient = target.dataset.gradient;
                this.setBackground(gradient || color || '#F5F5F5');
                this.updateActiveButton('.color-btn', target);
            });
        });

        // 字体选择
        document.querySelectorAll('.font-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                this.setFont(target.dataset.font || 'Microsoft YaHei');
                this.updateActiveButton('.font-btn', target);
            });
        });

        // 导出按钮
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportCard();
        });

        // 质量滑块
        const qualityRange = document.getElementById('qualityRange') as HTMLInputElement;
        const qualityValue = document.getElementById('qualityValue') as HTMLElement;
        qualityRange.addEventListener('input', (e) => {
            const value = (e.target as HTMLInputElement).value;
            qualityValue.textContent = `${Math.round(parseFloat(value) * 100)}%`;
        });
    }

    private async loadSelectedText(): Promise<void> {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' }, (response) => {
                if (response && response.selectedText) {
                    this.quoteText.textContent = response.selectedText;
                }
            });
        }
    }

    private setTheme(theme: string): void {
        this.currentStyle.theme = theme;
        this.cardContainer.className = `card ${theme}-theme`;
    }

    private setBackground(background: string): void {
        this.currentStyle.background = background;
        this.cardContainer.style.background = background;
    }

    private setFont(font: string): void {
        this.currentStyle.font = font;
        this.cardContainer.style.fontFamily = font;
    }

    private updateActiveButton(selector: string, activeButton: HTMLElement): void {
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    private async exportCard(): Promise<void> {
        const format = (document.getElementById('formatSelect') as HTMLSelectElement).value;
        const quality = parseFloat((document.getElementById('qualityRange') as HTMLInputElement).value);

        try {
            const canvas = await html2canvas(this.cardContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: null
            });

            const link = document.createElement('a');
            link.download = `quote-card.${format}`;
            link.href = canvas.toDataURL(`image/${format}`, quality);
            link.click();
        } catch (error) {
            console.error('导出失败:', error);
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new CardGenerator();
}); 