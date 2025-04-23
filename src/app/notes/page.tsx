//src/app/notes/page.tsx 

'use client';

import React, { useState, useEffect } from 'react';

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '', isPublic: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editNoteId, setEditNoteId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchNotes() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/notes');
        if (!res.ok) throw new Error('Failed to fetch notes');
        const data = await res.json();
        setNotes(data);
      } catch {
        setError('Der opstod en fejl under hentning af noter.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotes();
  }, []);

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) {
      alert('Udfyld venligst både titel og indhold!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      if (!res.ok) throw new Error('Fejl ved oprettelse af note');
      const data = await res.json();
      setNotes([...notes, data]);
      setNewNote({ title: '', content: '', isPublic: false });
    } catch {
      setError('Der opstod en fejl under oprettelse af noten.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) {
      alert('Udfyld venligst både titel og indhold!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/notes/${editNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      if (!res.ok) throw new Error('Fejl ved opdatering');

      const updatedNote = await res.json();
      setNotes(notes.map((n) => (n.id === editNoteId ? updatedNote : n)));
      setNewNote({ title: '', content: '', isPublic: false });
      setEditNoteId(null);
    } catch {
      setError('Der opstod en fejl under opdatering af noten.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (note: any) => {
    setEditNoteId(note.id);
    setNewNote({
      title: note.title,
      content: note.content,
      isPublic: note.isPublic,
    });
  };

  const deleteNote = async (id: number) => {
    const confirmed = confirm('Er du sikker på, at du vil slette noten?');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Fejl ved sletning');
      setNotes(notes.filter((n) => n.id !== id));
    } catch {
      setError('Der opstod en fejl under sletning af noten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Dine Noter</h1>

        {error && <p className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</p>}
        {isLoading && <p className="text-gray-500 mb-4 italic">Henter data...</p>}

        <form onSubmit={editNoteId ? updateNote : createNote} className="bg-white shadow-lg rounded-2xl p-6 mb-10 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{editNoteId ? 'Rediger note' : 'Opret ny note'}</h2>
          <input
            type="text"
            placeholder="Titel"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <textarea
            placeholder="Indhold"
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={newNote.isPublic}
              onChange={(e) => setNewNote({ ...newNote, isPublic: e.target.checked })}
              className="mr-2"
            />
            Offentlig
          </label>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {editNoteId ? 'Opdater Note' : 'Opret Note'}
            </button>
            {editNoteId && (
              <button
                type="button"
                onClick={() => {
                  setEditNoteId(null);
                  setNewNote({ title: '', content: '', isPublic: false });
                }}
                className="text-sm text-gray-500 hover:underline"
              >
                Annuller redigering
              </button>
            )}
          </div>
        </form>

        <h2 className="text-2xl font-semibold mb-4">Alle Noter</h2>
        <ul className="space-y-4">
          {notes.map((note: any) => (
            <li key={note.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-bold">{note.title}</h3>
              <p className="text-gray-700">{note.content}</p>
              <p className="text-sm mt-2 text-gray-500">
                {note.isPublic ? '🌐 Offentlig' : '🔒 Privat'}
              </p>
              {note.isPublic && (
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/notes/${note.id}`;
                    navigator.clipboard.writeText(link);
                    alert("Link kopieret til udklipsholder!");
                  }}
                  className="text-blue-600 underline mt-2 hover:text-blue-800"
                >
                  🔗 Kopiér delbart link
                </button>
              )}
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => startEdit(note)}
                  className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
                >
                  ✏️ Rediger
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                >
                  🗑 Slet
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default NotesPage;


