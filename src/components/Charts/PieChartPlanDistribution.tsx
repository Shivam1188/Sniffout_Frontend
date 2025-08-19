// components/PlanDistributionPieChart.tsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PlanDistributionData {
  plan_name: string;
  count: number;
}

interface Props {
  data: PlanDistributionData[];
}

const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa"]; // Feel free to customize

const PlanDistributionPieChart = ({ data }: Props) => {
  const totalCount = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full h-96">
  
      {totalCount === 0 ? (
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
              label={({ name, percent }:any) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {data.map((index:any) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
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
