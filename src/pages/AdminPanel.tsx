import React from 'react';

const AdminPanel: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-2xl font-semibold text-yellow-600 mb-4">Panel de Administración</h2>
      {/* Aquí los admins podrán gestionar géneros, artistas y canciones */}
    </div>
  );
};

export default AdminPanel;
