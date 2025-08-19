import Cookies from "js-cookie";

export const getUserRole = () => {
  return Cookies.get("role"); 
};
