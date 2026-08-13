import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { apiClient } from '../../api/client';

export const ManageCourses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [semesterId, setSemesterId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterDept, setFilterDept] = useState<number | ''>('');
  const [filterSem, setFilterSem] = useState<number | ''>('');

  const fetchMetadata = async () => {
    try {
      const [dRes, sRes] = await Promise.all([
        apiClient.get('/admin/departments'),
        apiClient.get('/semesters/')
      ]);
      setDepts(dRes.data);
      setSemesters(sRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (filterDept) params.department_id = filterDept;
      if (filterSem) params.semester_id = filterSem;
      
      const res = await apiClient.get('/admin/courses', { params });
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filterDept, filterSem]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !departmentId || !semesterId) return;
    try {
      await apiClient.post('/admin/courses', {
        name,
        department_id: departmentId,
        semester_id: semesterId
      });
      setName('');
      setDepartmentId('');
      setSemesterId('');
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create course');
    }
  };

  const getDeptName = (id: number) => depts.find(d => d.id === id)?.name || id;
  const getSemName = (id: number) => semesters.find(s => s.id === id)?.name || id;

  return (
    <Layout role="admin">
      <header className="fade-in-up stagger-1 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
            Courses
          </h1>
          <p className="font-body-lg text-secondary">Manage curriculum courses and coordinate student syllabi.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in-up stagger-2">
        <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl h-fit">
          <h3 className="font-label-caps text-label-caps text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">library_add</span>
            Create Course
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Course Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DSP or Python"
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-secondary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Department</label>
              <select 
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              >
                <option value="">Select Department</option>
                {depts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Semester</label>
              <select 
                required
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-primary border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              >
                <option value="">Select Semester</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full px-6 py-3 bg-primary text-white font-label-caps text-label-caps font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all"
            >
              Add Course
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/60 shadow-md flex flex-col gap-6">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border-subtle/40 pb-4">
            <h3 className="font-label-caps text-label-caps text-primary">Curriculum Courses</h3>
            <div className="flex gap-3">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value ? Number(e.target.value) : '')}
                className="bg-surface-container border border-border-subtle rounded-xl px-3 py-2 text-primary focus:outline-none text-xs"
              >
                <option value="">All Depts</option>
                {depts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={filterSem}
                onChange={(e) => setFilterSem(e.target.value ? Number(e.target.value) : '')}
                className="bg-surface-container border border-border-subtle rounded-xl px-3 py-2 text-primary focus:outline-none text-xs"
              >
                <option value="">All Semesters</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-secondary">Loading...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-secondary">No courses found matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-subtle text-secondary font-label-caps text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 w-20">Course ID</th>
                    <th className="pb-3">Course Name</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Semester</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40 text-sm">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 font-mono-metrics text-secondary">{course.id}</td>
                      <td className="py-4 font-semibold text-primary">{course.name}</td>
                      <td className="py-4 text-secondary font-semibold">{getDeptName(course.department_id)}</td>
                      <td className="py-4 text-secondary">{getSemName(course.semester_id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
