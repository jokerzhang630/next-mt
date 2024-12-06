import crypto from "crypto";
import axios from "axios";
import * as cheerio from "cheerio";
import NodeCache from "node-cache";

// Initialize cache with default TTL of 30 minutes
const cache = new NodeCache({ stdTTL: 1800 });

// Signature generation function
export function generateSignature(content: string, timestamp: number): string {
  const SALT = "2af72f100c356273d46284f6fd1dfc08";
  const text = `${SALT}${content}${timestamp}`;
  let md5 = "";
  try {
    const hashBytes = crypto.createHash("md5").update(text).digest();
    const sb = [];
    for (const b of hashBytes) {
      sb.push(b.toString(16).padStart(2, "0"));
    }
    md5 = sb.join("");
  } catch (e) {
    console.error(e);
  }
  return md5;
}

export async function getItems() {
  const CACHE_KEY = "mt_items";
  const cachedItems = cache.get(CACHE_KEY);
  if (cachedItems) {
    return cachedItems;
  }

  const dayTime = new Date().setHours(0, 0, 0, 0);
  const response = await axios.get(
    `https://static.moutai519.com.cn/mt-backend/xhr/front/mall/index/session/get/${dayTime}`,
    {
      headers: {
        "MT-APP-Version": await getMTVersion(),
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
        "MT-Request-ID": `${Date.now()}${Math.random().toString().slice(-6)}`,
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "MT-Device-ID": crypto.randomUUID(),
      },
    }
  );
  const items = response.data;
  console.log("items", items);
  cache.set(CACHE_KEY, items);
  return items;
}

// Get MT-APP-Version by scraping Apple Store
export async function getMTVersion(): Promise<string> {
  const CACHE_KEY = "mt_version";
  const cachedVersion = cache.get(CACHE_KEY);
  if (cachedVersion) {
    return cachedVersion as string;
  }

  try {
    const response = await axios.get(
      "https://apps.apple.com/cn/app/i%E8%8C%85%E5%8F%B0/id1600482450",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }
    );

    const $ = cheerio.load(response.data);
    const version = $(".whats-new__latest__version")
      .text()
      .replace("版本 ", "")
      .trim();

    cache.set(CACHE_KEY, version);
    return version;
  } catch (error) {
    console.error("Error fetching MT version:", error);
    const fallbackVersion = "1.7.5";
    cache.set(CACHE_KEY, fallbackVersion);
    return fallbackVersion;
  }
}

export function aesEncrypt(params: string): string {
  const AES_KEY = "qbhajinldepmucsonaaaccgypwuvcjaa";
  const AES_IV = "2018534749963515";

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(AES_KEY),
    Buffer.from(AES_IV)
  );

  let encrypted = cipher.update(params, "utf8", "base64");
  encrypted += cipher.final("base64");

  return encrypted;
}
