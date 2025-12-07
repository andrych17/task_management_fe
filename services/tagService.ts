import api from '@/lib/api';
import { Tag, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '@/lib/constants';

export class TagService {
  static async getTags(search?: string): Promise<Tag[]> {
    try {
      console.log('🔗 [TagService] Fetching tags from API', search ? `with search: ${search}` : '');
      const url = search ? `${API_ENDPOINTS.TAGS}?search=${encodeURIComponent(search)}` : API_ENDPOINTS.TAGS;
      const response = await api.get(url);
      
      let tags: Tag[] = [];
      
      // Handle response structure
      if (response.data.success && response.data.data) {
        tags = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        tags = response.data;
      }
      
      console.log(`✅ [TagService] Fetched ${tags.length} tags`);
      return tags;
    } catch (error: any) {
      console.error('❌ [TagService] Error fetching tags:', error.response?.data);
      return [];
    }
  }

  // Helper method to extract unique tags from tasks
  static extractTagsFromTasks(tasks: any[]): Tag[] {
    const tagMap = new Map<string, Tag>();
    
    tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach((tag: Tag) => {
          if (tag.id && tag.name && !tagMap.has(tag.name)) {
            tagMap.set(tag.name, tag);
          }
        });
      }
    });
    
    const uniqueTags = Array.from(tagMap.values());
    console.log(`📊 [TagService] Extracted ${uniqueTags.length} unique tags from tasks`);
    return uniqueTags;
  }

  static async createTag(data: { name: string }): Promise<Tag> {
    console.error('❌ [TagService] Tags are not separate entities');
    throw new Error('Tags are managed through tasks, not as separate entities.');
  }

  static async deleteTag(id: number): Promise<void> {
    console.error('❌ [TagService] Tags are not separate entities');
    throw new Error('Tags are managed through tasks, not as separate entities.');
  }
}
