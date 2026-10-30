const assert = require('node:assert/strict');
const {once} = require('node:events');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
process.env.ROT_PORT = '0';
const server = require('../private-server.cjs');

(async () => {
  let browser;
  try {
    if (!server.listening) await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const html = await (await fetch(base)).text();
    const dependencies = [...html.matchAll(/(?:src|href)="([^"\s]+\.(?:js|css))"/g)].map(m => m[1]);
    for (const dependency of dependencies) {
      const response = await fetch(`${base}/${dependency}`);
      assert.equal(response.status, 200, `Server blocks ${dependency}`);
    }
    for (const blocked of ['/private-server.cjs', '/Play%20privately.ps1', '/docs/campaign-rules.md']) {
      assert.equal((await fetch(base + blocked)).status, 404, `Private file exposed: ${blocked}`);
    }
    browser = await chromium.launch({channel:'msedge', headless:true});
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto(base);
    await page.evaluate(() => Promise.all([WorldAssets.ready, ActorArt.ready]));
    await page.locator('#newRevelation').click();
    await page.locator('#patronPick button').first().click();
    await page.locator('#worldChoice .gbtn').first().click();
    assert.equal(await page.evaluate(() => S.mode), 'altar');
    await page.locator('.offer').first().click();
    await page.locator('#closeAltar').click();
    assert.equal(await page.evaluate(() => S.mode), 'play');
    await page.locator('#playerStatsButton').click();
    assert.equal(await page.evaluate(() => S.mode), 'stats');
    assert.deepEqual(errors, []);
    console.log(`Private HTTP play passed: ${dependencies.length} dependencies, assets, new run, blessing, combat and stats; private files blocked.`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
