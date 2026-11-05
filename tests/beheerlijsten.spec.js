// ClubComm — Besluit NNN: Rollen per rol ingeklapt met zoeken en een regel voor teams zonder trainer of teamleider; Seizoen per bouw ingeklapt.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer } = require('./hulp');
const TAG = { tag: ['@clubbeheer', '@schermen'] };
const beheerder = async (page, tab) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.evaluate((t) => { const S = CC.S(); CC.login(S.demo.peter); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'beheerder')); CC.go(t); }, tab);
};

test('Rollen: per rol ingeklapt, zoeken opent de juiste groep, korter dan één scherm', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await beheerder(page, 'rollen');
  const groepen = page.locator('#app details.bl-groep');
  await expect(groepen.first()).toContainText('Trainers (15)');
  await expect(page.locator('#app details.bl-groep[open]')).toHaveCount(0);
  await expect(groepen.filter({ hasText: 'Ouders' })).toHaveCount(1);
  // Mensen-deel tot de vaste blokken: hooguit ongeveer één scherm
  const hoogte = await page.evaluate(() => { const b = document.querySelector('#app .blokken'); return b ? b.getBoundingClientRect().top + scrollY : 9999; });
  expect(hoogte).toBeLessThan(844 * 1.3);
  // Zoeken: alleen treffers, groepen met een treffer gaan open; leegmaken zet alles terug
  await page.fill('[data-filter="rollen"]', 'dennis peters');
  await expect(page.locator('#app [data-act="rollenPersoon"]:visible')).toHaveCount(1);
  await expect(page.locator('#app [data-act="rollenPersoon"]:visible')).toContainText('Trainer O9-1');
  await page.fill('[data-filter="rollen"]', 'xyz');
  await expect(page.locator('#app .bl-leeg')).toBeVisible();
  await page.fill('[data-filter="rollen"]', '');
  await expect(page.locator('#app details.bl-groep[open]')).toHaveCount(0);
  // Een persoon openen werkt zoals eerder
  await groepen.first().locator('summary').click();
  await groepen.first().locator('[data-act="rollenPersoon"]').first().click();
  await expect(page.locator('#sheet')).toBeVisible();
  await controleer(page, fouten, 'rollen ingeklapt');
});

test('Rollen: regel voor teams zonder trainer of teamleider; de rol staat al goed', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await beheerder(page, 'rollen');
  const zonder = await page.evaluate(() => { const S = CC.S(); const t = S.teams[0];
    S.people.forEach((p) => { p.rollen = p.rollen.filter((r) => !(r.rol === 'teamleider' && r.teamId === t.id)); }); CC.save(); CC.render();
    return { naam: t.naam, n: CC.teamsZonder(S).length }; });
  const regel = page.locator('#app [data-act="teamsZonder"]');
  await expect(regel).toContainText(`${zonder.n} team`); await expect(regel).toContainText(zonder.naam);
  await regel.click();
  await page.locator('#sheet [data-act="stafNieuw"][data-rol="teamleider"]').first().click();
  await expect(page.locator('#sn-r')).toHaveValue('teamleider');
  await controleer(page, fouten, 'teams zonder');
});

test('Seizoen: teams per bouw ingeklapt met aandacht in de kop; zoeken en een team openen', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await beheerder(page, 'seizoen');
  await page.evaluate(() => { const S = CC.S(); S.teams.find((t) => t.naam === 'O8-1').trainerId = null; CC.render(); });
  const groepen = page.locator('#app .tb-teams details.bl-groep');
  await expect(groepen).toHaveCount(2);
  await expect(groepen.filter({ hasText: 'Onderbouw' })).toContainText('2 zonder trainer') // O12-4 heeft in de demo al geen trainer;
  await expect(page.locator('#app .tb-teams details.bl-groep[open]')).toHaveCount(0);
  await page.fill('[data-filter="teams"]', 'o10-2');
  await expect(page.locator('#app [data-act="teamBeheer"]:visible')).toHaveCount(1);
  await page.locator('#app [data-act="teamBeheer"]:visible').click();
  await expect(page.locator('#sheet')).toContainText('O10-2');
  await controleer(page, fouten, 'seizoen per bouw');
});
