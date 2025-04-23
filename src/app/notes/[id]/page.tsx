// src/app/notes/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function NoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`/api/notes/${params.id}`);
        if (!res.ok) throw new Error('Kunne ikke hente noten');
        const data = await res.json();
        setNote(data);
      } catch (err: any) {
        setError(err.message || 'Der opstod en fejl.');
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchNote();
    }
  }, [params.id]);

  if (isLoading) return <p className="p-4">Henter note...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!note) return <p className="p-4">Ingen note fundet.</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
        <p className="text-gray-700 whitespace-pre-wrap mb-6">{note.content}</p>
        <p className="text-sm text-gray-500">
          {note.isPublic ? '🌐 Offentlig' : '🔒 Privat'}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 inline-block text-blue-600 hover:underline"
        >
          ← Tilbage
        </button>
      </div>
    </div>
  );
}
