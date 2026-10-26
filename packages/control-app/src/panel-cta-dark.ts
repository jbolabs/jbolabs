import { chromium } from "playwright-core";

const PANEL_CTA = ".bg-panel a[href]:not([href=''])";

const srgbChannel = (value: number): number => {
  const unit = value / 255;
  return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
};

/** Luminance from sRGB 0–255; higher means lighter (panel CTA should be light in dark mode). */
const relativeLuminance = (red: number, green: number, blue: number): number =>
  0.2126 * srgbChannel(red) +
  0.7152 * srgbChannel(green) +
  0.0722 * srgbChannel(blue);

export interface PanelCtaDarkResult {
  readonly ok: boolean;
  readonly detail: string;
  readonly skipped: boolean;
}

export const panelCtaReadableInDarkMode = async (
  origin: string
): Promise<PanelCtaDarkResult> => {
  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    return {
      detail: "Chrome not available",
      ok: true,
      skipped: true,
    };
  }
  try {
    const context = await browser.newContext({
      viewport: { height: 900, width: 1280 },
    });
    const page = await context.newPage();
    await page.goto(`${origin}/`, { waitUntil: "load" });
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    });
    await page.reload({ waitUntil: "load" });
    const link = page.locator(PANEL_CTA).first();
    const count = await link.count();
    if (count === 0) {
      return {
        detail: "no panel CTA link found",
        ok: false,
        skipped: false,
      };
    }
    const rgb = await link.evaluate((element) => {
      const className = element.getAttribute("class") ?? "";
      if (!className.includes("bg-panel-foreground")) {
        return null;
      }
      const { backgroundColor } = getComputedStyle(element);
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const drawingContext = canvas.getContext("2d");
      if (drawingContext === null) {
        return null;
      }
      // The browser resolves modern CSS colors (including oklab) to sRGB bytes.
      drawingContext.fillStyle = backgroundColor;
      drawingContext.fillRect(0, 0, 1, 1);
      const [red = 0, green = 0, blue = 0] = drawingContext.getImageData(
        0,
        0,
        1,
        1
      ).data;
      return {
        blue,
        green,
        red,
      };
    });
    await context.close();
    if (rgb === null) {
      return {
        detail: "could not read CTA background color",
        ok: false,
        skipped: false,
      };
    }
    const luminance = relativeLuminance(rgb.red, rgb.green, rgb.blue);
    const ok = luminance > 0.7;
    return {
      detail: ok
        ? `dark-mode CTA luminance ${luminance.toFixed(2)}`
        : `dark-mode CTA too dark (luminance ${luminance.toFixed(2)})`,
      ok,
      skipped: false,
    };
  } finally {
    await browser.close();
  }
};
