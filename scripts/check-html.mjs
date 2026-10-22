import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
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
  'wallH=2.65',
  'sign.position.set(0,2.22,signZ)',
  'session.end().catch(()=>{})',
  "addEventListener('blur',()=>{keys={};dragging=false;activeTouchId=null;velocity.set(0,0,0);})",
  "document.addEventListener('visibilitychange'",
  "session.addEventListener('end'",
  'getViewerPose(renderer.xr.getReferenceSpace())',
  'new THREE.InstancedMesh(wallGeo',
  'new THREE.InstancedMesh(ceilingTileGeo',
  'ceilingTiles.setColorAt(ceilingTileIndex,tileTint)',
  'const ceilingGridCount=Math.ceil(mazeSize*cell/.6)',
  'const wideRooms=[]',
  'new THREE.InstancedMesh(pillarGeo',
  'for(const b of roomPillarBoxes)',
  'headOffset.position.y=TARGET_VR_EYE_HEIGHT-pose.transform.position.y',
  'wallpaperTexture=makeCanvasTexture',
  'carpetTexture=makeCanvasTexture',
  'ceilingTexture=makeCanvasTexture',
  'const monsterCell={x:mazeSize-1,z:mazeSize-1}',
  'yaw=grid[mazeSize-1][0].w[3]?0:-Math.PI/2;',
  'function updateMonster(dt,xrFrame)',
  'for(const [frequency,level] of [[119.8,.55],[239.6,.22],[359.4,.08]])',
  'new THREE.PointLight(0xffe8ad,.72,16,2)',
  'function playMonsterNoise()',
  "window.addEventListener('unhandledrejection'"
]) {
  check('required feature: ' + marker, html.includes(marker));
}

// Execute the exact maze-generation block (without Three.js/DOM) repeatedly to catch graph regressions.
const generationStart = html.indexOf('const grid=Array.from');
const generationEnd = html.indexOf('const wallGeo=', generationStart);
let mazeTrialsPassed = generationStart >= 0 && generationEnd > generationStart;
let mazeTrialDetail = '';
if (mazeTrialsPassed) {
  const generationCode = html.slice(generationStart, generationEnd) +
    '\nglobalThis.__grid = grid; globalThis.__dirs = dirs; globalThis.__wideRooms = wideRooms;';
  for (let trial = 0; trial < 50; trial++) {
    try {
      const context = { mazeSize: 13 };
      runInNewContext(generationCode, context);
      const grid = context.__grid;
      const dirs = context.__dirs;
      const queue = [[0, 0]];
      const reached = new Set(['0,0']);
      for (let head = 0; head < queue.length; head++) {
        const [x, z] = queue[head];
        for (const d of dirs) {
          const nx = x + d[0], nz = z + d[1];
          if (nx < 0 || nz < 0 || nx >= 13 || nz >= 13) continue;
          if (grid[z][x].w[d[2]]) continue;
          const key = nx + ',' + nz;
          if (!reached.has(key)) { reached.add(key); queue.push([nx, nz]); }
        }
      }
      if (reached.size !== 169) {
        mazeTrialsPassed = false;
        mazeTrialDetail = 'trial ' + (trial + 1) + ' reached ' + reached.size + '/169 cells';
        break;
      }
      for (const room of context.__wideRooms) {
        for (const x of [room.x, room.x + 1]) {
          if (grid[room.z][x].w[1] || grid[room.z + 1][x].w[3]) {
            mazeTrialsPassed = false; mazeTrialDetail = 'wide room missing a Z opening'; break;
          }
        }
        for (const z of [room.z, room.z + 1]) {
          if (grid[z][room.x].w[2] || grid[z][room.x + 1].w[0]) {
            mazeTrialsPassed = false; mazeTrialDetail = 'wide room missing an X opening'; break;
          }
        }
        if (!mazeTrialsPassed) break;
      }
      if (!mazeTrialsPassed) break;
    } catch (error) {
      mazeTrialsPassed = false;
      mazeTrialDetail = String(error);
      break;
    }
  }
}
check('50 generated maze layouts stay connected and widened rooms are fully open', mazeTrialsPassed, mazeTrialDetail);

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
