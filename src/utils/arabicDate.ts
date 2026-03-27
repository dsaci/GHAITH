export function formatArabicDate(date: string | Date): string {
  const months = [
    'جانفي','فيفري','مارس','أبريل','ماي','جوان',
    'جويلية','أوت','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
  ]
  const d = new Date(date)
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
