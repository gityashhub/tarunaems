import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import EmployeeLayout from '../../components/Employee/EmployeeLayout/EmployeeLayout';
import api from '../../utils/api';
import {
    Calendar as CalendarIcon,
    User,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../Admin/AdminHolidayCalendar.css';

const EmployeeHolidayCalendar = () => {
    const [date, setDate] = useState(new Date());
    const [holidays, setHolidays] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    <div className="w-2 h-2 bg-blue-400 rounded-full" title="Your Leave"></div>
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
        <EmployeeLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Holiday & Leave Calendar</h1>
                    <p className="text-secondary-400">View company holidays and your approved leaves</p>
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
                                <span className="text-secondary-400">My Leave</span>
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
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-secondary-500 italic">No holidays scheduled</p>
                                    )}
                                </div>

                                {/* Leaves for selected date */}
                                <div>
                                    <h3 className="text-sm font-medium text-secondary-400 uppercase tracking-wider mb-2">My Leaves</h3>
                                    {selectedDateLeaves.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedDateLeaves.map(l => (
                                                <div key={l._id} className="flex items-center space-x-3 bg-blue-400/10 border border-blue-400/20 rounded-lg p-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">
                                                            {l.leaveType}
                                                        </p>
                                                        <p className="text-xs text-secondary-400">{l.reason}</p>
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
        </EmployeeLayout>
    );
};

export default EmployeeHolidayCalendar;
