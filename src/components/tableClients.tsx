import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { obtenerUsuarios } from '../hooks/usersSlice';
import { RootState, AppDispatch } from '../hooks/store';
import { Usuario } from '../constans/types';

interface TableClientsProps {
  onOpenModal: (usuario: Usuario) => void;
}

const TableClients: React.FC<TableClientsProps> = ({ onOpenModal }) => {
  const dispatch = useDispatch<AppDispatch>();
  const usuarios = useSelector((state: RootState) => state.usuarios.items);
  const status = useSelector((state: RootState) => state.usuarios.status);
  const error = useSelector((state: RootState) => state.usuarios.error);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 8;

  useEffect(() => {
    dispatch(obtenerUsuarios());
  }, [dispatch]);

  const handleLoadUsers = () => {
    dispatch(obtenerUsuarios());
  };

  const handleOpenModal = (usuario: Usuario) => {
    onOpenModal(usuario);
  };

  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (status === 'failed') {
    return <div>Error al cargar los usuarios: {error}</div>;
  }

  const getRowClass = (estado: string): string => {
    if (estado === 'activo') return 'bg-green-100';
    if (estado === 'inactivo') return 'bg-gray-200';
    return 'bg-red-100';
  };

  const filtrarUsuarios = (estado: string) => {
    if (estado === 'todos') return usuarios;
    return usuarios.filter((usuario) => usuario.estado === estado);
  };

  const filtrarPorBusqueda = (usuario: Usuario) => {
    const query = searchQuery.toLowerCase();
    return (
      usuario.uuid.toLowerCase().includes(query) ||
      usuario.nombre.toLowerCase().includes(query) ||
      usuario.fecha_inicio.toLowerCase().includes(query) ||
      usuario.fecha_pago.toLowerCase().includes(query) ||
      usuario.fecha_corte.toLowerCase().includes(query) ||
      usuario.membresia.toLowerCase().includes(query) ||
      usuario.estado.toLowerCase().includes(query)
    );
  };

  const getCurrentPageRows = () => {
    const filteredUsuarios = filtrarUsuarios(filtroEstado).filter(filtrarPorBusqueda);
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredUsuarios.slice(startIndex, startIndex + rowsPerPage);
  };

  const totalPages = Math.ceil(filtrarUsuarios(filtroEstado).filter(filtrarPorBusqueda).length / rowsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationRange = () => {
    const range = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
    }
    return range;
  };

  return (
    <div className="container bg-[#2F2F2F] mx-auto p-4 pt-[100px] mb-20">
      <div className="flex justify-between mb-4">
        {/* <button onClick={handleLoadUsers} className="px-4 py-2 bg-blue-500 text-white rounded">
          Cargar Usuarios
        </button> */}
        <input
          type="text"
          placeholder="Buscar..."
          className="px-4 py-2 bg-white w-[450px] text-black rounded-xl border-solid border-[1px] border-gray-400-500 mr-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="px-4 py-2 bg-white text-black rounded-xl mr-2 outline-none"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="sin membresia">Sin Membresía</option>
        </select>
      </div>

      <table className="min-w-full border-solid border-[1px] border-[#FF5722] rounded-t-[30px] shadow-md overflow-hidden">
        <thead>
          <tr className="bg-[#424242] text-[#E0E0E0]">
            <th className="py-2 px-4">ID</th>
            <th className="py-2 px-4">Nombre</th>
            <th className="py-2 px-4">Tipo de Membresía</th>
            <th className="py-2 px-4">Días Restantes</th>
            <th className="py-2 px-4">Estado</th>
          </tr>
        </thead>
        <tbody>
          {getCurrentPageRows().map((usuario: Usuario, index: number) => (
            <tr
              key={index}
              className={`text-gray-700 focus:bg-red-950 ${getRowClass(usuario.estado || '')}`}
            >
              <td className="py-2 px-4 text-center border-x border-white">{usuario.uuid || ''}</td>
              <td className="py-2 px-4 text-center border-x border-white">{usuario.nombre || ''}</td>
              <td className="py-2 px-4 text-center border-x border-white">{usuario.membresia || ''}</td>
              <td className="py-2 px-4 text-center border-x border-white">{usuario.dias_restantes || ''}</td>
              <td className="py-2 relative px-4 text-center border-x border-white">{usuario.estado || ''}
                {usuarios.length > 0 && (
                  <button
                    onClick={() => handleOpenModal(usuario)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-700 focus:outline-none"
                  >
                    &#x22EE;
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <div className="bg-[#424242] w-[274px] h-[40px] rounded-2xl flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="w-7 h-7 ml-3 rounded-full bg-[#2F2F2F] text-white"
              disabled={currentPage === 1}
            >
              B
            </button>
            <div className="flex space-x-1">
              {getPaginationRange().map((page) => (
                <span
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-5 h-5 rounded-full text-center flex items-center justify-center ${currentPage === page ? 'bg-[#2F2F2F] text-white' : 'text-[#E0E0E0] cursor-pointer'}`}
                >
                  {page}
                </span>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="w-7 h-7 mr-3 rounded-full bg-[#2F2F2F] text-white"
              disabled={currentPage === totalPages}
            >
              N
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableClients;