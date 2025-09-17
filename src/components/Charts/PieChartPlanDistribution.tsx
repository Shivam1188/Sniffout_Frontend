import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";

const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa"];

const PlanDistributionPieChart = ({ data }: any) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) setLoading(false);
    else setLoading(true);
  }, [data]);

  const totalCount =
    data?.reduce((acc: any, item: any) => acc + item.count, 0) || 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full h-96 relative">
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 animate-pulse">
          <div className="w-48 h-48 rounded-full bg-gray-200"></div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {COLORS.map((color, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : totalCount === 0 ? (
        <div className="text-center text-gray-500 h-full flex items-center justify-center">
          No plan distribution data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="plan_name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }: any) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {data.map((_: any, idx: any) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PlanDistributionPieChart;
