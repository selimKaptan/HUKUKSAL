/**
 * iyzico SDK - SADECE server-side (API routes) için
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
let iyzipay: any = null;

function getIyzipay() {
  if (iyzipay) return iyzipay;

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Iyzipay = require("iyzipay");
  iyzipay = new Iyzipay({
    apiKey,
    secretKey,
    uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
  });

  return iyzipay;
}

export default getIyzipay;
