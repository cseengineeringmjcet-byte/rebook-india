const fs = require('fs');
let file = 'c:\\\\Users\\\\admin\\\\Desktop\\\\New folder (2)\\\\app\\\\admin\\\\page.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/\\\`/g, '`');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync(file, c, 'utf8');
console.log('Fixed');
