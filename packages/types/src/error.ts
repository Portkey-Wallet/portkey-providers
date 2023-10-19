export interface IProviderError extends Error {
  code: number;
  data?: unknown;
}

export class ProviderError extends Error implements IProviderError {
  public code: number;
  public data?: unknown;

  constructor(message: string, code: number, data?: unknown) {
    super(message);
    this.code = code;
    this.data = data;
  }
}
