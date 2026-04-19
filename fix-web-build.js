const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  // Adiciona o type="module" para que o navegador suporte import.meta
  content = content.replace(/<script /g, '<script type="module" ');
  fs.writeFileSync(indexPath, content);
  console.log('✅ Sucesso: Atributo type="module" adicionado ao index.html!');
} else {
  console.log('❌ Erro: index.html não encontrado em dist/');
}
