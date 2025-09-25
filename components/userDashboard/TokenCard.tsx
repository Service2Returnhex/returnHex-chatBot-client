"use client";

type Props = {
  available: number;
  totalUsed: number;
  used: number;
  monthlyLimit?: number | null;
};

export default function TokenCard({ available, totalUsed, monthlyLimit, used }: Props) {
  const usedPct = monthlyLimit
    ? Math.round((totalUsed / monthlyLimit) * 100)
    : undefined;

  return (
    <div className="custom-card-bg">
      <h3 className="text-sm text-gray-300">Message Remain</h3>

      <div className="flex items-center justify-between mt-4">
        <div>
          <div className="text-3xl font-semibold">
            {available.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">Available Message</div>
        </div>

        <div>

          <div className="text-right">
            <div className="text-lg font-medium text-gray-200">
              {totalUsed.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Total Used Message</div>
          </div>

          <div className="text-right">
            <div className="text-lg font-medium text-gray-200">
              {used.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Used this period</div>
          </div>
        </div>
      </div>

      {monthlyLimit ? (
        <div className="mt-4">
          <div className="text-xs text-gray-400 mb-1">
            Usage: {usedPct}% of {monthlyLimit.toLocaleString()}
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${Math.min(100, Math.max(0, usedPct || 0))}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
