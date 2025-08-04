"use client";

import { useState } from "react";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import { Button, message, Input, List, Tag } from "antd";

interface ConversionResult {
  original: string;
  converted: string;
  platform: string;
  success: boolean;
  error?: string;
}

interface LinkConverterProps {
  platform: Platform;
  platformName: string;
  placeholder: string;
  supportFormat: string;
  buttonColor: string;
  resultBgColor: string;
}

type Platform = "taobao" | "alipay" | "tmall" | "jd";

export default function LinkConverter({ platform, platformName, placeholder, supportFormat, buttonColor, resultBgColor }: LinkConverterProps) {
  const [inputLinks, setInputLinks] = useState("");
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleConvert = async () => {
    if (!inputLinks.trim()) {
      message.warning("请输入需要转换的链接");
      return;
    }

    setIsConverting(true);
    const links = inputLinks.split("\n").filter((link) => link.trim());

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          links,
          platform,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        message.success("转换完成");
      } else {
        message.error(data.error || "转换失败");
      }
    } catch (error) {
      console.error("请求失败:", error);
      message.error("网络请求失败");
    } finally {
      setIsConverting(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      message.success(index === -1 ? "全部复制成功" : "复制成功");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error("复制失败:", error);
      message.error("复制失败");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Input Area */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl border border-gray-200/50 p-4 sm:p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">输入链接</label>
          <Input.TextArea
            value={inputLinks}
            onChange={(e) => setInputLinks(e.target.value)}
            placeholder={placeholder}
            allowClear
            autoSize={{ minRows: 6, maxRows: 10 }}
            className="text-sm sm:text-base"
            style={{
              borderRadius: "8px",
              borderColor: "#d1d5db",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(8px)",
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-xs sm:text-sm text-gray-500 bg-gray-100/50 px-3 py-2 rounded-lg">
            <span className="font-medium">支持格式：</span>
            <code className="text-xs bg-white px-2 py-1 rounded ml-1 break-all">{supportFormat}</code>
          </div>
          <Button
            type="primary"
            onClick={handleConvert}
            loading={isConverting}
            disabled={!inputLinks.trim()}
            style={{
              backgroundColor: buttonColor,
              borderColor: buttonColor,
              height: "44px",
              paddingLeft: "20px",
              paddingRight: "20px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#ffffff",
            }}
            className="hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            {isConverting ? "转换中..." : "获取链接"}
          </Button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: buttonColor }}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">转换结果 ({results.filter((r) => r.success).length} 个)</span>
            </div>
            {results.some((r) => r.success) && (
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  const successfulResults = results.filter((r) => r.success).map((r) => r.converted);
                  copyToClipboard(successfulResults.join("\n"), -1);
                }}
                className="hover:text-blue-600 transition-colors duration-200"
                style={{ color: buttonColor }}
              >
                复制全部
              </Button>
            )}
          </div>

          {/* Results List */}
          {results.map(
            (result, index) =>
              result.success && (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 font-mono line-clamp-3">{result.converted}</div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={copiedIndex === index ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={() => copyToClipboard(result.converted, index)}
                    className="flex-shrink-0 hover:text-blue-600 transition-colors duration-200"
                    style={{ color: buttonColor }}
                  >
                    {copiedIndex === index ? "已复制" : "复制"}
                  </Button>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
