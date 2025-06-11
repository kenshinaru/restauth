export type ScraperFunction = (...args: string[]) => Promise<any>;

export async function getScraper(scraperPath: string): Promise<ScraperFunction | null> {
  try {
    const [moduleName, methodName] = scraperPath.split(".");
    const mod = await import(`@/lib/${moduleName}`);

    console.log(`✅ Loader Scraper : ${moduleName}`);
    const availableKeys = Object.keys(mod);
    
    let target: any = null;

    if (mod.default) {
      target = mod.default;
      console.log("✅ Using default export");
    }

    if (methodName) {
      if (typeof mod[methodName] === "function") {
        return (...args) => mod[methodName](...args);
      }

      if (mod.default && typeof mod.default[methodName] === "function") {
        console.log(`✅ ${moduleName}.${methodName}`);
        return (...args) => mod.default[methodName](...args);
      }
      return null;
    }

    if (typeof target === "function") {
      return target;
    }

    const functionExports = Object.entries(mod).filter(
      ([_, val]) => typeof val === "function"
    );

    if (functionExports.length === 1) {
      const [name, func] = functionExports[0];
      return func;
    }

    return null;
  } catch (err) {
    console.error("❌ Scraper Failed:", err);
    return null;
  }
}
