import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  period: string;
  revenue: string;
  expense: string;
}

interface ChartProps {
  monthlyEarningData?: MonthlyData[];
}

const MonthlyEarningsChart = ({ monthlyEarningData = [] }: ChartProps) => {
  // Convert string to numbers and rename `period` to `month`
  const transformedData = monthlyEarningData.map((item) => ({
    month: item.period,
    revenue: parseFloat(item.revenue),
    expense: parseFloat(item.expense),
  }));

  // Filter only months with actual data
  const validChartData = transformedData.filter(
    (item) => item.revenue !== 0 || item.expense !== 0
  );

  const renderDot = (props: any) => {
    const { cx, cy, stroke, fill } = props;
    return (
      <circle cx={cx} cy={cy} r={5} stroke={stroke} strokeWidth={2} fill={fill} />
    );
  };

  return (
    <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Earnings Overview</h2>
        <button className="cursor-pointer text-gray-500 hover:text-[#fe6a3c] text-sm font-medium">
          Monthly
        </button>
      </div>
      <div className="p-2 rounded-lg h-72">
        {validChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={transformedData}
              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: "0.875rem", marginBottom: "1rem" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={renderDot}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={renderDot}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No earnings data available for this period.
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyEarningsChart;
