/**
 * @typedef {Object} AudioVisualizerConfig
 * @property {HTMLCanvasElement} canvas - 用于绘制的画布元素
 * @property {CanvasRenderingContext2D} ctx - 画布上下文
 * @property {AudioContext} audioContext - Web Audio API 上下文
 * @property {AnalyserNode} analyser - 音频分析器节点
 * @property {Uint8Array} dataArray - 用于存储频率数据的数组
 */

/** @type {AudioVisualizerConfig} */
const config = {
    canvas: null,
    ctx: null,
    audioContext: null,
    analyser: null,
    dataArray: null
};

/**
 * 初始化音频可视化器
 */
function initVisualizer() {
    try {
        config.canvas = document.getElementById('visualizer');
        config.ctx = config.canvas.getContext('2d');
        
        // 设置画布尺寸为显示尺寸的2倍，以支持高分辨率显示
        config.canvas.width = config.canvas.offsetWidth * 2;
        config.canvas.height = config.canvas.offsetHeight * 2;
        
        // 创建音频上下文
        config.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        config.analyser = config.audioContext.createAnalyser();
        
        // 设置频率分析的精度
        config.analyser.fftSize = 256;
        const bufferLength = config.analyser.frequencyBinCount;
        config.dataArray = new Uint8Array(bufferLength);
        
        // 设置音频文件选择监听器
        document.getElementById('audioFile').addEventListener('change', handleFileSelect);
        
        // 添加音频播放状态监听
        const audio = document.getElementById('audio');
        audio.addEventListener('play', () => {
            // 确保 AudioContext 处于运行状态
            if (config.audioContext.state === 'suspended') {
                config.audioContext.resume();
            }
        });

        // 显示提示信息
        showMessage('请选择一个音频文件并点击播放按钮');
    } catch (error) {
        showMessage('初始化音频系统时出错：' + error.message);
    }
}

/**
 * 显示提示信息
 * @param {string} message - 要显示的消息
 */
function showMessage(message) {
    const container = document.querySelector('.container');
    let messageDiv = document.querySelector('.message');
    
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        container.insertBefore(messageDiv, document.querySelector('.audio-controls'));
    }
    
    messageDiv.textContent = message;
}

/**
 * 处理音频文件选择
 * @param {Event} e - 文件选择事件
 */
function handleFileSelect(e) {
    const file = e.target.files[0];
    const audio = document.getElementById('audio');
    
    if (file) {
        try {
            const url = URL.createObjectURL(file);
            audio.src = url;
            
            // 确保 AudioContext 已经初始化
            if (!config.audioContext) {
                config.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                config.analyser = config.audioContext.createAnalyser();
                config.analyser.fftSize = 256;
                config.dataArray = new Uint8Array(config.analyser.frequencyBinCount);
            }

            // 断开之前的连接（如果有的话）
            if (audio._source) {
                audio._source.disconnect();
            }
            
            // 连接音频节点
            const source = config.audioContext.createMediaElementSource(audio);
            audio._source = source; // 保存引用以便后续断开连接
            source.connect(config.analyser);
            config.analyser.connect(config.audioContext.destination);
            
            showMessage('音频文件已加载，请点击播放按钮开始播放');
            
            // 监听播放开始
            audio.onplay = () => {
                if (config.audioContext.state === 'suspended') {
                    config.audioContext.resume().then(() => {
                        drawVisualizer();
                    });
                } else {
                    drawVisualizer();
                }
            };
        } catch (error) {
            showMessage('加载音频文件时出错：' + error.message);
        }
    }
}

/**
 * 绘制可视化效果
 */
function drawVisualizer() {
    if (config.audioContext.state === 'running') {
        requestAnimationFrame(drawVisualizer);
        
        // 获取频率数据
        config.analyser.getByteFrequencyData(config.dataArray);
        
        // 清空画布
        config.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        config.ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);
        
        // 计算条形宽度和间距
        const barWidth = (config.canvas.width / config.dataArray.length) * 2.5;
        const barSpacing = 2;
        let x = 0;
        
        // 绘制频谱条形
        config.dataArray.forEach((value) => {
            const barHeight = (value / 255) * config.canvas.height;
            
            // 创建渐变色
            const gradient = config.ctx.createLinearGradient(0, config.canvas.height, 0, config.canvas.height - barHeight);
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#81C784');
            
            config.ctx.fillStyle = gradient;
            config.ctx.fillRect(
                x,
                config.canvas.height - barHeight,
                barWidth,
                barHeight
            );
            
            x += barWidth + barSpacing;
        });
    }
}

// 页面加载完成后初始化
window.addEventListener('load', initVisualizer); 