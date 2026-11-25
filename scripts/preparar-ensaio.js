// Prepara as fotos do ensaio para a web, sem mexer nos arquivos originais.
//
//   npm run ensaio -- <pasta com os .jpg originais> [prefixo dos arquivos]
//   ex.: npm run ensaio -- ~/Downloads ST208321
//
// Gera em public/ensaio/:
//   720/ 1440/ 2560/ 3840/  versões AVIF (o navegador escolhe a certa para a tela)
//   reserva/                JPEG para navegadores sem AVIF
//   originais/              cópia idêntica do arquivo da fotógrafa (fora do git)
//   fotos.json              lista usada pelo site
// Fotos já processadas são puladas; cópias baixadas em dobro — "foto (1).jpg" — são ignoradas.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const [origem, prefixo = ''] = process.argv.slice(2);
if (!origem) {
  console.error('Uso: npm run ensaio -- <pasta dos originais> [prefixo]');
  process.exit(1);
}

const DESTINO = path.join(__dirname, '..', 'public', 'ensaio');
const TAMANHOS = [720, 1440, 2560, 3840]; // lado maior, em pixels
const RESERVA = 1920;
sharp.cache(false);

const idDe = (f) => path.parse(f).name.replace(/ \(\d+\)$/, '').trim();

async function gerar(arquivo, saida, etapa) {
  if (fs.existsSync(saida)) return;
  const tmp = saida + '.tmp'; // se for interrompido, não deixa arquivo pela metade
  await etapa(sharp(arquivo).rotate()).toFile(tmp);
  fs.renameSync(tmp, saida);
}

async function preparar(arquivo, id) {
  const caber = (s, lado) => s.resize(lado, lado, { fit: 'inside', withoutEnlargement: true });
  for (const lado of TAMANHOS) {
    await gerar(arquivo, path.join(DESTINO, String(lado), id + '.avif'), (s) =>
      caber(s, lado).avif({ quality: 85, effort: 4, chromaSubsampling: '4:4:4' })
    );
  }
  await gerar(arquivo, path.join(DESTINO, 'reserva', id + '.jpg'), (s) =>
    caber(s, RESERVA).jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: true })
  );
  const original = path.join(DESTINO, 'originais', id + '.jpg');
  if (!fs.existsSync(original)) fs.copyFileSync(arquivo, original, fs.constants.COPYFILE_FICLONE);

  const { autoOrient } = await sharp(arquivo).metadata();
  const { dominant: c } = await sharp(await sharp(arquivo).resize(64, 64, { fit: 'inside' }).toBuffer()).stats();
  const cor = '#' + [c.r, c.g, c.b].map((n) => n.toString(16).padStart(2, '0')).join('');
  return { id, w: autoOrient.width, h: autoOrient.height, cor };
}

(async () => {
  for (const d of [...TAMANHOS.map(String), 'reserva', 'originais']) fs.mkdirSync(path.join(DESTINO, d), { recursive: true });

  const unicos = new Map();
  for (const f of fs.readdirSync(origem).sort()) {
    if (!/\.jpe?g$/i.test(f) || !f.startsWith(prefixo)) continue;
    if (!unicos.has(idDe(f))) unicos.set(idDe(f), path.join(origem, f));
  }
  const fila = [...unicos].sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true }));
  const fotos = new Array(fila.length);
  let proxima = 0;
  let prontas = 0;
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (proxima < fila.length) {
        const i = proxima++;
        const [id, arquivo] = fila[i];
        fotos[i] = await preparar(arquivo, id);
        console.log(`${++prontas}/${fila.length} ${id}`);
      }
    })
  );
  fs.writeFileSync(path.join(DESTINO, 'fotos.json'), '[\n' + fotos.map((f) => JSON.stringify(f)).join(',\n') + '\n]\n');
  console.log(`✅ ${fotos.length} fotos em public/ensaio`);
})();
