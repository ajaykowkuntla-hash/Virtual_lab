import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';

export const LabDetails: React.FC = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const [labData, setLabData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabDetails = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get(`/lab/student/labs/${labId}`);
        setLabData(res.data);
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
          setError("You are not enrolled in this lab.");
        } else {
          setError("Failed to fetch lab details. The lab might not exist.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (labId) fetchLabDetails();
  }, [labId]);

  if (isLoading) {
    return (
      <Layout role="student">
        <div className="flex justify-center items-center h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (error || !labData) {
    return (
      <Layout role="student">
        <div className="p-8 text-center text-error bg-error/10 border border-error/20 rounded-xl m-8">
          <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">error</span>
          <p>{error || 'Lab not found'}</p>
          <Link to="/" className="mt-4 inline-block text-primary underline">Return to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  const { lab, experiments } = labData;

  const getActionLabel = (status: string) => {
    if (status === 'PENDING') return 'Start Experiment';
    if (status === 'SUBMITTED') return 'View Submission';
    if (status === 'GRADED') return 'View Result';
    return 'Open';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'GRADED') return <span className="px-2 py-1 bg-success-emerald/10 text-success-emerald rounded text-xs font-bold">GRADED</span>;
    if (status === 'SUBMITTED') return <span className="px-2 py-1 bg-neural-blue/10 text-neural-blue rounded text-xs font-bold">SUBMITTED</span>;
    return <span className="px-2 py-1 bg-secondary/10 text-secondary rounded text-xs font-bold">PENDING</span>;
  };

  return (
    <Layout role="student">
      <header className="fade-in-up stagger-1 mb-8">
        <Link to="/" className="text-secondary hover:text-primary mb-4 inline-flex items-center gap-2 text-sm font-bold bg-surface-container px-4 py-2 rounded-lg border border-border-subtle transition-all">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Dashboard
        </Link>
        <h1 className="text-[40px] font-semibold text-primary tracking-tight leading-none mb-2">{lab.name}</h1>
        <p className="font-body-lg text-secondary">{lab.course} {lab.semester ? `• ${lab.semester}` : ''}</p>
        {lab.description && <p className="font-body-md text-secondary mt-2">{lab.description}</p>}
      </header>

      <div className="glass-panel p-8 rounded-3xl border border-white/60 shadow-xl fade-in-up stagger-2">
        <div className="flex justify-between items-end mb-6 border-b border-border-subtle pb-4">
          <h3 className="text-2xl font-bold text-primary tracking-tight">Assigned Experiments</h3>
        </div>

        {experiments.length === 0 ? (
          <div className="text-center py-12 text-secondary bg-surface-container rounded-2xl border border-border-subtle border-dashed">
            No experiments available for this lab.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {experiments.map((exp: any) => (
              <div key={exp.id} className="p-6 bg-surface-container rounded-2xl border border-border-subtle hover:border-primary/30 transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-primary text-lg">{exp.title}</h4>
                    {getStatusBadge(exp.submission_status)}
                    {exp.numeric_grade !== null && (
                      <span className="font-mono-metrics text-primary font-bold text-sm ml-2">Score: {exp.numeric_grade}</span>
                    )}
                  </div>
                  {exp.description && <p className="text-sm text-secondary mb-2">{exp.description}</p>}
                  <div className="flex items-center gap-4 text-xs font-mono-metrics text-secondary">
                    {exp.language && <span>LANG: {exp.language.toUpperCase()}</span>}
                    {exp.lab_type && <span>TYPE: {exp.lab_type.toUpperCase()}</span>}
                    {exp.submitted_at && <span>LAST SUBMITTED: {new Date(exp.submitted_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/lab/${exp.id}`)}
                  className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all font-bold text-sm"
                >
                  {getActionLabel(exp.submission_status)}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
