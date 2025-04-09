import axios, { AxiosError, AxiosProgressEvent } from 'axios';

const apiService = {
  /**
   * Sube un archivo al bucket S3
   * @param filename - Nombre del archivo (ej: "documento.pdf")
   * @param file - Objeto File del archivo a subir
   * @param onUploadProgress - Callback para progreso de subida
   * @returns Promise con {success: boolean}
   */
  uploadFile: async (
    filename: string, 
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<{success: boolean}> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log('Iniciando subida de:', filename);
      const response = await axios.put(
        `https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/folder/bucket-rodval/${filename}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress,
        }
      );
      
      console.log('Subida completada:', filename);
      return { success: response.data?.success || false };
    } catch (error: unknown) {
      console.error('Error en uploadFile:', {
        filename,
        error: error instanceof Error ? error.message : 'Error desconocido',
        responseData: (error as {response?: {data?: unknown}})?.response?.data
      });
      throw new Error('Error al subir el archivo');
    }
  },

  /**
   * Obtiene URL pública de un archivo en S3
   * @param filename - Nombre del archivo (ej: "documento.pdf")
   * @returns Promise con {url: string}
   */
  getFileUrl: async (filename: string): Promise<{url: string} | {error: string}> => {
    const url = 'https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject';
    console.log('🔍 URL completa:', `${url}?fileName=${encodeURIComponent(filename)}`);
  
    try {
      const response = await axios.post(url, { fileName: filename }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      console.log('📡 Respuesta del servidor:', response.data);
      return { url: response.data.url };
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as AxiosError;
        console.error('🔥 Error completo:', {
          message: axiosError.message,
          code: axiosError.code,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            data: axiosError.config?.data
          },
          response: axiosError.response?.data
        });
        return { error: axiosError.message };
      }
      return { error: 'Error desconocido al obtener URL del archivo' };
    }
  }
};

export default apiService;