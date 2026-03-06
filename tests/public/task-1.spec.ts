import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Upload a small text document via the Upload page so we have something to
 * delete in the delete-flow tests. Returns the document name used.
 */
async function uploadTestDocument(page: Page, name: string = 'test-delete-doc.txt'): Promise<string> {
    await page.goto('/upload');

    const fileContent = 'This is a test document for deletion.';
    await page.setInputFiles('input[type="file"]', {
        name,
        mimeType: 'text/plain',
        buffer: Buffer.from(fileContent),
    });

    // Submit the upload form — click the last button matching "upload"
    const uploadButton = page.getByRole('button', { name: /upload/i }).last();
    await uploadButton.click();

    // Wait for navigation to documents list
    await page.waitForURL(/\/documents/, { timeout: 15_000 });

    return name;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Task 1 – Document deletion', () => {

    // -----------------------------------------------------------------------
    // List view: delete button per row
    // -----------------------------------------------------------------------

    test('documents page loads and shows the document list', async ({ page }) => {
        await page.goto('/documents');
        await expect(page).toHaveURL(/\/documents/);
        await expect(page.getByRole('heading', { name: /documents/i })).toBeVisible();
    });

    test('each document row has a Delete button (title="Delete")', async ({ page }) => {
        await uploadTestDocument(page, 'row-delete-btn-test.txt');

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        // The test runner targets buttons by title="Delete"
        const deleteBtn = page.getByTitle('Delete').first();
        await expect(deleteBtn).toBeVisible();
    });

    test('clicking title="Delete" opens the confirmation dialog', async ({ page }) => {
        await uploadTestDocument(page, 'dialog-open-test.txt');

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const row = page.locator('table tbody tr').first();
        await row.getByTitle('Delete').click();

        // Dialog must be visible with heading "Delete Document"
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Delete Document' })).toBeVisible();
    });

    test('dialog shows the filename in quotes', async ({ page }) => {
        const docName = 'quoted-filename-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const docRow = page.locator('table tbody tr', { hasText: docName });
        await docRow.getByTitle('Delete').click();

        await expect(page.getByRole('dialog')).toBeVisible();
        // Filename must appear in quotes inside the dialog
        await expect(page.getByText(`"${docName}"`)).toBeVisible();
    });

    test('Cancel button closes the dialog without deleting', async ({ page }) => {
        await uploadTestDocument(page, 'cancel-test.txt');

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const rowsBefore = await page.locator('table tbody tr').count();

        await page.locator('table tbody tr').first().getByTitle('Delete').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect(page.getByRole('dialog')).not.toBeVisible();
        const rowsAfter = await page.locator('table tbody tr').count();
        expect(rowsAfter).toBe(rowsBefore);
    });

    test('confirming deletion removes the document from the list', async ({ page }) => {
        const docName = 'confirm-delete-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const docRow = page.locator('table tbody tr', { hasText: docName });
        await expect(docRow).toBeVisible();

        await docRow.getByTitle('Delete').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Exact "Delete" button (not "Delete Document" heading)
        await page.getByRole('button', { name: 'Delete' }).click();

        await expect(docRow).not.toBeVisible({ timeout: 10_000 });
    });

    test('shows "Document deleted successfully" toast after deletion', async ({ page }) => {
        const docName = 'success-toast-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const docRow = page.locator('table tbody tr', { hasText: docName });
        await docRow.getByTitle('Delete').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByRole('button', { name: 'Delete' }).click();

        await expect(
            page.getByText('Document deleted successfully')
        ).toBeVisible({ timeout: 10_000 });
    });

    test('deleted document no longer appears after page reload', async ({ page }) => {
        const docName = 'reload-persistence-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const docRow = page.locator('table tbody tr', { hasText: docName });
        await docRow.getByTitle('Delete').click();
        await page.getByRole('button', { name: 'Delete' }).click();
        await expect(docRow).not.toBeVisible({ timeout: 10_000 });

        await page.reload();
        await page.waitForSelector('table', { timeout: 10_000 });
        await expect(page.locator('table tbody tr', { hasText: docName })).not.toBeVisible();
    });

    // -----------------------------------------------------------------------
    // Document view page: delete button in header
    // -----------------------------------------------------------------------

    test('document view page has a Delete Document button (title="Delete Document")', async ({ page }) => {
        const docName = 'view-delete-btn-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        // Navigate into the document view
        const docRow = page.locator('table tbody tr', { hasText: docName });
        await docRow.click();
        await page.waitForURL(/\/documents\/\d+/, { timeout: 10_000 });

        // The header must have a button with title="Delete Document"
        await expect(page.getByTitle('Delete Document')).toBeVisible();
    });

    test('Delete Document button on view page opens confirmation dialog', async ({ page }) => {
        const docName = 'view-dialog-open-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const docRow = page.locator('table tbody tr', { hasText: docName });
        await docRow.click();
        await page.waitForURL(/\/documents\/\d+/, { timeout: 10_000 });

        await page.getByTitle('Delete Document').click();

        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Delete Document' })).toBeVisible();
        await expect(page.getByText(`"${docName}"`)).toBeVisible();
    });

    test('confirming delete from view page redirects to /documents', async ({ page }) => {
        const docName = 'view-confirm-redirect-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const docRow = page.locator('table tbody tr', { hasText: docName });
        await docRow.click();
        await page.waitForURL(/\/documents\/\d+/, { timeout: 10_000 });

        await page.getByTitle('Delete Document').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByRole('button', { name: 'Delete' }).click();

        // Should redirect back to the documents list
        await page.waitForURL(/\/documents$/, { timeout: 10_000 });
        await expect(page).toHaveURL(/\/documents$/);
    });

    test('shows "Document deleted successfully" toast after deletion from view page', async ({ page }) => {
        const docName = 'view-toast-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const docRow = page.locator('table tbody tr', { hasText: docName });
        await docRow.click();
        await page.waitForURL(/\/documents\/\d+/, { timeout: 10_000 });

        await page.getByTitle('Delete Document').click();
        await page.getByRole('button', { name: 'Delete' }).click();

        await expect(
            page.getByText('Document deleted successfully')
        ).toBeVisible({ timeout: 10_000 });
    });

    test('document deleted from view page no longer appears in list', async ({ page }) => {
        const docName = 'view-list-removal-test.txt';
        await uploadTestDocument(page, docName);

        await page.goto('/documents');
        await page.waitForSelector('table tbody tr', { timeout: 10_000 });

        const docRow = page.locator('table tbody tr', { hasText: docName });
        await docRow.click();
        await page.waitForURL(/\/documents\/\d+/, { timeout: 10_000 });

        await page.getByTitle('Delete Document').click();
        await page.getByRole('button', { name: 'Delete' }).click();

        // After redirect, the document should not be in the list
        await page.waitForURL(/\/documents$/, { timeout: 10_000 });
        await page.waitForSelector('table', { timeout: 10_000 });
        await expect(page.locator('table tbody tr', { hasText: docName })).not.toBeVisible();
    });

});
