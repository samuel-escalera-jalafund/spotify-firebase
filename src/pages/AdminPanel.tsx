import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../infrastructure/Firebase/firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Genre {
  id: string;
  name: string;
  imageUrl: string;
}

type Tab = 'genres' | 'artists' | 'songs';

interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  genreId: string;
}

interface Song {
  id: string;
  name: string;
  audioUrl: string;
  artistId: string;
}

const AdminPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>('genres');

  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editGenre, setEditGenre] = useState<Genre | null>(null);
  const [form, setForm] = useState({ name: '', imageUrl: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [editArtist, setEditArtist] = useState<Artist | null>(null);
  const [artistForm, setArtistForm] = useState({ name: '', imageUrl: '', genreId: '' });
  const [artistImageFile, setArtistImageFile] = useState<File | null>(null);
  const [artistImagePreview, setArtistImagePreview] = useState<string>('');
  const [artistFormLoading, setArtistFormLoading] = useState(false);

  const [songs, setSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [showSongForm, setShowSongForm] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [songForm, setSongForm] = useState({ name: '', audioUrl: '', artistId: '' });
  const [songFile, setSongFile] = useState<File | null>(null);
  const [songFormLoading, setSongFormLoading] = useState(false);

  const fetchGenres = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchGenres();
    fetchArtists();
    fetchSongs();
  }, []);

  const fetchArtists = async () => {
    setLoadingArtists(true);
    try {
      const snapshot = await getDocs(collection(db, 'artists'));
      const artistsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Artist[];
      setArtists(artistsData);
    } catch (err) {
      setError('Error al cargar los artistas');
    }
    setLoadingArtists(false);
  };

  const handleOpenArtistForm = (artist?: Artist) => {
    setEditArtist(artist || null);
    setArtistForm(artist ? { name: artist.name, imageUrl: artist.imageUrl, genreId: artist.genreId } : { name: '', imageUrl: '', genreId: '' });
    setArtistImageFile(null);
    setArtistImagePreview(artist?.imageUrl || '');
    setShowArtistForm(true);
  };

  const handleCloseArtistForm = () => {
    setShowArtistForm(false);
    setEditArtist(null);
    setArtistForm({ name: '', imageUrl: '', genreId: '' });
    setArtistImageFile(null);
    setArtistImagePreview('');
    setArtistFormLoading(false);
  };

  const handleArtistChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setArtistForm(prev => ({ ...prev, [name]: value }));
  };

  const handleArtistImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setArtistImageFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setArtistImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setArtistImagePreview('');
    }
  };

  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setArtistFormLoading(true);
    try {
      let imageUrl = artistForm.imageUrl;
      if (artistImageFile) {
        const storageRef = ref(storage, `artists/${Date.now()}_${artistImageFile.name}`);
        await uploadBytes(storageRef, artistImageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      if (editArtist) {
        await updateDoc(doc(db, 'artists', editArtist.id), {
          name: artistForm.name,
          imageUrl,
          genreId: artistForm.genreId
        });
      } else {
        await addDoc(collection(db, 'artists'), {
          name: artistForm.name,
          imageUrl,
          genreId: artistForm.genreId
        });
      }
      fetchArtists();
      handleCloseArtistForm();
    } catch (err) {
    }
    setArtistFormLoading(false);
  };

  const handleDeleteArtist = async (id: string) => {
    if (!window.confirm('¿Eliminar este artista?')) return;
    await deleteDoc(doc(db, 'artists', id));
    fetchArtists();
  };

  const fetchSongs = async () => {
    setLoadingSongs(true);
    try {
      const snapshot = await getDocs(collection(db, 'songs'));
      const songsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Song[];
      setSongs(songsData);
    } catch (err) {

    }
    setLoadingSongs(false);
  };

  const handleOpenSongForm = (song?: Song) => {
    setEditSong(song || null);
    setSongForm(song ? { name: song.name, audioUrl: song.audioUrl, artistId: song.artistId } : { name: '', audioUrl: '', artistId: '' });
    setSongFile(null);
    setSongFormLoading(false);
  };

  const handleCloseSongForm = () => {
    setShowSongForm(false);
    setEditSong(null);
    setSongForm({ name: '', audioUrl: '', artistId: '' });
    setSongFile(null);
    setSongFormLoading(false);
  };

  const handleSongChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSongForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSongFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSongFile(file || null);
    if (file) {

    }
  };

  const handleSongSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSongFormLoading(true);
    try {
      let audioUrl = songForm.audioUrl;
      if (songFile) {
        const storageRef = ref(storage, `songs/${Date.now()}_${songFile.name}`);
        await uploadBytes(storageRef, songFile);
        audioUrl = await getDownloadURL(storageRef);
      }
      if (editSong) {
        await updateDoc(doc(db, 'songs', editSong.id), {
          name: songForm.name,
          audioUrl,
          artistId: songForm.artistId
        });
      } else {
        await addDoc(collection(db, 'songs'), {
          name: songForm.name,
          audioUrl,
          artistId: songForm.artistId
        });
      }
      fetchSongs();
      handleCloseSongForm();
    } catch (err) {

    }
    setSongFormLoading(false);
  };

  const handleDeleteSong = async (id: string) => {
    if (!window.confirm('¿Eliminar esta canción?')) return;
    await deleteDoc(doc(db, 'songs', id));
    fetchSongs();
  };


  const handleOpenForm = (genre?: Genre) => {
    if (genre) {
      setEditGenre(genre);
      setForm({ name: genre.name, imageUrl: genre.imageUrl });
      setImagePreview(genre.imageUrl);
      setImageFile(null);
    } else {
      setEditGenre(null);
      setForm({ name: '', imageUrl: '' });
      setImagePreview('');
      setImageFile(null);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditGenre(null);
    setForm({ name: '', imageUrl: '' });
    setImageFile(null);
    setImagePreview('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const storageRef = ref(storage, `genres/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      const genreData = { name: form.name, imageUrl };
      if (editGenre) {
        await updateDoc(doc(db, 'genres', editGenre.id), genreData);
      } else {
        await addDoc(collection(db, 'genres'), genreData);
      }
      await fetchGenres();
      handleCloseForm();
    } catch (err) {
      setError('Error al guardar el género');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este género?')) return;
    try {
      await deleteDoc(doc(db, 'genres', id));
      await fetchGenres();
    } catch (err) {
      setError('Error al eliminar el género');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-2xl font-semibold text-yellow-600 mb-4">Panel de Administración</h2>
      <div className="flex gap-4 mb-8">
        <button className={`px-4 py-2 rounded ${tab==='genres'?'bg-green-500 text-white':'bg-gray-200'}`} onClick={()=>setTab('genres')}>Géneros</button>
        <button className={`px-4 py-2 rounded ${tab==='artists'?'bg-green-500 text-white':'bg-gray-200'}`} onClick={()=>setTab('artists')}>Artistas</button>
        <button className={`px-4 py-2 rounded ${tab==='songs'?'bg-green-500 text-white':'bg-gray-200'}`} onClick={()=>setTab('songs')}>Canciones</button>
      </div>

      {tab==='genres' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Géneros</h3>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => handleOpenForm()}
            >
              + Nuevo Género
            </button>
          </div>
          {loading && <p className="text-gray-500">Cargando géneros...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <table className="w-full table-auto mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Imagen</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {genres.map((genre) => (
                <tr key={genre.id} className="border-b">
                  <td className="px-4 py-2">
                    <img src={genre.imageUrl} alt={genre.name} className="w-12 h-12 object-cover rounded-full border" />
                  </td>
                  <td className="px-4 py-2">{genre.name}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => handleOpenForm(genre)}
                    >Editar</button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleDelete(genre.id)}
                    >Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg min-w-[320px]">
                <h3 className="text-lg font-semibold mb-4">{editGenre ? 'Editar Género' : 'Nuevo Género'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Imagen</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border rounded px-3 py-2"
                    />
                    {(imagePreview || form.imageUrl) && (
                      <img
                        src={imagePreview || form.imageUrl}
                        alt="Preview"
                        className="mt-2 w-24 h-24 object-cover rounded-full border"
                      />
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={handleCloseForm}
                      disabled={formLoading}
                    >Cancelar</button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      disabled={formLoading}
                    >{formLoading ? 'Guardando...' : 'Guardar'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab==='artists' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Artistas</h3>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => handleOpenArtistForm()}
            >
              + Nuevo Artista
            </button>
          </div>
          {loadingArtists && <p className="text-gray-500">Cargando artistas...</p>}
          <table className="w-full table-auto mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Imagen</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Género</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist.id} className="border-b">
                  <td className="px-4 py-2">
                    <img src={artist.imageUrl} alt={artist.name} className="w-12 h-12 object-cover rounded-full border" />
                  </td>
                  <td className="px-4 py-2">{artist.name}</td>
                  <td className="px-4 py-2">{genres.find(g=>g.id===artist.genreId)?.name || '-'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => handleOpenArtistForm(artist)}
                    >Editar</button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleDeleteArtist(artist.id)}
                    >Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {showArtistForm && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg min-w-[320px]">
                <h3 className="text-lg font-semibold mb-4">{editArtist ? 'Editar Artista' : 'Nuevo Artista'}</h3>
                <form onSubmit={handleArtistSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      value={artistForm.name}
                      onChange={handleArtistChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Género</label>
                    <select
                      name="genreId"
                      value={artistForm.genreId}
                      onChange={handleArtistChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">Selecciona un género</option>
                      {genres.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Imagen</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArtistImageChange}
                      className="w-full border rounded px-3 py-2"
                    />
                    {(artistImagePreview || artistForm.imageUrl) && (
                      <img
                        src={artistImagePreview || artistForm.imageUrl}
                        alt="Preview"
                        className="mt-2 w-24 h-24 object-cover rounded-full border"
                      />
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={handleCloseArtistForm}
                      disabled={artistFormLoading}
                    >Cancelar</button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      disabled={artistFormLoading}
                    >{artistFormLoading ? 'Guardando...' : 'Guardar'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab==='songs' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Canciones</h3>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => handleOpenSongForm()}
            >
              + Nueva Canción
            </button>
          </div>
          {loadingSongs && <p className="text-gray-500">Cargando canciones...</p>}
          <table className="w-full table-auto mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Artista</th>
                <th className="px-4 py-2 text-left">Audio</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id} className="border-b">
                  <td className="px-4 py-2">{song.name}</td>
                  <td className="px-4 py-2">{artists.find(a=>a.id===song.artistId)?.name || '-'}</td>
                  <td className="px-4 py-2">
                    <audio controls className="w-32">
                      <source src={song.audioUrl} type="audio/mpeg" />
                    </audio>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => handleOpenSongForm(song)}
                    >Editar</button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleDeleteSong(song.id)}
                    >Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {showSongForm && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg min-w-[320px]">
                <h3 className="text-lg font-semibold mb-4">{editSong ? 'Editar Canción' : 'Nueva Canción'}</h3>
                <form onSubmit={handleSongSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      value={songForm.name}
                      onChange={handleSongChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Artista</label>
                    <select
                      name="artistId"
                      value={songForm.artistId}
                      onChange={handleSongChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">Selecciona un artista</option>
                      {artists.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Archivo MP3</label>
                    <input
                      type="file"
                      accept="audio/mp3,audio/mpeg"
                      onChange={handleSongFileChange}
                      className="w-full border rounded px-3 py-2"
                    />
                    {songForm.audioUrl && (
                      <audio controls className="mt-2 w-full">
                        <source src={songForm.audioUrl} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={handleCloseSongForm}
                      disabled={songFormLoading}
                    >Cancelar</button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      disabled={songFormLoading}
                    >{songFormLoading ? 'Guardando...' : 'Guardar'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
