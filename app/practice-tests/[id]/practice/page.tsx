'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Volume2, FileText, Image, AlertTriangle } from 'lucide-react';

export default function TestInterfacePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const testId = params?.testId as string;

  const rawParts = searchParams.get('parts');
  const selectedParts = (!rawParts || rawParts === 'all') ? [] : rawParts.split(',');
  const customTime = searchParams.get('time') && searchParams.get('time') !== 'unlimited' ? parseInt(searchParams.get('time')!) : null;
  const isPartialTest = selectedParts.length > 0;
  const isUnlimited = searchParams.get('time') === 'unlimited';

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(7200);
  const [showResults, setShowResults] = useState(false);
  const [initialTime, setInitialTime] = useState(7200);

  // Khởi tạo thời gian
  useEffect(() => {
    let calculatedTime = 7200; // Default 2 hours

    if (isUnlimited) {
      // Nếu unlimited, không cần đếm ngược
      calculatedTime = 0;
    } else if (customTime) {
      // Thời gian tùy chỉnh (phút -> giây)
      calculatedTime = customTime * 60;
    } else {
      // Luôn dùng thời gian mặc định 2 giờ cho tất cả test
      calculatedTime = 7200;
    }

    setTimeLeft(calculatedTime);
    setInitialTime(calculatedTime);
  }, [customTime, isUnlimited]);

  // Countdown timer - chỉ chạy khi không unlimited
  useEffect(() => {
    if (showResults || isUnlimited || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        console.log('Timer tick:', prev); // Debug log
        if (prev <= 1) {
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults, isUnlimited]);

  const allQuestions = [
    { id: 1, part: '1', type: 'photograph', question: 'Look at the picture and choose the best description.', image: '/placeholder.svg', audio: true, options: ['The woman is reading a book','The woman is writing on a board','The woman is making a presentation','The woman is using a computer'], correct: 'The woman is making a presentation' },
    { id: 2, part: '2', type: 'question-response', question: 'You will hear a question followed by three responses. Choose the best response.', audio: true, options: ['At 3 o\'clock','In the conference room','With my colleagues'], correct: 'At 3 o\'clock' },
    { id: 3, part: '3', type: 'conversation', question: 'What is the main topic of the conversation?', audio: true, options: ['Planning a business trip','Scheduling a meeting','Discussing a project deadline','Arranging a lunch appointment'], correct: 'Scheduling a meeting' },
    { id: 4, part: '4', type: 'talk', question: 'What is the speaker announcing?', audio: true, options: ['A company reorganization','New office hours','A product launch','System maintenance'], correct: 'System maintenance' },
    { id: 5, part: '5', type: 'incomplete-sentence', question: 'The meeting has been _______ until next week due to the holiday.', options: ['postponed','postpone','postponing','to postpone'], correct: 'postponed' },
    { id: 6, part: '6', type: 'text-completion', question: 'Choose the best word or phrase to complete the text.', text: 'We are pleased to announce that our company has _______ expanded its operations to include three new locations across the region.', options: ['successfully','success','successful','succeed'], correct: 'successfully' },
    { id: 7, part: '7', type: 'reading-comprehension', question: 'According to the passage, what is the company\'s main goal?', text: 'TechCorp has announced its expansion plans... market share by 25%...', options: ['To hire more employees','To increase market share by 25%','To reduce operational costs','To open new offices'], correct: 'To increase market share by 25%' }
  ];

  const testData = {
    id: testId,
    title: isPartialTest 
      ? `TOEIC Practice Test - Parts ${selectedParts.join(', ')}` 
      : 'TOEIC Practice Test - Complete',
    questions: isPartialTest 
      ? allQuestions.filter(q => selectedParts.includes(q.part))
      : allQuestions
  };

  const formatTime = (s: number) => {
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  };

  const getTimeColor = () => {
    if (isUnlimited) return 'text-blue-600';
    if (timeLeft <= 300) return 'text-red-600'; // 5 phút cuối
    if (timeLeft <= 600) return 'text-orange-600'; // 10 phút cuối
    return 'text-gray-900';
  };

  const getTimeBackground = () => {
    if (isUnlimited) return 'bg-blue-50';
    if (timeLeft <= 300) return 'bg-red-50'; // 5 phút cuối
    if (timeLeft <= 600) return 'bg-orange-50'; // 10 phút cuối
    return 'bg-gray-50';
  };

  const handleAnswerChange = (val: string) => setAnswers(prev => ({ ...prev, [testData.questions[currentQuestion]?.id]: val }));
  const handleNextQuestion = () => setCurrentQuestion(prev => Math.min(prev + 1, testData.questions.length - 1));
  const handlePreviousQuestion = () => setCurrentQuestion(prev => Math.max(prev - 1, 0));
  const handleSubmitTest = () => setShowResults(true);

  const calculateScore = () => {
    let correct = 0;
    testData.questions.forEach(q => { if (answers[q.id] === q.correct) correct++; });
    return Math.round((correct / testData.questions.length) * 100);
  };

  const getPartName = (part: string) => ({
    '1': 'Photographs','2': 'Question-Response','3': 'Conversations','4': 'Talks','5': 'Incomplete Sentences','6': 'Text Completion','7': 'Reading Comprehension'
  }[part] || part);

  const currentQ = testData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / testData.questions.length) * 100;

  if (!currentQ) {
    return <div className="text-center text-red-500 py-8">Không tìm thấy câu hỏi nào để hiển thị.</div>;
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Test Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{score}%</div>
              <p className="text-gray-600">
                You answered {testData.questions.filter(q => answers[q.id] === q.correct).length} out of {testData.questions.length} questions correctly
              </p>
            </div>
            {isPartialTest && (
              <div className="space-y-2">
                <h3 className="font-semibold">Parts Completed:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedParts.map(part => (
                    <Badge key={part} variant="outline">Part {part}: {getPartName(part)}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/practice-tests')}>More Tests</Button>
              <Button variant="outline" onClick={() => router.push('/progress')}>View Progress</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{testData.title}</h1>
        <div className="flex items-center space-x-4">
          {/* Enhanced Timer Display */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getTimeBackground()}`}>
            <Clock className={`h-4 w-4 ${getTimeColor()}`} />
            <div className="flex flex-col items-center">
              <span className={`font-mono text-lg font-semibold ${getTimeColor()}`}>
                {isUnlimited ? 'Unlimited' : formatTime(timeLeft)}
              </span>
              {!isUnlimited && (
                <span className="text-xs text-gray-500">
                  {timeLeft <= 300 ? 'Hurry up!' : timeLeft <= 600 ? 'Time running out' : 'Remaining time'}
                </span>
              )}
            </div>
            {!isUnlimited && timeLeft <= 300 && (
              <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
            )}
          </div>
          <Button variant="outline" onClick={handleSubmitTest}>Submit Test</Button>
        </div>
      </div>

      {/* Progress indicator for time (only when not unlimited) */}
      {!isUnlimited && initialTime > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Time Progress</span>
            <span>{Math.round(((initialTime - timeLeft) / initialTime) * 100)}% elapsed</span>
          </div>
          <Progress 
            value={((initialTime - timeLeft) / initialTime) * 100} 
            className="w-full h-2"
          />
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {testData.questions.length}</span>
          <span>Part {currentQ.part}: {getPartName(currentQ.part)}</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {currentQ.audio && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Audio Question - Part {currentQ.part}</span>
              </div>
              <audio controls className="w-full">
                <source src="/audio/sample.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {currentQ.image && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Image className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Part {currentQ.part}: {getPartName(currentQ.part)}</span>
              </div>
              <img src={currentQ.image} alt="Question image" className="max-w-full h-64 object-cover rounded-lg mx-auto" />
            </div>
          )}

          {currentQ.text && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Part {currentQ.part}: {getPartName(currentQ.part)}</span>
              </div>
              <p className="text-sm leading-relaxed">{currentQ.text}</p>
            </div>
          )}

          <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>

          <RadioGroup value={answers[currentQ.id] || ''} onValueChange={handleAnswerChange} className="space-y-3">
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>Previous</Button>
        <Button onClick={handleNextQuestion} disabled={currentQuestion === testData.questions.length - 1}>Next</Button>
      </div>
    </div>
  );
}