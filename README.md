# Netflix 暫時存取碼 Telegram 通知機器人
# Netflix Temporary Access Code Telegram Notification Bot

自動偵測 Gmail 收到的 Netflix 暫時存取碼信件，並即時發送連結、申請人姓名、裝置及時間到 Telegram 群組。

Automatically detects Netflix temporary access code emails in Gmail and instantly sends the link, requester's name, device, and time to a Telegram group.

---

## 功能 / Features

- ✅ 自動偵測 Netflix 暫時存取碼信件
- ✅ 擷取存取連結、申請人姓名、裝置名稱、申請時間
- ✅ 發送通知到 Telegram 群組
- ✅ 防止重複發送同一封信件
- ✅ 每分鐘自動檢查一次

---

## 使用前準備 / Prerequisites

### 1. 建立 Telegram Bot

1. 在 Telegram 搜尋 `@BotFather`
2. 輸入 `/newbot`，依指示建立 Bot
3. 取得 **Bot Token**（格式：`123456789:ABCdef...`）
4. 將 Bot 加入目標群組
5. 開啟以下網址取得群組 **Chat ID**（群組 ID 為負數）：
   ```
   https://api.telegram.org/bot你的BOT_TOKEN/getUpdates
   ```

### 2. 開啟 Google Apps Script

1. 前往 [script.google.com](https://script.google.com)
2. 建立新專案
3. 將 `Code.js` 的內容貼入編輯器

---

## 設定方式 / Setup

在 `Code.js` 最上方填入你的資訊：

```javascript
const BOT_TOKEN = "你的Telegram Bot Token";
const CHAT_ID = "你的群組Chat ID";
```

> ⚠️ **安全提醒**：請勿將含有實際 Token 和 Chat ID 的程式碼上傳到 GitHub 或任何公開平台。

---

## 部署步驟 / Deployment

1. 填入 `BOT_TOKEN` 和 `CHAT_ID`
2. 執行 `test` 函式，確認 Telegram 有收到測試訊息
3. 授權 Gmail 與網路存取權限
4. 設定觸發器：
   - 點左側「⏰ 觸發條件」
   - 新增觸發條件：
     - 函式：`checkNetflixCode`
     - 觸發類型：時間驅動
     - 間隔：**每 1 分鐘**

---

## Telegram 通知格式 / Notification Format

```
🔐 Netflix 暫時存取碼

👤 申請人：李帥
📱 裝置：Samsung - Android 手機
🕐 時間：3月25日下午4:48 (GMT+8)

點擊連結登入：
https://...
```

---

## 工具函式 / Utility Functions

| 函式 | 說明 |
|------|------|
| `test()` | 測試 Telegram Bot 連線是否正常 |
| `checkSavedIds()` | 查看已處理的信件 ID 數量 |
| `clearSavedIds()` | 清除所有已處理記錄（重置用） |

---

## 注意事項 / Notes

- 信件主旨預設為繁體中文 `"暫時存取碼"`，若你的 Netflix 帳號是英文介面，請將搜尋條件改為 `"temporary access code"`
- 每次最多搜尋 10 封未處理信件
- 已處理的信件 ID 最多保留 100 筆，超過自動刪除最舊的記錄

---

## 常見問題 / FAQ

**Q：為什麼名字或裝置顯示「未知」？**
A：可能是 Netflix 更新了信件格式，請在 Apps Script 執行紀錄中查看 `body` 內容並調整正規表示式。

**Q：為什麼會重複發送？**
A：確認觸發器只有一個，且 `PropertiesService` 正常儲存。可執行 `checkSavedIds()` 確認。

**Q：可以同時發送到多個群組嗎？**
A：可以，在 `checkNetflixCode` 中多次呼叫 `sendToTelegram` 並帶入不同的 `CHAT_ID` 即可。

---

## License

MIT
