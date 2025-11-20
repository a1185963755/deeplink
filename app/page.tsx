"use client";

import React from "react";
import { Tabs } from "antd";
import { FaShoppingCart, FaCreditCard, FaStore, FaGift, FaMobileAlt, FaUtensils, FaRecycle, FaTiktok } from "react-icons/fa";
import LinkConverter from "./components/LinkConverter";

type Platform = "taobao" | "alipay" | "tmall" | "jd" | "pdd" | "meituan" | "xianyu" | "douji";

const platforms: {
  key: Platform;
  label: string;
  icon: React.ReactNode;
  platformName: string;
  placeholder: string;
  supportFormat: string;
  buttonColor: string;
  resultBgColor: string;
}[] = [
  {
    key: "taobao",
    label: "淘宝",
    icon: <FaShoppingCart />,
    platformName: "淘宝",
    placeholder: "请输入淘宝链接，支持批量转换，一行一个",
    supportFormat: "https://m.tb.cn/h.xxx 或 https://pages-fast.m.taobao.com/xxx",
    buttonColor: "#ff6b35",
    resultBgColor: "#fff5f5",
  },
  {
    key: "alipay",
    label: "支付宝",
    icon: <FaCreditCard />,
    platformName: "支付宝",
    placeholder: "请输入支付宝链接，支持批量转换，一行一个",
    supportFormat: "https://ur.alipay.com/xxx 或 https://render.alipay.com/xxx",
    buttonColor: "#1677ff",
    resultBgColor: "#f0f9ff",
  },
  {
    key: "tmall",
    label: "天猫",
    icon: <FaStore />,
    platformName: "天猫",
    placeholder: "请输入天猫链接，支持批量转换，一行一个",
    supportFormat: "任意链接",
    buttonColor: "#ff4d4f",
    resultBgColor: "#fff2f0",
  },
  {
    key: "jd",
    label: "京东",
    icon: <FaGift />,
    platformName: "京东",
    placeholder: "请输入京东链接，支持批量转换，一行一个",
    supportFormat: "任意链接",
    buttonColor: "#e60012",
    resultBgColor: "#fff2f0",
  },
  {
    key: "pdd",
    label: "拼多多",
    icon: <FaMobileAlt />,
    platformName: "拼多多",
    placeholder: "请输入拼多多链接，支持批量转换，一行一个",
    supportFormat: "https://mobile.yangkeduo.com/xxx 或 https://pinduoduo.com/xxx",
    buttonColor: "#e02e24",
    resultBgColor: "#fff1f0",
  },
  {
    key: "meituan",
    label: "美团",
    icon: <FaUtensils />,
    platformName: "美团",
    placeholder: "请输入美团链接，支持批量转换，一行一个",
    supportFormat: "任意链接",
    buttonColor: "#ffc300",
    resultBgColor: "#fffbf0",
  },
  {
    key: "xianyu",
    label: "闲鱼",
    icon: <FaRecycle />,
    platformName: "闲鱼",
    placeholder: "请输入闲鱼链接，支持批量转换，一行一个",
    supportFormat: "任意链接",
    buttonColor: "#00c896",
    resultBgColor: "#f0fdf4",
  },
  {
    key: "douji",
    label: "抖极",
    icon: <FaTiktok />,
    platformName: "抖极",
    placeholder: "请输入抖极文案，支持批量转换，一行一个",
    supportFormat: "任意",
    buttonColor: "#fe2c55",
    resultBgColor: "#fff0f2",
  },
];

export default function Home() {
  // Fake metrics state (initialized after mount to avoid hydration mismatch)
  const [online, setOnline] = React.useState<number | null>(null);
  const [visits, setVisits] = React.useState<number | null>(null);

  // Stable, day-accumulating visits algorithm (update once per day)
  React.useEffect(() => {
    const totalKey = "metrics_visits_total";
    const dateKey = "metrics_visits_date";

    const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
    const getDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const now = new Date();
    const todayStr = getDateStr(now);
    let total = Number(localStorage.getItem(totalKey));
    if (!Number.isFinite(total) || total <= 0 ||total<380000) {
      total = Math.floor(randomBetween(380000, 400000));
    }

    const storedDate = localStorage.getItem(dateKey);
    if (!storedDate) {
      localStorage.setItem(dateKey, todayStr);
      localStorage.setItem(totalKey, String(total));
    } else if (storedDate !== todayStr) {
      // New day: add a small daily increment and persist
      const dailyDelta = Math.floor(randomBetween(200, 800));
      total = total + dailyDelta;
      localStorage.setItem(dateKey, todayStr);
      localStorage.setItem(totalKey, String(total));
    }

    setVisits(total);
    // Initialize online immediately (avoid waiting for the first interval tick)
    setOnline(5000 + Math.floor(Math.random() * 200));

    // Only animate online users; visits stays fixed for the day
    const timer = setInterval(() => {
      setOnline((o) => {
        const current = typeof o === "number" ? o : 500; // default after first mount
        const delta = Math.round((Math.random() - 0.5) * 6);
        const next = current + delta;
        return Math.max(50, Math.min(600, Math.round(next)));
      });
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);
  const items = platforms.map((platform) => ({
    key: platform.key,
    label: (
      <span className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-medium">
        <span style={{ color: platform.buttonColor }} className="text-base sm:text-lg">
          {platform.icon}
        </span>
        <span>{platform.label}</span>
      </span>
    ),
    children: (
      <LinkConverter
        platform={platform.key}
        platformName={platform.platformName}
        placeholder={platform.placeholder}
        supportFormat={platform.supportFormat}
        buttonColor={platform.buttonColor}
        resultBgColor={platform.resultBgColor}
      />
    ),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DP转换工具
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base font-medium">永久免费 · 快速转换 · 安全可靠</p>

            {/* Fake metrics under subtitle */}
            <div className="mt-3 inline-flex items-center gap-4 rounded-full border border-gray-200/80 bg-white/70 backdrop-blur-sm px-3 py-1.5 text-xs sm:text-sm shadow-sm">
              <span className="inline-flex items-center gap-1 text-gray-700">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                当前在线
                <span className="font-semibold text-gray-900">{typeof online === "number" ? online.toLocaleString() : "--"}</span>
              </span>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="inline-flex items-center gap-1 text-gray-700">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                累计访问
                <span className="font-semibold text-gray-900">{typeof visits === "number" ? visits.toLocaleString() : "--"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer spacer */}
      <div className="h-4" />

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Conversion Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 mb-8 sm:mb-16">
          <div className="p-4 sm:p-8">
            <Tabs
              defaultActiveKey="taobao"
              items={items}
              size="middle"
              className="conversion-tabs"
              tabBarStyle={{
                marginBottom: 24,
              }}
              tabBarGutter={0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
