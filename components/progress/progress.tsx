'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Award, BarChart3, BookOpen, Clock, LogIn } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getUserProgress } from '@/lib/api/progress';
import { useAuthStore } from '@/store/auth';
import { Summary, SectionHighs, TrendPoint } from '@/types/progress';
import { toast } from 'sonner';
import TestHistory from '@/components/account/test-history';

const ProgressPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isFetchingUser = useAuthStore((state) => state.isFetchingUser);

  const [summary, setSummary] = useState<Summary>({
    currentScore: 0,
    testsTaken: 0,
    studyHours: 0,
  });
  const [sectionHighs, setSectionHighs] = useState<SectionHighs>({
    listeningMax: 0,
    readingMax: 0,
  });
  const [scoreTrend, setScoreTrend] = useState<TrendPoint[]>([]);

  const completedScore = useMemo(
    () => parseInt(searchParams.get('score') || '0', 10),
    [searchParams]
  );

  const isAuthenticated = !!user;
  const hasTarget = user?.targetScore != null;

  const currentScore = completedScore || summary.currentScore || 0;
  const progressToTarget =
    hasTarget && user?.targetScore && user?.targetScore > 0
      ? (currentScore / user?.targetScore) * 100
      : 0;

  const loginToastShown = useRef(false);

  const getProgressData = async () => {
    try {
      const response = await getUserProgress();
      const data = response.data;
      setSummary(data.summary);
      setSectionHighs(data.sectionHighs);
      setScoreTrend(data.scoreTrend || []);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
      toast.error('Có lỗi khi tải dữ liệu tiến trình. Vui lòng thử lại sau.');
    }
  };

  useEffect(() => {
    if (hasHydrated && !isFetchingUser && !isAuthenticated && !loginToastShown.current) {
      loginToastShown.current = true;
    }
  }, [hasHydrated, isFetchingUser, isAuthenticated]);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      getProgressData();
    }
  }, [hasHydrated, isAuthenticated]);

  if (!hasHydrated || isFetchingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md animate-pulse">
          <CardHeader>
            <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-10 w-full bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Tiến độ luyện tập
            </CardTitle>
            <CardDescription>
              Vui lòng đăng nhập để xem và đồng bộ dữ liệu tiến trình của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => router.push('/login')}>
              <LogIn className="h-4 w-4 mr-2" />
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tiến độ luyện tập</h1>
          <p className="text-gray-600 mt-2">Theo dõi hành trình và hiệu suất chuẩn bị cho kỳ thi TOEIC của bạn</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Điểm hiện tại */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm số cao nhất</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentScore}</div>
            </CardContent>
          </Card>

          {/* Mục tiêu */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm mục tiêu</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {hasTarget ? (
                <>
                  <div className="text-2xl font-bold">{user!.targetScore}</div>
                  <div className="text-xs text-muted-foreground">
                    {(user?.targetScore ?? 0) - currentScore <= 0
                      ? "Đã đạt mục tiêu"
                      : `${(user?.targetScore ?? 0) - currentScore} điểm còn lại`}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-500">Chưa đặt mục tiêu</div>
                  <div className="text-xs text-muted-foreground">---</div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Số lần làm bài */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số lần làm bài</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.testsTaken}</div>
            </CardContent>
          </Card>

          {/* Thời gian luyện */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thời gian luyện tập</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.studyHours}h</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Score Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tiến độ điểm số
              </CardTitle>
              <CardDescription>Điểm số TOEIC của bạn theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoreTrend.map((p) => ({ date: p.day, score: p.score }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 990]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Target Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tiến độ mục tiêu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tiến độ đến mục tiêu</span>
                  <span>{hasTarget ? `${Math.round(progressToTarget)}%` : 'Chưa đặt mục tiêu'}</span>
                </div>
                <Progress value={hasTarget ? progressToTarget : 0} className="h-2" />
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{currentScore}</div>
                  <div className="text-sm text-gray-600">Điểm số cao nhất</div>
                </div>

                <div className="text-center">
                  {hasTarget ? (
                    <>
                      {(user?.targetScore ?? 0) - currentScore <= 0 ? (
                        <>
                          <div className="text-xl font-semibold text-green-600">Đã đạt mục tiêu!</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-semibold text-gray-800">
                            {(user?.targetScore ?? 0) - currentScore}
                          </div>
                          <div className="text-sm text-gray-600">Điểm còn lại để đạt mục tiêu</div>
                        </>
                      )}
                    </>

                  ) : (
                    <>
                      <div className="text-xl font-semibold text-gray-500">---</div>
                      <div className="text-sm text-gray-600">Chưa đặt mục tiêu</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Breakdown */}
        <div className="gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Hiệu suất
              </CardTitle>
              <CardDescription>Khả năng của bạn theo từng phần</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Listening</span>
                    <span>{sectionHighs.listeningMax}/495</span>
                  </div>
                  <Progress value={(sectionHighs.listeningMax / 495) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Reading</span>
                    <span>{sectionHighs.readingMax}/495</span>
                  </div>
                  <Progress value={(sectionHighs.readingMax / 495) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>Your recent test attempts and results</CardDescription>
            </CardHeader>
            <CardContent>
              <TestHistory />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
