export class DateFormatting {
    static daysOfWeek = [
        "SUN",
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT"
    ];

    static months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC"
    ];

    // форматирование для строки с минутами
    checkMinutesZero(minutes) {
        if (minutes == "0") { minutes = "00"; }
        if ((minutes >= 0 && minutes < 10) && minutes != "00") { minutes = `0${minutes}`; }
        return minutes;
    }

    // получение даты из секунд
    getDateFromSeconds(seconds) {
        return new Date(seconds * 1000);
    }

    // получение формата 'час:минут' из даты
    getHourMinutes(date) {
        return `${date.getUTCHours()}:${this.checkMinutesZero(date.getUTCMinutes())}`;
    }

    // получение формата 'час:минут' из секунд учитывая таймзону
    getFromSecondsHM(seconds, timezoneOffsetSeconds) {
        const localTime = this.getDateFromSeconds(seconds + timezoneOffsetSeconds);
        return this.getHourMinutes(localTime);
    }

    // получение формата 'час:минут' из разницы секунд
    getDurationDateHM(seconds1, seconds2) {
        const durationDate = this.getDateFromSeconds(seconds2 - seconds1);
        return this.getHourMinutes(durationDate);
    }

    // получение текущей даты учитывая таймзону
    getDateNow(timezoneOffsetSeconds) {
        const dateInTimeZone = new Date(Date.now() + timezoneOffsetSeconds * 1000);
        
        // коррекция времени, чтобы получить локальное время, учитывая смещение
        dateInTimeZone.setMinutes(dateInTimeZone.getMinutes() + dateInTimeZone.getTimezoneOffset());
        return dateInTimeZone.toLocaleDateString();
    }

    // получение текущего дня недели
    getDayFromSeconds(seconds, timezoneOffsetSeconds) {
        const d = this.getDateFromSeconds(seconds + timezoneOffsetSeconds);
        return DateFormatting.daysOfWeek[d.getUTCDay()];
    }

    // получение формата 'МЕСЯЦ ДАТА час:минут'
    getFromSecondsMDHM(seconds, timezoneOffsetSeconds) {
        const d = this.getDateFromSeconds(seconds + timezoneOffsetSeconds);
        return `${DateFormatting.months[d.getUTCMonth()]} ${d.getUTCDate()} (${this.getHourMinutes(d)})`;
    }
}
