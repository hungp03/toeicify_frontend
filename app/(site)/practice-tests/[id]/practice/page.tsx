'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getQuestionsByPartIds } from '@/lib/api/question';
import ToeicPart1Test from './toeic-part-one-test';
import { PartData } from '@/types/question';

export default function TestPage() {
  const { testId } = useParams();
  const [partData, setPartData] = useState<PartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await getQuestionsByPartIds({ partIds: ['1'] });
        setPartData(response.data?.[0] ?? null);
      } catch (err) {
        console.error('Error fetching test data:', err);
        setPartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading test...</p>
      </div>
    );
  }

  if (!partData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Test Not Found</h1>
        <p>Unable to load test data. Please try again later.</p>
      </div>
    );
  }

  return <ToeicPart1Test partData={partData} />;
}
