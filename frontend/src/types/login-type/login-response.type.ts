export type LoginResponseType = {
  tokens: LoginTokensType,
  user: LoginUserType
}

export type LoginTokensType = {
  accessToken: string,
  refreshToken: string
}

export type LoginUserType = {
  name: string,
  lastName: string,
  id: number
}