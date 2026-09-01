export interface PublishBotPayload {
  botId: string;
  /** Present on first publish or when updating the token; omitted to reuse the stored token. */
  token?: string;
}

export interface ActionResponse {
  success: boolean;
  error?: string;
}
