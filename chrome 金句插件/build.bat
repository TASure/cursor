@echo off
echo 创建必要的目录...
mkdir dist 2>nul
mkdir dist\assets 2>nul
mkdir dist\assets\icons 2>nul
mkdir dist\content 2>nul

echo 复制文件...
copy manifest.json dist\
copy src\popup\index.html dist\popup.html
copy src\popup\popup.css dist\
copy src\popup\index.js dist\popup.js
copy src\content\content.js dist\content\content.js
copy src\background\background.js dist\background.js
copy assets\icons\icon128.png dist\assets\icons\

echo 创建内容脚本的样式文件...
echo /* Content script styles */ > dist\content\content.css

echo 构建完成！
echo 请在Chrome扩展管理页面中加载dist目录 