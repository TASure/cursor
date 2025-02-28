const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const inputSvg = path.join(__dirname, '../assets/icons/icon.svg');
const outputDir = path.join(__dirname, '../assets/icons');

async function generateIcons() {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 为每个尺寸生成PNG
    for (const size of sizes) {
        await sharp(inputSvg)
            .resize(size, size)
            .png()
            .toFile(path.join(outputDir, `icon${size}.png`));
        
        console.log(`Generated ${size}x${size} icon`);
    }
}

generateIcons().catch(console.error); 