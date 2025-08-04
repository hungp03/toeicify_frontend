'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Eye, BookOpen, Headphones, FileText } from 'lucide-react';
import { TestInfoProps } from '@/types';

const TestInfo = ({
  testTitle,
  setTestTitle,
  testDescription,
  setTestDescription,
  currentPart,
  setCurrentPart,
  totalQuestions,
  questionsByPart,
  partConfigs,
  onAddQuestionGroup,
  onSaveTest,
  onPreviewTest
}: TestInfoProps) => {
  const currentPartConfig = partConfigs[currentPart];

  const getPartIcon = (partId: number) => {
    const config = partConfigs[partId];
    if (config.hasAudio) return <Headphones className="h-3 w-3" />;
    if (config.hasPassage) return <FileText className="h-3 w-3" />;
    return <BookOpen className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      {/* Test Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đề thi</CardTitle>
          <CardDescription>
            Cấu hình cơ bản cho đề thi TOEIC
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-title">Tên đề thi *</Label>
            <Input
              id="test-title"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              placeholder="VD: TOEIC Practice Test 1"
            />
          </div>
          <div>
            <Label htmlFor="test-description">Mô tả</Label>
            <Textarea
              id="test-description"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              placeholder="Mô tả ngắn về đề thi..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Part Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Thêm câu hỏi</CardTitle>
          <CardDescription>
            Chọn phần để tạo nhóm câu hỏi mới
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Chọn Part</Label>
            <Select 
              value={currentPart.toString()} 
              onValueChange={(value) => setCurrentPart(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(partConfigs).map(([partId, config]) => (
                  <SelectItem key={partId} value={partId}>
                    <div className="flex items-center space-x-2">
                      {getPartIcon(parseInt(partId))}
                      <span>Part {partId}: {config.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Part Info */}
          {currentPartConfig && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Part {currentPart}: {currentPartConfig.name}
              </div>
              <div className="text-xs text-blue-700 mb-2">
                {currentPartConfig.description}
              </div>
              <div className="flex flex-wrap gap-1">
                {currentPartConfig.hasAudio && (
                  <Badge variant="secondary" className="text-xs">
                    <Headphones className="h-3 w-3 mr-1" />
                    Audio
                  </Badge>
                )}
                {currentPartConfig.hasImage && (
                  <Badge variant="secondary" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Image
                  </Badge>
                )}
                {currentPartConfig.hasPassage && (
                  <Badge variant="secondary" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Passage
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {currentPartConfig.questionsPerGroup} câu/nhóm
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentPartConfig.optionCount} lựa chọn
                </Badge>
              </div>
            </div>
          )}

          <Button onClick={onAddQuestionGroup} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Tạo nhóm câu hỏi Part {currentPart}
          </Button>
        </CardContent>
      </Card>

      {/* Question Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê câu hỏi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
            <div className="text-sm text-gray-600">Tổng số câu hỏi</div>
          </div>
          
          {Object.keys(questionsByPart).length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Câu hỏi theo từng Part:</div>
              <div className="space-y-2">
                {Object.entries(questionsByPart).map(([partId, count]) => (
                  <div key={partId} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {getPartIcon(parseInt(partId))}
                      <span className="text-sm">Part {partId}</span>
                    </div>
                    <Badge variant="outline">{count} câu</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalQuestions === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Chưa có câu hỏi nào. Hãy tạo nhóm câu hỏi đầu tiên!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Button onClick={onSaveTest} className="w-full" disabled={!testTitle || totalQuestions === 0}>
              <Save className="h-4 w-4 mr-2" />
              Lưu đề thi
            </Button>
            <Button 
              variant="outline" 
              onClick={onPreviewTest} 
              className="w-full"
              disabled={totalQuestions === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem trước
            </Button>
          </div>
          
          {(!testTitle || totalQuestions === 0) && (
            <div className="text-xs text-red-600 mt-2 text-center">
              {!testTitle && "Cần nhập tên đề thi. "}
              {totalQuestions === 0 && "Cần ít nhất 1 câu hỏi."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestInfo;