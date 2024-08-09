/**
 * TokenHandlerError is a custom error class that extends the built-in Error class.
 * It is used as a base class for errors specific to the TokenHandler.
 */
export class TokenHandlerError extends Error {
  /**
   * Constructor to create a new TokenHandlerError.
   * 
   * @param {string} message - The error message describing what went wrong.
   */
  constructor(message: string) {
      super(message);  // Pass the message to the base Error class
      this.name = 'TokenHandlerError';  // Set the error name to the class name
  }
}

/**
* TokenHandlerErrorData is a specialized error class that extends TokenHandlerError.
* It can be used for errors specifically related to data handling within the TokenHandler.
*/
export class TokenHandlerErrorData extends TokenHandlerError {
  /**
   * Constructor to create a new TokenHandlerErrorData.
   * 
   * @param {string} message - The error message describing what went wrong with the data.
   */
  constructor(message: string) {
      super(message);  // Pass the message to the base TokenHandlerError class
  }
}
