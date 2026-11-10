// Chạy trước khi build: chép danh mục cho trang quản trị dùng
const fs = require('fs');
fs.copyFileSync('shared/taxonomy.json', 'public/taxonomy.json');
console.log('prebuild ok');
