/**
 * An interface that represents an error returned by the Clerk API.
 */
export interface ClerkAPIError {
  /**
   * A string code that represents the error, such as `username_exists_code`.
   */
  code: string;
  /**
   * A message that describes the error.
   */
  message: string;
  /**
   * A more detailed message that describes the error.
   */
  longMessage?: string;
  /**
   * Additional information about the error.
   */
  meta?: {
    /**
     * TODO: Document this.
     */
    paramName?: string;
    /**
     * TODO: Document this.
     */
    sessionId?: string;
    /**
     * TODO: Document this.
     */
    emailAddresses?: string[];
    /**
     * TODO: Document this.
     */
    identifiers?: string[];
    /**
     * TODO: Document this.
     */
    zxcvbn?: {
      /**
       * TODO: Document this.
       */
      suggestions: {
        /**
         * TODO: Document this.
         */
        code: string;
        /**
         * TODO: Document this.
         */
        message: string;
      }[];
    };
    /**
     * TODO: Document this.
     */
    permissions?: string[];
  };
}

export interface ClerkRuntimeError {
  code: string;
  message: string;
}
