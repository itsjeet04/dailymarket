"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CompareData {
  [ticker: string]: { date: string; close: number }[];
}

export default function ComparePage() {
  const [tickerA, setTickerA] = useState("");
  const [tickerB, setTickerB] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [compared, setCompared] = useState(false);

  const handleCompare = async () => {
    if (!tickerA.trim() || !tickerB.trim()) {
      setError("Please enter both stock tickers!");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/compare?a=${tickerA.toUpperCase()}&b=${tickerB.toUpperCase()}`
      );
      const data: CompareData = await res.json();

      // merge both stocks into one array for recharts
      const tickerAData = data[tickerA.toUpperCase()] || [];
      const tickerBData = data[tickerB.toUpperCase()] || [];

      const merged = tickerAData.map((item, index) => ({
        date: item.date,
        [tickerA.toUpperCase()]: item.close,
        [tickerB.toUpperCase()]: tickerBData[index]?.close ?? null,
      }));

      setChartData(merged);
      setCompared(true);
    } catch {
      setError("Failed to fetch comparison data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">

      {/* heading */}
      <div>
        <h1 className="text-4xl font-bold text-white">
          Compare <span className="text-green-400">Stocks</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Compare price performance of 2 stocks over the last month
        </p>
      </div>

      {/* input row */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Stock A e.g. AAPL"
          value={tickerA}
          onChange={(e) => setTickerA(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
        />
        <input
          type="text"
          placeholder="Stock B e.g. TSLA"
          value={tickerB}
          onChange={(e) => setTickerB(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={handleCompare}
          disabled={loading}
          className="bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-black font-semibold px-8 py-3 rounded-lg transition"
        >
          {loading ? "Loading..." : "Compare"}
        </button>
      </div>

      {/* error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* quick pairs */}
      <div>
        <p className="text-gray-500 text-sm mb-3">Quick Pairs</p>
        <div className="flex gap-3 flex-wrap">
          {[
            ["AAPL", "MSFT"],
            ["TSLA", "GOOGL"],
            ["AMZN", "META"],
          ].map(([a, b]) => (
            <button
              key={`${a}-${b}`}
              onClick={() => { setTickerA(a); setTickerB(b); }}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition"
            >
              {a} vs {b}
            </button>
          ))}
        </div>
      </div>

      {/* chart */}
      {compared && chartData.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-white font-semibold text-lg mb-4">
            {tickerA.toUpperCase()} vs {tickerB.toUpperCase()} — Last 30 Days
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <Legend />
              <Line type="monotone" dataKey={tickerA.toUpperCase()} stroke="#34d399" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={tickerB.toUpperCase()} stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}