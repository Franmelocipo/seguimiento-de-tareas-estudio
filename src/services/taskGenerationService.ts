import type { Client, DueDate, Task } from '../types';
import { taskService, dueDateService, standardTaskService } from './index';
import { addMonths, setDate, startOfMonth, endOfMonth } from 'date-fns';

export const taskGenerationService = {
  /**
   * Generate tasks for a specific client based on their assigned standard tasks
   * and due dates configuration
   */
  async generateTasksForClient(
    client: Client,
    targetMonth: Date
  ): Promise<Task[]> {
    const generatedTasks: Task[] = [];

    // Get all due dates
    const dueDates = await dueDateService.getAll();

    // Get client's assigned standard tasks
    const standardTasks = await standardTaskService.getAll();
    const assignedStandardTasks = standardTasks.filter((st) =>
      client.assignedStandardTasks.includes(st.id)
    );

    for (const standardTask of assignedStandardTasks) {
      // Find matching due dates for this standard task's type
      const matchingDueDates = dueDates.filter(
        (dd) => dd.taskTypeId === standardTask.taskTypeId
      );

      for (const dueDate of matchingDueDates) {
        // Check if this due date applies to the target month
        if (!this.shouldGenerateForMonth(dueDate, targetMonth, client)) {
          continue;
        }

        // Calculate the specific due date for this client
        const calculatedDueDate = this.calculateDueDate(
          dueDate,
          client,
          targetMonth
        );

        if (!calculatedDueDate) {
          continue;
        }

        // Create the task
        const task: Omit<Task, 'id'> = {
          title: `${standardTask.name} - ${client.name}`,
          description: standardTask.description,
          clientId: client.id,
          taskTypeId: standardTask.taskTypeId,
          standardTaskId: standardTask.id,
          status: 'pending',
          priority: false,
          dueDate: calculatedDueDate,
          requiredDocuments: standardTask.requiredDocuments,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const createdTask = await taskService.create(task);
        generatedTasks.push(createdTask);
      }
    }

    return generatedTasks;
  },

  /**
   * Generate tasks for all active clients
   */
  async generateTasksForAllClients(targetMonth: Date): Promise<{
    success: number;
    failed: number;
    total: number;
  }> {
    const clients = await this.getActiveClients();
    let success = 0;
    let failed = 0;

    for (const client of clients) {
      try {
        await this.generateTasksForClient(client, targetMonth);
        success++;
      } catch (error) {
        console.error(`Error generating tasks for client ${client.name}:`, error);
        failed++;
      }
    }

    return {
      success,
      failed,
      total: clients.length,
    };
  },

  /**
   * Check if a task should be generated for a specific month
   */
  shouldGenerateForMonth(
    dueDate: DueDate,
    targetMonth: Date,
    client: Client
  ): boolean {
    if (!dueDate.frequency) {
      return true;
    }

    const targetMonthNumber = targetMonth.getMonth() + 1;

    switch (dueDate.frequency) {
      case 'monthly':
        return true;

      case 'bimonthly':
        return targetMonthNumber % 2 === 0;

      case 'quarterly':
        return targetMonthNumber % 3 === 0;

      case 'annual':
        // For annual tasks, check if it's the right month after fiscal closing
        if (dueDate.monthOffset) {
          const dueMonth =
            ((client.fiscalClosingMonth + dueDate.monthOffset - 1) % 12) + 1;
          return targetMonthNumber === dueMonth;
        }
        return targetMonthNumber === client.fiscalClosingMonth;

      default:
        return true;
    }
  },

  /**
   * Calculate the specific due date for a client based on CUIT and rules
   */
  calculateDueDate(
    dueDate: DueDate,
    client: Client,
    targetMonth: Date
  ): Date | null {
    let dayOfMonth: number;

    // If there are CUIT-based rules, use them
    if (dueDate.cuitLastDigitRules) {
      const lastDigit = client.cuit.slice(-1);
      dayOfMonth = dueDate.cuitLastDigitRules[lastDigit];

      if (!dayOfMonth && dueDate.dayOfMonth) {
        dayOfMonth = dueDate.dayOfMonth;
      } else if (!dayOfMonth) {
        return null;
      }
    } else if (dueDate.dayOfMonth) {
      dayOfMonth = dueDate.dayOfMonth;
    } else {
      return null;
    }

    // Calculate the month for the due date
    let dueMonth = new Date(targetMonth);

    if (dueDate.monthOffset && dueDate.frequency === 'annual') {
      // For annual tasks with month offset, calculate based on fiscal closing
      const monthsFromClosing = dueDate.monthOffset;
      const fiscalClosingDate = new Date(
        targetMonth.getFullYear(),
        client.fiscalClosingMonth - 1,
        1
      );
      dueMonth = addMonths(fiscalClosingDate, monthsFromClosing);
    }

    // Set the day
    const calculatedDate = setDate(dueMonth, dayOfMonth);

    // Validate the date is within the target month (or the calculated month for annual tasks)
    if (
      calculatedDate >= startOfMonth(dueMonth) &&
      calculatedDate <= endOfMonth(dueMonth)
    ) {
      return calculatedDate;
    }

    return null;
  },

  /**
   * Get all active clients
   */
  async getActiveClients(): Promise<Client[]> {
    // Firestore query would be more efficient, but this works for the prototype
    const clients = await import('./index').then(m => m.clientService.getAll());
    return clients.filter((c) => c.active);
  },
};
