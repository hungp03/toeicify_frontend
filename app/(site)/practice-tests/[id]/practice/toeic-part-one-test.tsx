'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Volume2, Image as ImageIcon, AlertTriangle, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { PartData} from '@/types/question';

interface Props {
  partData: PartData;
}

const ToeicPart1Test = ({ partData }: Props) => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const testId = params?.testId as string;
  const customTime = searchParams.get('time') && searchParams.get('time') !== 'unlimited' 
    ? parseInt(searchParams.get('time')!) : null;
  const isUnlimited = searchParams.get('time') === 'unlimited';

  // Flatten questions từ groups và sort theo questionId
  const allQuestions = partData.groups
    .flatMap(group => 
      group.questions.map(question => ({
        ...question,
        groupId: group.groupId,
        audioUrl: group.audioUrl,
        imageUrl: group.imageUrl
      }))
    )
    .sort((a, b) => a.questionId - b.questionId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes for Part 1
  const [showResults, setShowResults] = useState(false);
  const [initialTime, setInitialTime] = useState(1800);

  // Khởi tạo thời gian
  useEffect(() => {
    let calculatedTime = 1800; // Default 30 minutes for Part 1

    if (isUnlimited) {
      calculatedTime = 0;
    } else if (customTime) {
      calculatedTime = customTime * 60;
    }

    setTimeLeft(calculatedTime);
    setInitialTime(calculatedTime);
  }, [customTime, isUnlimited]);

  // Countdown timer
  useEffect(() => {
    if (showResults || isUnlimited || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults, isUnlimited]);

  const formatTime = (s: number) => {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (isUnlimited) return 'text-blue-600';
    if (timeLeft <= 300) return 'text-red-600'; // 5 phút cuối
    if (timeLeft <= 600) return 'text-orange-600'; // 10 phút cuối
    return 'text-gray-900';
  };

  const getTimeBackground = () => {
    if (isUnlimited) return 'bg-blue-50';
    if (timeLeft <= 300) return 'bg-red-50';
    if (timeLeft <= 600) return 'bg-orange-50';
    return 'bg-gray-50';
  };

  const handleAnswerChange = (val: string) => {
    setAnswers(prev => ({ 
      ...prev, 
      [allQuestions[currentQuestion]?.questionId]: val 
    }));
  };

  const handleMarkForReview = () => {
    const questionId = allQuestions[currentQuestion]?.questionId;
    setMarkedForReview(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => Math.min(prev + 1, allQuestions.length - 1));
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion(prev => Math.max(prev - 1, 0));
  };

  const handleSubmitTest = () => {
    setShowResults(true);
  };

  const currentQ = allQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / allQuestions.length) * 100;

  if (!currentQ) {
    return (
      <div className="text-center text-red-500 py-8">
        No questions found to display.
      </div>
    );
  }

  if (showResults) {
    const answeredCount = Object.keys(answers).length;
    const reviewCount = Object.keys(markedForReview).filter(key => markedForReview[parseInt(key)]).length;
    
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Test Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {Math.round((answeredCount / allQuestions.length) * 100)}%
              </div>
              <p className="text-gray-600">
                You completed {answeredCount} out of {allQuestions.length} questions
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Part Completed:</h3>
              <Badge variant="outline">
                Part {partData.partNumber}: Photographs
              </Badge>
              {reviewCount > 0 && (
                <div className="text-sm text-orange-600">
                  {reviewCount} questions were marked for review
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/practice-tests')}>
                More Tests
              </Button>
              <Button variant="outline" onClick={() => router.push('/progress')}>
                View Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          TOEIC Practice Test - Part {partData.partNumber}: Photographs
        </h1>
        <div className="flex items-center space-x-4">
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
          <Button variant="outline" onClick={handleSubmitTest}>
            Submit Test
          </Button>
        </div>
      </div>

      {/* Progress indicator for time */}
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
          <span>Question {currentQuestion + 1} of {allQuestions.length}</span>
          <span>Part {partData.partNumber}: Photographs</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Question Navigation Grid - Horizontal layout */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Questions Overview</h3>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
              <span>Review</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Current</span>
            </div>
          </div>
        </div>
        
        {/* Horizontal scrollable question grid */}
        <div className="relative">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {allQuestions.map((q, index) => {
              const isAnswered = answers[q.questionId];
              const isMarked = markedForReview[q.questionId];
              const isCurrent = index === currentQuestion;
              
              return (
                <button
                  key={q.questionId}
                  onClick={() => setCurrentQuestion(index)}
                  className={`
                    flex-shrink-0 w-12 h-12 text-sm rounded-lg border-2 font-medium transition-all relative
                    ${isCurrent 
                      ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                      : isAnswered && isMarked
                        ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                        : isAnswered
                          ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                          : isMarked
                            ? 'bg-orange-50 text-orange-600 border-orange-300 hover:bg-orange-100'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {index + 1}
                  {isMarked && (
                    <Flag className="absolute -top-1 -right-1 h-3 w-3 text-orange-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Audio Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Volume2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Audio for Question {currentQuestion + 1}
              </span>
            </div>
            <audio 
              controls 
              className="w-full" 
              key={currentQ.audioUrl}
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={currentQ.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-xs text-blue-600 mt-2">
              Listen to the audio and look at the picture. Choose the best description.
            </p>
          </div>

          {/* Image Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <ImageIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Picture {currentQuestion + 1}
              </span>
            </div>
            <div className="flex justify-center">
              <img 
                src={currentQ.imageUrl} 
                alt={`Question ${currentQuestion + 1} image`}
                className="max-w-full h-64 md:h-80 object-contain rounded-lg border"
                loading="lazy"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">
              Choose the best description for the picture:
            </h3>
            
            <RadioGroup 
              value={answers[currentQ.questionId] || ''} 
              onValueChange={handleAnswerChange} 
              className="space-y-3"
            >
              {currentQ.options.map((option) => (
                <div key={option.optionId} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem 
                    value={option.optionLetter} 
                    id={`option-${option.optionId}`} 
                  />
                  <Label 
                    htmlFor={`option-${option.optionId}`} 
                    className="cursor-pointer text-base flex-1"
                  >
                    <span className="font-medium text-lg">({option.optionLetter})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Navigation and Mark for Review */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handlePreviousQuestion} 
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleMarkForReview}
            className={`${
              markedForReview[currentQ.questionId]
                ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                : 'hover:bg-orange-50'
            }`}
          >
            <Flag className={`h-4 w-4 mr-2 ${markedForReview[currentQ.questionId] ? 'text-orange-500' : ''}`} />
            {markedForReview[currentQ.questionId] ? 'Unmark' : 'Mark for Review'}
          </Button>
          
          <div className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {allQuestions.length}
          </div>
        </div>
        
        <Button 
          onClick={handleNextQuestion} 
          disabled={currentQuestion === allQuestions.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ToeicPart1Test;