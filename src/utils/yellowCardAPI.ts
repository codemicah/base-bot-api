import axios from "axios";
import { config } from "../config/env";
import crypto from "crypto";

const {
  YELLOWCARD_API_BASE_URL,
  YELLOWCARD_API_KEY,
  YELLOWCARD_API_SECRET_KEY,
} = config;

const YellowCardAPI = axios.create({
  baseURL: YELLOWCARD_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// pass the body through generateYCSignature before making request
YellowCardAPI.interceptors.request.use(async (config) => {
  const { url, method, data } = config;
  const { timestamp, authorization } = generateYCSignature({
    path: String(url),
    method: String(method).toUpperCase(),
    body: data,
    secretKey: YELLOWCARD_API_SECRET_KEY,
    apiKey: YELLOWCARD_API_KEY,
  });

  config.headers["Authorization"] = authorization;
  config.headers["X-YC-Timestamp"] = timestamp;

  return config;
});

interface IGenerateYCSignature {
  path: string;
  method: string;
  body?: string;
  secretKey: string;
  apiKey: string;
}

const generateYCSignature = (payload: IGenerateYCSignature) => {
  const { path, method, body, secretKey, apiKey } = payload;

  const timestamp = new Date().toISOString(); // ISO8601 format

  // Message to sign
  let message = timestamp + path + method;

  if (body) {
    // Base64 encode SHA256 hash of the request body for POST/PUT requests
    const hash = crypto.createHash("sha256").update(body).digest("base64");
    message += hash;
  }

  // Create HMAC signature using secret key
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");

  return {
    timestamp,
    authorization: `YcHmacV1 ${apiKey}:${signature}`,
  };
};

export default YellowCardAPI;
