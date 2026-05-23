export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  scope: string;
  tokenType: string;
  expiresAt: Date;
}
