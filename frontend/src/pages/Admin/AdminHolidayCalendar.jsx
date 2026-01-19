import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import AdminLayout from '../../components/Admin/layout/AdminLayout';
import api from '../../utils/api';
import {
    Plus,
    Trash2,
    Calendar as CalendarIcon,
    User,
    Info,
    ChevronLeft,
    ChevronRight,
    Loader2,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminHolidayCalendar.css';

const AdminHolidayCalendar = () => {
    const [date, setDate] = useState(new Date());
    const [holidays, setHolidays] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newHoliday, setNewHoliday] = useState({
        title: '',
        date: '',
        description: '',
        type: 'Public'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [holidayRes, leaveRes] = await Promise.all([
                api.get('/holidays'),
                api.get('/leaves', { params: { status: 'Approved', limit: 1000 } })
            ]);

            if (holidayRes.data.success) {
                setHolidays(holidayRes.data.holidays);
            }
            if (leaveRes.data.success) {
                setLeaves(leaveRes.data.leaves);
            }
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            toast.error('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddHoliday = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/holidays', newHoliday);
            if (response.data.success) {
                toast.success('Holiday added successfully');
                setShowAddModal(false);
                setNewHoliday({ title: '', date: '', description: '', type: 'Public' });
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add holiday');
        }
    };

    const handleDeleteHoliday = async (id) => {
        if (window.confirm('Are you sure you want to delete this holiday?')) {
            try {
                await api.delete(`/holidays/${id}`);
                toast.success('Holiday deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete holiday');
            }
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const formatUTCDate = (date) => {
        const d = new Date(date);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    };

    const tileContent = ({ date, view }) => {
        if (view !== 'month') return null;

        const dateString = formatDate(date);
        const dayHolidays = holidays.filter(h => formatUTCDate(h.date) === dateString);
        const dayLeaves = leaves.filter(l => {
            const start = formatUTCDate(l.startDate);
            const end = formatUTCDate(l.endDate);
            return dateString >= start && dateString <= end;
        });

        return (
            <div className="flex flex-col items-center mt-1 space-y-1">
                {dayHolidays.length > 0 && (
                    <div className="w-2 h-2 bg-neon-pink rounded-full" title={dayHolidays.map(h => h.title).join(', ')}></div>
                )}
                {dayLeaves.length > 0 && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full" title={`${dayLeaves.length} leaves`}></div>
                )}
            </div>
        );
    };

    const selectedDateHolidays = holidays.filter(h =>
        formatUTCDate(h.date) === formatDate(date)
    );

    const selectedDateLeaves = leaves.filter(l => {
        const dateString = formatDate(date);
        const start = formatUTCDate(l.startDate);
        const end = formatUTCDate(l.endDate);
        return dateString >= start && dateString <= end;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Holiday & Leave Calendar</h1>
                        <p className="text-secondary-400">View and manage company holidays and employee leaves</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-purple text-white font-semibold rounded-lg hover-glow transition-all duration-300 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Holiday
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar Section */}
                    <div className="lg:col-span-2 glass-morphism neon-border rounded-2xl p-6">
                        <Calendar
                            onChange={setDate}
                            value={date}
                            tileContent={tileContent}
                            className="admin-calendar w-full bg-transparent border-none text-white"
                        />

                        <div className="mt-6 flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-neon-pink rounded-full"></div>
                                <span className="text-secondary-400">Public Holiday</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                <span className="text-secondary-400">Employee Leave</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        <div className="glass-morphism neon-border rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <CalendarIcon className="w-5 h-5 mr-2 text-neon-pink" />
                                {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </h2>

                            <div className="space-y-4">
                                {/* Holidays for selected date */}
                                <div>
                                    <h3 className="text-sm font-medium text-secondary-400 uppercase tracking-wider mb-2">Holidays</h3>
                                    {selectedDateHolidays.length > 0 ? (
                                        selectedDateHolidays.map(h => (
                                            <div key={h._id} className="flex items-center justify-between bg-neon-pink/10 border border-neon-pink/20 rounded-lg p-3">
                                                <div>
                                                    <p className="text-white font-medium">{h.title}</p>
                                                    <p className="text-xs text-secondary-400">{h.type}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteHoliday(h._id)}
                                                    className="text-secondary-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-secondary-500 italic">No holidays scheduled</p>
                                    )}
                                </div>

                                {/* Leaves for selected date */}
                                <div>
                                    <h3 className="text-sm font-medium text-secondary-400 uppercase tracking-wider mb-2">Employee Leaves</h3>
                                    {selectedDateLeaves.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedDateLeaves.map(l => (
                                                <div key={l._id} className="flex items-center space-x-3 bg-blue-400/10 border border-blue-400/20 rounded-lg p-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">
                                                            {l.employee?.fullName || l.employee?.user?.name || 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-secondary-400">{l.leaveType}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-secondary-500 italic">No leaves on this date</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Holidays List */}
                        <div className="glass-morphism neon-border rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Upcoming Holidays</h2>
                            <div className="space-y-3">
                                {holidays
                                    .filter(h => new Date(h.date) >= new Date())
                                    .slice(0, 5)
                                    .map(h => (
                                        <div key={h._id} className="flex items-center justify-between p-2 border-b border-secondary-800">
                                            <div>
                                                <p className="text-white text-sm font-medium">{h.title}</p>
                                                <p className="text-xs text-secondary-400">{new Date(h.date).toLocaleDateString()}</p>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-700 text-secondary-300">
                                                {h.type}
                                            </span>
                                        </div>
                                    ))}
                                {holidays.length === 0 && <p className="text-sm text-secondary-500">No upcoming holidays</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Holiday Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative glass-morphism neon-border rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Add Company Holiday</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-secondary-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddHoliday} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-400 mb-1">Holiday Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newHoliday.title}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary-800/50 border border-secondary-600 rounded-lg text-white focus:border-neon-pink outline-none"
                                    placeholder="e.g., New Year's Day"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-400 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newHoliday.date}
                                        onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                        className="w-full px-4 py-2 bg-secondary-800/50 border border-secondary-600 rounded-lg text-white focus:border-neon-pink outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-400 mb-1">Type</label>
                                    <select
                                        value={newHoliday.type}
                                        onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                                        className="w-full px-4 py-2 bg-secondary-800/50 border border-secondary-600 rounded-lg text-white focus:border-neon-pink outline-none"
                                    >
                                        <option value="Public">Public</option>
                                        <option value="Optional">Optional</option>
                                        <option value="Company">Company</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-400 mb-1">Description (Optional)</label>
                                <textarea
                                    value={newHoliday.description}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-secondary-800/50 border border-secondary-600 rounded-lg text-white focus:border-neon-pink outline-none resize-none"
                                    placeholder="Add some details..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-neon-pink to-neon-purple text-white font-bold rounded-lg hover-glow transition-all"
                            >
                                Save Holiday
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminHolidayCalendar;
