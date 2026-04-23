"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = async () => {
    if (!ticker.trim()) return;
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stock/${ticker.toUpperCase()}`);
      if (!res.ok) {
        setError("Stock not found! Try AAPL, TSLA, MSFT");
        return;
      }
      router.push(`/stock/${ticker.toUpperCase()}`);
    } catch {
      setError("Backend not running! Start uvicorn first.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">

      {/* heading */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-3">
          Stock <span className="text-green-400">Analytics</span> Dashboard
        </h1>
        <p className="text-gray-400 text-lg">
          Real-time stock data, moving averages & trend signals
        </p>
      </div>

      {/* search box */}
      <div className="flex gap-3 w-full max-w-lg">
        <input
          type="text"
          placeholder="Enter ticker e.g. AAPL, TSLA, MSFT"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
        />
        <button
          onClick={handleSearch}
          className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-lg transition"
        >
          Search
        </button>
      </div>

      {/* error message */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* popular stocks */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-3">Popular Stocks</p>
        <div className="flex gap-3 flex-wrap justify-center">
          {["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "META"].map((t) => (
            <button
              key={t}
              onClick={() => router.push(`/stock/${t}`)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}