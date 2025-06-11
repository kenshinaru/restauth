export type ScraperFunction = (...args: string[]) => Promise<any>;

export async function getScraper(scraperPath: string): Promise<ScraperFunction | null> {
  try {
    const [moduleName, methodName] = scraperPath.split(".");
    const mod = await import(`@/lib/${moduleName}`);

    const funcs: Record<string, Function> = {};

    for (const [key, val] of Object.entries(mod)) {
      if (typeof val === "function") funcs[key] = val;
    }

    if (mod.default) {
      if (typeof mod.default === "function") {
        funcs["default"] = mod.default;
      } else if (typeof mod.default === "object") {
        for (const [key, val] of Object.entries(mod.default)) {
          if (typeof val === "function") funcs[key] = val;
        }
      }
    }

    if (methodName) {
      return typeof funcs[methodName] === "function"
        ? (...args) => funcs[methodName](...args)
        : null;
    }

    if (typeof funcs["default"] === "function") {
      return funcs["default"] as ScraperFunction;
    }

    const funcList = Object.values(funcs);
    return funcList.length === 1 ? funcList[0] as ScraperFunction : null;

  } catch (e) {
    console.log(JSON.stringify(e, null, 2))
    return null;
  }
}
