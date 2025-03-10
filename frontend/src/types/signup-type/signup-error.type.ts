export type SignupErrorType = {
  error: boolean,
  message: string
  validation?: SignupValidationErrorType[]
}

export type SignupValidationErrorType = {
  key: string;
  message: string;
}