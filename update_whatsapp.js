const fs = require('fs');
const path = require('path');

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== '.agents') {
                getAllFiles(filePath, fileList);
            }
        } else if (filePath.endsWith('.html') || filePath.endsWith('.txt')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const files = getAllFiles(__dirname);
let totalUpdated = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/5582987737277/g, '5582982120707');
    content = content.replace(/\+55-82-98773-7277/g, '+55-82-98212-0707');
    content = content.replace(/\(82\) 98773-7277/g, '(82) 98212-0707');
    content = content.replace(/\+55 82 98773-7277/g, '+55 82 98212-0707');
    content = content.replace(/\+5582987737277/g, '+5582982120707');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
        totalUpdated++;
    }
}

console.log(`Successfully updated ${totalUpdated} files.`);
