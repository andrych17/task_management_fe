import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TaskStatus } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    return 'Invalid date';
  }
}

export function isOverdue(dueDate?: string | null, status?: TaskStatus): boolean {
  if (!dueDate || status === 'done') return false;
  
  try {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return due < today;
  } catch (error) {
    return false;
  }
}

export function isDueSoon(dueDate?: string | null, status?: TaskStatus): boolean {
  if (!dueDate || status === 'done') return false;
  
  try {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return due >= today && due <= threeDaysFromNow;
  } catch (error) {
    return false;
  }
}

