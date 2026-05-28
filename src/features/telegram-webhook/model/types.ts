export interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from: { username?: string };
    text?: string;
  };
}

export interface UserContext {
  botId: string;
  botToken: string;
  chatId: string;
  userText: string;
  username: string;
}
