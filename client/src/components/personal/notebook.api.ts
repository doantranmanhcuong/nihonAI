import {
  NotebookItem,
  NotebookFilterParams,
  CreateNotebookItemInput,
  UpdateNotebookItemInput,
  NotebookStats,
  MasteryStatus
} from './notebook.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nihonai_token') || localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export class NotebookApi {
  /**
   * Lấy danh sách các mục trong sổ tay từ CSDL MySQL
   */
  static async getItems(filters: NotebookFilterParams = {}): Promise<NotebookItem[]> {
    const params = new URLSearchParams();
    if (filters.itemType && filters.itemType !== 'ALL') params.append('itemType', filters.itemType);
    if (filters.level && filters.level !== 'ALL') params.append('level', filters.level);
    if (filters.masteryStatus && filters.masteryStatus !== 'ALL') params.append('masteryStatus', filters.masteryStatus);
    if (filters.search) params.append('search', filters.search);
    if (filters.tags) params.append('tags', filters.tags);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/notebook${queryString}`, {
      headers: getAuthHeaders(), credentials: 'include', cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Không thể tải danh mục sổ tay');
    }

    const data = await res.json();
    return data.data || [];
  }

  /**
   * Lấy thống kê sổ tay từ CSDL
   */
  static async getStats(): Promise<NotebookStats> {
    const res = await fetch(`${API_BASE_URL}/notebook/stats`, {
      headers: getAuthHeaders(), credentials: 'include', cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Không thể tải thống kê sổ tay');
    }

    const json = await res.json();
    const data = json.data;
    if (!data) {
      return {
        total: 0, vocabCount: 0, kanjiCount: 0, grammarCount: 0, noteCount: 0,
        learningCount: 0, reviewingCount: 0, masteredCount: 0, masteryRate: 0,
        studyStreak: 0
      };
    }

    // Map backend format (totalItems, masteredItems, learningItems, dueItems, studyStreak)
    // to frontend format (total, masteredCount, learningCount, reviewingCount, masteryRate, studyStreak)
    const total = data.totalItems || 0;
    const masteredCount = data.masteredItems || 0;
    const masteryRate = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
    
    return {
      total: total,
      vocabCount: data.vocabCount || 0,
      kanjiCount: data.kanjiCount || 0,
      grammarCount: data.grammarCount || 0,
      noteCount: data.noteCount || 0,
      learningCount: data.learningItems || 0,
      reviewingCount: data.reviewingItems !== undefined ? data.reviewingItems : (data.dueItems || 0),
      masteredCount: masteredCount,
      masteryRate: masteryRate,
      studyStreak: data.studyStreak || 0
    } as any;
  }

  /**
   * Thêm mục mới vào sổ tay và lưu vào CSDL
   */
  static async createItem(input: CreateNotebookItemInput): Promise<NotebookItem> {
    const res = await fetch(`${API_BASE_URL}/notebook`, {
      method: 'POST',
      headers: getAuthHeaders(), credentials: 'include', cache: 'no-store',
      body: JSON.stringify(input)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tạo mới mục vào sổ tay');
    }

    const data = await res.json();
    return data.data;
  }

  /**
   * Cập nhật thông tin chi tiết mục sổ tay
   */
  static async updateItem(id: string, input: UpdateNotebookItemInput): Promise<NotebookItem> {
    const res = await fetch(`${API_BASE_URL}/notebook/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(), credentials: 'include', cache: 'no-store',
      body: JSON.stringify(input)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể cập nhật mục sổ tay');
    }

    const data = await res.json();
    return data.data;
  }

  /**
   * Cập nhật nhanh trạng thái ghi nhớ SRS (1-chạm)
   */
  static async toggleMastery(id: string, masteryStatus: MasteryStatus): Promise<NotebookItem> {
    const res = await fetch(`${API_BASE_URL}/notebook/${id}/mastery`, {
      method: 'PATCH',
      headers: getAuthHeaders(), credentials: 'include', cache: 'no-store',
      body: JSON.stringify({ masteryStatus })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể đổi trạng thái ghi nhớ');
    }

    const data = await res.json();
    return data.data;
  }

  /**
   * Xóa mục khỏi sổ tay
   */
  
  static async deleteItemByTitle(itemType: string, title: string): Promise<{ success: boolean }> {
    const params = new URLSearchParams({ itemType, title });
    const res = await fetch(`${API_BASE_URL}/notebook/by-title?${params.toString()}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi khi xóa mục theo title');
    }
    const data = await res.json();
    return data.data;
  }
static async deleteItem(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/notebook/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(), credentials: 'include', cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Không thể xóa mục sổ tay');
    }

    const data = await res.json();
    return data.success;
  }

  // --- SRS Methods ---
  static async getDueCards(limit: number = 200, itemType?: string, level?: string): Promise<NotebookItem[]> {
    try {
      const url = new URL(`${API_BASE_URL}/notebook/due`);
      url.searchParams.append('limit', limit.toString());
      if (itemType && itemType !== 'ALL') url.searchParams.append('itemType', itemType);
      if (level && level !== 'ALL') url.searchParams.append('level', level);
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders(), credentials: 'include', cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch due cards');
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  static async submitReview(id: string, quality: number): Promise<NotebookItem | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/notebook/${id}/review`, {
        method: 'POST',
        headers: getAuthHeaders(), credentials: 'include', cache: 'no-store',
        body: JSON.stringify({ quality })
      });
      if (!response.ok) throw new Error('Failed to submit review');
      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }


  static async generateMnemonic(id: string): Promise<NotebookItem | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/notebook/${id}/mnemonic`, {
        method: 'POST',
        headers: getAuthHeaders(), credentials: 'include', cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to generate mnemonic');
      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

}
