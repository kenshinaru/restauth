import { JSDOM } from "jsdom";

class GDriveDownloader {
  static isUrl(str) {
    return /^https?:\/\//.test(str);
  }

  static validateStatus(status) {
    return status >= 200 && status < 400;
  }

  static abbreviateNumber(number) {
    const SI_POSTFIXES = ["", "KB", "MB", "GB", "TB"];
    const sign = number < 0 ? "-" : "";
    const absNumber = Math.abs(number);
    const tier = (Math.log10(absNumber) / 3) | 0;
    if (tier === 0) return `${absNumber}`;
    const postfix = SI_POSTFIXES[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = absNumber / scale;
    const floored = Math.floor(scaled * 10) / 10;
    return `${sign}${floored.toFixed(1).replace(/\.0$/, "")}${postfix}`;
  }

  static getItemId(url) {
    try {
      const parsed = new URL(url);
      if (parsed.searchParams.has("id")) {
        return parsed.searchParams.get("id");
      }
      const segments = parsed.pathname.split("/");
      const index = segments.findIndex((it) => it === "d");
      if (index === -1 || !segments[index + 1]) {
        throw new Error(`Failed to extract ID from URL: ${url}`);
      }
      return segments[index + 1];
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  static async getFileInfo(url) {
    try {
      const response = await fetch(url);
      const contentDisposition = response.headers.get("content-disposition") || "";
      const fileName = contentDisposition.match(/filename="(.+?)"/)?.[1] || "";
      const contentType = response.headers.get("content-type") || "";
      const contentLength = response.headers.get("content-length");
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;
      return {
        fileName,
        contentType,
        fileSize: this.abbreviateNumber(fileSize),
        fileSizeB: fileSize,
      };
    } catch {
      return {
        fileName: "",
        contentType: "",
        fileSize: this.abbreviateNumber(0),
        fileSizeB: 0,
      };
    }
  }

  static async getIdDrive(url, skip = false) {
    try {
      if (!this.isUrl(url) || !/drive\.google\.com/i.test(url)) {
        return { status: false, msg: `Invalid URL: ${url}` };
      }

      const docID = this.getItemId(url);
      const downloadUrl = skip
        ? url
        : `https://drive.google.com/uc?id=${docID}&export=download`;

      const response = await fetch(downloadUrl, { redirect: "manual" });

      if (this.validateStatus(response.status)) {
        const location = response.headers.get("location");
        if (location?.includes("googleusercontent.com")) {
          const fileInfo = await this.getFileInfo(location);
          return { status: true, data: { downloadUrl: location, ...fileInfo } };
        }
        if (!location) {
          const html = await fetch(downloadUrl).then((r) => r.text());
          const dom = new JSDOM(html);
          const formAction = dom.window.document.querySelector("form")?.getAttribute("action");
          if (!formAction) return { status: false, msg: "Form action not found" };
          return this.getIdDrive(formAction, true);
        }
      }

      return { status: true, data: { downloadUrl } };
    } catch (error) {
      return { status: false, msg: error.message || "Unknown error" };
    }
  }

  static async download(url) {
    if (!this.isUrl(url) || !/drive\.google\.com/i.test(url)) {
      return { status: false, msg: "Invalid URL" };
    }

    try {
      const docID = this.getItemId(url);
      const response = await fetch(
        `https://drive.google.com/uc?id=${docID}&authuser=0&export=download`,
        {
          method: "POST",
          headers: {
            "accept-encoding": "gzip, deflate, br",
            "content-length": 0,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            origin: "https://drive.google.com",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
            "x-client-data": "CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=",
            "x-drive-first-party": "DriveWebUi",
            "x-json-requested": "true",
          },
        }
      );

      const json = JSON.parse((await response.text()).slice(4));
      const { fileName, sizeBytes, downloadUrl } = json;

      if (!downloadUrl) {
        return { status: false, msg: "Link Download Limit!" };
      }

      const dataRes = await fetch(downloadUrl);
      if (dataRes.status !== 200) {
        return {
          status: false,
          msg: `Failed to download file: ${dataRes.status} ${dataRes.statusText}`,
        };
      }

      return {
        status: true,
        data: {
          url,
          fileName,
          size: this.abbreviateNumber(sizeBytes),
          mimetype: dataRes.headers.get("content-type"),
        },
      };
    } catch (error) {
      return { status: false, msg: error.message || "Unknown error" };
    }
  }
}

export default new GDriveDownloader;
