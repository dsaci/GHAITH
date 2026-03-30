import { supabase } from '../lib/supabase';
import { MOCK_OCCASIONS, MOCK_MAILS, MOCK_MEETINGS } from '../data/mockData';

export const migrationService = {
    async migrate2023Data() {
        console.log('Starting refined migration of 2023 data...');
        const results = { occasions: 0, mails: 0, meetings: 0, errors: [] as string[] };

        try {
            // 1. Migrate Occasions (Activities/Plans)
            // We want 2023 data precisely for the archive
            const archiveOccasions = MOCK_OCCASIONS.filter(o => 
                (o.startDate && o.startDate.includes('2023')) || 
                o.status === 'completed'
            );
            
            for (const o of archiveOccasions) {
                const { error } = await supabase.from('occasions').upsert([{
                    title: o.title,
                    occasion_type: o.occasionType,
                    description: o.description,
                    start_date: o.startDate,
                    end_date: o.endDate,
                    location: o.location,
                    target_beneficiaries_count: o.targetBeneficiariesCount || 0,
                    actual_beneficiaries_count: o.actualBeneficiariesCount || 0,
                    budget_planned: o.budgetPlanned || 0,
                    budget_actual: o.budgetActual || 0,
                    status: 'completed',
                    responsible_member_name: o.responsibleMemberName || 'إدارة الجمعية'
                }], { onConflict: 'title' });
                
                if (error) {
                    console.error(`Error migrating occasion ${o.title}:`, error);
                    results.errors.push(`Occasion "${o.title}": ${error.message}`);
                } else {
                    results.occasions++;
                }
            }

            // 2. Migrate Mails
            for (const m of MOCK_MAILS) {
                const { error } = await supabase.from('mails').upsert([{
                    mail_number: m.mailNumber,
                    mail_direction: m.mailDirection,
                    subject: m.subject,
                    sender_or_recipient: m.senderOrRecipient,
                    mail_date: m.mailDate,
                    action_status: m.actionStatus || 'completed',
                    action_required: m.actionRequired,
                    action_deadline: m.actionDeadline
                }], { onConflict: 'mail_number' });

                if (error) {
                    console.error(`Error migrating mail ${m.mailNumber}:`, error);
                    results.errors.push(`Mail "${m.mailNumber}": ${error.message}`);
                } else {
                    results.mails++;
                }
            }

            // 3. Migrate Meetings
            for (const mt of MOCK_MEETINGS) {
                // Ensure arrays are initialized
                const { error } = await supabase.from('meetings').upsert([{
                    title: mt.title,
                    meeting_type: mt.meetingType,
                    meeting_date: mt.meetingDate,
                    location: mt.location,
                    agenda: mt.agenda || [],
                    attendees: mt.attendees || [],
                    decisions: mt.decisions || [],
                    status: mt.status || 'completed'
                }], { onConflict: 'title' });

                if (error) {
                    console.error(`Error migrating meeting ${mt.title}:`, error);
                    results.errors.push(`Meeting "${mt.title}": ${error.message}`);
                } else {
                    results.meetings++;
                }
            }

            console.log('Final Migration Results:', results);
            return results;
        } catch (err: any) {
            console.error('Migration crashed:', err);
            return { ...results, globalError: err.message };
        }
    }
};
