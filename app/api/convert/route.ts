import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

type Platform = "taobao" | "alipay" | "tmall" | "jd";

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

    if (!platform || !["taobao", "alipay", "tmall", "jd"].includes(platform)) {
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
  const result = `tbopen://m.taobao.com/tbopen/index.html?h5Url=${encodeURIComponent(link)}`;
  if (useUniversalLink) {
    // Universal Link格式
    return `https://ace.tb.cn/t?smburl=${encodeURIComponent(result)}`;
  } else {
    // 普通deeplink格式
    return `tbopen://m.taobao.com/tbopen/index.html?h5Url=${encodeURIComponent(link)}`;
  }
};

const convertAlipay = async (link: string) => {
  if (link.startsWith("https://ur.alipay.com")) {
    try {
      const response = await axios.get(link, {
        responseType: "text",
        maxRedirects: 10,
      });

      const finalUrl = response.request.res.responseUrl?.split("scheme=")?.[1]
        ? decodeURIComponent(response.request.res.responseUrl?.split("scheme=")?.[1])
        : link;

      return finalUrl;
    } catch (err) {
      console.error("请求失败:", err);
      return null;
    }
  }
  return `alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(link)}`;
};

const convertTmall = async (link: string) => {
  return `tmall://page.tm/appLink?h5Url=${encodeURIComponent(link)}`;
};

const convertJd = async (link: string) => {
  return `
openapp.jdmobile://virtual?params={"category":"jump","sourcetype":"sourcetype_test","des":"m","url":"${link}","unionsource":"awake","channel":"c463034d12227447a79d0fefaef3fa18","union_open":"union_cps"}`;
};
