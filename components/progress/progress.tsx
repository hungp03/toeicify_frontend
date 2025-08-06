'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Award, BarChart3, BookOpen, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProgressPage = () => {
  const searchParams = useSearchParams();

  const testCompleted = searchParams.get('testCompleted') === 'true';
  const completedScore = parseInt(searchParams.get('score') || '0', 10);
  const testTitle = searchParams.get('testTitle') || '';

  const scoreHistory = [
    { date: '2024-01-01', score: 620 },
    { date: '2024-01-03', score: 640 },
    { date: '2024-01-05', score: 660 },
    { date: '2024-01-08', score: 680 },
    { date: '2024-01-10', score: 720 },
    { date: '2024-01-12', score: 740 },
    { date: '2024-01-15', score: completedScore || 760 },
  ];

  const sectionBreakdown = [
    { section: 'Listening', score: 385, maxScore: 495 },
    { section: 'Reading', score: 375, maxScore: 495 },
  ];

  const studyStats = [
    { week: 'Week 1', hours: 8 },
    { week: 'Week 2', hours: 12 },
    { week: 'Week 3', hours: 10 },
    { week: 'Week 4', hours: 15 },
  ];

  const skillDistribution = [
    { name: 'Grammar', value: 85 },
    { name: 'Vocabulary', value: 78 },
    { name: 'Listening', value: 82 },
    { name: 'Reading', value: 80 },
  ];

  const currentScore = completedScore || 760;
  const targetScore = 850;
  const progressToTarget = (currentScore / targetScore) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {testCompleted && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Test Completed Successfully!
                </h3>
                <p className="text-green-700">
                  You scored <strong>{completedScore}/990</strong> on {testTitle}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Progress Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your TOEIC preparation journey and performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentScore}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+40 from last test</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{targetScore}</div>
              <div className="text-xs text-muted-foreground">
                {targetScore - currentScore} points to go
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <div className="text-xs text-muted-foreground">
                8 this month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45h</div>
              <div className="text-xs text-muted-foreground">
                This month
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Score Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Score Progress
              </CardTitle>
              <CardDescription>Your TOEIC scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[500, 900]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Target Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to Target</span>
                  <span>{Math.round(progressToTarget)}%</span>
                </div>
                <Progress value={progressToTarget} className="h-2" />
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{currentScore}</div>
                  <div className="text-sm text-gray-600">Current Score</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-800">{targetScore - currentScore}</div>
                  <div className="text-sm text-gray-600">Points to Target</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-medium text-green-600">
                    {Math.ceil((targetScore - currentScore) / 10)} tests
                  </div>
                  <div className="text-sm text-gray-600">Estimated to reach target</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Section Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Section Breakdown
              </CardTitle>
              <CardDescription>Your performance by section</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectionBreakdown.map((section) => (
                  <div key={section.section}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{section.section}</span>
                      <span>{section.score}/{section.maxScore}</span>
                    </div>
                    <Progress 
                      value={(section.score / section.maxScore) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      {Math.round((section.score / section.maxScore) * 100)}% of maximum score
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Distribution</CardTitle>
              <CardDescription>Your strengths across different skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillDistribution.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span>{skill.value}%</span>
                    </div>
                    <Progress 
                      value={skill.value} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;