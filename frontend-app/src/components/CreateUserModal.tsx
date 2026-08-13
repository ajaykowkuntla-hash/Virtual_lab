import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: 'student' | 'faculty';
  editingUser?: any;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess, role, editingUser }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rfid, setRfid] = useState('');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [status, setStatus] = useState('Active');

  // Assignment variables
  const [courseId, setCourseId] = useState<number | ''>('');
  const [labId, setLabId] = useState<number | ''>('');
  const [assignedFacultyId, setAssignedFacultyId] = useState<number | ''>('');

  const [depts, setDepts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!editingUser;

  useEffect(() => {
    if (isOpen) {
      const loadAllMetadata = async () => {
        try {
          const [dRes, cRes, lRes, fRes] = await Promise.all([
            apiClient.get('/admin/departments'),
            apiClient.get('/courses'),
            apiClient.get('/labs'),
            apiClient.get('/admin/faculty')
          ]);
          setDepts(dRes.data);
          setCourses(cRes.data);
          setLabs(lRes.data);
          setFacultyList(fRes.data);
        } catch (err) {
          console.error(err);
        }
      };
      loadAllMetadata();

      if (editingUser) {
        setName(editingUser.name || '');
        setUsername(editingUser.username || '');
        setPassword('');
        setRfid(editingUser.rfid_tag_id || '');
        setDepartment(editingUser.department || '');
        setProgram(editingUser.program || '');
        setEmail(editingUser.email || '');
        setContactNumber(editingUser.contact_number || '');
        setEmployeeId(editingUser.employee_id || '');
        setRollNumber(editingUser.roll_number || '');
        setDesignation(editingUser.designation || '');
        setStatus(editingUser.status || 'Active');
      } else {
        setName('');
        setUsername('');
        setPassword('');
        setRfid('');
        setDepartment('');
        setProgram('');
        setEmail('');
        setContactNumber('');
        setEmployeeId('');
        setRollNumber('');
        setDesignation('');
        setStatus('Active');
        setCourseId('');
        setLabId('');
        setAssignedFacultyId('');
      }
      setError('');
    }
  }, [isOpen, editingUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const baseEndpoint = role === 'faculty' ? '/admin/faculty' : '/admin/students';
      
      const payload: any = {
        name,
        rfid_tag_id: rfid || undefined,
        department: department || undefined,
        program: role === 'student' ? program : undefined,
        email: email || undefined,
        contact_number: contactNumber || undefined,
        status: status
      };

      if (role === 'faculty') {
        payload.employee_id = employeeId;
        payload.designation = designation || undefined;
      } else {
        payload.roll_number = rollNumber;
      }

      let userObj;
      if (isEditMode) {
        const res = await apiClient.put(`${baseEndpoint}/${editingUser.id}`, payload);
        userObj = res.data;
      } else {
        payload.username = username;
        payload.password = password;
        const res = await apiClient.post(baseEndpoint, payload);
        userObj = res.data;
      }

      // Handle post-creation/update assignments
      if (!isEditMode) {
        if (role === 'faculty' && labId) {
          await apiClient.post(`/admin/labs/${labId}/assign-faculty`, null, {
            params: { faculty_id: userObj.id }
          });
        } else if (role === 'student' && courseId && labId && assignedFacultyId) {
          await apiClient.post(`/admin/students/${userObj.id}/assignments`, {
            course_id: courseId,
            lab_id: labId,
            assigned_faculty_id: assignedFacultyId
          });
        }
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} ${role}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card-bg w-full max-w-lg rounded-[24px] border border-border-subtle shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
          <h2 className="text-[24px] font-semibold text-primary">
            {isEditMode ? 'Edit' : 'Register New'} {role === 'faculty' ? 'Faculty' : 'Student'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="px-8 pt-4">
            <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm border border-error/20">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
              />
            </div>

            {role === 'faculty' ? (
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Employee ID</label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="FAC001"
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Roll Number</label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="STU001"
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
                />
              </div>
            )}
          </div>

          {!isEditMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@digilab.edu"
                className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Phone</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Phone Number"
                className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
              >
                <option value="">Select Department</option>
                {depts.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {role === 'faculty' ? (
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Professor"
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Program</label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. BTech ECE"
                  className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">RFID Tag ID</label>
              <input
                type="text"
                value={rfid}
                onChange={(e) => setRfid(e.target.value)}
                placeholder="RFID Tag ID"
                className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>

          {!isEditMode && (
            <div className="pt-4 border-t border-border-subtle space-y-4">
              <h3 className="font-label-caps text-label-caps text-primary">Initial Academic Assignments</h3>
              
              {role === 'faculty' ? (
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Assign Lab</label>
                  <select
                    value={labId}
                    onChange={(e) => setLabId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-surface-container-low text-primary px-4 py-3 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-sm"
                  >
                    <option value="">No assignment</option>
                    {labs.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Course</label>
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-surface-container-low text-primary px-3 py-2 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-xs"
                    >
                      <option value="">None</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Lab</label>
                    <select
                      value={labId}
                      onChange={(e) => setLabId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-surface-container-low text-primary px-3 py-2 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-xs"
                    >
                      <option value="">None</option>
                      {labs.filter(l => !courseId || l.course_id === courseId).map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Faculty</label>
                    <select
                      value={assignedFacultyId}
                      onChange={(e) => setAssignedFacultyId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-surface-container-low text-primary px-3 py-2 rounded-xl focus:outline-none focus:border-neural-blue border border-border-subtle text-xs"
                    >
                      <option value="">None</option>
                      {facultyList.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-border-subtle text-secondary hover:text-primary hover:bg-surface-container-low transition-colors font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-semibold text-sm disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (isEditMode ? 'Save Changes' : 'Register User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
