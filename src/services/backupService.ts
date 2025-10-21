/**
 * Backup and Restore service for localStorage data
 */

interface BackupData {
  version: string;
  timestamp: string;
  isDemoMode: boolean;
  data: {
    [key: string]: any;
  };
}

export const backupService = {
  /**
   * Export all localStorage data to a JSON file
   */
  exportBackup(): void {
    try {
      // Get all localStorage keys
      const allData: { [key: string]: any } = {};

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              // Try to parse as JSON
              allData[key] = JSON.parse(value);
            } catch {
              // If not JSON, store as string
              allData[key] = value;
            }
          }
        }
      }

      // Create backup object
      const backup: BackupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        isDemoMode: true,
        data: allData,
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(backup, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-estudio-contable-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log('✅ Backup exportado correctamente');
    } catch (error) {
      console.error('❌ Error al exportar backup:', error);
      throw new Error('Error al exportar backup: ' + (error as Error).message);
    }
  },

  /**
   * Import backup from a JSON file
   */
  async importBackup(file: File): Promise<void> {
    try {
      // Read file
      const text = await file.text();
      const backup: BackupData = JSON.parse(text);

      // Validate backup format
      if (!backup.version || !backup.data) {
        throw new Error('Formato de backup inválido');
      }

      // Confirm with user
      const itemCount = Object.keys(backup.data).length;
      const confirm = window.confirm(
        `¿Deseas importar este backup?\n\n` +
        `Fecha: ${new Date(backup.timestamp).toLocaleString('es-AR')}\n` +
        `Items: ${itemCount}\n\n` +
        `⚠️ ADVERTENCIA: Esto reemplazará TODOS los datos actuales.`
      );

      if (!confirm) {
        return;
      }

      // Clear current localStorage
      localStorage.clear();

      // Import all data
      for (const [key, value] of Object.entries(backup.data)) {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }

      console.log('✅ Backup importado correctamente');

      // Reload page to apply changes
      window.location.reload();
    } catch (error) {
      console.error('❌ Error al importar backup:', error);
      throw new Error('Error al importar backup: ' + (error as Error).message);
    }
  },

  /**
   * Get backup info without importing
   */
  async getBackupInfo(file: File): Promise<{
    version: string;
    timestamp: Date;
    itemCount: number;
  }> {
    try {
      const text = await file.text();
      const backup: BackupData = JSON.parse(text);

      return {
        version: backup.version,
        timestamp: new Date(backup.timestamp),
        itemCount: Object.keys(backup.data).length,
      };
    } catch (error) {
      throw new Error('No se pudo leer el archivo de backup');
    }
  },

  /**
   * Quick backup to clipboard (for quick sharing)
   */
  async exportToClipboard(): Promise<void> {
    try {
      const allData: { [key: string]: any } = {};

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              allData[key] = JSON.parse(value);
            } catch {
              allData[key] = value;
            }
          }
        }
      }

      const backup: BackupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        isDemoMode: true,
        data: allData,
      };

      await navigator.clipboard.writeText(JSON.stringify(backup, null, 2));
      console.log('✅ Backup copiado al portapapeles');
    } catch (error) {
      throw new Error('Error al copiar al portapapeles');
    }
  },

  /**
   * Import from clipboard
   */
  async importFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      const backup: BackupData = JSON.parse(text);

      if (!backup.version || !backup.data) {
        throw new Error('Formato de backup inválido');
      }

      const confirm = window.confirm(
        `¿Deseas importar este backup del portapapeles?\n\n` +
        `⚠️ ADVERTENCIA: Esto reemplazará TODOS los datos actuales.`
      );

      if (!confirm) {
        return;
      }

      localStorage.clear();

      for (const [key, value] of Object.entries(backup.data)) {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }

      console.log('✅ Backup importado desde portapapeles');
      window.location.reload();
    } catch (error) {
      throw new Error('Error al importar desde portapapeles: ' + (error as Error).message);
    }
  },
};
