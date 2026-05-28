export interface PublishBotPayload {
  botId: string;
  token: string;
}

export interface ActionResponse {
  success: boolean;
  error?: string;
}
