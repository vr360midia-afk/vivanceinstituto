const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

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

const htmlFiles = getHtmlFiles(rootDir);

const newNav = `            <nav class="nav-menu">
                <a href="/#sobre">Sobre</a>
                <div class="dropdown">
                    <a href="/#servicos" class="dropbtn">Serviços <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top:2px;"><polyline points="6 9 12 15 18 9"></polyline></svg></a>
                    <div class="dropdown-content">
                        <a href="/paginas/tratamento-obesidade-maceio.html">Tratamento de Obesidade</a>
                        <a href="/paginas/menopausa-maceio.html">Tratamento de Menopausa</a>
                        <a href="/paginas/medicina-integrativa-maceio.html">Medicina Integrativa</a>
                        <a href="/paginas/envelhecimento-saudavel-maceio.html">Envelhecimento Saudável</a>
                        <a href="/paginas/saude-intestinal-maceio.html">Saúde Intestinal</a>
                        <a href="/paginas/tratamento-fibromialgia-maceio.html">Tratamento de Fibromialgia</a>
                        <a href="/paginas/tratamentos-injetaveis-maceio.html">Tratamentos Injetáveis</a>
                        <a href="/paginas/bioimpedancia-maceio.html">Bioimpedância Tetrapolar</a>
                        <a href="/paginas/testes-de-forca-maceio.html">Testes de Força</a>
                        <a href="/paginas/polissonografia-portatil-maceio.html">Polissonografia Portátil</a>
                        <a href="/paginas/calorimetria-indireta-maceio.html">Calorimetria Indireta</a>
                        <a href="/paginas/exame-mineralograma-maceio.html">Mineralograma</a>
                        <a href="/paginas/teste-intolerancia-alimentar-maceio.html">Teste de Intolerância</a>
                        <a href="/paginas/exame-microbiota-intestinal-maceio.html">Microbiota Intestinal</a>
                        <a href="/paginas/teste-genetico-emagrecimento.html">Testes Genéticos</a>
                        <a href="/paginas/implantes-hormonais-maceio.html">Implantes Hormonais</a>
                    </div>
                </div>
                <a href="/#metodologia">Metodologia</a>
                <a href="/#clinica">A Clínica</a>
                <a href="/#localizacao">Localização</a>
                <a href="/blog.html">Blog</a>

                <div class="mobile-socials">
                    <a href="https://www.instagram.com/dr.danilomarques/" target="_blank" aria-label="Instagram">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                </div>
            </nav>`;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // 1. Replace nav-menu in all files except links.html (which doesn't have a header like this)
    if (!file.endsWith('links.html') && !file.endsWith('index.html')) {
        const navRegex = /<nav class="nav-menu">[\s\S]*?<\/nav>/;
        if (navRegex.test(content)) {
            content = content.replace(navRegex, newNav);
            modified = true;
        }
    }

    // 2. Fix script.js paths everywhere!
    if (content.includes('src="script.js"')) {
        content = content.replace(/src="script\.js"/g, 'src="/script.js"');
        modified = true;
    }
    if (content.includes('src="../script.js"')) {
        content = content.replace(/src="\.\.\/script\.js"/g, 'src="/script.js"');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        console.log("Updated: " + file);
    }
});
