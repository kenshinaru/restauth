import { GoogleGenAI } from "@google/genai";
import { fileTypeFromBuffer } from "file-type";
import mime from "mime-types";
import fs from "fs";
import path from "path";
import axios from "axios";
import { LRUCache } from "lru-cache";
import FormData from 'form-data'; 

class Gemini {
  constructor() {
    this.apiKey = [
      "AIzaSyAdaxWtuodlsQYaLJQKZ12XdyY-wcgQUUg",
      "AIzaSyAOwnv6_t8sj72JNLiNprUXlRarUCT6lDg",
      "AIzaSyAOwmYlMW39KLgylAauI1BQPgeTL3EnKcQ",
      "AIzaSyBjcyR-8MYJStXXBse7IkRIuiX1NgVNZQs",
      "AIzaSyBL8xZutJO8qpAjSEwiNyFcENTMxU0eJuc"
    ];
    this.genAI = new GoogleGenAI({
      apiKey: this.apiKey[Math.floor(Math.random() * this.apiKey.length)],
    });
    
    this.historyCache = new LRUCache({
      max: 1000, 
      ttl: 1000 * 60 * 60 * 24, 
      allowStale: false,
      updateAgeOnGet: true, 
      updateAgeOnHas: false
    });
  }

  loadHistory(id) {
    return this.historyCache.get(id) || [];
  }

  saveHistory(id, data) {
    this.historyCache.set(id, data);
  }

  getCacheStats() {
    return {
      size: this.historyCache.size,
      calculatedSize: this.historyCache.calculatedSize,
      remainingTTL: (id) => this.historyCache.getRemainingTTL(id)
    };
  }

  clearHistory(id = null) {
    if (id) {
      this.historyCache.delete(id);
    } else {
      this.historyCache.clear();
    }
  }

  historyManager(array) {
    if (array.length >= 10) array.splice(0, 2);
    if (array[0]?.role === "model") array.splice(0, 1);
    return array;
  }

  session(history, systemInstruction = "") {
    return this.genAI.chats.create({
      model: "gemini-2.0-flash",
      history: [...new Set(history)],
      config: {
        tools: [{ googleSearch: {} }],
        responseModalities: ["Text"],
        systemInstruction,
      },
    });
  }

  uploadToGemini = (url) =>
    new Promise(async (resolve) => {
      const { data: buffer } = await axios.get(url, { responseType: "arraybuffer" });
      if (!buffer) return resolve({ creator: global.creator, status: false, message: "File not found" });
      if (buffer.length > 10485760) return resolve({ creator: global.creator, status: false, msg: "File too large, max 10MB" });

      const mimeType = (await fileTypeFromBuffer(buffer))?.mime || "text/plain";
      const fname = `${new Date().toISOString().replace(/:/g, "-")}.${mime.extension(mimeType)}`;
      fs.writeFileSync(fname, buffer);
      const uploadResult = await this.genAI.files.upload({ file: fname });
      fs.unlinkSync(fname);

      resolve({
        status: true,
        data: {
          file: uploadResult.uri,
          mimeType: uploadResult.mimeType,
        },
      });
    });

  imagen = async (prompt, width = 1024, height = 1024) => {
  const deviceId = `dev-${Math.floor(Math.random() * 1e6)}`;

  try {
    const resp = await axios.post(
      "https://api-preview.chatgot.io/api/v1/deepimg/flux-1-dev",
      {
        prompt: prompt,
        size: `${width}x${height}`,
        device_id: deviceId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Origin: "https://deepimg.ai",
          Referer: "https://deepimg.ai/",
        },
      }
    );

    return { status: true, data: resp.data.data };
  } catch (err) {
    return { status: false, msg: err.message };
  }
}

  chatSession = (id, prompt, systemInstruction = "") =>
    new Promise(async (resolve) => {
      try {
        let history = this.loadHistory(id);
        history.push({ role: "user", parts: [{ text: prompt }] });
        history = this.historyManager(history);

        const response = await this.session(history, systemInstruction).sendMessage({ message: prompt });
        const parts = response?.candidates?.[0]?.content?.parts || [];

        history.push({ role: "model", parts: [{ text: parts[0]?.text || "" }] });
        this.saveHistory(id, history);
        
        resolve({
          status: true,
          data: {
            question: prompt,
            message: parts[0]?.text,
          },
        });
      } catch (e) {
        resolve({ status: false, msg: e.message });
      }
    });

  fileSession = (id, prompt, fileUrl, systemInstruction = "") =>
    new Promise(async (resolve) => {
      try {
        const buffer = await this.uploadToGemini(fileUrl);
        if (!buffer) return resolve({ status: false, msg: "File not found" });

        let history = this.loadHistory(id);
        history.push({
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: buffer.data.mimeType,
                fileUri: buffer.data.file,
              },
            },
            { text: prompt },
          ],
        });

        history = this.historyManager(history);
        const response = await this.session(history, systemInstruction).sendMessage({ message: prompt });
        const parts = response?.candidates?.[0]?.content?.parts || [];

        history.push({ role: "model", parts });
        this.saveHistory(id, history);

        resolve({
          status: true,
          data: {
            question: prompt,
            message: parts[0]?.text
          },
        });
      } catch (e) {
        resolve({ status: false, msg: e.message });
      }
    });

  chat = (prompt) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.genAI.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: {
             tools: [{ googleSearch: {} }],
          }
        });
        resolve({ status: true, data: { message: response.text } });
      } catch (error) {
        reject({ status: false, msg: error.message });
      }
    });
  };

  file = (prompt, url) => {
    return new Promise(async (resolve, reject) => {
      try {
        const buffer = await this.uploadToGemini(url);
        if (!buffer) return resolve({ status: false, msg: "File not found" });

        let contents = [
          {
            role: "user",
            parts: [
              {
                fileData: {
                  mimeType: buffer.data.mimeType,
                  fileUri: buffer.data.file,
                },
              },
              { text: prompt },
            ],
          },
        ];

        const response = await this.genAI.models.generateContent({
          model: "gemini-2.0-flash",
          contents,
          config: {
             tools: [{ googleSearch: {} }],
          }
        });

        resolve({
          status: true,
          data: { message: response.text,
            }
        });
      } catch (error) {
        reject({ status: false, msg: error.message });
      }
    });
  };

uploadBuffer = async(input, filename) => {
  try {
    const form = new FormData();
    form.append('file', input, filename);
    form.append('expiration', '5min');

    const { data } = await axios.post('https://cdn-arincy.vercel.app/api/upload', form, {
      headers: form.getHeaders()
    });

    if (!data?.status) throw new Error(data?.msg || 'Upload gagal');

    return {
      status: true,
      data: {
        url: data.data.url,
        filename
      }
    };
  } catch (e) {
    return {
      status: false,
      msg: e.message
    };
  }
}

  editImg = (url, prompt) =>
  new Promise(async (resolve) => {
    try {
      const { data: buffer } = await axios.get(url, { responseType: "arraybuffer" });

      const contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/png",
            data: buffer.toString("base64"),
          },
        },
      ];

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents,
        config: {
          responseModalities: ["Text", "Image"],
        },
      });

      let text = null;
      let base64 = null;

      for (const part of response.candidates[0].content.parts) {
        if (part.text) text = part.text;
        else if (part.inlineData?.data) base64 = part.inlineData.data;
      }

      if (!base64)
        return resolve({
          status: false,
          msg: "Tidak ada gambar yang dihasilkan",
        });

      const imgBuffer = Buffer.from(base64, "base64");
      const filename = `edited-${Date.now()}.png`;
      const uploadResult = await this.uploadBuffer(imgBuffer, filename);

      if (!uploadResult.status)
        return resolve({ status: false, msg: uploadResult.msg });

      resolve({
        status: true,
        data: {
          content: text,
          image: uploadResult.data.url, 
        },
      });
    } catch (error) {
      resolve({
        status: false,
        msg: error.message,
      });
    }
  });

  generateContent = (id, prompt, systemInstruction = "", file = null) =>
  new Promise(async (resolve) => {
    try {
      
      if (file === "null") {
        file = null;
      }

      const result = file
        ? await this.fileSession(id, prompt, file, systemInstruction)
        : await this.chatSession(id, prompt, systemInstruction);

      resolve(result);
    } catch (e) {
      resolve({ status: false, msg: e.message });
    }
  })
}

export default new Gemini();
