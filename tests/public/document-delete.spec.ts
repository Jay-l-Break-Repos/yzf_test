import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Upload a small text document via the Upload page so we have something to
 * delete in the delete-flow tests.  Returns the document name used.
 */
async function uploadTestDocument(page: Page, name: string = 'test-delete-doc.txt'): Promise<string> {
    await page.goto('/upload');

    // Create an in-memory file and attach it to the file input
    const fileContent = 'This is a test document for deletion.';
    await page.setInputFiles('input[type="file"]', {
        name,
        mimeType: 'text/plain',
        buffer: Buffer.from(fileContent),
    });

    // Submit the upload form
    const uploadButton = page.getByRole('button', { name: /upload/i }).last();
    await uploadButton.click();

    // Wait for navigation back to documents list or a success indicator
    await page.waitForURL(/\/documents/, { timeout: 10_000 });

    return name;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Document deletion', () => {

    test('documents page loads and shows the document list', async ({ page }) => {
        await page.goto('/documents');
        await expect(page).toHaveURL(/\/documents/);
        // The heading should be visible
        await expect(page.getByRole('heading', { name: /documents/i })).toBeVisible();
    });

    test('delete button is visible for each document in the list', async ({ page }) => {
        // Upload a document first so the list is non-empty
        await uploadTestDocument(page, 'btn-visibility-test.txt');

        await page.goto('/documents');

        // Wait for the table to render
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        // At least one delete button should be present
        const deleteButtons = page.getByRole('button', { name: /delete/i });
        await expect(deleteButtons.first()).toBeVisible();
    });

    test('clicking delete button opens confirmation dialog', async ({ page }) => {
        await uploadTestDocument(page, 'dialog-open-test.txt');

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        // Click the first delete button
        const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
        await deleteBtn.click();

        // The confirmation dialog should appear
        await expect(page.getByRole('dialog')).toBeVisible();
        // It should mention deletion
        await expect(page.getByText(/delete document/i)).toBeVisible();
    });

    test('cancel button closes the confirmation dialog without deleting', async ({ page }) => {
        await uploadTestDocument(page, 'cancel-test.txt');

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        // Count rows before
        const rowsBefore = await page.locator('table tbody tr').count();

        // Open dialog then cancel
        await page.getByRole('button', { name: /delete/i }).first().click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: /cancel/i }).click();

        // Dialog should be gone
        await expect(page.getByRole('dialog')).not.toBeVisible();

        // Row count should be unchanged
        const rowsAfter = await page.locator('table tbody tr').count();
        expect(rowsAfter).toBe(rowsBefore);
    });

    test('confirming deletion removes the document from the list', async ({ page }) => {
        const docName = 'confirm-delete-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        // Find the row for our specific document
        const docRow = page.locator('table tbody tr', { hasText: docName });
        await expect(docRow).toBeVisible();

        // Click its delete button
        await docRow.getByRole('button', { name: /delete/i }).click();

        // Confirm in the dialog
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: /^delete$/i }).click();

        // The row should disappear
        await expect(docRow).not.toBeVisible({ timeout: 10_000 });
    });

    test('user receives a success confirmation message after deletion', async ({ page }) => {
        const docName = 'success-toast-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const docRow = page.locator('table tbody tr', { hasText: docName });
        await docRow.getByRole('button', { name: /delete/i }).click();

        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: /^delete$/i }).click();

        // A success toast / confirmation message should appear
        await expect(
            page.getByText(/deleted successfully/i)
        ).toBeVisible({ timeout: 10_000 });
    });

    test('deleted document no longer appears after page reload', async ({ page }) => {
        const docName = 'reload-persistence-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const docRow = page.locator('table tbody tr', { hasText: docName });
        await docRow.getByRole('button', { name: /delete/i }).click();
        await page.getByRole('button', { name: /^delete$/i }).click();

        // Wait for the row to disappear
        await expect(docRow).not.toBeVisible({ timeout: 10_000 });

        // Reload and confirm it's still gone
        await page.reload();
        await page.waitForSelector('table', { timeout: 10_000 });
        await expect(page.locator('table tbody tr', { hasText: docName })).not.toBeVisible();
    });

});
