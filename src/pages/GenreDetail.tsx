import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../infrastructure/Firebase/firebase.config';

interface Artist {
  id: string;
  name: string;
  imageUrl: string;
}

const GenreDetail: React.FC = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtists = async () => {
      if (!genreId) return;
      try {
        const q = query(collection(db, 'artists'), where('genreId', '==', genreId));
        const querySnapshot = await getDocs(q);
        const artistsData: Artist[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Artist, 'id'>),
        }));
        setArtists(artistsData);
      } catch (err) {
        setError('Error al cargar los artistas');
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, [genreId]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-2xl font-semibold text-green-600 mb-4">Artistas del Género</h2>
      {loading && <p className="text-gray-500">Cargando artistas...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="flex flex-col items-center bg-gray-50 rounded-lg shadow p-4 hover:bg-green-100 transition cursor-pointer"
            onClick={() => navigate(`/artist/${artist.id}`)}
          >
            <img src={artist.imageUrl} alt={artist.name} className="w-24 h-24 object-cover rounded-full mb-2 border-4 border-green-200" />
            <h3 className="text-lg font-medium text-gray-800">{artist.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenreDetail;
