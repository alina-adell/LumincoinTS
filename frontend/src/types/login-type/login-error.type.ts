export type LoginErrorType = {
  error: boolean,
  message: string
  validation?: LoginValidationErrorType[]
}

export type LoginValidationErrorType = {
  key: string;
  message: string;
}