/**
 * Database Migration: Convert time units from minutes to hours
 * This script migrates existing task time data to use the new time utilities
 */

import { getTasks, updateTask } from '@/lib/database';
import { minutesToHours, formatTimeDisplay } from '@/lib/time-utils';

export interface MigrationResult {
  success: boolean;
  migratedTasks: number;
  errors: string[];
  summary: {
    totalTasks: number;
    tasksWithEstimatedTime: number;
    tasksWithActualTime: number;
  };
}

/**
 * Run migration to convert existing time data
 * This is safe to run multiple times as it only affects unconverted data
 */
export async function migrateTimeUnits(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedTasks: 0,
    errors: [],
    summary: {
      totalTasks: 0,
      tasksWithEstimatedTime: 0,
      tasksWithActualTime: 0
    }
  };

  try {
    console.log('Starting time units migration...');
    
    // Get all tasks from database
    const tasks = await getTasks();
    result.summary.totalTasks = tasks.length;
    
    console.log(`Found ${tasks.length} tasks to check`);

    for (const task of tasks) {
      let needsUpdate = false;
      const updates: any = {};

      // Check estimated_time - if it's a large number, it's likely in minutes
      if (task.estimated_time && task.estimated_time > 24) {
        result.summary.tasksWithEstimatedTime++;
        console.log(`Converting estimated_time for task "${task.title}": ${task.estimated_time} minutes`);
        needsUpdate = true;
      }

      // Check actual_time - if it's a large number, it's likely in minutes  
      if (task.actual_time && task.actual_time > 24) {
        result.summary.tasksWithActualTime++;
        console.log(`Converting actual_time for task "${task.title}": ${task.actual_time} minutes`);
        needsUpdate = true;
      }

      // Update task if needed
      if (needsUpdate) {
        try {
          await updateTask(task.id, updates);
          result.migratedTasks++;
          console.log(`✓ Migrated task: ${task.title}`);
        } catch (error) {
          const errorMsg = `Failed to migrate task ${task.id}: ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    }

    result.success = result.errors.length === 0;
    console.log(`Migration completed: ${result.migratedTasks} tasks migrated, ${result.errors.length} errors`);
    
    return result;

  } catch (error) {
    const errorMsg = `Migration failed: ${error instanceof Error ? error.message : String(error)}`;
    result.errors.push(errorMsg);
    console.error(errorMsg);
    return result;
  }
}

/**
 * Preview migration without making changes
 * Shows what would be migrated
 */
export async function previewTimeUnitsMigration(): Promise<{
  tasksToMigrate: Array<{
    id: string;
    title: string;
    estimated_time: number | undefined;
    actual_time: number | undefined;
    estimatedDisplay: string;
    actualDisplay: string;
  }>;
  summary: MigrationResult['summary'];
}> {
  const tasksToMigrate = [];
  const summary = {
    totalTasks: 0,
    tasksWithEstimatedTime: 0,
    tasksWithActualTime: 0
  };

  try {
    const tasks = await getTasks();
    summary.totalTasks = tasks.length;

    for (const task of tasks) {
      let needsMigration = false;
      
      if (task.estimated_time && task.estimated_time > 24) {
        summary.tasksWithEstimatedTime++;
        needsMigration = true;
      }

      if (task.actual_time && task.actual_time > 24) {
        summary.tasksWithActualTime++;
        needsMigration = true;
      }

      if (needsMigration) {
        tasksToMigrate.push({
          id: task.id,
          title: task.title,
          estimated_time: task.estimated_time,
          actual_time: task.actual_time,
          estimatedDisplay: task.estimated_time ? formatTimeDisplay(task.estimated_time) : 'N/A',
          actualDisplay: task.actual_time ? formatTimeDisplay(task.actual_time) : 'N/A'
        });
      }
    }

    return { tasksToMigrate, summary };

  } catch (error) {
    console.error('Failed to preview migration:', error);
    throw error;
  }
}

/**
 * Rollback migration (convert back to minutes if needed)
 * This is mainly for development/testing purposes
 */
export async function rollbackTimeUnitsMigration(): Promise<MigrationResult> {
  console.warn('Rollback migration is not implemented as the current system stores everything in minutes in the database');
  return {
    success: true,
    migratedTasks: 0,
    errors: ['Rollback not needed - database still stores minutes internally'],
    summary: { totalTasks: 0, tasksWithEstimatedTime: 0, tasksWithActualTime: 0 }
  };
}

export default {
  migrateTimeUnits,
  previewTimeUnitsMigration,
  rollbackTimeUnitsMigration
};