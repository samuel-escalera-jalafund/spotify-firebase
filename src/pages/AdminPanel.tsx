import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../infrastructure/Firebase/firebase.config';

interface Genre {
  id: string;
  name: string;
  imageUrl: string;
}

const AdminPanel: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editGenre, setEditGenre] = useState<Genre | null>(null);
  const [form, setForm] = useState({ name: '', imageUrl: '' });
  const [formLoading, setFormLoading] = useState(false);

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
  }, []);

  const handleOpenForm = (genre?: Genre) => {
    if (genre) {
      setEditGenre(genre);
      setForm({ name: genre.name, imageUrl: genre.imageUrl });
    } else {
      setEditGenre(null);
      setForm({ name: '', imageUrl: '' });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditGenre(null);
    setForm({ name: '', imageUrl: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editGenre) {
        await updateDoc(doc(db, 'genres', editGenre.id), form);
      } else {
        await addDoc(collection(db, 'genres'), form);
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

      {/* Modal/Formulario para crear/editar género */}
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
                <label className="block text-sm font-medium mb-1">Imagen URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
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
  );
};

export default AdminPanel;
