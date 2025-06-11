import ws from "ws"

class Copilot {
  constructor() {
    this.url = "wss://copilot.microsoft.com/c/api/chat?api-version=2&features=-%2Cncedge%2Cedgepagecontext&setflight=-%2Cncedge%2Cedgepagecontext&ncedge=1";
    this.wss = null;
    this.connected = false;
    this.connecting = false;
    this.message = [];
    this.resolve2 = [];
    this.tmp = "";
    this.q = "";
    this.rnd = this.getId();
  }

  getId(length = 21) {
    const chars = "eEQqRXUu123456CcbBZzhj";
    return Array.from({ length }).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  async connect() {
    if (this.connected) return;
    if (this.connecting) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.connected) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
      });
    }

    this.connecting = true;
    this.wss = new ws(this.url);

    return new Promise((resolve) => {
      this.wss.on("close", () => {
        this.connected = false;
        this.connecting = false;
      });

      this.wss.on("message", async (data) => {
        const parsed = JSON.parse(data.toString());
        const jsn = parsed?.event;

        if (jsn !== "error" && jsn !== "done") {
          const txt = parsed?.text;
          if (txt) {
            this.tmp += txt;
          }
        } else if (jsn === "done") {
          if (this.resolve2.length > 0) {
            this.resolve2.shift()({
              creator: global.creator,
              status: true,
              data: {
                message: this.tmp
              }
            });
          }
          this.tmp = "";
        } else {
          this.rnd = this.getId();
          await this.chat(this.q);
        }
      });

      this.wss.on("open", async () => {
        this.connected = true;
        this.connecting = false;
        resolve();
      });
    });
  }

  async chat(q) {
    await this.connect();

    return new Promise(async (resolve) => {
      this.resolve2.push(resolve);
      this.q = q;

      const datas = {
        event: "send",
        conversationId: this.rnd,
        content: [
          {
            type: "text",
            text: q
          }
        ],
        mode: "chat",
        context: {
          edge: "NoConsent"
        }
      };

      this.wss.send(JSON.stringify(datas));
    });
  }
}

export default new Copilot();
