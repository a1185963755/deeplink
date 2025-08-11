import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";

type Platform = "taobao" | "alipay" | "tmall" | "jd" | "pdd" | "meituan" | "xianyu";

interface ConversionRequest {
  links: string[];
  platform: Platform;
  useUniversalLink?: boolean;
}

interface ConversionResult {
  converted: string;
  platform: Platform;
  success: boolean;
  error?: string;
}

// 提取商品ID的辅助函数
const extractItemId = (url: string): string => {
  const match = url.match(/[?&]id=(\d+)/);
  return match ? match[1] : "";
};

const extractSkuId = (url: string): string => {
  const match = url.match(/[?&]sku=(\d+)/);
  return match ? match[1] : "";
};

// 转换逻辑
const convertToDeeplink = async (url: string, platform: Platform, useUniversalLink: boolean = false): Promise<string> => {
  switch (platform) {
    case "taobao":
      const taobaoLink = await convertTaoBao(url, useUniversalLink);
      return taobaoLink || "";

    case "alipay":
      const alipayLink = await convertAlipay(url);
      return alipayLink || "";

    case "tmall":
      const tmallLink = await convertTmall(url);
      return tmallLink || "";

    case "jd":
      const jdLink = await convertJd(url);
      return jdLink || "";

    case "pdd":
      const pddLink = await convertPdd(url);
      return pddLink || "";

    case "meituan":
      const meituanLink = await convertMeituan(url);
      return meituanLink || "";

    case "xianyu":
      const xianyuLink = await convertXianyu(url);
      return xianyuLink || "";

    default:
      return url;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: ConversionRequest = await request.json();
    const { links, platform, useUniversalLink = false } = body;

    if (!links || !Array.isArray(links) || links.length === 0) {
      return NextResponse.json({ error: "请提供有效的链接列表" }, { status: 400 });
    }

    if (!platform || !["taobao", "alipay", "tmall", "jd", "pdd", "meituan", "xianyu"].includes(platform)) {
      return NextResponse.json({ error: "请提供有效的平台类型" }, { status: 400 });
    }

    const results: ConversionResult[] = [];

    for (const link of links) {
      try {
        const converted = await convertToDeeplink(link.trim(), platform, useUniversalLink);
        results.push({
          converted,
          platform,
          success: true,
        });
      } catch (error) {
        results.push({
          converted: "",
          platform,
          success: false,
          error: "转换失败",
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("转换错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
const generateId = () => {
  const uuid = uuidv4(); // 生成 UUID v4
  const timestamp = Date.now(); // 当前时间戳（毫秒）
  return `${uuid}-${timestamp}`;
};

const convertTaoBao = async (link: string, useUniversalLink: boolean = false): Promise<string | null> => {
  if (link.startsWith("https://m.tb.cn")) {
    try {
      const res = await axios.get(link, {
        responseType: "text", // 确保返回 HTML 文本
      });
      const html = res.data as string;
      // 用正则提取 var url = '...';
      const match = html.match(/var\s+url\s*=\s*['"]([^'"]+)['"]/);
      if (!match || !match[1]) {
        return link;
      }
      const matchResult = match && match[1];
      const tk = link.split("?tk=")[1];
      const slk_sid = "rnd"
        .concat(((16777216 * (1 + Math.random())) | 0).toString(16).substring(1))
        .concat("_")
        .concat(String(new Date().getTime()));
      const result = `tbopen://m.taobao.com/tbopen/index.html?h5Url=${encodeURIComponent(
        matchResult
      )}%26tk%3D${tk}%26app%3Dchrome%26slk_gid%3Dgid_er_sidebar_0&action=ali.open.nav&module=h5&bootImage=0&slk_sid=${slk_sid}&slk_t=${Date.now()}&slk_gid=gid_er_sidebar_0&afcPromotionOpen=false&bc_fl_src=h5_huanduan&source=slk_dp`;
      if (useUniversalLink) {
        // Universal Link格式
        return `https://ace.tb.cn/t?smburl=${encodeURIComponent(result)}`;
      } else {
        // 普通deeplink格式
        return result;
      }
    } catch (err) {
      console.error("请求失败:", err);
      return null;
    }
  }
  let result = `tbopen://m.taobao.com/tbopen/index.html?h5Url=${encodeURIComponent(link)}`;
  if (link.startsWith("https://pages-fast.m.taobao.com")) {
    const slk_sid = "rnd"
      .concat(((16777216 * (1 + Math.random())) | 0).toString(16).substring(1))
      .concat("_")
      .concat(String(new Date().getTime()));
    result += `%26app%3Dchrome%26slk_gid%3Dgid_er_sidebar_0&action=ali.open.nav&module=h5&bootImage=0&slk_sid=${slk_sid}&slk_t=${Date.now()}&slk_gid=gid_er_sidebar_0&afcPromotionOpen=false&bc_fl_src=h5_huanduan&source=slk_dp`;
  }
  if (useUniversalLink) {
    // Universal Link格式
    return `https://ace.tb.cn/t?smburl=${encodeURIComponent(result)}`;
  } else {
    // 普通deeplink格式
    return result;
  }
};

const convertAlipay = async (link: string) => {
  const id = generateId();
  if (link.startsWith("https://ur.alipay.com") || link.startsWith("https://qr.alipay.com")) {
    try {
      const response = await axios.get(link, {
        responseType: "text",
        maxRedirects: 10,
      });

      const finalUrl = response.request.res.responseUrl?.split("scheme=")?.[1]
        ? decodeURIComponent(response.request.res.responseUrl?.split("scheme=")?.[1])
        : link;

      return `${finalUrl}&launchKey=${id}`;
    } catch (err) {
      console.error("请求失败:", err);
      return null;
    }
  }
  return `alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(link)}&launchKey=${id}`;
};

const convertTmall = async (link: string) => {
  return `tmall://page.tm/appLink?h5Url=${encodeURIComponent(link)}`;
};

const convertJd = async (link: string) => {
  return `
openapp.jdmobile://virtual?params={"category":"jump","sourcetype":"sourcetype_test","des":"m","url":"${link}","unionsource":"awake","channel":"c463034d12227447a79d0fefaef3fa18","union_open":"union_cps"}`;
};

const convertPdd = async (link: string): Promise<string | null> => {
  try {
    const url = new URL(link);
    const pathname = url.pathname;
    return `pinduoduo://com.xunmeng.pinduoduo${pathname}`;
  } catch (err) {
    return `pinduoduo://com.xunmeng.pinduoduo/${link}`;
  }
};

const convertMeituan = async (link: string): Promise<string | null> => {
  try {
    // 美团转换逻辑：将link进行encodeURIComponent编码后前面拼接imeituan://www.meituan.com/web?url=
    const encodedUrl = encodeURIComponent(link);
    return `imeituan://www.meituan.com/web?url=${encodedUrl}`;
  } catch (error) {
    console.error("美团链接转换失败:", error);
    return null;
  }
};

const convertXianyu = async (link: string): Promise<string | null> => {
  try {
    // 闲鱼转换逻辑：将link进行encodeURIComponent编码后前面拼接fleamarket://2.taobao.com/onepiece?source=auto&action=ali.open.nav&module=h5&bootimage=0&h5Url=
    const encodedUrl = encodeURIComponent(link);
    return `fleamarket://2.taobao.com/onepiece?source=auto&action=ali.open.nav&module=h5&bootimage=0&h5Url=${encodedUrl}`;
  } catch (error) {
    console.error("闲鱼链接转换失败:", error);
    return null;
  }
};
