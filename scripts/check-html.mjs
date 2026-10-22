import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

let failures = 0;
function check(name, passed, detail = '') {
  if (passed) {
    console.log('PASS  ' + name);
  } else {
    failures++;
    console.error('FAIL  ' + name + (detail ? ': ' + detail : ''));
  }
}

const htmlPath = resolve(process.cwd(), 'index.html');
const html = readFileSync(htmlPath, 'utf8');
const moduleScripts = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
check('index.html exists and is non-empty', html.length > 1000);
check('exactly one module script', moduleScripts.length === 1, 'found ' + moduleScripts.length);
check('Three.js import map is configured', html.includes('"three":"https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js"'));
check('unused hidden avatar geometry removed', !html.includes('mobileAvatar'));
for (const id of ['enter', 'start', 'reset', 'hint']) {
  check('required UI element #' + id, new RegExp('id="' + id + '"').test(html));
}
for (const marker of [
  "renderer.xr.setReferenceSpaceType('local-floor')",
  "requiredFeatures:['local-floor']",
  'TARGET_VR_EYE_HEIGHT=1.52',
  'headOffset.position.y=TARGET_VR_EYE_HEIGHT-pose.transform.position.y',
  'camera.position.set(0,1.52,0)',
  'testHand.visible=false',
  'hand.visible=true',
  'renderer.xr.getControllerGrip(0)',
  'controllerConnected[i]',
  "fillText('NO EXIT'",
  'const signZ=-half+.115',
  'session.end().catch(()=>{})',
  "session.addEventListener('end'",
  'getViewerPose(renderer.xr.getReferenceSpace())',
  'new THREE.InstancedMesh(wallGeo',
  'wallpaperTexture=makeCanvasTexture',
  'carpetTexture=makeCanvasTexture',
  'ceilingTexture=makeCanvasTexture',
  'function updateMonster(dt,xrFrame)',
  'function playMonsterNoise()',
  "window.addEventListener('unhandledrejection'"
]) {
  check('required feature: ' + marker, html.includes(marker));
}

if (moduleScripts.length === 1) {
  const tempPath = join(tmpdir(), 'backroomsgtag-module-check-' + process.pid + '.mjs');
  try {
    writeFileSync(tempPath, moduleScripts[0][1], 'utf8');
    const syntax = spawnSync(process.execPath, ['--check', tempPath], { encoding: 'utf8' });
    check('module JavaScript syntax', syntax.status === 0, (syntax.stderr || syntax.stdout || '').trim());
  } finally {
    try { unlinkSync(tempPath); } catch {}
  }
}

if (failures) {
  console.error('Static smoke check failed: ' + failures + ' check(s).');
  process.exitCode = 1;
} else {
  console.log('All static checks passed. Headset runtime/performance still requires manual testing.');
}
