import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    Plus,
    Trash2,
    Save,
    Send,
    CheckCircle,
    AlertCircle,
    Loader2,
    Info,
    ArrowLeft
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';

const DayBookEntry = () => {
    const [dayBook, setDayBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();

    const fetchTodayDayBook = async () => {
        try {
            setLoading(true);
            const response = await taskService.getTodayDayBook();
            if (response.success) {
                setDayBook(response.dayBook);
            }
        } catch (error) {
            console.error('Fetch daybook error:', error);
            toast.error(error.message || 'Failed to fetch today\'s day book');
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await taskService.getTasks();
            if (response.success) {
                setTasks(response.tasks);
            }
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        }
    };

    useEffect(() => {
        fetchTodayDayBook();
        fetchTasks();
    }, []);

    const handleSlotChange = (index, field, value) => {
        const updatedSlots = [...dayBook.slots];
        updatedSlots[index] = { ...updatedSlots[index], [field]: value };
        setDayBook({ ...dayBook, slots: updatedSlots });
    };

    const handleSave = async (submit = false) => {
        try {
            setSaving(true);
            // Validate: if submitting, all entries should have descriptions
            if (submit) {
                const emptySlots = dayBook.slots.filter(s => !s.description);
                if (emptySlots.length > 0) {
                    toast.error('Please fill in all slot descriptions before submitting');
                    setSaving(false);
                    return;
                }
            }

            const response = await taskService.submitDayBook({
                slots: dayBook.slots,
                status: submit ? 'Submitted' : 'Draft'
            });

            if (response.success) {
                toast.success(submit ? 'Day Book submitted successfully' : 'Day Book saved successfully');
                fetchTodayDayBook();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save Day Book');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-neon-pink" />
            </div>
        );
    }

    const isEditable = dayBook?.status === 'Draft' || dayBook?.status === 'Rejected' || dayBook?.status === 'Pending';

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                    <button
                        onClick={() => navigate('/employee/tasks')}
                        className="mt-1 p-2 bg-secondary-800/50 border border-secondary-700 text-secondary-400 rounded-lg hover:text-white hover:bg-secondary-700 transition-all duration-300"
                        title="Back to Tasks"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Daily Slot Report (EOD)</h1>
                        <div className="flex items-center text-secondary-400">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium ${dayBook?.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                        dayBook?.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                            dayBook?.status === 'Submitted' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        Status: {dayBook?.status || 'Draft'}
                    </div>
                </div>
            </div>

            {dayBook?.adminComment && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-400 font-bold text-sm">Feedback from Admin:</p>
                        <p className="text-secondary-300 text-sm mt-1">{dayBook.adminComment}</p>
                    </div>
                </div>
            )}

            {dayBook?.status === 'Approved' && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-green-400 font-bold text-sm">Report Approved</p>
                        <p className="text-secondary-300 text-sm mt-1">Great job! Your EOD report for today has been approved.</p>
                    </div>
                </div>
            )}

            {/* Info Card */}
            <div className="glass-morphism neon-border rounded-2xl p-4 flex items-center space-x-4 bg-neon-pink/5">
                <div className="w-10 h-10 bg-neon-pink/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-neon-pink" />
                </div>
                <p className="text-secondary-300 text-sm">
                    Please fill in your work details for each 2-hour slot. Link your tasks where applicable to automatically update their status.
                </p>
            </div>

            {/* Slots Table */}
            <div className="glass-morphism neon-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-secondary-700 bg-secondary-800/50">
                            <tr>
                                <th className="text-left p-6 text-secondary-300 font-medium w-32">Time Slot</th>
                                <th className="text-left p-6 text-secondary-300 font-medium w-40">Work Type</th>
                                <th className="text-left p-6 text-secondary-300 font-medium">Work Description & Task Linking</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-800">
                            {dayBook?.slots.map((slot, index) => (
                                <tr key={index} className="hover:bg-secondary-800/20 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-neon-pink" />
                                            <span className="text-white font-semibold text-sm">{slot.slotType}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {index === 1 ? (
                                            <div className="px-3 py-2 bg-secondary-800/50 border border-secondary-700 rounded-lg text-secondary-400 text-sm">
                                                Break
                                            </div>
                                        ) : (
                                            <select
                                                disabled={!isEditable}
                                                value={slot.taskRef?._id || slot.taskRef || slot.workType}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (['Meeting', 'Learning', 'Internal Work', 'Other'].includes(val)) {
                                                        handleSlotChange(index, 'workType', val);
                                                        handleSlotChange(index, 'taskRef', null);
                                                    } else {
                                                        handleSlotChange(index, 'workType', 'Task');
                                                        handleSlotChange(index, 'taskRef', val);
                                                        // Auto-fill description if empty
                                                        const selectedTask = tasks.find(t => t._id === val);
                                                        if (selectedTask && !slot.description) {
                                                            handleSlotChange(index, 'description', selectedTask.description);
                                                        }
                                                    }
                                                }}
                                                className="w-full px-3 py-2 bg-secondary-900/50 border border-secondary-700 rounded-lg text-white text-sm focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/20 disabled:opacity-50"
                                            >
                                                <optgroup label="Active Tasks">
                                                    {tasks.filter(t => t.status !== 'Cancelled' && t.status !== 'Completed').map(task => (
                                                        <option key={task._id} value={task._id}>
                                                            {task.description.substring(0, 40)}...
                                                        </option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Categories">
                                                    <option value="Meeting">Meeting</option>
                                                    <option value="Learning">Learning</option>
                                                    <option value="Internal Work">Internal Work</option>
                                                    <option value="Other">Other</option>
                                                </optgroup>
                                            </select>
                                        )}
                                    </td>
                                    <td className="p-6 space-y-3">
                                        {index === 1 ? (
                                            <div className="px-4 py-3 bg-secondary-800/30 border border-secondary-700 rounded-lg text-secondary-400 text-sm">
                                                Lunch Break
                                            </div>
                                        ) : (
                                            <>
                                                <textarea
                                                    disabled={!isEditable}
                                                    placeholder="What did you work on during this slot?"
                                                    value={slot.description}
                                                    onChange={(e) => handleSlotChange(index, 'description', e.target.value)}
                                                    rows="2"
                                                    className="w-full px-4 py-3 bg-secondary-900/50 border border-secondary-700 rounded-lg text-white text-sm placeholder-secondary-500 focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/20 disabled:opacity-50"
                                                ></textarea>

                                                {slot.taskRef && (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-[10px] text-neon-pink font-medium px-2 py-1 bg-neon-pink/10 rounded items-center flex">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Linked to Task
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                handleSlotChange(index, 'taskRef', null);
                                                                handleSlotChange(index, 'workType', 'Other');
                                                            }}
                                                            className="text-[10px] text-secondary-500 hover:text-red-400 transition-colors"
                                                        >
                                                            Unlink
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Buttons */}
            {isEditable && (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pb-12">
                    <button
                        disabled={saving}
                        onClick={() => navigate('/employee/tasks')}
                        className="w-full sm:w-auto px-8 py-3 bg-secondary-800/50 border border-secondary-700 text-secondary-400 rounded-xl hover:bg-secondary-700 hover:text-white transition-colors flex items-center justify-center order-last sm:order-first"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={saving}
                        onClick={() => handleSave(false)}
                        className="w-full sm:w-auto px-8 py-3 border border-secondary-600 text-secondary-300 rounded-xl hover:bg-secondary-700 transition-colors flex items-center justify-center"
                    >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Draft
                    </button>
                    <button
                        disabled={saving}
                        onClick={() => handleSave(true)}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-neon-pink to-neon-purple text-white font-bold rounded-xl hover-glow transition-all duration-300 flex items-center justify-center transform hover:scale-105"
                    >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Submit Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default DayBookEntry;
