export interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from: { username?: string };
    text?: string;
  };
  callback_query?: {
    from: { username?: string };
    message?: {
      chat: { id: number };
    };
    data: string;
  };
}

export interface UserContext {
  botId: string;
  botToken: string;
  chatId: string;
  userText: string;
  username: string;
}
