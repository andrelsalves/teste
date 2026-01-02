import { supabase } from './supabaseClient';

export const notificationService = {
  async create(data: {
    userId: string;
    message: string;
    type: string;
    link: string;
  }) {
    return supabase.from('notifications').insert({
      user_id: data.userId,
      message: data.message,
      type: data.type,
      link: data.link
    });
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markAsRead(id: string) {
    return supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  }
};
