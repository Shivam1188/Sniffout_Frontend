
interface PlanStats {
  plan_type: string;
  restaurants: number;
  monthly_revenue: number;
  growth: number;
}

interface Props {
  data: PlanStats[];
}

const RestaurantsByPlanTable = ({ data }: Props) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center sm:text-left">
        📊 Restaurants by Plan
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-[600px] w-full table-auto text-sm text-gray-700">
          <thead>
            <tr className="bg-[#f3f4f6] text-[#1d3faa] uppercase text-xs tracking-wide">
              <th className="py-3 px-4 text-left">Plan Type</th>
              <th className="py-3 px-4 text-center">Restaurants</th>
              <th className="py-3 px-4 text-center">Revenue</th>
              <th className="py-3 px-4 text-center">Growth</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const isPositive = row.growth >= 0;
              return (
                <tr
                  key={index}
                  className={`transition duration-300 ease-in-out hover:bg-[#f0f4ff] ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                >
                  <td className="py-3 px-4 font-medium text-left">
                    {row.plan_type}
                  </td>
                  <td className="py-3 px-4 text-center">{row.restaurants}</td>
                  <td className="py-3 px-4 text-center">
                    ${row.monthly_revenue.toFixed(2)}
                  </td>
                  <td
                    className={`py-3 px-4 text-center font-semibold ${isPositive
                      ? "text-green-600"
                      : "text-red-500"
                      }`}
                  >
                    {isPositive ? "▲" : "▼"} {row.growth.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RestaurantsByPlanTable;
