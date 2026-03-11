"use client";

import { useState, useEffect, useCallback } from "react";

interface Submission {
  id: string;
  name: string;
  slots: string[];
  createdAt: string;
}

const HOURS = [9, 12, 15, 18, 21];
function getDates(): string[] {
  const dates: string[] = [];
  const ranges = [
    ["2026-04-01", "2026-04-14"],
  ];
  for (const [startStr, endStr] of ranges) {
    const start = new Date(startStr + "T00:00:00");
    const end = new Date(endStr + "T00:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }
  }
  return dates;
}

function formatDateChinese(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  return `${month}/${day} 周${weekday}`;
}

function formatHourLabel(hour: number): string {
  const endHour = hour + 3;
  return `${String(hour).padStart(2, "0")}:00-${String(endHour).padStart(2, "0")}:00`;
}

function slotId(date: string, hour: number): string {
  return `${date}_${String(hour).padStart(2, "0")}`;
}

// Login screen
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError("密码错误，请重试");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          私董会时间协调
        </h1>
        <p className="text-center text-gray-500 mb-6">请输入密码进入</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg mb-4"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "验证中..." : "进入"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Main scheduling app
function ScheduleApp() {
  const [name, setName] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [tab, setTab] = useState<"fill" | "results">("fill");

  const dates = getDates();

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const toggleSlot = (id: string) => {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("请输入您的姓名");
      return;
    }
    if (selectedSlots.size === 0) {
      alert("请选择至少一个可用时间段");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slots: Array.from(selectedSlots),
        }),
      });
      if (res.ok) {
        setSubmitSuccess(true);
        await fetchSubmissions();
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        const data = await res.json();
        alert(data.error || "提交失败");
      }
    } catch {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  // Load existing submission when name matches
  useEffect(() => {
    if (name.trim()) {
      const existing = submissions.find((s) => s.name === name.trim());
      if (existing) {
        setSelectedSlots(new Set(existing.slots));
      }
    }
  }, [name, submissions]);

  const getSlotAvailability = (sid: string) => {
    const available = submissions.filter((s) => s.slots.includes(sid));
    const unavailable = submissions.filter((s) => !s.slots.includes(sid));
    return { available, unavailable };
  };

  const totalPeople = submissions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">
            私董会时间协调
          </h1>
          <p className="text-sm text-gray-500">
            选择您可以参加的时间段（每段3小时）
          </p>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="max-w-5xl mx-auto px-4 mt-4">
        <div className="flex gap-1 bg-gray-200 p-1 rounded-lg w-fit">
          <button
            onClick={() => setTab("fill")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "fill"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            填写时间
          </button>
          <button
            onClick={() => {
              setTab("results");
              fetchSubmissions();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "results"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            查看结果 ({totalPeople}人已填)
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {tab === "fill" ? (
          <div>
            {/* Name input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                您的姓名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
              />
              {name.trim() &&
                submissions.find((s) => s.name === name.trim()) && (
                  <p className="text-sm text-blue-600 mt-1">
                    已找到您之前的提交，可以修改后重新提交
                  </p>
                )}
            </div>

            {/* Time grid */}
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sticky left-0 bg-white z-10">
                      时间段
                    </th>
                    {dates.map((date) => (
                      <th
                        key={date}
                        className="px-2 py-3 text-center text-sm font-medium text-gray-700 min-w-[80px]"
                      >
                        {formatDateChinese(date)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((hour) => (
                    <tr key={hour} className="border-b last:border-b-0">
                      <td className="px-3 py-2 text-sm text-gray-600 font-medium sticky left-0 bg-white z-10">
                        {formatHourLabel(hour)}
                      </td>
                      {dates.map((date) => {
                        const sid = slotId(date, hour);
                        const isSelected = selectedSlots.has(sid);
                        return (
                          <td key={sid} className="px-2 py-2 text-center">
                            <button
                              onClick={() => toggleSlot(sid)}
                              className={`w-full h-10 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? "bg-green-500 border-green-600 text-white shadow-sm"
                                  : "bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              {isSelected ? "OK" : ""}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "提交中..." : "提交"}
              </button>
              {submitSuccess && (
                <span className="text-green-600 font-medium">
                  提交成功！
                </span>
              )}
              <span className="text-sm text-gray-500">
                已选择 {selectedSlots.size} 个时间段
              </span>
            </div>
          </div>
        ) : (
          <div>
            {totalPeople === 0 ? (
              <div className="text-center py-12 text-gray-500">
                还没有人提交时间，请先填写您的可用时间
              </div>
            ) : (
              <>
                {/* Who has submitted */}
                <div className="mb-4 bg-white rounded-xl shadow-sm border p-4">
                  <h3 className="font-medium text-gray-800 mb-2">
                    已提交成员 ({totalPeople}人)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {submissions.map((s) => (
                      <span
                        key={s.id}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Results grid */}
                <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 sticky left-0 bg-white z-10">
                          时间段
                        </th>
                        {dates.map((date) => (
                          <th
                            key={date}
                            className="px-2 py-3 text-center text-sm font-medium text-gray-700 min-w-[100px]"
                          >
                            {formatDateChinese(date)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {HOURS.map((hour) => (
                        <tr key={hour} className="border-b last:border-b-0">
                          <td className="px-3 py-2 text-sm text-gray-600 font-medium sticky left-0 bg-white z-10">
                            {formatHourLabel(hour)}
                          </td>
                          {dates.map((date) => {
                            const sid = slotId(date, hour);
                            const { available, unavailable } =
                              getSlotAvailability(sid);
                            const allAvailable =
                              available.length === totalPeople;
                            const noneAvailable = available.length === 0;
                            const ratio =
                              totalPeople > 0
                                ? available.length / totalPeople
                                : 0;

                            let bgColor = "bg-gray-50";
                            let textColor = "text-gray-400";
                            if (allAvailable) {
                              bgColor = "bg-green-500";
                              textColor = "text-white";
                            } else if (ratio >= 0.75) {
                              bgColor = "bg-green-200";
                              textColor = "text-green-800";
                            } else if (ratio >= 0.5) {
                              bgColor = "bg-yellow-100";
                              textColor = "text-yellow-800";
                            } else if (!noneAvailable) {
                              bgColor = "bg-red-50";
                              textColor = "text-red-600";
                            }

                            return (
                              <td key={sid} className="px-2 py-2 text-center">
                                <div
                                  className={`rounded-lg p-2 ${bgColor} ${textColor}`}
                                  title={
                                    available.length > 0
                                      ? `可以: ${available.map((s) => s.name).join(", ")}${
                                          unavailable.length > 0
                                            ? ` | 不行: ${unavailable.map((s) => s.name).join(", ")}`
                                            : ""
                                        }`
                                      : "暂无人可以"
                                  }
                                >
                                  <div className="text-sm font-bold">
                                    {available.length}/{totalPeople}
                                  </div>
                                  {unavailable.length > 0 &&
                                    unavailable.length <= 3 && (
                                      <div className="text-xs mt-0.5 opacity-75">
                                        缺:{" "}
                                        {unavailable
                                          .map((s) => s.name)
                                          .join(", ")}
                                      </div>
                                    )}
                                  {allAvailable && (
                                    <div className="text-xs font-bold mt-0.5">
                                      全员OK
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-green-500 inline-block"></span>{" "}
                    全员可以
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-green-200 inline-block"></span>{" "}
                    大部分可以 (&ge;75%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-yellow-100 inline-block"></span>{" "}
                    部分可以 (&ge;50%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-red-50 inline-block"></span>{" "}
                    少数可以
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-gray-100 border inline-block"></span>{" "}
                    无人可以
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return <ScheduleApp />;
}
