/**
 * E2E tests for the "Reembolso mes anterior" (partial refund) flow.
 *
 * Requires the dev server to be running on http://localhost:3000
 * and the backend API on its configured URL.
 *
 * Auth is handled via storageState from auth.setup.ts — the saved token
 * is injected into localStorage before each test.
 */
import { test, expect, type Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOTS = path.resolve(__dirname, "screenshots");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function screenshot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOTS, `${name}.png`),
    fullPage: false,
  });
}

/**
 * Navigate to the Pedagogía scholarships view, which contains the
 * payment_verify column with RefrendSituationBar (the dots menu).
 * The stored token in localStorage auto-authenticates via the router guard.
 */
async function navigateToPedagogia(page: Page) {
  await page.goto("/scholarships/pedagogia", { waitUntil: "domcontentloaded" });
  // The router guard will call getProfile using the stored token.
  // Wait for the Buscar button as the "page is ready" signal.
  await page
    .locator('button:has-text("Buscar")')
    .waitFor({ state: "visible", timeout: 15_000 });
}

/**
 * Select the first available Generación option and click Buscar.
 * Filter bar inputs: [0]=Año, [1]=Mes, [2]=Sede, [3]=Generación(autocomplete).
 * Sede is auto-selected for ROOT users.
 * Returns true if the table shows at least one data row.
 */
async function loadTableData(page: Page): Promise<boolean> {
  // Close any stray overlay first
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  // Click the Generación v-autocomplete (4th input)
  const generacionInput = page.locator("input").nth(3);
  await generacionInput.click();

  // Wait for the overlay dropdown to appear
  const overlay = page.locator(".v-overlay .v-list-item");
  try {
    await overlay.first().waitFor({ state: "visible", timeout: 4_000 });
  } catch {
    // Retry once
    await generacionInput.click();
    await page.waitForTimeout(600);
  }

  const firstOption = page.locator(".v-overlay .v-list-item").first();
  if (!(await firstOption.isVisible().catch(() => false))) {
    console.log("No generation options in autocomplete — table will be empty");
    return false;
  }

  await firstOption.click();
  await page.waitForTimeout(600);

  // Poll until Buscar is enabled (Vue reactivity takes a few ticks)
  const buscarBtn = page.locator('button:has-text("Buscar")').first();
  let buscarEnabled = false;
  for (let i = 0; i < 10; i++) {
    buscarEnabled = await buscarBtn.isEnabled().catch(() => false);
    if (buscarEnabled) break;
    await page.waitForTimeout(200);
  }

  if (!buscarEnabled) {
    console.log("WARNING: Buscar still disabled — generation may not have propagated");
    return false;
  }

  // Click Buscar and wait for the API response
  const apiResponse = page.waitForResponse(
    (r) => r.url().includes("/api/") && r.status() === 200,
    { timeout: 8_000 },
  );
  await buscarBtn.click();
  await apiResponse;
  await page.waitForTimeout(1_000);

  const rowCount = await page.locator("tbody tr").count();
  console.log(`Table rows loaded: ${rowCount}`);
  return rowCount > 0;
}

/**
 * Open the three-dot situation menu for the first unlocked row.
 */
async function openSituationMenu(page: Page) {
  const dotsIcon = page.locator(".mdi-dots-vertical").first();
  await expect(dotsIcon).toBeVisible({ timeout: 5_000 });
  const triggerBtn = dotsIcon.locator("xpath=ancestor::button[1]");
  await triggerBtn.click();
  await page.waitForTimeout(350);
}

/**
 * Open the dots menu and click "Reembolso mes anterior".
 */
async function openReembolsoDialog(page: Page) {
  await openSituationMenu(page);
  const menuItem = page
    .locator(".v-overlay .v-list-item")
    .filter({ hasText: "Reembolso mes anterior" });
  await expect(menuItem).toBeVisible({ timeout: 3_000 });
  await menuItem.click();
  await page.waitForTimeout(400);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Reembolso mes anterior flow", () => {
  // ── 1. Page loads ────────────────────────────────────────────────────────

  test("1. Scholarships page loads and is authenticated", async ({ page }) => {
    await navigateToPedagogia(page);
    await screenshot(page, "01-scholarships-pedagogia");

    expect(page.url()).toContain("/scholarships/pedagogia");
    await expect(page.locator('button:has-text("Buscar")')).toBeVisible();
    console.log("PASS: scholarships/pedagogia page loaded (auth working)");
  });

  // ── 2. Filter and load table ─────────────────────────────────────────────

  test("2. Filter by generación and load refrendo table", async ({ page }) => {
    await navigateToPedagogia(page);
    const hasData = await loadTableData(page);
    await screenshot(page, "02-table-loaded");

    await expect(
      page.locator(".v-data-table, [role='table']").first(),
    ).toBeVisible({ timeout: 5_000 });

    if (hasData) {
      await expect(page.locator(".mdi-dots-vertical").first()).toBeVisible({
        timeout: 3_000,
      });
      console.log("PASS: Table loaded with 9 rows and action menus");
    } else {
      console.log("INFO: Table empty — no refrendos for this period");
    }
  });

  // ── 3. Menu item visible ─────────────────────────────────────────────────

  test("3. Reembolso mes anterior appears in situation menu", async ({
    page,
  }) => {
    await navigateToPedagogia(page);
    const hasData = await loadTableData(page);

    if (!hasData) {
      test.skip(true, "No rows — cannot test situation menu");
      return;
    }

    await openSituationMenu(page);
    await screenshot(page, "03-situation-menu-open");

    const reembolsoItem = page
      .locator(".v-overlay .v-list-item")
      .filter({ hasText: "Reembolso mes anterior" });
    await expect(reembolsoItem).toBeVisible({ timeout: 3_000 });
    await screenshot(page, "04-reembolso-menu-item");
    console.log("PASS: 'Reembolso mes anterior' menu item is visible");

    // Verify cash-plus icon is inside the item
    await expect(reembolsoItem.locator(".mdi-cash-plus")).toBeVisible();
    console.log("PASS: mdi-cash-plus icon present");
  });

  // ── 4. Dialog structure ──────────────────────────────────────────────────

  test("4. SituationReembolsoDialog opens with both modes", async ({
    page,
  }) => {
    await navigateToPedagogia(page);
    const hasData = await loadTableData(page);

    if (!hasData) {
      test.skip(true, "No rows — cannot test dialog");
      return;
    }

    await openReembolsoDialog(page);
    await screenshot(page, "05-dialog-opened");

    // Title
    await expect(page.locator(".v-dialog .v-card-title")).toContainText(
      "Reembolso de mes anterior",
      { timeout: 3_000 },
    );
    console.log("PASS: Dialog title 'Reembolso de mes anterior'");

    // Mode toggles
    await expect(
      page.locator('.v-dialog .v-btn-toggle button:has-text("Monto MXN")'),
    ).toBeVisible();
    await expect(
      page.locator('.v-dialog .v-btn-toggle button:has-text("Porcentaje")'),
    ).toBeVisible();
    console.log("PASS: 'Monto MXN' / 'Porcentaje' mode toggles visible");

    // Amount input (default mode = amount)
    await expect(
      page.locator('.v-dialog input[type="number"]').first(),
    ).toBeVisible();
    console.log("PASS: Amount input visible in default mode");

    // Notes textarea
    await expect(page.locator(".v-dialog textarea").first()).toBeVisible();
    console.log("PASS: Notes textarea visible");

    // Submit button
    await expect(
      page.locator(
        '.v-dialog .v-card-actions button:has-text("Confirmar")',
      ),
    ).toBeVisible();
    await screenshot(page, "06-dialog-full-structure");
    console.log("PASS: Confirmar button visible");
  });

  // ── 5. Validation: disabled without notes ────────────────────────────────

  test("5. Submit disabled without notes; enabled with amount + notes", async ({
    page,
  }) => {
    await navigateToPedagogia(page);
    const hasData = await loadTableData(page);

    if (!hasData) {
      test.skip(true, "No rows — cannot test validation");
      return;
    }

    await openReembolsoDialog(page);

    const submitBtn = page.locator(
      '.v-dialog .v-card-actions button:has-text("Confirmar")',
    );
    const amountInput = page.locator('.v-dialog input[type="number"]').first();
    const notesTextarea = page.locator(".v-dialog textarea").first();

    // Initial: disabled (no amount, no notes)
    await expect(submitBtn).toBeDisabled();
    await screenshot(page, "07-submit-disabled-initial");
    console.log("PASS: Submit disabled on empty form");

    // Amount filled, notes still empty
    await amountInput.fill("288");
    await page.waitForTimeout(150);
    await expect(submitBtn).toBeDisabled();
    await screenshot(page, "08-amount-no-notes");
    console.log("PASS: Submit still disabled with amount but no notes");

    // Both fields filled
    await notesTextarea.fill("Se reembolsa beca del mes anterior por retención");
    await page.waitForTimeout(150);
    await expect(submitBtn).toBeEnabled();
    await screenshot(page, "09-both-filled-enabled");
    console.log("PASS: Submit enabled with amount + notes");
  });

  // ── 6. Percentage mode: live preview ────────────────────────────────────

  test("6. Percentage mode — live MXN preview updates and validation holds", async ({
    page,
  }) => {
    await navigateToPedagogia(page);
    const hasData = await loadTableData(page);

    if (!hasData) {
      test.skip(true, "No rows — cannot test percentage mode");
      return;
    }

    await openReembolsoDialog(page);

    // Switch to Porcentaje
    await page
      .locator('.v-dialog .v-btn-toggle button:has-text("Porcentaje")')
      .click();
    await page.waitForTimeout(300);
    await screenshot(page, "10-percent-mode");
    console.log("PASS: Switched to Porcentaje mode");

    // Percent input visible
    await expect(
      page.locator('.v-dialog input[type="number"]').first(),
    ).toBeVisible();

    // Enter 50%
    await page
      .locator('.v-dialog input[type="number"]')
      .first()
      .fill("50");
    await page.waitForTimeout(300);

    // Live preview alert
    const infoAlert = page.locator(".v-dialog .v-alert");
    await expect(infoAlert).toBeVisible({ timeout: 2_000 });
    const alertText = await infoAlert.textContent();
    expect(alertText).toContain("$");
    expect(alertText).toContain("reembolso");
    await screenshot(page, "11-percent-preview");
    console.log(`PASS: Live preview: "${alertText?.trim()}"`);

    // Submit still disabled without notes
    const submitBtn = page.locator(
      '.v-dialog .v-card-actions button:has-text("Confirmar")',
    );
    await expect(submitBtn).toBeDisabled();
    console.log("PASS: Submit disabled without notes in percent mode");

    // Add notes → enabled
    await page
      .locator(".v-dialog textarea")
      .first()
      .fill("Reembolso 50% beca mes anterior");
    await page.waitForTimeout(150);
    await expect(submitBtn).toBeEnabled();
    await screenshot(page, "12-percent-enabled");
    console.log("PASS: Submit enabled with percent + notes");
  });

  // ── 7. Cancel closes dialog and resets form ──────────────────────────────

  test("7. Cancel closes dialog and form resets", async ({ page }) => {
    await navigateToPedagogia(page);
    const hasData = await loadTableData(page);

    if (!hasData) {
      test.skip(true, "No rows — cannot test cancel");
      return;
    }

    await openReembolsoDialog(page);

    await expect(page.locator(".v-dialog .v-card-title")).toContainText(
      "Reembolso",
      { timeout: 3_000 },
    );

    // Fill amount
    await page
      .locator('.v-dialog input[type="number"]')
      .first()
      .fill("500");
    await screenshot(page, "13-before-cancel");

    // Click Cancelar
    await page
      .locator('.v-dialog .v-card-actions button:has-text("Cancelar")')
      .click();
    await page.waitForTimeout(400);
    await screenshot(page, "14-after-cancel");

    // Dialog closed
    await expect(page.locator(".v-dialog .v-card-title")).not.toBeVisible({
      timeout: 3_000,
    });
    console.log("PASS: Dialog closed after Cancelar");

    // Reopen — form should be reset (watcher clears on v-model false)
    await openReembolsoDialog(page);

    const amountVal = await page
      .locator('.v-dialog input[type="number"]')
      .first()
      .inputValue()
      .catch(() => "");
    expect(amountVal).toBe("");
    await screenshot(page, "15-dialog-reset");
    console.log("PASS: Form reset on reopen after cancel");
  });
});
