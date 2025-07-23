/**
 * Persian Datepicker - Optimized Version
 * High Performance Persian Calendar for Forms
 */

class PersianDatePicker {
    constructor() {
        this.persianMonths = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        
        this.persianDays = [
            'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
        ];
        
        this.init();
    }
    
    init() {
        // Auto-initialize all Persian date inputs
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeDatePickers();
        });
        
        // Handle dynamic content
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                this.initializeDatePickers();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    
    initializeDatePickers() {
        const dateInputs = document.querySelectorAll('input[type="date"], .persian-date-picker');
        
        dateInputs.forEach(input => {
            if (!input.hasAttribute('data-persian-initialized')) {
                this.createDatePicker(input);
                input.setAttribute('data-persian-initialized', 'true');
            }
        });
    }
    
    createDatePicker(input) {
        // Convert to text input for better control
        input.type = 'text';
        input.placeholder = 'YYYY/MM/DD - مثال: ۱۴۰۳/۰۲/۱۵';
        input.setAttribute('maxlength', '10');
        input.classList.add('persian-date-input');
        
        // Add calendar icon
        this.addCalendarIcon(input);
        
        // Add event listeners
        input.addEventListener('focus', (e) => this.showCalendar(e.target));
        input.addEventListener('input', (e) => this.formatInput(e.target));
        input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Set today's date if empty
        if (!input.value) {
            const today = new Date();
            const persianDate = this.gregorianToPersian(today.getFullYear(), today.getMonth() + 1, today.getDate());
            input.value = this.formatPersianDate(persianDate);
        }
    }
    
    addCalendarIcon(input) {
        const wrapper = document.createElement('div');
        wrapper.className = 'persian-date-wrapper position-relative';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        const icon = document.createElement('span');
        icon.className = 'persian-date-icon position-absolute';
        icon.innerHTML = '<i class="fas fa-calendar-alt"></i>';
        icon.style.cssText = `
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
            cursor: pointer;
            z-index: 10;
        `;
        
        wrapper.appendChild(icon);
        
        icon.addEventListener('click', () => {
            input.focus();
            this.showCalendar(input);
        });
    }
    
    formatInput(input) {
        let value = input.value.replace(/[^\d]/g, '');
        
        if (value.length >= 4) {
            value = value.substring(0, 4) + '/' + value.substring(4);
        }
        if (value.length >= 7) {
            value = value.substring(0, 7) + '/' + value.substring(7, 9);
        }
        
        // Convert to Persian numbers
        value = this.toPersianNumber(value);
        input.value = value;
    }
    
    showCalendar(input) {
        // Remove existing calendar
        const existingCalendar = document.querySelector('.persian-calendar-popup');
        if (existingCalendar) {
            existingCalendar.remove();
        }
        
        const calendar = this.createCalendarPopup();
        document.body.appendChild(calendar);
        
        // Position calendar
        const rect = input.getBoundingClientRect();
        calendar.style.cssText = `
            position: fixed;
            top: ${rect.bottom + window.scrollY + 5}px;
            left: ${rect.left + window.scrollX}px;
            z-index: 9999;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 15px;
            min-width: 280px;
            direction: rtl;
        `;
        
        // Handle clicks outside calendar
        setTimeout(() => {
            document.addEventListener('click', function closeCalendar(e) {
                if (!calendar.contains(e.target) && e.target !== input) {
                    calendar.remove();
                    document.removeEventListener('click', closeCalendar);
                }
            });
        }, 100);
        
        // Set calendar to current date or today
        let currentDate;
        if (input.value) {
            const persianDate = this.parsePersianDate(input.value);
            if (persianDate) {
                currentDate = persianDate;
            } else {
                const today = new Date();
                currentDate = this.gregorianToPersian(today.getFullYear(), today.getMonth() + 1, today.getDate());
            }
        } else {
            const today = new Date();
            currentDate = this.gregorianToPersian(today.getFullYear(), today.getMonth() + 1, today.getDate());
        }
        
        this.renderCalendarMonth(calendar, currentDate, input);
    }
    
    createCalendarPopup() {
        const calendar = document.createElement('div');
        calendar.className = 'persian-calendar-popup';
        return calendar;
    }
    
    renderCalendarMonth(calendar, date, input) {
        const [year, month, day] = date;
        
        calendar.innerHTML = `
            <div class="calendar-header d-flex justify-content-between align-items-center mb-3">
                <button type="button" class="btn btn-sm btn-outline-primary prev-month">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="current-month-year">
                    <span class="persian-month">${this.persianMonths[month - 1]}</span>
                    <span class="persian-year">${this.toPersianNumber(year.toString())}</span>
                </div>
                <button type="button" class="btn btn-sm btn-outline-primary next-month">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-days-header">
                    ${this.persianDays.map(day => `<div class="day-header">${day}</div>`).join('')}
                </div>
                <div class="calendar-days-body">
                    ${this.generateCalendarDays(year, month, day)}
                </div>
            </div>
            <div class="calendar-footer mt-3">
                <button type="button" class="btn btn-sm btn-success today-btn">امروز</button>
                <button type="button" class="btn btn-sm btn-secondary close-btn">بستن</button>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .persian-calendar-popup .calendar-grid {
                display: grid;
                grid-template-rows: auto 1fr;
            }
            .persian-calendar-popup .calendar-days-header {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 2px;
                margin-bottom: 5px;
            }
            .persian-calendar-popup .day-header {
                text-align: center;
                font-weight: bold;
                padding: 8px 4px;
                font-size: 12px;
                color: #666;
            }
            .persian-calendar-popup .calendar-days-body {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 2px;
            }
            .persian-calendar-popup .calendar-day {
                text-align: center;
                padding: 8px 4px;
                cursor: pointer;
                border-radius: 4px;
                font-size: 13px;
                transition: all 0.2s;
            }
            .persian-calendar-popup .calendar-day:hover {
                background: #e9ecef;
            }
            .persian-calendar-popup .calendar-day.selected {
                background: #007bff;
                color: white;
            }
            .persian-calendar-popup .calendar-day.other-month {
                color: #ccc;
            }
            .persian-calendar-popup .calendar-footer {
                display: flex;
                justify-content: space-between;
            }
        `;
        calendar.appendChild(style);
        
        // Add event listeners
        this.addCalendarEventListeners(calendar, input, year, month);
    }
    
    generateCalendarDays(year, month, selectedDay) {
        const daysInMonth = this.getDaysInPersianMonth(year, month);
        const firstDayOfWeek = this.getPersianDayOfWeek(year, month, 1);
        
        let days = '';
        
        // Previous month days
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const daysInPrevMonth = this.getDaysInPersianMonth(prevYear, prevMonth);
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            days += `<div class="calendar-day other-month" data-year="${prevYear}" data-month="${prevMonth}" data-day="${day}">
                ${this.toPersianNumber(day.toString())}
            </div>`;
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = day === selectedDay ? 'selected' : '';
            days += `<div class="calendar-day ${isSelected}" data-year="${year}" data-month="${month}" data-day="${day}">
                ${this.toPersianNumber(day.toString())}
            </div>`;
        }
        
        // Next month days
        const totalCells = Math.ceil((daysInMonth + firstDayOfWeek) / 7) * 7;
        const remainingCells = totalCells - (daysInMonth + firstDayOfWeek);
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        
        for (let day = 1; day <= remainingCells; day++) {
            days += `<div class="calendar-day other-month" data-year="${nextYear}" data-month="${nextMonth}" data-day="${day}">
                ${this.toPersianNumber(day.toString())}
            </div>`;
        }
        
        return days;
    }
    
    addCalendarEventListeners(calendar, input, currentYear, currentMonth) {
        // Day selection
        calendar.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', () => {
                const year = parseInt(day.dataset.year);
                const month = parseInt(day.dataset.month);
                const dayNum = parseInt(day.dataset.day);
                
                const persianDate = this.formatPersianDate([year, month, dayNum]);
                input.value = persianDate;
                
                // Trigger change event
                input.dispatchEvent(new Event('change', { bubbles: true }));
                
                calendar.remove();
            });
        });
        
        // Month navigation
        calendar.querySelector('.prev-month').addEventListener('click', () => {
            const newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const newYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            this.renderCalendarMonth(calendar, [newYear, newMonth, 1], input);
        });
        
        calendar.querySelector('.next-month').addEventListener('click', () => {
            const newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
            const newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
            this.renderCalendarMonth(calendar, [newYear, newMonth, 1], input);
        });
        
        // Today button
        calendar.querySelector('.today-btn').addEventListener('click', () => {
            const today = new Date();
            const persianToday = this.gregorianToPersian(today.getFullYear(), today.getMonth() + 1, today.getDate());
            input.value = this.formatPersianDate(persianToday);
            input.dispatchEvent(new Event('change', { bubbles: true }));
            calendar.remove();
        });
        
        // Close button
        calendar.querySelector('.close-btn').addEventListener('click', () => {
            calendar.remove();
        });
    }
    
    // Utility methods
    toPersianNumber(str) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return str.replace(/[0-9]/g, (match) => persianDigits[parseInt(match)]);
    }
    
    toEnglishNumber(str) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        let result = str;
        persianDigits.forEach((persian, index) => {
            result = result.replace(new RegExp(persian, 'g'), index.toString());
        });
        return result;
    }
    
    formatPersianDate(dateArray) {
        const [year, month, day] = dateArray;
        const formattedYear = year.toString().padStart(4, '0');
        const formattedMonth = month.toString().padStart(2, '0');
        const formattedDay = day.toString().padStart(2, '0');
        return this.toPersianNumber(`${formattedYear}/${formattedMonth}/${formattedDay}`);
    }
    
    parsePersianDate(dateString) {
        const englishDate = this.toEnglishNumber(dateString);
        const parts = englishDate.split('/');
        if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const day = parseInt(parts[2]);
            if (year > 1300 && year < 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                return [year, month, day];
            }
        }
        return null;
    }
    
    // Persian calendar calculations
    gregorianToPersian(gy, gm, gd) {
        const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        const jy = gy <= 1600 ? 0 : 979;
        gy -= gy <= 1600 ? 621 : 1600;
        const gy2 = gm > 2 ? gy + 1 : gy;
        const days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
        let jy_calc = -14;
        let jp = 0;
        
        while (jy_calc < days) {
            const tmp = jy_calc;
            jy_calc += this.isLeapPersianYear(jy + jp) ? 366 : 365;
            if (jy_calc >= days) {
                jy_calc = tmp;
                break;
            }
            jp++;
        }
        
        const remaining_days = days - jy_calc;
        const jm = remaining_days <= 186 ? Math.ceil(remaining_days / 31) : Math.ceil((remaining_days - 6) / 30);
        const jd = remaining_days <= 186 ? 
            remaining_days - 31 * (jm - 1) : 
            remaining_days - 31 * 6 - 30 * (jm - 7);
            
        return [jy + jp, jm || 12, jd || 1];
    }
    
    isLeapPersianYear(year) {
        const breaks = [
            -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
            1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
        ];
        
        let gy = year + 1029;
        let jp = breaks.length;
        let jump = 0;
        
        for (let j = 1; j < breaks.length; j++) {
            const jm = breaks[j];
            jump = jm - breaks[j - 1];
            if (year < jm) {
                jp = j;
                break;
            }
        }
        
        const n = year - breaks[jp - 1];
        
        if (n < jump) {
            if (jump - n < 6) {
                n = n - jump + ((Math.floor(jump / 33)) * 33);
            }
            const leap = ((n + 1) % 33) % 4;
            if (jump === 33 && leap === 1) {
                return true;
            }
            return leap === 1;
        }
        
        return false;
    }
    
    getDaysInPersianMonth(year, month) {
        if (month <= 6) return 31;
        if (month <= 11) return 30;
        return this.isLeapPersianYear(year) ? 30 : 29;
    }
    
    getPersianDayOfWeek(year, month, day) {
        const gregorian = this.persianToGregorian(year, month, day);
        const date = new Date(gregorian[0], gregorian[1] - 1, gregorian[2]);
        return (date.getDay() + 1) % 7;
    }
    
    persianToGregorian(jy, jm, jd) {
        let gy = jy <= 979 ? 1600 : 979;
        jy -= jy <= 979 ? 0 : 979;
        const jp = Math.floor(jy / 33) * 12053 + Math.floor((jy % 33 + 3) / 4) * 365 + Math.floor(((jy % 33) % 4 + 1) / 4) * 366;
        let jdays = jp + (jm <= 6 ? (jm - 1) * 31 : (jm - 7) * 30 + 186) + jd;
        
        const gy2 = Math.floor(jdays / 365.25);
        jdays -= Math.floor(gy2 * 365.25);
        gy += gy2;
        
        const sal_a = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        
        if ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) {
            sal_a[2] = 29;
        }
        
        let gm = 0;
        for (let i = 0; i < 13; i++) {
            const v = sal_a[i];
            if (jdays <= v) {
                gm = i;
                break;
            }
            jdays -= v;
        }
        
        return [gy, gm, jdays];
    }
    
    handleKeyDown(e) {
        // Allow: backspace, delete, tab, escape, enter
        if ([46, 8, 9, 27, 13].includes(e.keyCode) ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        // Ensure that it is a number or Persian number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
            (e.keyCode < 96 || e.keyCode > 105) &&
            ![47, 191].includes(e.keyCode)) { // Allow forward slash
            e.preventDefault();
        }
    }
}

// Initialize Persian DatePicker
window.PersianDatePickerInstance = new PersianDatePicker();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersianDatePicker;
}