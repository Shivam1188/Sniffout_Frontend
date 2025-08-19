import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { month: "January", revenue: 50, expense: 20 },
  { month: "February", revenue: 80, expense: -20 },
  { month: "March", revenue: 60, expense: 0 },
  { month: "April", revenue: 80, expense: 40 },
  { month: "May", revenue: 60, expense: 20 },
  { month: "June", revenue: 40, expense: -10 },
];

export default function EarningsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#1d3faa" strokeWidth={2} />
        <Line type="monotone" dataKey="expense" stroke="#fe6a3c" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
