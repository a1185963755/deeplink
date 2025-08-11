"use client";

import { Tabs } from "antd";
import { FaShoppingCart, FaCreditCard, FaStore, FaGift, FaMobileAlt, FaUtensils, FaRecycle } from "react-icons/fa";
import LinkConverter from "./components/LinkConverter";

type Platform = "taobao" | "alipay" | "tmall" | "jd" | "pdd" | "meituan" | "xianyu";

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
];

export default function Home() {
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
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
