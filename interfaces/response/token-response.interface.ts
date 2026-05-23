export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  tokenType: string;
  expiresAt: Date;
}
