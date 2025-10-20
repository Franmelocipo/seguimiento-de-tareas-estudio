import type { AITaskBreakdownRequest, AIEmailRequest, AIResponse, Subtask } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;
const AI_API_ENDPOINT = import.meta.env.VITE_AI_API_ENDPOINT || 'https://api.anthropic.com/v1/messages';

export const aiService = {
  // Generate task breakdown
  async generateTaskBreakdown(request: AITaskBreakdownRequest): Promise<AIResponse> {
    try {
      if (!AI_API_KEY) {
        throw new Error('API key de IA no configurada');
      }

      const prompt = `Eres un asistente especializado en contabilidad argentina.
Desglose la siguiente tarea en subtareas específicas y detalladas:

Título: ${request.taskTitle}
Tipo: ${request.taskType}
${request.taskDescription ? `Descripción: ${request.taskDescription}` : ''}

Proporciona una lista de 3-8 subtareas específicas y ordenadas que un contador debería realizar para completar esta tarea.
Responde ÚNICAMENTE con un array JSON de strings, sin explicaciones adicionales.

Ejemplo de formato de respuesta:
["Subtarea 1", "Subtarea 2", "Subtarea 3"]`;

      const response = await fetch(AI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AI_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con la IA');
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Respuesta de IA en formato inesperado');
      }

      const subtasksArray: string[] = JSON.parse(jsonMatch[0]);
      const subtasks: Subtask[] = subtasksArray.map((title, index) => ({
        id: crypto.randomUUID(),
        title,
        completed: false,
        order: index,
      }));

      return {
        success: true,
        data: subtasks,
      };
    } catch (error) {
      console.error('Error generating task breakdown:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  // Generate email draft
  async generateEmailDraft(request: AIEmailRequest): Promise<AIResponse> {
    try {
      if (!AI_API_KEY) {
        throw new Error('API key de IA no configurada');
      }

      const formattedDate = format(request.dueDate, "d 'de' MMMM 'de' yyyy", {
        locale: es,
      });

      const documentsText = request.requiredDocuments?.length
        ? `\n\nDocumentación requerida:\n${request.requiredDocuments.map(doc => `- ${doc}`).join('\n')}`
        : '';

      const prompt = `Eres un asistente de un estudio contable argentino. Redacta un email profesional y cordial para un cliente.

Cliente: ${request.clientName}
Tarea: ${request.taskTitle}
Fecha de vencimiento: ${formattedDate}${documentsText}

El email debe:
1. Ser cordial y profesional
2. Recordar el vencimiento próximo
3. Solicitar la documentación necesaria (si aplica)
4. Ofrecer disponibilidad para consultas
5. Tener un asunto apropiado

Proporciona la respuesta en formato JSON con esta estructura exacta:
{
  "subject": "Asunto del email",
  "body": "Cuerpo del email con saltos de línea apropiados"
}`;

      const response = await fetch(AI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AI_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con la IA');
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Respuesta de IA en formato inesperado');
      }

      const emailData = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        data: emailData,
      };
    } catch (error) {
      console.error('Error generating email draft:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },
};
