export const handleError = (errorMessage: any) => {
  if (!errorMessage) return "An error occurred. Please try again.";

  switch (errorMessage) {
    case "User with this email does not exist":
      return "User with this email does not exist";
    case "Invalid credentials.":
      return "Invalid credentials.";
    case "ERR_AUTH_USER_LOCKED":
      return "User account is locked.";
    case "ERR_AUTH_USERNAME":
      return "Username already Exist";
    case "ERR_AUTH_WRONG_TOKEN":
      return "Oops! Looks like this link has expired. Please request a fresh one.";
    case "Email Not Found":
      return "Email Not Found";
    case "Password Not Matched":
      return "Wrong Password";
    case "custom user with this email already exists.":
      return "Email Already Exists";
    case "ERR_INVALID_ADMIN_TOKEN":
      return "Invalid Admin token. Please try again";
    default:
      return "An error occurred. Please try again.";
  }
};
