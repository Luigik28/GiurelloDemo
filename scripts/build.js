'use strict';

/**
 * Build di produzione:
 *  - JS: bundle + minificazione (esbuild) + offuscamento (javascript-obfuscator)
 *  - CSS: minificazione (esbuild)
 *  - nomi file con hash del contenuto (cache immutabile) e nessuna source map
 * Solo la cartella dist/ finisce nell'immagine di produzione: i sorgenti client non vengono pubblicati.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const esbuild = require('esbuild');
const JavaScriptObfuscator = require('javascript-obfuscator');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const ASSETS = path.join(OUT, 'public', 'assets');
const STATIC = path.join(OUT, 'public', 'static');

const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(ASSETS, { recursive: true });
  fs.mkdirSync(STATIC, { recursive: true });

  const js = await esbuild.build({
    entryPoints: [path.join(ROOT, 'client/js/main.js')],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    legalComments: 'none',
    sourcemap: false,
    write: false
  });

  const obfuscated = JavaScriptObfuscator.obfuscate(js.outputFiles[0].text, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.2,
    identifierNamesGenerator: 'hexadecimal',
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 8,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.9,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
    sourceMap: false
  }).getObfuscatedCode();

  const css = await esbuild.build({
    entryPoints: [path.join(ROOT, 'client/css/styles.css')],
    bundle: true,
    minify: true,
    legalComments: 'none',
    target: ['chrome100', 'safari15', 'firefox100'],
    loader: { '.css': 'css' },
    write: false
  });
  const cssText = css.outputFiles[0].text;

  const jsName = `app.${hash(obfuscated)}.js`;
  const cssName = `app.${hash(cssText)}.css`;
  fs.writeFileSync(path.join(ASSETS, jsName), obfuscated);
  fs.writeFileSync(path.join(ASSETS, cssName), cssText);

  for (const f of fs.readdirSync(path.join(ROOT, 'client/static'))) {
    fs.copyFileSync(path.join(ROOT, 'client/static', f), path.join(STATIC, f));
  }

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ js: jsName, css: cssName }, null, 2));
  const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} kB`;
  console.log(`build ok → ${jsName} (${kb(obfuscated)}), ${cssName} (${kb(cssText)})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
