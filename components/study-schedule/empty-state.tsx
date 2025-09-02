import { Calendar } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Chưa có lịch học nào
      </h3>
      <p className="text-muted-foreground mb-4">
        Tạo lịch học đầu tiên để bắt đầu theo dõi tiến độ học tập
      </p>
    </div>
  );
};