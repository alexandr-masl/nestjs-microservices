export class TokenHandlerError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TokenHandlerError';
    }
  }
  
export class TokenHandlerErrorData extends TokenHandlerError {
    constructor(message: string) {
        super(message);
    }
}
  
  