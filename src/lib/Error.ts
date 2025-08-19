
export interface IErrorHandler {
  refresh?: boolean;
  toast?: string;
  validation?: boolean;
  signOut?: boolean;
}


function signOut(): IErrorHandler {
  return { signOut: true };
}

function toast(message: string): IErrorHandler {
  return { toast: message };
}

export const errorCodes: Record<string, IErrorHandler> = {
  ERR_INVALID_TOKEN: signOut(),
  ERR_AUTH_TOKEN_MISSING: signOut(),
  ERR_ACCESS_TOKEN_MISSING: signOut(),
  ERR_ACCESS_TOKEN_EXPIRED: signOut(),
  ERR_AUTH_TOKEN_EXPIRED: signOut(),
  ERR_INVALID_ACCESS_TOKEN: signOut(),
  ERR_AUTH_WRONG_REFRESH_TOKEN: signOut(),
  ERR_AUTH_REFRESH_EXPIRED: signOut(),

 
  ERR_AUTH_WRONG_OLD_PASSWORD: toast("Old password is incorrect"),
  ERR_AUTH_WRONG_USERNAME_OR_PASSWORD: toast("Wrong email or password"),
  ERR_AUTH_WRONG_PASSWORD_RESET_TOKEN: toast("Reset token expired"),
  ERR_AUTH_USERNAME_OR_EMAIL_ALREADY_EXIST: toast("Email already exists"),
  ERR_AUTH_PASSWORD_RESET_WRONG_EMAIL: toast("Email does not exist"),
  ERR_VALIDATION: { validation: true },
};

async function handle(res: any): Promise<any> {
  if (res.status === 200) return res;

  const errorCode = res.error?.code;

  if (!errorCode) {
    console.warn("Unhandled error (no code)", res);
    // Optionally show toast here if needed
    return res;
  }

  const error = errorCodes[errorCode];

  if (!error) {
    console.warn("Unhandled error code:", errorCode);
    return res;
  }

  if (error.toast) {
    // You can show a toast here using your own component or 3rd-party one
    // e.g., toasterError(error.toast);
    console.error("[TOAST]", error.toast);
  }

  if (error.signOut) {
    // Implement sign-out if needed
    // await User.signOut();
    console.warn("Signing out due to token error.");
  }

  if (error.validation) {
    // Optional: Show first validation message
    const message = res.data?.body?.[0]?.message || "Validation error!";
    console.error("[VALIDATION]", message);
  }

  return res;
}

export default { handle };
