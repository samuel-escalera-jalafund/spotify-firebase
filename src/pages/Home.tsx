import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../infrastructure/Firebase/firebase.config';

interface Genre {
  id: string;
  name: string;
  imageUrl: string;
}

const Home: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'genres'));
        const genresData: Genre[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Genre, 'id'>),
        }));
        setGenres(genresData);
      } catch (err) {
        setError('Error al cargar los géneros');
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
      <h1 className="text-4xl font-bold text-green-500 mb-8 drop-shadow">Spotify Firebase</h1>
      {loading && <p className="text-gray-500">Cargando géneros...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {genres.map((genre) => (
          <div key={genre.id} className="bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col items-center p-4 cursor-pointer">
            <img src={genre.imageUrl} alt={genre.name} className="w-32 h-32 object-cover rounded-full mb-4 border-4 border-green-200" />
            <h2 className="text-xl font-semibold text-gray-800">{genre.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
