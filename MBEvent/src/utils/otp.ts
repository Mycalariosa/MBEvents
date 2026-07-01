import AsyncStorage from '@react-native-async-storage/async-storage';

const OTP_STORAGE_KEY = (email: string) => `@mbevents:forgot-password-otp:${email.toLowerCase()}`;

export type ForgotPasswordOtpRecord = {
  otp: string;
  expiresAt: number;
};

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOtpForEmail(email: string, otp: string) {
  const record: ForgotPasswordOtpRecord = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  await AsyncStorage.setItem(OTP_STORAGE_KEY(email), JSON.stringify(record));
}

export async function getOtpRecordForEmail(email: string) {
  const raw = await AsyncStorage.getItem(OTP_STORAGE_KEY(email));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ForgotPasswordOtpRecord;
  } catch {
    return null;
  }
}

export async function clearOtpForEmail(email: string) {
  await AsyncStorage.removeItem(OTP_STORAGE_KEY(email));
}

export function isOtpValid(record: ForgotPasswordOtpRecord | null, otp: string) {
  return Boolean(record && record.otp === otp && Date.now() <= record.expiresAt);
}
