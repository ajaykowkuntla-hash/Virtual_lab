import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { CreateUserModal } from '../../components/CreateUserModal';
import { apiClient } from '../../api/client';

export const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState<number | ''>('');
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedLab, setSelectedLab] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Assign modal state
  const [assigningStudent, setAssigningStudent] = useState<any | null>(null);
  const [assignCourseId, setAssignCourseId] = useState<number | ''>('');
  const [assignLabId, setAssignLabId] = useState<number | ''>('');
  const [assignFacultyId, setAssignFacultyId] = useState<number | ''>('');

  // View detail modal state
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [studRes, deptRes, semRes, courseRes, labRes, facRes, enrollRes] = await Promise.all([
        apiClient.get('/admin/students'),
        apiClient.get('/admin/departments'),
        apiClient.get('/semesters/'),
        apiClient.get('/courses'),
        apiClient.get('/labs'),
        apiClient.get('/admin/faculty'),
        apiClient.get('/admin/enrollments')
      ]);

      setStudents(studRes.data);
      setDepts(deptRes.data);
      setSemesters(semRes.data);
      setCourses(courseRes.data);
      setLabs(labRes.data);
      setFaculty(facRes.data);
      setEnrollments(enrollRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
    try {
      await apiClient.put(`/admin/students/${user.id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningStudent || !assignCourseId || !assignLabId || !assignFacultyId) return;
    try {
      await apiClient.post(`/admin/students/${assigningStudent.id}/assignments`, {
        course_id: assignCourseId,
        lab_id: assignLabId,
        assigned_faculty_id: assignFacultyId
      });
      setAssigningStudent(null);
      setAssignCourseId('');
      setAssignLabId('');
      setAssignFacultyId('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update assignments. Make sure consistency rules are satisfied.');
    }
  };

  // Helper mappings
  const getEnrollment = (studentId: number) => {
    return enrollments.find(e => e.student_id === studentId);
  };

  const getSemText = (studentId: number) => {
    const enroll = getEnrollment(studentId);
    if (!enroll) return '-';
    return semesters.find(s => s.id === enroll.semester_id)?.name || `Semester ${enroll.semester_id}`;
  };

  const getCourseText = (studentId: number) => {
    const enroll = getEnrollment(studentId);
    if (!enroll || !enroll.course_id) return '-';
    return courses.find(c => c.id === enroll.course_id)?.name || `Course ${enroll.course_id}`;
  };

  const getLabText = (studentId: number) => {
    const enroll = getEnrollment(studentId);
    if (!enroll || !enroll.lab_id) return '-';
    return labs.find(l => l.id === enroll.lab_id)?.name || `Lab ${enroll.lab_id}`;
  };

  const getFacultyText = (studentId: number) => {
    const enroll = getEnrollment(studentId);
    if (!enroll || !enroll.assigned_faculty_id) return '-';
    return faculty.find(f => f.id === enroll.assigned_faculty_id)?.name || `Faculty ${enroll.assigned_faculty_id}`;
  };

  // Search/Filters matching logic
  const filteredStudents = students.filter(s => {
    const enroll = getEnrollment(s.id);
    
    // Search query
    const matchSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_number && s.roll_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()));

    // Dropdown filters
    const matchDept = !selectedDept || s.department === selectedDept;
    const matchSem = !selectedSem || (enroll && enroll.semester_id === Number(selectedSem));
    const matchCourse = !selectedCourse || (enroll && enroll.course_id === Number(selectedCourse));
    const matchLab = !selectedLab || (enroll && enroll.lab_id === Number(selectedLab));
    const matchStatus = !selectedStatus || s.status === selectedStatus;

    return matchSearch && matchDept && matchSem && matchCourse && matchLab && matchStatus;
  });

  return (
    <Layout role="admin">
      <header className="fade-in-up stagger-1 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
            Student Management
          </h1>
          <p className="font-body-lg text-secondary">Manage student accounts, course enrollments, and lab access.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-all font-label-caps text-label-caps font-bold"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Register Student
        </button>
      </header>

      {/* Filters bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/60 mb-6 flex flex-wrap gap-4 items-center fade-in-up stagger-2">
        <div className="flex-1 min-w-[240px] relative">
          <span className="material-symbols-outlined absolute left-4 top-3.5 text-secondary text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search by name, roll number, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container rounded-xl pl-12 pr-4 py-3 text-primary border border-border-subtle focus:outline-none text-sm placeholder:text-secondary/50"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-surface-container border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none text-xs"
        >
          <option value="">Department: All</option>
          {depts.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <select
          value={selectedSem}
          onChange={(e) => setSelectedSem(e.target.value ? Number(e.target.value) : '')}
          className="bg-surface-container border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none text-xs"
        >
          <option value="">Semester: All</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : '')}
          className="bg-surface-container border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none text-xs"
        >
          <option value="">Course: All</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedLab}
          onChange={(e) => setSelectedLab(e.target.value ? Number(e.target.value) : '')}
          className="bg-surface-container border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none text-xs"
        >
          <option value="">Lab: All</option>
          {labs.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-surface-container border border-border-subtle rounded-xl px-4 py-3 text-primary focus:outline-none text-xs"
        >
          <option value="">Status: All</option>
          <option value="Active">Active</option>
          <option value="Disabled">Disabled</option>
        </select>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl fade-in-up stagger-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-secondary">No students found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-secondary font-label-caps text-[11px] font-bold uppercase tracking-wider">
                  <th className="pb-3 w-28">Roll Number</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Semester</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Assigned Faculty</th>
                  <th className="pb-3">Lab</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/40 text-sm">
                {filteredStudents.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 font-mono-metrics text-secondary">{user.roll_number || '-'}</td>
                    <td className="py-4 font-semibold text-primary">{user.name}</td>
                    <td className="py-4 text-secondary">{user.email || '-'}</td>
                    <td className="py-4 font-semibold text-primary">{user.department || '-'}</td>
                    <td className="py-4 text-secondary">{getSemText(user.id)}</td>
                    <td className="py-4 text-secondary font-semibold">{getCourseText(user.id)}</td>
                    <td className="py-4 text-secondary">{getFacultyText(user.id)}</td>
                    <td className="py-4 text-secondary">{getLabText(user.id)}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status === 'Active' ? 'bg-success-emerald/10 text-success-emerald' : 'bg-secondary/10 text-secondary'
                      }`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setViewingStudent(user)}
                          className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg border border-border-subtle font-bold text-xs"
                          title="View Details"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                          className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg border border-border-subtle font-bold text-xs"
                          title="Edit Account"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            setAssigningStudent(user);
                            const enroll = getEnrollment(user.id);
                            if (enroll) {
                              setAssignCourseId(enroll.course_id || '');
                              setAssignLabId(enroll.lab_id || '');
                              setAssignFacultyId(enroll.assigned_faculty_id || '');
                            } else {
                              setAssignCourseId('');
                              setAssignLabId('');
                              setAssignFacultyId('');
                            }
                          }}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-xs"
                          title="Assign"
                        >
                          Assign
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs border ${
                            user.status === 'Active' 
                              ? 'border-error/20 text-error hover:bg-error/10' 
                              : 'border-success-emerald/20 text-success-emerald hover:bg-success-emerald/10'
                          }`}
                        >
                          {user.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateUserModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }} 
        onSuccess={fetchData}
        role="student"
        editingUser={editingUser}
      />

      {/* View Detail Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card-bg w-full max-w-md rounded-[24px] border border-border-subtle shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200 text-sm text-primary">
            <div className="flex justify-between items-center border-b border-border-subtle pb-4">
              <h3 className="text-xl font-bold">{viewingStudent.name}</h3>
              <button onClick={() => setViewingStudent(null)} className="text-secondary hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="block text-xs font-bold text-secondary uppercase">Roll Number</span>
                <p className="font-semibold">{viewingStudent.roll_number || 'N/A'}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-secondary uppercase">Email / Contact</span>
                <p className="font-semibold">{viewingStudent.email || 'N/A'} • {viewingStudent.contact_number || 'N/A'}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-secondary uppercase">Department / Program</span>
                <p className="font-semibold">{viewingStudent.department || 'N/A'} — {viewingStudent.program || 'N/A'}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-secondary uppercase">Academic Stream</span>
                <p className="font-semibold text-secondary">
                  Semester: {getSemText(viewingStudent.id)} • Course: {getCourseText(viewingStudent.id)}
                </p>
              </div>
              <div>
                <span className="block text-xs font-bold text-secondary uppercase">Responsible Faculty / Lab</span>
                <p className="font-semibold text-secondary">
                  Faculty: {getFacultyText(viewingStudent.id)} • Lab: {getLabText(viewingStudent.id)}
                </p>
              </div>
              <div>
                <span className="block text-xs font-bold text-secondary uppercase">Account Status</span>
                <p className="font-semibold">{viewingStudent.status || 'Active'}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border-subtle flex justify-end">
              <button onClick={() => setViewingStudent(null)} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assigningStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card-bg w-full max-w-sm rounded-[24px] border border-border-subtle shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border-subtle pb-4">
              <h3 className="text-lg font-bold text-primary">Assign Course/Lab to {assigningStudent.name}</h3>
              <button onClick={() => setAssigningStudent(null)} className="text-secondary hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Select Course</label>
                <select
                  required
                  value={assignCourseId}
                  onChange={(e) => setAssignCourseId(Number(e.target.value))}
                  className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none text-sm"
                >
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Select Lab</label>
                <select
                  required
                  value={assignLabId}
                  onChange={(e) => setAssignLabId(Number(e.target.value))}
                  className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none text-sm"
                >
                  <option value="">Select Lab</option>
                  {labs.filter(l => !assignCourseId || l.course_id === assignCourseId).map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Select Faculty</label>
                <select
                  required
                  value={assignFacultyId}
                  onChange={(e) => setAssignFacultyId(Number(e.target.value))}
                  className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none text-sm"
                >
                  <option value="">Select Faculty</option>
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle">
                <button 
                  type="button" 
                  onClick={() => setAssigningStudent(null)}
                  className="px-4 py-2 rounded-xl text-secondary hover:text-primary font-semibold text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-primary text-white font-semibold rounded-xl text-sm"
                >
                  Save Assignments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
