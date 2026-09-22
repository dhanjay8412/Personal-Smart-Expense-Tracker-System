import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Toast } from '../components/common/Toast';
import { Users, Plus, ChevronRight, UserPlus } from 'lucide-react';

export const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchGroups = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await groupService.getGroups();
      if (res.success && res.data) {
        setGroups(res.data);
      } else {
        setError(res.message || 'Failed to fetch groups.');
      }
    } catch (err) {
      setError(err.message || 'Error loading groups.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setActionLoading(true);
    try {
      await groupService.createGroup({ name, description });
      setToast({ message: 'Group created successfully!', type: 'success' });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      fetchGroups();
    } catch (err) {
      setToast({ message: err.message || 'Failed to create group', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Shared Expenses & Groups</h1>
          <p className="text-xs text-slate-400 mt-1">Split bills with roommates, friends, or trip companions</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Create Group
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchGroups} />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No Groups Created"
          description="Create your first group for roommates, trips, or shared bills."
          actionLabel="Create Group"
          onAction={() => setIsModalOpen(true)}
          icon={Users}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <Link key={group._id} to={`/groups/${group._id}`}>
              <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-sky-500/50 transition-all space-y-4 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-100 group-hover:text-sky-400 transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{group.description || 'Shared expense group'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                  <span className="text-slate-400">
                    Members: <strong className="text-slate-200">{group.members?.length || 1}</strong>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-400 font-semibold text-[10px]">
                    View Dashboard &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Shared Expense Group" maxWidth="max-w-md">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="Group Name"
            placeholder="e.g. Goa Trip 2026, Roommates"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="What are these shared expenses for?"
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Create Group
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
