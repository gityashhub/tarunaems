import React, { useState, useEffect } from 'react';
import {
    Calendar,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Check,
    X,
    Loader2,
    MessageSquare,
    Trash2
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';

const AdminDayBookReview = () => {
    const [dayBooks, setDayBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDayBook, setSelectedDayBook] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [adminComment, setAdminComment] = useState('');
    const [taskStatuses, setTaskStatuses] = useState({});

    const fetchDayBooks = async () => {
        try {
            setLoading(true);
            const response = await taskService.getDayBooks();
            if (response.success) {
                setDayBooks(response.dayBooks);
            }
        } catch (error) {
            toast.error('Failed to fetch day books');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDayBooks();
    }, []);

    const handleReview = (dayBook) => {
        setSelectedDayBook(dayBook);
        setAdminComment(dayBook.adminComment || '');

        // Initialize task statuses from dayBook slots
        const statuses = {};
        dayBook.slots.forEach(slot => {
            if (slot.taskRef) {
                statuses[slot.taskRef._id] = slot.taskRef.status;
            }
        });
        setTaskStatuses(statuses);
        setShowReviewModal(true);
    };

    const updateStatus = async (status) => {
        try {
            // Prepare task status updates
            const taskUpdates = Object.entries(taskStatuses).map(([taskId, status]) => ({
                taskId,
                status
            }));

            const response = await taskService.updateDayBookStatus(selectedDayBook._id, {
                status,
                adminComment,
                taskStatuses: taskUpdates
            });

            if (response.success) {
                toast.success(`Day Book ${status.toLowerCase()} successfully`);
                setShowReviewModal(false);
                fetchDayBooks();
            }
        } catch (error) {
            toast.error('Failed to update Day Book status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this Day Book? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await taskService.deleteDayBook(id);
            if (response.success) {
                toast.success('Day Book deleted successfully');
                fetchDayBooks();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete Day Book');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-neon-pink" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="glass-morphism neon-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-secondary-700">
                            <tr>
                                <th className="text-left p-6 text-secondary-300 font-medium">Date</th>
                                <th className="text-left p-6 text-secondary-300 font-medium">Employee</th>
                                <th className="text-left p-6 text-secondary-300 font-medium">Status</th>
                                <th className="text-left p-6 text-secondary-300 font-medium">Slots Filled</th>
                                <th className="text-left p-6 text-secondary-300 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-800">
                            {dayBooks.map((db) => (
                                <tr key={db._id} className="hover:bg-secondary-800/30 transition-colors">
                                    <td className="p-6 text-white font-medium">
                                        {new Date(db.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-secondary-700 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-secondary-300" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">
                                                    {db.employee?.personalInfo?.firstName} {db.employee?.personalInfo?.lastName}
                                                </p>
                                                <p className="text-secondary-400 text-xs">{db.employee?.employeeId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 text-xs rounded-full ${db.status === 'Approved' ? 'text-green-400 bg-green-400/20' :
                                            db.status === 'Rejected' ? 'text-red-400 bg-red-400/20' :
                                                db.status === 'Submitted' ? 'text-blue-400 bg-blue-400/20' :
                                                    'text-yellow-400 bg-yellow-400/20'
                                            }`}>
                                            {db.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-secondary-300">
                                        {db.slots.filter(s => s.description).length} / {db.slots.length}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleReview(db)}
                                                className="p-2 text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors flex items-center"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Review
                                            </button>
                                            <button
                                                onClick={() => handleDelete(db._id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center"
                                                title="Delete Day Book"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {dayBooks.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-secondary-500">
                                        No EOD reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showReviewModal && selectedDayBook && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowReviewModal(false)} />
                    <div className="relative glass-morphism neon-border rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">EOD Report Review</h2>
                                <p className="text-secondary-400">
                                    {selectedDayBook.employee?.personalInfo?.firstName} {selectedDayBook.employee?.personalInfo?.lastName} - {new Date(selectedDayBook.date).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={() => setShowReviewModal(false)} className="text-secondary-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {selectedDayBook.slots.map((slot, index) => (
                                <div key={index} className="p-4 bg-secondary-800/40 rounded-xl border border-secondary-700">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-neon-pink" />
                                            <span className="text-white font-semibold">{slot.slotType}</span>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full bg-secondary-700 text-secondary-300 italic`}>
                                            {slot.workType}
                                        </span>
                                    </div>
                                    <p className="text-secondary-200 text-sm mb-4 bg-secondary-900/40 p-3 rounded-lg">
                                        {slot.description || <span className="text-secondary-500 italic">No description provided</span>}
                                    </p>

                                    {slot.taskRef && (
                                        <div className="mt-2 p-3 bg-neon-pink/5 border border-neon-pink/20 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <CheckCircle className="w-4 h-4 text-neon-pink" />
                                                <div>
                                                    <p className="text-white text-xs font-medium">Linked Task Status</p>
                                                    <p className="text-secondary-400 text-[10px] line-clamp-1">{slot.taskRef.description}</p>
                                                </div>
                                            </div>
                                            <select
                                                value={taskStatuses[slot.taskRef._id] || slot.taskRef.status}
                                                onChange={(e) => setTaskStatuses({ ...taskStatuses, [slot.taskRef._id]: e.target.value })}
                                                className="bg-secondary-800 border-none rounded text-xs text-neon-pink focus:ring-0"
                                            >
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Review">Review</option>
                                                <option value="Completed">Completed</option>
                                                <option value="On Hold">On Hold</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="pt-4 border-t border-secondary-700">
                                <label className="block text-sm font-medium text-secondary-300 mb-2">Admin Feedback / Comment</label>
                                <textarea
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                    placeholder="Provide feedback to the employee..."
                                    rows="3"
                                    className="w-full px-4 py-3 bg-secondary-800/50 border border-secondary-600 rounded-lg text-white placeholder-secondary-500 focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20"
                                ></textarea>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => updateStatus('Rejected')}
                                    className="flex-1 px-4 py-3 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => updateStatus('Approved')}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover-glow transition-all duration-300 flex items-center justify-center"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve EOD
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDayBookReview;
