import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Briefcase, Calendar, Save, Camera, CreditCard, DollarSign, FileText, MapPin, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import EmployeeLayout from '../../components/Employee/EmployeeLayout/EmployeeLayout';
import { authAPI } from '../../utils/api';

const EmployeeProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employeeId: '',
    joiningDate: '',
    profileImage: '',
    // Detailed sections
    personalInfo: {},
    contactInfo: {},
    workInfo: {},
    bankInfo: {},
    salaryInfo: {},
    documents: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      if (response.data.success) {
        const userData = response.data.data.user;
        const employeeData = response.data.data.employee;

        setProfile({
          name: userData.name || (employeeData?.personalInfo ? `${employeeData.personalInfo.firstName} ${employeeData.personalInfo.lastName}` : '') || localStorage.getItem('userName') || '',
          email: userData.email || employeeData?.contactInfo?.personalEmail || localStorage.getItem('userEmail') || '',
          phone: userData.phone || employeeData?.contactInfo?.phone || '',
          department: employeeData?.workInfo?.department?.name || localStorage.getItem('userDepartment') || '',
          employeeId: userData.employeeId || employeeData?.employeeId || localStorage.getItem('employeeId') || '',
          joiningDate: employeeData?.workInfo?.joiningDate || '',
          profileImage: userData.profileImage || '',
          position: employeeData?.workInfo?.position || '',
          // Detailed sections mapping
          personalInfo: employeeData?.personalInfo || {},
          contactInfo: employeeData?.contactInfo || {},
          workInfo: employeeData?.workInfo || {},
          bankInfo: employeeData?.bankInfo || {},
          salaryInfo: employeeData?.salaryInfo || {},
          documents: employeeData?.documents || {}
        });
        if (userData.profileImage) {
          localStorage.setItem('userImage', userData.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({
        name: localStorage.getItem('userName') || 'Employee',
        email: localStorage.getItem('userEmail') || '',
        phone: '',
        department: localStorage.getItem('userDepartment') || '',
        position: '',
        employeeId: localStorage.getItem('employeeId') || '',
        joiningDate: '',
        profileImage: localStorage.getItem('userImage') || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile({
        name: profile.name,
        phone: profile.phone
      });
      toast.success('Profile updated successfully');
      localStorage.setItem('userName', profile.name);
      // Refresh profile data to show updated values
      await fetchProfile();
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    const toastId = toast.loading('Uploading image...');
    try {
      const response = await authAPI.updateProfileImage(formData);
      if (response.data.success) {
        toast.success('Profile picture updated', { id: toastId });
        const newImagePath = response.data.data.profileImage;
        setProfile(prev => ({ ...prev, profileImage: newImagePath }));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image', { id: toastId });
    }
  };

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    return baseUrl.replace('/api', '') + path;
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-secondary-400 mt-1">View and update your information</p>
        </div>

        {/* Profile Header */}
        <div className="glass-morphism neon-border rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full flex items-center justify-center overflow-hidden">
                {profile.profileImage ? (
                  <img
                    src={getFullImageUrl(profile.profileImage)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 right-0 w-8 h-8 bg-secondary-700 rounded-full flex items-center justify-center border-2 border-secondary-800 hover:bg-secondary-600 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-white" />
                <input
                  id="profile-upload"
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
              <p className="text-sm text-secondary-400">{profile.position || 'Employee'}</p>
              {profile.employeeId && (
                <p className="text-xs text-neon-pink mt-1">ID: {profile.employeeId}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <section className="glass-morphism neon-border rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-5 h-5 text-neon-pink" />
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-1">First Name</label>
                <p className="text-white p-3 bg-secondary-800/30 rounded-lg border border-secondary-700">
                  {profile.personalInfo?.firstName || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-1">Last Name</label>
                <p className="text-white p-3 bg-secondary-800/30 rounded-lg border border-secondary-700">
                  {profile.personalInfo?.lastName || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-1">Date of Birth</label>
                <p className="text-white p-3 bg-secondary-800/30 rounded-lg border border-secondary-700">
                  {profile.personalInfo?.dateOfBirth ? new Date(profile.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-1">Gender</label>
                <p className="text-white p-3 bg-secondary-800/30 rounded-lg border border-secondary-700">
                  {profile.personalInfo?.gender || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-1">Blood Group</label>
                <p className="text-white p-3 bg-secondary-800/30 rounded-lg border border-secondary-700">
                  {profile.personalInfo?.bloodGroup || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-1">Nationality</label>
                <p className="text-white p-3 bg-secondary-800/30 rounded-lg border border-secondary-700">
                  {profile.personalInfo?.nationality || 'Indian'}
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="glass-morphism neon-border rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Mail className="w-5 h-5 text-neon-purple" />
              <h3 className="text-lg font-semibold text-white">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-1">Official Email</label>
                <p className="text-white p-3 bg-secondary-800/30 rounded-lg border border-secondary-700 overflow-hidden text-ellipsis">
                  {profile.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-1">Personal Email</label>
                <p className="text-white p-3 bg-secondary-800/30 rounded-lg border border-secondary-700 overflow-hidden text-ellipsis">
                  {profile.contactInfo?.personalEmail || 'N/A'}
                </p>
              </div>
              <div>
                <form onSubmit={handleSubmit}>
                  <label className="block text-sm font-medium text-secondary-400 mb-1">Phone Number (Editable)</label>
                  <div className="flex space-x-2">
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="flex-1 p-3 bg-secondary-800/50 border border-secondary-600 rounded-lg text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="p-3 bg-gradient-to-r from-neon-pink to-neon-purple text-white rounded-lg hover-glow disabled:opacity-50"
                    >
                      {saving ? '...' : <Save className="w-5 h-5" />}
                    </button>
                  </div>
                </form>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-1">Alternate Phone</label>
                <p className="text-white p-3 bg-secondary-800/30 rounded-lg border border-secondary-700">
                  {profile.contactInfo?.alternatePhone || 'N/A'}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="mt-8 pt-8 border-t border-secondary-700/50">
              <h4 className="text-sm font-semibold text-secondary-300 mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-neon-purple" />
                Address Details
              </h4>
              <div className="p-4 bg-secondary-800/20 border border-secondary-700/50 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs text-secondary-500 mb-1">Street</label>
                  <p className="text-sm text-white">{profile.contactInfo?.address?.street || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">City & State</label>
                  <p className="text-sm text-white">
                    {profile.contactInfo?.address?.city || 'N/A'}, {profile.contactInfo?.address?.state || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Pincode & Country</label>
                  <p className="text-sm text-white">
                    {profile.contactInfo?.address?.pincode || 'N/A'}, {profile.contactInfo?.address?.country || 'India'}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-8 pt-8 border-t border-secondary-700/50">
              <h4 className="text-sm font-semibold text-secondary-300 mb-4 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-neon-pink" />
                Emergency Contact
              </h4>
              <div className="p-4 bg-secondary-800/20 border border-secondary-700/50 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Name</label>
                  <p className="text-sm text-white">{profile.contactInfo?.emergencyContact?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Relationship</label>
                  <p className="text-sm text-white">{profile.contactInfo?.emergencyContact?.relationship || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Phone</label>
                  <p className="text-sm text-white">{profile.contactInfo?.emergencyContact?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Bank Information */}
          <div className="glass-morphism neon-border rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <CreditCard className="w-6 h-6 text-neon-pink" />
              <h2 className="text-xl font-bold text-white">Bank Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-secondary-400">Account Holder</p>
                <p className="text-white font-medium">{profile.bankInfo?.accountHolderName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-400">Bank Name</p>
                <p className="text-white font-medium">{profile.bankInfo?.bankName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-400">Account Number</p>
                <p className="text-white font-medium">{profile.bankInfo?.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-400">IFSC Code</p>
                <p className="text-white font-medium">{profile.bankInfo?.ifscCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-400">Branch Name</p>
                <p className="text-white font-medium">{profile.bankInfo?.branchName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-400">Account Type</p>
                <p className="text-white font-medium">{profile.bankInfo?.accountType || 'Savings'}</p>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="glass-morphism neon-border rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <DollarSign className="w-6 h-6 text-neon-purple" />
              <h2 className="text-xl font-bold text-white">Salary Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-secondary-400">Basic Salary</p>
                <p className="text-white font-medium">
                  {profile.salaryInfo?.currency || 'INR'} {profile.salaryInfo?.basicSalary?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-400">Pay Frequency</p>
                <p className="text-white font-medium">{profile.salaryInfo?.payFrequency || 'Monthly'}</p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="glass-morphism neon-border rounded-2xl p-6 mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-neon-pink" />
              <h2 className="text-xl font-bold text-white">Additional Details</h2>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-secondary-400 mb-2">Notes from Admin</p>
                <div className="p-4 bg-secondary-800/30 border border-secondary-700 rounded-lg text-secondary-300">
                  {profile.personalInfo?.notes || 'No notes provided.'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-secondary-400">Employment Type</p>
                  <p className="text-white font-medium">{profile.workInfo?.employmentType || 'Full-time'}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-400">Work Location</p>
                  <p className="text-white font-medium">{profile.workInfo?.workLocation || 'Office'}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-400">Work Shift</p>
                  <p className="text-white font-medium">{profile.workInfo?.workShift || 'Morning'}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-400">Reporting Manager</p>
                  <p className="text-white font-medium">
                    {profile.workInfo?.reportingManager
                      ? `${profile.workInfo.reportingManager.personalInfo?.firstName} ${profile.workInfo.reportingManager.personalInfo?.lastName}`
                      : 'Not Assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeProfile;