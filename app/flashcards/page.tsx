'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookPlus, Book, FlipHorizontal } from 'lucide-react';

interface FlashcardSet {
  id: number;
  title: string;
  description: string;
  cardCount: number;
  createdAt: string;
}

const FlashcardsPage = () => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([
    {
      id: 1,
      title: 'TOEIC Vocabulary - Business',
      description: 'Essential business vocabulary for TOEIC',
      cardCount: 50,
      createdAt: '2024/01/15'
    },
    {
      id: 2,
      title: 'Common Phrases',
      description: 'Frequently used phrases in TOEIC tests',
      cardCount: 30,
      createdAt: '2024/01/10'
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');

  const handleCreateSet = () => {
    if (newSetTitle.trim()) {
      const newSet: FlashcardSet = {
        id: Date.now(),
        title: newSetTitle.trim(),
        description: newSetDescription.trim(),
        cardCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setFlashcardSets(prev => [...prev, newSet]);
      setNewSetTitle('');
      setNewSetDescription('');
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Flashcards</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tạo và ôn tập bộ thẻ ghi nhớ để nâng cao vốn từ vựng.
          </p>
        </div>

        {/* Thanh tiêu đề và nút tạo mới */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Danh sách của bạn</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-500">
                <BookPlus className="h-4 w-4 mr-2" />
                Tạo bộ thẻ mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo bộ flashcard mới</DialogTitle>
                <DialogDescription>
                  Nhập tiêu đề và mô tả để bắt đầu.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    placeholder="Nhập tiêu đề"
                    value={newSetTitle}
                    onChange={(e) => setNewSetTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Mô tả (tuỳ chọn)</Label>
                  <Textarea
                    id="description"
                    placeholder="Nhập mô tả"
                    value={newSetDescription}
                    onChange={(e) => setNewSetDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Huỷ
                  </Button>
                  <Button onClick={handleCreateSet} disabled={!newSetTitle.trim()}>
                    Tạo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Danh sách bộ thẻ */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => (
            <Card key={set.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" /> {set.title}
                </CardTitle>
                <CardDescription>{set.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>{set.cardCount} thẻ</p>
                    <p>Ngày tạo: {new Date(set.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/flashcards/${set.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Book className="h-4 w-4 mr-2" />
                        Quản lý
                      </Button>
                    </Link>
                    <Link href={`/flashcards/${set.id}/study`} className="flex-1">
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-500">
                        <FlipHorizontal className="h-4 w-4 mr-2" />
                        Ôn tập
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Không có bộ thẻ */}
        {flashcardSets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Chưa có bộ flashcard nào.</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <BookPlus className="h-4 w-4 mr-2" />
                  Tạo bộ đầu tiên
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlashcardsPage;