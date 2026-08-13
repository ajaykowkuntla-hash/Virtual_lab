import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scope variables for posting
  const [targetRole, setTargetRole] = useState('student');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [labId, setLabId] = useState<number | ''>('');

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/announcements');
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        apiClient.get('/courses'),
        apiClient.get('/labs')
      ]);
      setCourses(cRes.data);
      setLabs(lRes.data);
    } catch (err) {
      console.error('Failed to load courses/labs', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    if (user?.role !== 'student') {
      fetchMetadata();
    }
  }, [user]);
  
  const handleCreateAnnouncement = async () => {
    if (!postContent.trim()) return;
    
    try {
      await apiClient.post('/announcements', {
        title: 'Notice',
        content: postContent.trim(),
        target_role: targetRole,
        course_id: courseId || undefined,
        lab_id: labId || undefined
      });
      setPostContent('');
      setCourseId('');
      setLabId('');
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to create announcement', err);
      alert(err.response?.data?.detail || 'Failed to post announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await apiClient.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        console.error('Failed to delete announcement', err);
        alert('Failed to delete announcement');
      }
    }
  };

  return (
    <Layout role={user?.role as any || 'student'}>
      <header className="fade-in-up stagger-1 mb-8">
        <h1 className="text-[48px] font-semibold text-primary tracking-tight leading-none mb-4">
          Announcements
        </h1>
        <p className="font-body-lg text-secondary">Broadcast updates and notices to your students.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in-up stagger-2">
        {/* Create Post (Only for Admin & Faculty) */}
        {user?.role !== 'student' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl h-fit space-y-4">
            <h3 className="font-label-caps text-label-caps text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">edit_square</span>
              New Announcement
            </h3>
            
            <textarea 
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-32 p-4 bg-surface-container rounded-xl border border-border-subtle text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-surface-container border border-border-subtle rounded-xl px-3 py-2 text-primary focus:outline-none text-xs"
                >
                  <option value="student">Students Only</option>
                  {user?.role === 'admin' && <option value="faculty">Faculty Only</option>}
                  <option value="all">Everyone</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Course Scope (Optional)</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-surface-container border border-border-subtle rounded-xl px-3 py-2 text-primary focus:outline-none text-xs"
                >
                  <option value="">Institution-wide</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">Lab Scope (Optional)</label>
                <select
                  value={labId}
                  onChange={(e) => setLabId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-surface-container border border-border-subtle rounded-xl px-3 py-2 text-primary focus:outline-none text-xs"
                >
                  <option value="">No lab filter</option>
                  {labs.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleCreateAnnouncement} 
              disabled={!postContent.trim()}
              className="w-full px-6 py-2.5 bg-primary text-white font-label-caps text-label-caps font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              Post Announcement
            </button>
          </div>
        )}

        {/* Feed */}
        <div className={user?.role === 'student' ? 'lg:col-span-3 space-y-6' : 'lg:col-span-2 space-y-6'}>
          <h3 className="font-label-caps text-label-caps text-primary mb-2">Recent Broadcasts</h3>
          {isLoading ? (
            <div className="glass-panel p-8 rounded-3xl border border-white/60 text-center text-secondary">
              Loading announcements...
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl border border-white/60 text-center text-secondary">
              No broadcasts yet.
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="glass-panel p-6 rounded-3xl border border-white/60 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neural-blue/10 flex items-center justify-center text-neural-blue font-bold">
                      {post.author_id === 1 ? 'AD' : 'FA'}
                    </div>
                    <div>
                      <h4 className="font-body-md font-semibold text-primary">
                        {post.author_id === 1 ? 'Institution/Admin' : 'Faculty Member'}
                      </h4>
                      <span className="text-[10px] text-secondary">
                        {new Date(post.timestamp).toLocaleString()}
                        {post.target_role && ` • Target: ${post.target_role.toUpperCase()}`}
                      </span>
                    </div>
                  </div>
                  {(user?.role === 'admin' || post.author_id === user?.id) && (
                    <button 
                      onClick={() => handleDeleteAnnouncement(post.id)} 
                      className="text-secondary hover:text-error transition-colors p-1 rounded-md hover:bg-error/10"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  )}
                </div>
                <p className="font-body-sm text-primary leading-relaxed">
                  {post.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};
