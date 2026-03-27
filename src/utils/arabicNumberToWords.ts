const ones = ['','واحد','اثنان','ثلاثة','أربعة','خمسة', 'ستة','سبعة','ثمانية','تسعة','عشرة','أحد عشر', 'اثنا عشر','ثلاثة عشر','أربعة عشر','خمسة عشر', 'ستة عشر','سبعة عشر','ثمانية عشر','تسعة عشر']

const tens = ['','','عشرون','ثلاثون','أربعون','خمسون', 'ستون','سبعون','ثمانون','تسعون']

const hundreds = ['','مائة','مائتان','ثلاثمائة', 'أربعمائة','خمسمائة','ستمائة','سبعمائة', 'ثمانمائة','تسعمائة']


export function convertInteger(num: number): string {
    if (num === 0) return 'صفر';
    
    let result = '';

    if (num >= 1000) {
        const thousandPart = Math.floor(num / 1000);
        if (thousandPart === 1) {
            result += 'ألف ';
        } else if (thousandPart === 2) {
            result += 'ألفان ';
        } else if (thousandPart >= 3 && thousandPart <= 10) {
            result += convertInteger(thousandPart) + ' آلاف ';
        } else {
            result += convertInteger(thousandPart) + ' ألف ';
        }
        num %= 1000;
        if (num > 0) result += 'و';
    }

    if (num >= 100) {
        result += hundreds[Math.floor(num / 100)] + ' ';
        num %= 100;
        if (num > 0 && result.trim()) result += 'و';
    }

    if (num > 0) {
        if (num < 20) {
            result += ones[num] + ' ';
        } else {
            const onePart = num % 10;
            const tenPart = Math.floor(num / 10);
            if (onePart > 0) {
                result += ones[onePart] + ' و';
            }
            result += tens[tenPart] + ' ';
        }
    }

    return result.trim().replace(/\s+/g, ' ');
}

export function convertToArabicWords(amount: number): string {
  if (amount === 0) return 'صفر دينار جزائري فقط لا غير'

  const intPart = Math.floor(amount)
  const decPart = Math.round((amount - intPart) * 100)

  let result = convertInteger(intPart) + ' دينار جزائري'
  if (decPart > 0) {
    result += ' و' + convertInteger(decPart) + ' سنتيم'
  }
  return result + ' فقط لا غير'
}
