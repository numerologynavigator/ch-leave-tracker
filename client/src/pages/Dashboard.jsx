import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Calendar, Clock, Award, Info } from 'lucide-react';

const COLORS = {
  planned: '#10b981',
  unplanned: '#ef4444',
  primary: '#3b82f6',
  secondary: '#8b5cf6'
};

function StatCard({ title, value, icon: Icon, trend, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center text-sm">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(trend)}%
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTeam, setSelectedTeam] = useState('All Teams');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?year=${selectedYear}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  // Prepare monthly trend data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = monthNames.map((month, index) => {
    const monthNum = (index + 1).toString().padStart(2, '0');
    const planned = analytics.monthlyTrend.find(t => t.month === monthNum && t.leave_type === 'Planned');
    const unplanned = analytics.monthlyTrend.find(t => t.month === monthNum && t.leave_type === 'Unplanned');
    
    return {
      month,
      Planned: planned?.total_days || 0,
      Unplanned: unplanned?.total_days || 0
    };
  });

  // Prepare PTO breakdown for pie chart
  const ptoBreakdownData = [
    { name: 'Planned', value: analytics.ptoBreakdown.planned?.totalDays || 0 },
    { name: 'Unplanned', value: analytics.ptoBreakdown.unplanned?.totalDays || 0 }
  ];

  // Get unique teams for filter
  const uniqueTeams = ['All Teams', ...new Set(analytics.teamEfficiency.map(emp => emp.team))];

  // Filter employees by selected team
  const filteredEmployees = selectedTeam === 'All Teams' 
    ? analytics.teamEfficiency 
    : analytics.teamEfficiency.filter(emp => emp.team === selectedTeam);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Team PTO overview and analytics for {selectedYear}
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="input w-32"
        >
          {[2024, 2025, 2026, 2027].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={analytics.summary.totalEmployees}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Total PTO Days Used"
          value={analytics.summary.totalPTOUsed}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Planned PTO %"
          value={`${analytics.summary.plannedPercentage}%`}
          icon={Award}
          color="green"
        />
        <StatCard
          title="Unplanned PTO %"
          value={`${analytics.summary.unplannedPercentage}%`}
          icon={Clock}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly PTO Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Planned" fill={COLORS.planned} />
              <Bar dataKey="Unplanned" fill={COLORS.unplanned} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PTO Breakdown */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">PTO Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ptoBreakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {ptoBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Planned' ? COLORS.planned : COLORS.unplanned} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team-wise Efficiency */}
      {analytics.teamWiseEfficiency && analytics.teamWiseEfficiency.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team-wise PTO Planning Efficiency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.teamWiseEfficiency.map((team) => (
              <div key={team.team} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{team.team}</h3>
                  <span className="text-xs text-gray-500">{team.employee_count} members</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total PTO:</span>
                    <span className="font-medium">{team.total_pto_used} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Planned:</span>
                    <span className="font-medium text-green-600">{team.planned_days || 0} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Unplanned:</span>
                    <span className="font-medium text-red-600">{team.unplanned_days || 0} days</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Planning Efficiency</span>
                      <span className={`text-xs font-medium ${
                        team.planned_percentage >= 70 ? 'text-green-600' : 
                        team.planned_percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {team.planned_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          team.planned_percentage >= 70 ? 'bg-green-500' : 
                          team.planned_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${team.planned_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Work Efficiency</span>
                      <span className={`text-xs font-medium ${
                        team.work_efficiency >= 95 ? 'text-green-600' : 
                        team.work_efficiency >= 90 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {team.work_efficiency}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          team.work_efficiency >= 95 ? 'bg-green-500' : 
                          team.work_efficiency >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${team.work_efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Efficiency Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Individual Employee Efficiency Analysis</h2>
          <div className="flex items-center space-x-2">
            <label htmlFor="team-filter" className="text-sm text-gray-600">Filter by Team:</label>
            <select
              id="team-filter"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {uniqueTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total PTO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unplanned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Planning %</span>
                    <div className="group relative">
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute z-10 w-64 p-2 mt-1 text-xs font-normal normal-case bg-gray-900 text-white rounded shadow-lg -left-24">
                        <strong>Formula:</strong> (Planned Days / Total PTO Used) × 100<br/>
                        Measures how well employees plan their time off in advance.
                      </div>
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Work Efficiency</span>
                    <div className="group relative">
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute z-10 w-64 p-2 mt-1 text-xs font-normal normal-case bg-gray-900 text-white rounded shadow-lg -left-24">
                        <strong>Formula:</strong> ((Total PTO - Unplanned Days) / Total PTO) × 100<br/>
                        Measures productivity impact of unplanned absences.
                      </div>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {employee.team}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.total_pto_days} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.pto_used} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.pto_remaining} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {employee.planned || 0} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {employee.unplanned || 0} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${employee.planned_percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{employee.planned_percentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            employee.work_efficiency >= 95 ? 'bg-green-500' : 
                            employee.work_efficiency >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${employee.work_efficiency}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        employee.work_efficiency >= 95 ? 'text-green-600' : 
                        employee.work_efficiency >= 90 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{employee.work_efficiency}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Leaves */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leave Requests</h2>
        <div className="space-y-3">
          {analytics.recentLeaves.slice(0, 5).map((leave) => (
            <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${leave.leave_type === 'Planned' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{leave.employee_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  leave.leave_type === 'Planned' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {leave.leave_type}
                </span>
                <span className="text-sm text-gray-600">{leave.days_count} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
