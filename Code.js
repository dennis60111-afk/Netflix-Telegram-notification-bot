// ============================================================
// Netflix 暫時存取碼 → Telegram 通知機器人
// Netflix Temporary Access Code → Telegram Notification Bot
// ============================================================
// 設定方式：請將以下變數填入你的實際值
// Setup: Fill in your actual values in the variables below
// ============================================================

const BOT_TOKEN = "";  // Telegram Bot Token
const CHAT_ID = "";    // Telegram 群組 Chat ID

// ============================================================
// 主要功能：檢查 Netflix 信件並發送到 Telegram
// Main function: Check Netflix emails and send to Telegram
// ============================================================

function checkNetflixCode() {
  const props = PropertiesService.getScriptProperties();
  const sentIds = new Set(JSON.parse(props.getProperty("sentIds") || "[]"));

  Logger.log("執行開始，已儲存 ID 數：" + sentIds.size);

  const threads = GmailApp.search(
    'from:netflix.com subject:"暫時存取碼"', 0, 10
  );

  Logger.log("找到 thread 數：" + threads.length);

  threads.forEach(thread => {
    thread.getMessages().forEach(msg => {
      const id = msg.getId();

      if (sentIds.has(id)) {
        Logger.log("跳過（已處理）：" + id);
        return;
      }

      Logger.log("新信件：" + id + " | " + msg.getSubject());

      const body = msg.getPlainBody();
      const htmlBody = msg.getBody();

      // 抓取連結
      const linkMatch = body.match(/https?:\/\/[^\s"<>]+netflix[^\s"<>]+/gi)
                     || htmlBody.match(/href="(https?:\/\/[^"]*netflix[^"]*temporaryAccessCode[^"]*|https?:\/\/[^"]*netflix[^"]*access[^"]*)"/gi);

      let link = null;
      if (linkMatch && linkMatch.length > 0) {
        link = linkMatch[0].replace(/href="|"$/g, "");
      }

      // 抓取名字（例如：李帥，您好）
      const nameMatch = body.match(/^(.+)，您好/m);
      const name = nameMatch ? nameMatch[1].trim() : "未知";

      // 抓取裝置和時間
      const deviceMatch = body.match(/於(.+?)透過(.+?)提出申請/);
      const time = deviceMatch ? deviceMatch[1].trim() : "未知時間";
      const device = deviceMatch ? deviceMatch[2].trim() : "未知裝置";

      const text = link
        ? `🔐 *Netflix 暫時存取碼*\n\n👤 申請人：${name}\n📱 裝置：${device}\n🕐 時間：${time}\n\n點擊連結登入：\n${link}`
        : `🔐 *Netflix 暫時存取碼*\n\n👤 申請人：${name}\n📱 裝置：${device}\n🕐 時間：${time}\n\n⚠️ 無法自動抓取連結，請至 Gmail 查看`;

      // 先儲存 ID，再發送（避免重複通知）
      sentIds.add(id);
      const trimmed = [...sentIds].slice(-100);
      props.setProperty("sentIds", JSON.stringify(trimmed));
      Logger.log("已儲存 ID，目前共 " + trimmed.length + " 筆");

      // 發送到 Telegram
      try {
        sendToTelegram(text);
        Logger.log("發送成功：" + id);
      } catch (e) {
        Logger.log("發送失敗：" + e.message);
      }
    });
  });
}

// ============================================================
// 發送訊息到 Telegram
// Send message to Telegram
// ============================================================

function sendToTelegram(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: "Markdown",
      disable_web_page_preview: false
    })
  });
}

// ============================================================
// 工具函式
// Utility functions
// ============================================================

// 測試 Bot 連線是否正常
function test() {
  sendToTelegram("✅ 測試訊息：Bot 連線正常！");
}

// 查看目前已儲存的信件 ID 數量
function checkSavedIds() {
  const props = PropertiesService.getScriptProperties();
  const sentIds = JSON.parse(props.getProperty("sentIds") || "[]");
  Logger.log("目前已儲存的 ID 數量：" + sentIds.length);
  Logger.log("內容：" + JSON.stringify(sentIds));
}

// 清除所有已儲存的信件 ID（重置用）
// ⚠️ 清除後下次執行會重新發送所有舊信件
function clearSavedIds() {
  PropertiesService.getScriptProperties().deleteProperty("sentIds");
  Logger.log("已清除所有儲存的 ID");
}
