// src/utils/encryptedStorage.ts
import CryptoJS from "crypto-js";

// Use .env variable so the key isn’t visible in code
const SECRET_KEY: string =
  import.meta.env.VITE_ENCRYPTION_KEY || "default_secret_key_2025";

export const setEncryptedItem = <T>(key: string, value: T): void => {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      SECRET_KEY
    ).toString();
    localStorage.setItem(key, encrypted);
  } catch (err) {
    console.error("Error encrypting item:", err);
  }
};

export const getDecryptedItem = <T>(key: string): T | null => {
  try {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted ? (JSON.parse(decrypted) as T) : null;
  } catch (err) {
    console.error("Error decrypting item:", err);
    return null;
  }
};

export const removeEncryptedItem = (key: string): void => {
  localStorage.removeItem(key);
};
