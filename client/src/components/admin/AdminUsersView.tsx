import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, AlertTriangle, CheckCircle2, XCircle, ChevronDown, Lock, Trash2, Award, BookOpen, Calendar, Clock } from 'lucide-react';
import { authApi } from '@/context/AuthContext';

export const AdminUsersView = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authApi.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await authApi.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Lỗi cập nhật quyền');
    }
  };

  const handleChangeStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const reason = newStatus !== 'ACTIVE' ? prompt('Lý do khóa/đình chỉ:') : '';
    
    if (newStatus !== 'ACTIVE' && reason === null) return;

    try {
      await authApi.put(`/admin/users/${userId}/status`, { status: newStatus.toUpperCase(), banReason: reason });
      alert('Cập nhật trạng thái thành công');
      fetchUsers();
    } catch (err) {
      alert('Lỗi cập nhật');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Bạn có chắc chắn dùng xóa vĩnh viễn tài khoản này không? Mọi dữ liệu học tập của họ sẽ bị mất!')) return;
    try {
      const res = await authApi.delete('/admin/users/' + id);
      if (res.data.success) {
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      }
    } catch (e) {
      alert('Lỗi khi xóa tài khoản');
    }
  };

  const handleSelectUser = async (u: any) => {
    setSelectedUser(u);
    try {
      setLoadingProgress(true);
      const res = await authApi.get(`/admin/users/${u.id}/progress`);
      if (res.data.success) {
        setUserProgress(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi lấy tiến độ:', err);
    } finally {
      setLoadingProgress(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Quản lý Người dùng</h2>
        <p className="text-sm text-slate-500">Xem, tìm kiếm và phân quyền thành viên.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm theo email hoặc tên..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 w-5 h-5" />
          <select 
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-indigo-500"
          >
            <option value="ALL">Tất cả quyền</option>
            <option value="USER">User thường</option>
            <option value="PREMIUM">Premium</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex">
        {/* Users Table */}
        <div className="flex-1 overflow-x-auto border-r border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Người dùng</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Vai trò</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Không tìm thấy người dùng.</td></tr>
              ) : (
                filteredUsers.map(u => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <tr 
                      key={u.id} 
                      className={`transition-colors group cursor-pointer ${isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'}`} 
                      onClick={() => handleSelectUser(u)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email)}&background=e0e7ff&color=4f46e5`} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <p className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{u.displayName || 'Chưa cập nhật'}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {u.isEmailVerified ? (
                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle2 size={14}/> Đã xác thực</span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-400 text-xs font-medium"><XCircle size={14}/> Chưa xác thực</span>
                          )}
                          {u.status === 'BANNED' && (
                            <span className="text-rose-600 text-[10px] font-bold" title={u.banReason || ''}>BỊ KHÓA</span>
                          )}
                          {u.status === 'SUSPENDED' && (
                            <span className="text-amber-600 text-[10px] font-bold" title={u.banReason || ''}>ĐÌNH CHỈ</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select 
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className={`text-xs font-bold px-2 py-1 rounded-lg outline-none cursor-pointer ${
                            u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' :
                            u.role === 'PREMIUM' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <option value="USER">USER</option>
                          <option value="PREMIUM">PREMIUM</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); handleChangeStatus(u.id, u.status); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Khóa/Đình chỉ">
                          <AlertTriangle size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa tài khoản">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Progress Sidebar */}
        <div className="hidden lg:block w-96 bg-slate-50/80 p-4 border-l border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Shield className="text-indigo-600" size={16} /> Thông tin & Lịch sử thi
            </h3>
            {selectedUser && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {selectedUser.role}
              </span>
            )}
          </div>

          {!selectedUser ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100 p-6">
              <Shield className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">Chưa chọn người dùng</p>
              <p className="text-xs text-slate-400 mt-1">Bấm vào bất kỳ dòng nào bên trái để xem kết quả thi và tiến độ học tập.</p>
            </div>
          ) : loadingProgress ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-500 text-sm">
              Đang tải kết quả thi...
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Selected User Header Card */}
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                <img
                  src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.email)}&background=e0e7ff&color=4f46e5`}
                  alt=""
                  className="w-10 h-10 rounded-full border border-slate-100 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{selectedUser.displayName || 'Chưa đặt tên'}</p>
                  <p className="text-xs text-slate-500 truncate">{selectedUser.email}</p>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Award size={13} className="text-indigo-500" /> Mục tiêu
                  </p>
                  <p className="font-black text-slate-800 text-base">
                    {userProgress?.targetLevel || selectedUser.targetLevel || 'N5'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <BookOpen size={13} className="text-emerald-500" /> Sổ tay
                  </p>
                  <p className="font-black text-slate-800 text-base">
                    {userProgress?.notebooks || 0} <span className="text-xs font-normal text-slate-500">mục</span>
                  </p>
                </div>
              </div>

              {/* Lịch sử thi JLPT */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} className="text-rose-500" /> Kết quả thi JLPT
                  </p>
                  <span className="text-[11px] font-bold text-slate-500">
                    {(userProgress?.examAttempts || userProgress?.exams || []).length} bài thi
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-0.5">
                  {(!userProgress?.examAttempts || userProgress.examAttempts.length === 0) &&
                   (!userProgress?.exams || userProgress.exams.length === 0) ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Người dùng này chưa có lượt thi nào.
                    </div>
                  ) : (
                    (userProgress.examAttempts || userProgress.exams).map((attempt: any) => {
                      const examTitle = attempt.exam?.title || attempt.examTitle || 'Đề thi JLPT';
                      const examLevel = attempt.exam?.level || attempt.level || 'JLPT';
                      const score = attempt.totalScore ?? attempt.score ?? 0;
                      const correct = attempt.totalCorrect;
                      const totalQ = attempt.totalQuestions;
                      const isPassed = attempt.isPassed;
                      const dateStr = attempt.createdAt
                        ? new Date(attempt.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : '';

                      return (
                        <div
                          key={attempt.id}
                          className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-indigo-100 text-indigo-700">
                                  {examLevel}
                                </span>
                                <p className="font-bold text-slate-800 text-xs truncate max-w-[150px]" title={examTitle}>
                                  {examTitle}
                                </p>
                              </div>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Calendar size={10} /> {dateStr}
                                {correct != null && totalQ != null && (
                                  <span className="text-slate-500 font-medium ml-1">({correct}/{totalQ} câu)</span>
                                )}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-black text-slate-900 text-sm">
                                {score}<span className="text-[10px] font-semibold text-slate-400">/180</span>
                              </p>
                              <span
                                className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  isPassed
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {isPassed ? 'ĐỖ' : 'CHƯA ĐẠT'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
