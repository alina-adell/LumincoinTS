export type RefreshResponseType = {
  error?: boolean,
  message?: string,
  tokens?: RefreshResponseTokensType
}

export type RefreshResponseTokensType = {
  accessToken: string,
  refreshToken: string
}