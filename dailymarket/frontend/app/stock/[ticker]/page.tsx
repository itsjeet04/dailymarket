"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} = await import("recharts") as any;

interface StockInfo {
  ticker: string;
  company_name: string;
  current_price: number;
  change_percent: number;
  market_cap: number;
  volume: number;
  sector: string;
}

interface AnalysisData {
  signal: string;
  MA7: number;
  MA30: number;
  data: { date: string; close: number; MA7: number; MA30: number }[];
}

export default function StockPage() {
  const { ticker } = useParams();
  const [info, setInfo] = useState<StockInfo | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [infoRes, analysisRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/stock/${ticker}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/stock/${ticker}/analysis`),
      ]);
      const infoData = await infoRes.json();
      const analysisData = await analysisRes.json();
      setInfo(infoData);
      setAnalysis(analysisData);
    } catch {
      setError("Failed to fetch stock data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [ticker]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-gray-400 text-lg animate-pulse">Loading {ticker} data...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-red-400">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">

      {/* header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">{info?.ticker}</h1>
          <p className="text-gray-400 mt-1">{info?.company_name}</p>
          <p className="text-gray-500 text-sm">{info?.sector}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-green-400">
            ${info?.current_price?.toFixed(2)}
          </p>
          <p className={`text-sm mt-1 ${(info?.change_percent ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
            {((info?.change_percent ?? 0) * 100).toFixed(2)}% (52W Change)
          </p>
        </div>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Market Cap", value: `$${((info?.market_cap ?? 0) / 1e9).toFixed(2)}B` },
          { label: "Volume", value: info?.volume?.toLocaleString() },
          { label: "MA7", value: `$${analysis?.MA7?.toFixed(2)}` },
          { label: "MA30", value: `$${analysis?.MA30?.toFixed(2)}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-white text-xl font-semibold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* trend signal */}
      <div className={`rounded-xl p-4 border text-center text-lg font-semibold
        ${analysis?.signal?.includes("BULLISH")
          ? "bg-green-900 border-green-600 text-green-300"
          : "bg-red-900 border-red-600 text-red-300"}`}>
        Trend Signal: {analysis?.signal}
      </div>

      {/* chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-white font-semibold text-lg mb-4">
          Price & Moving Averages (3 Months)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={analysis?.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              tickFormatter={(val: string) => val.slice(5)}
            />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
              labelStyle={{ color: "#9ca3af" }}
            />
            <Legend />
            <Line type="monotone" dataKey="close" stroke="#34d399" strokeWidth={2} dot={false} name="Price" />
            <Line type="monotone" dataKey="MA7" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="MA7" />
            <Line type="monotone" dataKey="MA30" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="MA30" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}