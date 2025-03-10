export type LoginDataResultType = {
  accessToken: string,
  refreshToken: string,
  user: LoginUserDataResultType
}

export type LoginUserDataResultType = {
  userId: number,
  userName: string,
  userLastName: string
}