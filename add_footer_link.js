const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const devLinkHTML = `
                <p style="font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-top: 1rem; text-align: center;">Desenvolvido por <a href="https://wa.me/5582993928558?text=Ol%C3%A1%20Vim%20do%20Site%20do%20Instituto%20Vivance%20gostaria%20de%20fazer%20o%20meu%20site." target="_blank" style="color: #D8B661; text-decoration: none; font-weight: 500; transition: color 0.3s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#D8B661'">@tudo.em360</a></p>
`;

function getHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file === 'paginas') {
                results = results.concat(getHtmlFiles(filePath));
            }
        } else if (filePath.endsWith('.html')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = getHtmlFiles(rootDir);
let updatedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if already added
    if (content.includes('@tudo.em360')) {
        console.log(`Already added in: ${file}`);
        return;
    }
    
    // Replace the closing tags of footer-bottom
    const searchRegex = /(<\/div>\s*<\/div>\s*<\/footer>)/;
    if (searchRegex.test(content)) {
        content = content.replace(searchRegex, devLinkHTML + '$1');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
        updatedCount++;
    } else {
        console.log(`Could not find footer closing tags in: ${file}`);
    }
});

console.log(`\nSuccessfully updated ${updatedCount} files.`);
