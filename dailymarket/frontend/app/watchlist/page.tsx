"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface WatchlistItem {
  id: number;
  ticker: string;
  company_name: string;
  added_at: string;
}

interface LivePrice {
  current_price: number;
  change_percent: number;
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [prices, setPrices] = useState<{ [ticker: string]: LivePrice }>({});
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // fetch watchlist on load
  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/watchlist");
    const data = await res.json();
    setWatchlist(data);
    fetchLivePrices(data);
  };

  // fetch live price for each stock in watchlist
  const fetchLivePrices = async (items: WatchlistItem[]) => {
    const priceMap: { [ticker: string]: LivePrice } = {};
    await Promise.all(
      items.map(async (item) => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stock/${item.ticker}`);
          const data = await res.json();
          priceMap[item.ticker] = {
            current_price: data.current_price,
            change_percent: data.change_percent,
          };
        } catch {
          priceMap[item.ticker] = { current_price: 0, change_percent: 0 };
        }
      })
    );
    setPrices(priceMap);
  };

  const handleAdd = async () => {
    if (!ticker.trim()) return;
    setError("");
    setLoading(true);

    try {
      // first verify stock exists
      const infoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stock/${ticker.toUpperCase()}`);
      if (!infoRes.ok) {
        setError("Stock not found! Try AAPL, TSLA, MSFT");
        setLoading(false);
        return;
      }
      const info = await infoRes.json();

      // add to watchlist
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          company_name: info.company_name,
        }),
      });

      if (!res.ok) {
        setError("Stock already in watchlist!");
        setLoading(false);
        return;
      }

      setTicker("");
      fetchWatchlist();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticker: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchlist/${ticker}`, {
      method: "DELETE",
    });
    fetchWatchlist();
  };

  return (
    <div className="flex flex-col gap-8">

      {/* heading */}
      <div>
        <h1 className="text-4xl font-bold text-white">
          My <span className="text-green-400">Watchlist</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Track your favourite stocks with live prices
        </p>
      </div>

      {/* add stock input */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Add stock e.g. AAPL"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-black font-semibold px-6 py-3 rounded-lg transition"
        >
          {loading ? "Adding..." : "+ Add"}
        </button>
      </div>

      {/* error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* empty state */}
      {watchlist.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg">Your watchlist is empty</p>
          <p className="text-sm mt-1">Add stocks above to start tracking</p>
        </div>
      )}

      {/* watchlist table */}
      {watchlist.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-sm">
                <th className="text-left px-6 py-4">Stock</th>
                <th className="text-left px-6 py-4">Company</th>
                <th className="text-right px-6 py-4">Price</th>
                <th className="text-right px-6 py-4">52W Change</th>
                <th className="text-right px-6 py-4">Added</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-700 hover:bg-gray-750 transition"
                >
                  <td className="px-6 py-4">
                    <span className="text-green-400 font-bold">{item.ticker}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{item.company_name}</td>
                  <td className="px-6 py-4 text-right text-white font-semibold">
                    ${prices[item.ticker]?.current_price?.toFixed(2) ?? "..."}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${
                      (prices[item.ticker]?.change_percent ?? 0) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}>
                      {((prices[item.ticker]?.change_percent ?? 0) * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 text-sm">
                    {new Date(item.added_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => router.push(`/stock/${item.ticker}`)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-gray-300 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(item.ticker)}
                        className="text-xs bg-red-900 hover:bg-red-800 px-3 py-1 rounded-lg text-red-300 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}