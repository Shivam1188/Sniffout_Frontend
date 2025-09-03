// components/Charts/SubscribersBarChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PlanData {
  plan: string;
  subscribers: number;
}

interface SubscribersBarChartProps {
  planData?: PlanData[];
  title?: string;
}

const SubscribersBarChart = ({ planData = [] }: SubscribersBarChartProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2> */}
      <div className="h-72">
        {planData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={planData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="plan" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Bar dataKey="subscribers" fill="#3b82f6" barSize={40} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No subscriber data available for this period.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribersBarChart;