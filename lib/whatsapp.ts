export const getWhatsAppTaskLink = (phone: string, employeeName: string, taskTitle: string, projectName: string, priority: string, dueDate?: string) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = `👋 Hi ${employeeName},\n\nA new task has been assigned to you:\n📋 *Task:* ${taskTitle}\n📁 *Project:* ${projectName}\n⚡ *Priority:* ${priority}\n📅 *Due Date:* ${dueDate || 'Not Specified'}\n\nPlease check your workspace dashboard for details.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};