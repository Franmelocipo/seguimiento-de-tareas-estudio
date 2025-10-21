import React, { useRef, useState } from 'react';
import { DraggableModal } from '../ui/DraggableModal';
import { Button } from '../ui/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { backupService } from '../../services/backupService';
import { isDemoMode } from '../../lib/firebase/config';
import {
  Download,
  Upload,
  Copy,
  ClipboardPaste,
  Database,
  AlertTriangle,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleExportBackup = () => {
    try {
      backupService.exportBackup();
      addNotification('success', 'Backup descargado correctamente');
    } catch (error) {
      addNotification('error', 'Error al exportar backup');
      console.error(error);
    }
  };

  const handleImportBackup = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await backupService.importBackup(file);
      addNotification('success', 'Backup importado correctamente');
    } catch (error) {
      addNotification('error', (error as Error).message);
      console.error(error);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportToClipboard = async () => {
    try {
      await backupService.exportToClipboard();
      addNotification('success', 'Backup copiado al portapapeles');
    } catch (error) {
      addNotification('error', 'Error al copiar al portapapeles');
      console.error(error);
    }
  };

  const handleImportFromClipboard = async () => {
    try {
      await backupService.importFromClipboard();
      addNotification('success', 'Backup importado desde portapapeles');
    } catch (error) {
      addNotification('error', (error as Error).message);
      console.error(error);
    }
  };

  const handleClearData = () => {
    if (
      window.confirm(
        '⚠️ ¿Estás seguro de que deseas BORRAR TODOS LOS DATOS?\n\nEsta acción NO se puede deshacer.\n\nAsegúrate de tener un backup antes de continuar.'
      )
    ) {
      localStorage.clear();
      addNotification('success', 'Datos borrados. Recargando...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración"
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Demo Mode Info */}
        {isDemoMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  Modo DEMO Activo
                </h3>
                <p className="text-sm text-blue-700">
                  Los datos se guardan en el navegador (localStorage). Usa las
                  funciones de backup para conservar tus datos entre sesiones.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Backup Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Gestión de Datos
          </h3>

          <div className="space-y-3">
            {/* Export Backup */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Exportar Backup
                  </h4>
                  <p className="text-sm text-gray-600">
                    Descarga todos tus datos en un archivo JSON. Guárdalo para
                    no perder tu progreso.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={handleExportBackup}
                >
                  Descargar
                </Button>
              </div>
            </div>

            {/* Import Backup */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Importar Backup
                  </h4>
                  <p className="text-sm text-gray-600">
                    Restaura tus datos desde un archivo de backup. Esto
                    reemplazará todos los datos actuales.
                  </p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                  >
                    {importing ? 'Importando...' : 'Cargar'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Clipboard Options */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">
                  Opciones Rápidas
                </h4>
                <p className="text-sm text-gray-600">
                  Copia/pega datos usando el portapapeles (útil para compartir
                  entre sesiones).
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Copy}
                  onClick={handleExportToClipboard}
                >
                  Copiar al Portapapeles
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ClipboardPaste}
                  onClick={handleImportFromClipboard}
                >
                  Pegar desde Portapapeles
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zona de Peligro
          </h3>

          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1">
                  Borrar Todos los Datos
                </h4>
                <p className="text-sm text-red-700">
                  Elimina permanentemente todos los datos almacenados. Esta
                  acción NO se puede deshacer.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleClearData}
              >
                Borrar Todo
              </Button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            💡 Recomendaciones
          </h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Exporta un backup regularmente para no perder tu progreso</li>
            <li>
              Guarda los archivos de backup en un lugar seguro (ej: Google
              Drive)
            </li>
            <li>
              Antes de hacer cambios importantes, siempre exporta un backup
            </li>
            <li>
              Los backups son compatibles entre diferentes navegadores y
              computadoras
            </li>
          </ul>
        </div>
      </div>
    </DraggableModal>
  );
};
