import { test, expect } from '@playwright/test'

test.describe('Core Workflow', () => {
  test('login → dashboard carga correctamente', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('crear proyecto → editor → SQL → nodo visible', async ({ page }) => {
    await page.goto('/dashboard')

    // Find and click "Nuevo" button
    const newBtn = page.locator('button').filter({ hasText: /nuevo/i }).first()
    await newBtn.click()

    // Wait for editor to load
    await page.waitForURL(/\/editor\//, { timeout: 10_000 })

    // Wait for Monaco Editor to appear
    await page.locator('.monaco-editor').first().waitFor({ timeout: 15_000 })

    // Click into Monaco to focus it
    await page.locator('.monaco-editor').first().click()

    // Select all and type SQL
    await page.keyboard.press('Control+A')
    await page.keyboard.type('CREATE TABLE e2e_test (id INT PRIMARY KEY, name TEXT);')

    // Wait for the debounce to fire and node to appear (up to 8s)
    const node = page.locator('.react-flow__node').filter({ hasText: 'e2e_test' })
    await expect(node).toBeVisible({ timeout: 8_000 })
  })
})
