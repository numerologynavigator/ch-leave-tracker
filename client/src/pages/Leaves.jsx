import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [formData, setFormData] = useState({
    employee_id: '',
    start_date: '',
    end_date: '',
    leave_type: 'Planned',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await fetch('/api/leaves');
      const data = await response.json();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingLeave ? `/api/leaves/${editingLeave.id}` : '/api/leaves';
      const method = editingLeave ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchLeaves();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving leave:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this leave record?')) return;

    try {
      const response = await fetch(`/api/leaves/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error deleting leave:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      start_date: '',
      end_date: '',
      leave_type: 'Planned',
      reason: ''
    });
    setEditingLeave(null);
    setShowModal(false);
  };

  const openEditModal = (leave) => {
    setEditingLeave(leave);
    setFormData({
      employee_id: leave.employee_id,
      start_date: leave.start_date,
      end_date: leave.end_date,
      leave_type: leave.leave_type,
      reason: leave.reason || ''
    });
    setShowModal(true);
  };

  // Get unique teams from employees
  const uniqueTeams = ['all', ...new Set(employees.map(emp => emp.team).filter(Boolean))];

  // Filter employees based on selected team
  const filteredEmployees = filterTeam === 'all' 
    ? employees 
    : employees.filter(emp => emp.team === filterTeam);

  // Handle team change - reset employee filter when team changes
  const handleTeamChange = (team) => {
    setFilterTeam(team);
    setFilterEmployee('all');
  };

  const filteredLeaves = leaves.filter(leave => {
    // Filter by type
    const typeMatch = filterType === 'all' || leave.leave_type.toLowerCase() === filterType.toLowerCase();
    
    // Filter by employee
    const employeeMatch = filterEmployee === 'all' || leave.employee_id.toString() === filterEmployee;
    
    return typeMatch && employeeMatch;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Records</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage all PTO requests</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add Leave
        </button>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center space-x-3">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input w-48"
          >
            <option value="all">All Types</option>
            <option value="planned">Planned Only</option>
            <option value="unplanned">Unplanned Only</option>
          </select>
          <select
            value={filterTeam}
            onChange={(e) => handleTeamChange(e.target.value)}
            className="input w-48"
          >
            <option value="all">All Teams</option>
            {uniqueTeams.filter(team => team !== 'all').map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="input w-64"
          >
            <option value="all">All Employees</option>
            {filteredEmployees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {leave.employee_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(leave.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(leave.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leave.days_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      leave.leave_type === 'Planned' 
                        ? 'bg-green-100 text-green-800' 
                        : leave.leave_type === 'Unplanned'
                        ? 'bg-red-100 text-red-800'
                        : leave.leave_type === 'Maternity Leave'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {leave.leave_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {leave.reason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(leave)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(leave.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingLeave ? 'Edit Leave' : 'Add New Leave'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Employee *</label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="input"
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Leave Type *</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  className="input"
                >
                  <option value="Planned">Planned PTO</option>
                  <option value="Unplanned">Unplanned PTO</option>
                  <option value="Maternity Leave">Maternity Leave (6 months)</option>
                  <option value="Paternity Leave">Paternity Leave (4 weeks)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: All leave types exclude weekends (Saturday and Sunday)
                </p>
              </div>
              <div>
                <label className="label">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Optional reason for leave"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLeave ? 'Update' : 'Add'} Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
