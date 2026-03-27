import { useEffect } from 'react';
import { ensureAnnualReportReminders } from '../../services/reports.service';

/**
 * Ensures the five standard annual report reminders exist for the given year (idempotent).
 * Intended to run on app load (e.g. Jan 1 cron on server is ideal; client runs once per session).
 */
export default function ReminderScheduler({ year }: { year?: number }) {
    useEffect(() => {
        const y = year ?? new Date().getFullYear();
        void ensureAnnualReportReminders(y);
    }, [year]);
    return null;
}
