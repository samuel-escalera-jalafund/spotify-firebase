import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../infrastructure/Firebase/firebase.config';

interface Song {
  id: string;
  name: string;
  audioUrl: string;
}

const ArtistDetail: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSongs = async () => {
      if (!artistId) return;
      try {
        const q = query(collection(db, 'songs'), where('artistId', '==', artistId));
        const querySnapshot = await getDocs(q);
        const songsData: Song[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Song, 'id'>),
        }));
        setSongs(songsData);
      } catch (err) {
        setError('Error al cargar las canciones');
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [artistId]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-2xl font-semibold text-green-600 mb-4">Canciones del Artista</h2>
      {loading && <p className="text-gray-500">Cargando canciones...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-6">
        {songs.map((song) => (
          <div key={song.id} className="flex flex-col items-start bg-gray-50 rounded-lg shadow p-4">
            <span className="text-lg font-medium text-gray-800 mb-2">{song.name}</span>
            <audio controls className="w-full">
              <source src={song.audioUrl} type="audio/mpeg" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistDetail;
