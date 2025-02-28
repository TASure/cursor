// 创建浮动图标元素
const createFloatingIcon = () => {
    const icon = document.createElement('div');
    icon.className = 'quote-card-icon';
    icon.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
            <path d="M14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="currentColor"/>
        </svg>
    `;
    return icon;
};

// 添加浮动图标样式
const addIconStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .quote-card-icon {
            position: fixed;
            z-index: 10000;
            background: #4A90E2;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: transform 0.2s ease;
            display: none;
        }
        .quote-card-icon:hover {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
};

// 处理选中文本
const handleTextSelection = () => {
    let icon = null;
    let timeout = null;

    const showIcon = (e) => {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim() === '') {
            return;
        }

        if (!icon) {
            icon = createFloatingIcon();
            document.body.appendChild(icon);
            
            // 点击图标时打开扩展弹窗
            icon.addEventListener('click', () => {
                chrome.runtime.sendMessage({
                    action: 'openPopup',
                    selectedText: selection.toString()
                });
            });
        }

        // 更新图标位置
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        icon.style.left = `${rect.right + window.scrollX + 10}px`;
        icon.style.top = `${rect.top + window.scrollY - 16}px`;
        icon.style.display = 'flex';
    };

    const hideIcon = () => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = window.setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.toString().trim() === '') {
                if (icon) {
                    icon.style.display = 'none';
                }
            }
        }, 300);
    };

    document.addEventListener('mouseup', showIcon);
    document.addEventListener('mousedown', hideIcon);
};

// 添加右键菜单项
const addContextMenu = () => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getSelectedText') {
            const selection = window.getSelection();
            sendResponse({ selectedText: selection?.toString() || '' });
        }
    });
};

// 初始化内容脚本
const initialize = () => {
    addIconStyles();
    handleTextSelection();
    addContextMenu();
};

initialize(); 