// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'generateQuoteCard',
        title: '生成金句卡片',
        contexts: ['selection']
    });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'generateQuoteCard' && tab?.id) {
        // 发送消息到content script获取选中的文本
        chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' }, (response) => {
            if (response && response.selectedText) {
                // 存储选中的文本
                chrome.storage.local.set({ selectedText: response.selectedText }, () => {
                    // 打开扩展弹窗
                    chrome.action.openPopup();
                });
            }
        });
    }
});

// 处理来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openPopup' && request.selectedText) {
        // 存储选中的文本
        chrome.storage.local.set({ selectedText: request.selectedText }, () => {
            // 打开扩展弹窗
            chrome.action.openPopup();
        });
    }
}); 