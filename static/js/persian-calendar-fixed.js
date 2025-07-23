// Fixed Persian Calendar Implementation
class PersianCalendar {
    constructor() {
        this.persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 
                             'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
        this.persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
        this.currentPersianDate = this.getCurrentPersianDate();
        this.holidays = this.getIranianHolidays();
    }
    
    // Convert Gregorian to Persian (Jalali)
    gregorianToPersian(gYear, gMonth, gDay) {
        const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        let jy, jp, ja, jm, jd;
        
        if (gYear <= 1600) {
            jy = 0; jp = 0;
        } else {
            jy = 979;
            gYear -= 1600;
            jp = 365 * gYear + Math.floor((gYear + 3) / 4) - Math.floor((gYear + 99) / 100) + Math.floor((gYear + 399) / 400) - 80 + gDay + g_d_m[gMonth - 1];
        }
        
        if (gMonth > 2) {
            if (((gYear % 4 === 0) && (gYear % 100 !== 0)) || (gYear % 400 === 0)) {
                jp++;
            }
        }
        
        ja = jp + 1948321;
        
        if (jp < 366) {
            jy += 1029;
            jp = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + 78 + jp;
        } else {
            jy += 1029;
            jp = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + 78 + jp;
        }
        
        jy = Math.floor(jp / 365.25);
        jp = jp - Math.floor(jy * 365.25);
        
        if (jp < 186) {
            jm = 1 + Math.floor(jp / 31);
            jd = 1 + jp % 31;
        } else {
            jm = 7 + Math.floor((jp - 186) / 30);
            jd = 1 + (jp - 186) % 30;
        }
        
        return {
            year: jy + 1371,
            month: jm,
            day: jd
        };
    }
    
    getCurrentPersianDate() {
        const now = new Date();
        return this.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
    
    getIranianHolidays() {
        return {
            '1/1': 'نوروز - جشن سال نو',
            '1/2': 'عید نوروز',
            '1/3': 'عید نوروز',
            '1/4': 'عید نوروز',
            '1/12': 'روز جمهوری اسلامی',
            '1/13': 'روز طبیعت (سیزده‌بدر)',
            '3/14': 'رحلت امام خمینی',
            '3/15': 'قیام پانزده خرداد',
            '11/22': 'پیروزی انقلاب اسلامی'
        };
    }
    
    renderCalendar(year, month) {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;
        
        const monthName = this.persianMonths[month - 1];
        document.getElementById('current-month').textContent = `${monthName} ${year}`;
        
        // Create calendar grid
        let calendarHTML = '<table class="calendar-table table table-bordered">';
        calendarHTML += '<thead><tr>';
        
        // Day headers
        this.persianDays.forEach(day => {
            calendarHTML += `<th class="text-center">${day}</th>`;
        });
        calendarHTML += '</tr></thead><tbody>';
        
        // Calculate first day of month and days in month
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = this.getDaysInPersianMonth(year, month);
        const adjustedFirstDay = (firstDay + 1) % 7; // Adjust for Saturday start
        
        let date = 1;
        for (let week = 0; week < 6; week++) {
            calendarHTML += '<tr>';
            for (let day = 0; day < 7; day++) {
                if (week === 0 && day < adjustedFirstDay) {
                    calendarHTML += '<td></td>';
                } else if (date > daysInMonth) {
                    calendarHTML += '<td></td>';
                } else {
                    const isToday = (year === this.currentPersianDate.year && 
                                   month === this.currentPersianDate.month && 
                                   date === this.currentPersianDate.day);
                    const holidayKey = `${month}/${date}`;
                    const isHoliday = this.holidays[holidayKey];
                    
                    let cellClass = 'calendar-day';
                    if (isToday) cellClass += ' today';
                    if (isHoliday) cellClass += ' holiday';
                    
                    calendarHTML += `<td class="${cellClass}" onclick="selectDate(${year}, ${month}, ${date})" title="${isHoliday || ''}">`;
                    calendarHTML += `<div class="date-number">${this.toPersianDigits(date)}</div>`;
                    if (isHoliday) {
                        calendarHTML += `<div class="holiday-name">${isHoliday}</div>`;
                    }
                    calendarHTML += '</td>';
                    date++;
                }
            }
            calendarHTML += '</tr>';
            if (date > daysInMonth) break;
        }
        
        calendarHTML += '</tbody></table>';
        calendarEl.innerHTML = calendarHTML;
    }
    
    getDaysInPersianMonth(year, month) {
        if (month <= 6) return 31;
        if (month <= 11) return 30;
        return this.isPersianLeapYear(year) ? 30 : 29;
    }
    
    isPersianLeapYear(year) {
        return ((year + 1029) % 33) % 4 === 1;
    }
    
    toPersianDigits(num) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, (digit) => persianDigits[digit]);
    }
    
    updateTodayInfo() {
        const current = this.currentPersianDate;
        const gregorianDate = new Date();
        
        document.getElementById('today-persian-date').textContent = 
            `${this.toPersianDigits(current.day)} ${this.persianMonths[current.month - 1]} ${this.toPersianDigits(current.year)}`;
        
        document.getElementById('today-gregorian-date').textContent = 
            gregorianDate.toLocaleDateString('fa-IR');
        
        document.getElementById('today-weekday').textContent = 
            this.persianDays[gregorianDate.getDay()];
        
        const seasons = ['بهار', 'تابستان', 'پاییز', 'زمستان'];
        const seasonIndex = Math.floor((current.month - 1) / 3);
        document.getElementById('today-season').textContent = seasons[seasonIndex];
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const calendar = new PersianCalendar();
    const current = calendar.currentPersianDate;
    
    calendar.renderCalendar(current.year, current.month);
    calendar.updateTodayInfo();
    
    // Navigation functions
    window.previousMonth = function() {
        // Implementation for previous month navigation
    };
    
    window.nextMonth = function() {
        // Implementation for next month navigation
    };
    
    window.selectDate = function(year, month, day) {
        console.log(`Selected: ${day}/${month}/${year}`);
        // Add reminder functionality here
    };
});