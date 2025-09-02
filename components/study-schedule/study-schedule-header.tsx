import { BookOpen } from 'lucide-react';

export const StudyScheduleHeader = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
        <BookOpen className="h-8 w-8" />
        Lịch học cá nhân
      </h1>
      <p className="text-muted-foreground mt-2">
        Quản lý lịch học và theo dõi tiến độ học tập của bạn
      </p>
    </div>
  );
};