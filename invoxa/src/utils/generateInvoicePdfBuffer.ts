import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export async function generateInvoicePdfBuffer(html: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'a4', printBackground: true });
  await browser.close();
  return pdfBuffer;
}