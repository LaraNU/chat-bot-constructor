export interface TelegramUpdate {
  update_id: number;
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

  username: string;

  userText?: string;
  callbackData?: string;
}
