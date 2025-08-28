"use client";

import { useState, useRef, useEffect } from "react";
import { CopyOutlined, CheckOutlined, CameraOutlined, PictureOutlined, QrcodeOutlined, EditOutlined, ThunderboltFilled } from "@ant-design/icons";
import { Button, message, Input, List, Tag, Switch } from "antd";
import QrScanner from "qr-scanner";
// Loosen typings to support different versions of qr-scanner
const QrScannerAny: any = QrScanner as any;

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

type Platform = "taobao" | "alipay" | "tmall" | "jd" | "pdd" | "meituan" | "xianyu";

export default function LinkConverter({ platform, platformName, placeholder, supportFormat, buttonColor, resultBgColor }: LinkConverterProps) {
  const [inputLinks, setInputLinks] = useState("");
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [useUniversalLink, setUseUniversalLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Camera scan states
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const appendLinks = (newLinks: string[]) => {
    const existing = inputLinks
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...existing, ...newLinks.map((s) => s.trim()).filter(Boolean)]));
    setInputLinks(merged.join("\n"));
  };

  const extractLinksFromText = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = text.match(urlRegex) || [];
    return matches;
  };

  const decodeFileToLinks = async (file: File): Promise<string[]> => {
    try {
      const result: unknown = await QrScanner.scanImage(file, { returnDetailedScanResult: true } as any);
      const raw = typeof result === "string" ? result : (result as any)?.data ?? "";
      const links = extractLinksFromText(raw);
      return links.length > 0 ? links : raw ? [raw] : [];
    } catch (e) {
      return [];
    }
  };

  const handleFiles = async (files: File[] | FileList) => {
    const list: File[] = Array.from(files);
    if (list.length === 0) return;
    message.loading({ content: "正在解析二维码...", key: "qr-parse" });
    try {
      const allLinks: string[] = [];
      for (const f of list) {
        if (!f.type.startsWith("image/")) continue;
        const links = await decodeFileToLinks(f);
        allLinks.push(...links);
      }
      const unique = Array.from(new Set(allLinks.map((s) => s.trim()).filter(Boolean)));
      if (unique.length > 0) {
        appendLinks(unique);
        message.success({ content: `已解析 ${unique.length} 个链接`, key: "qr-parse" });
      } else {
        message.warning({ content: "未在二维码中识别到链接", key: "qr-parse" });
      }
    } finally {
      message.destroy("qr-parse");
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === "file" && it.type.startsWith("image/")) {
        const file = it.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      await handleFiles(imageFiles);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFiles(files);
      e.target.value = "";
    }
  };

  // Start camera QR scanning
  const startCameraScan = async () => {
    try {
      const hasCamera = (await (QrScannerAny.hasCamera?.() ?? Promise.resolve(true))) as boolean;
      if (!hasCamera) {
        message.error("未检测到摄像头，无法进行扫码");
        return;
      }
      setIsScanning(true);
      // Delay to ensure video element mounted
      setTimeout(() => {
        if (!videoRef.current) return;
        if (scannerRef.current) {
          try {
            (scannerRef.current as any).stop?.();
          } catch {}
          try {
            (scannerRef.current as any).destroy?.();
          } catch {}
          scannerRef.current = null;
        }
        const onDecode = (result: string | { data?: string }) => {
          const raw = typeof result === "string" ? result : result?.data ?? "";
          const links = extractLinksFromText(raw);
          const payload = links.length > 0 ? links : raw ? [raw] : [];
          if (payload.length > 0) {
            appendLinks(payload);
            message.success("已识别并添加二维码内容");
            stopCameraScan();
          }
        };
        const scanner = new QrScannerAny(videoRef.current, (res: any) => onDecode(res as any), {
          preferredCamera: "environment",
          highlightScanRegion: true,
          maxScansPerSecond: 8,
        });
        scannerRef.current = scanner;
        (scannerRef.current as any).start?.();
      }, 50);
    } catch (err) {
      console.error(err);
      message.error("开启相机失败，请检查权限");
      setIsScanning(false);
    }
  };

  const stopCameraScan = () => {
    try {
      (scannerRef.current as any)?.stop?.();
      (scannerRef.current as any)?.destroy?.();
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      try {
        (scannerRef.current as any)?.stop?.();
        (scannerRef.current as any)?.destroy?.();
      } finally {
        scannerRef.current = null;
      }
    };
  }, []);

  const handleConvert = async () => {
    if (!inputLinks.trim()) {
      message.warning("请输入需要转换的链接");
      return;
    }

    setIsConverting(true);
    const links = inputLinks.split("\n").filter((link) => link.trim());

    try {
      const response = await fetch("/dp/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          links,
          platform,
          useUniversalLink: platform === "taobao" ? useUniversalLink : false,
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        message.success(index === -1 ? "全部复制成功" : "复制成功");
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          setCopiedIndex(index);
          message.success(index === -1 ? "全部复制成功" : "复制成功");
          setTimeout(() => setCopiedIndex(null), 2000);
        } else {
          throw new Error("execCommand copy failed");
        }
      }
    } catch (error) {
      console.error("复制失败:", error);
      message.error("复制失败，请手动复制");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Input Area */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl border border-gray-200/50 p-4 sm:p-6">
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-gray-700 text-sm">
            <EditOutlined />
            <span className="font-medium">输入链接</span>
          </div>
          <Input.TextArea
            value={inputLinks}
            onChange={(e) => setInputLinks(e.target.value)}
            onPaste={handlePaste}
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

        {/* QR Import Area */}
        <div className="mb-2 flex items-center gap-2 text-gray-700 text-sm">
          <QrcodeOutlined />
          <span className="font-medium">二维码导入</span>
        </div>
        <div
          className="mb-4 group rounded-xl border border-dashed border-gray-300/80 bg-white/60 backdrop-blur-sm p-5 cursor-pointer hover:border-blue-400 hover:bg-white/80 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={triggerFileSelect}
          onPaste={handlePaste}
          aria-label="导入二维码"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Left: Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                  <QrcodeOutlined className="text-xl" />
                </div>
                <div className="truncate">
                  <div className="text-gray-900 font-medium text-sm sm:text-base">拖拽/粘贴二维码图片到此区域</div>
                  <div className="text-xs text-gray-500 mt-0.5">支持扫一扫/选择图片，自动识别并追加到输入框</div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="w-full sm:w-auto flex items-stretch justify-center gap-2 sm:gap-3 flex-col sm:flex-row">
              <Button
                size="large"
                icon={<PictureOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileSelect();
                }}
                className="w-full sm:w-auto h-12 px-5 text-base"
                style={{ lineHeight: 1.1 }}
              >
                从图片选择
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<CameraOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  startCameraScan();
                }}
                className="w-full sm:w-auto h-12 px-5 text-base"
                style={{ lineHeight: 1.1, backgroundColor: buttonColor, borderColor: buttonColor }}
              >
                相机扫一扫
              </Button>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFileChange} className="hidden" />
        </div>

        {/* Universal Link Toggle for Taobao */}
        {platform === "taobao" && (
          <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">转换选项</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Deeplink</span>
              <Switch
                checked={useUniversalLink}
                onChange={setUseUniversalLink}
                size="small"
                style={{ backgroundColor: useUniversalLink ? buttonColor : undefined }}
              />
              <span className="text-xs text-gray-600">Universal Link</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="text-xs sm:text-sm text-gray-500 bg-gray-100/50 px-3 py-2 rounded-lg">
            <span className="font-medium">支持格式：</span>
            <code className="text-xs">{supportFormat}</code>
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
            <ThunderboltFilled className="text-xs text-gray-600" style={{ color: "#ffffff" }} />
            {isConverting ? "转换中..." : "极速转换"}
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
                    <div className="text-sm text-gray-900 font-mono line-clamp-3 break-all">{result.converted}</div>
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

      {/* Camera Scan Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="relative w-[90vw] max-w-sm aspect-square bg-black rounded-xl overflow-hidden">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
            {/* Corner frame */}
            <div className="absolute inset-6 border-2 border-white/70 rounded-lg pointer-events-none" />
            <div className="absolute bottom-3 left-0 right-0 text-center text-white text-sm">将二维码置于取景框内自动识别</div>
            <button onClick={stopCameraScan} className="absolute top-2 right-2 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded">
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
