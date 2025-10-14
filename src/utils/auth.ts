import { getDecryptedItem } from "./storageHelper";

export const getUserRole = () => {
  return getDecryptedItem("role");
};
