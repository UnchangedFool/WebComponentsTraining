const Difference = (startDate, endDate) => {
    const daysToMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const fullMillisecs = endDate.getTime() - startDate.getTime();
    const fullSeconds = Math.round(fullMillisecs / 1000);
    const fullMinutes = Math.round(fullSeconds / 60);
    const fullHours = Math.round(fullMinutes / 60);
    const fullDays = Math.round(fullHours / 24);
    const fullMonths = endDate.getFullYear() * 12 +
        endDate.getMonth() -
        (startDate.getFullYear() * 12 + startDate.getMonth()) -
        (endDate.getDate() < startDate.getDate() ? 1 : 0);
    const fullYears = endDate.getFullYear() - startDate.getFullYear();

    const millisecs = fullMillisecs % 1000;
    const seconds = fullSeconds % 60;
    const minutes = fullMinutes % 60;
    const hours = fullHours % 24;
    const months = fullMonths % 12;
    const years = fullYears;

    const isLeapYear = (date) => {
        return (
            (date.getFullYear() % 4 === 0 || date.getFullYear() % 100 === 0) &&
            date.getFullYear() % 400 !== 0
        );
    };

    const dateInMonthTime = (date, month) => {
      const nextDate = new Date(date);

      return new Date(nextDate.setMonth(nextDate.getMonth() + month));
    };

    const calcRemainderDays = () => {
        const monthIndex = (i) => (startDate.getMonth() + i) % 12;
        const isLeapYearFor = (i) => i % 12 === 1 && isLeapYear(dateInMonthTime(startDate, i));
        const generateDaysForEachMonth = () =>
            Array.from(
                Array(fullMonths),
                (_, i) => daysToMonth[monthIndex(i)] + (isLeapYearFor(i) ? 1 : 0)
            );
        const subDays = generateDaysForEachMonth().reduce((acc, v) => acc + v, 0);

        return fullDays - subDays;
    };

    const days = calcRemainderDays();

    return Object.freeze({
        inFullMillisecs: () => fullMillisecs,
        inFullSeconds: () => fullSeconds,
        inFullMinutes: () => fullMinutes,
        inFullHours: () => fullHours,
        inFullDays: () => fullDays,
        inFullMonths: () => fullMonths,
        inFullYears: () => fullYears,
        toString: () => (
            "Years: " + years + " Months: " + months + " Days: " + days + " Hours: " + hours +
            " Minutes: " + minutes + " Seconds: " + seconds + " Millisecs: " + millisecs
        )
    });
};

const modeToIndex = {
    year: 5,
    month: 4,
    day: 3,
    hour: 2,
    minute: 1,
    second: 0,
};

const truncMethods = [
    Date.prototype.setMilliseconds,
    Date.prototype.setSeconds,
    Date.prototype.setMinutes,
    Date.prototype.setHours,
    Date.prototype.setDate,
    Date.prototype.setMonth,
];

const trunc = (date, mode = "day") => {
    const index = modeToIndex[mode];

    if (index === undefined) {
        throw "Incorrect trunc mode '" + mode + "'.";
    }

    const truncedDate = new Date(date);
    truncMethods.forEach((method, i) => {
        if (i <= index) {
            method.apply(truncedDate, [i === 4 ? 1 : 0]);
        }
    });

    return truncedDate;
};

  //https://stackoverflow.com/a/11888430
const isDst = (date) => {
    const stdTimeZoneOffset = () => {
        const jan = new Date(date.getFullYear(), 0, 1);
        const jul = new Date(date.getFullYear(), 6, 1);

        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    };

    return date.getTimezoneOffset() < stdTimeZoneOffset();
};

const dateFormater = (fmt) => {
    const formatItems = fmt.replace(/[^a-zA-Z0-9%]/g, "-").split("-");
    const yearIndex = formatItems.indexOf("%Y");
    const monthIndex = formatItems.indexOf("%M");
    const dayIndex = formatItems.indexOf("%d");
    const hourIndex = formatItems.indexOf("%H");
    const minuteIndex = formatItems.indexOf("%m");
    const secondIndex = formatItems.indexOf("%s");

    const datePad = (value) => value.toString().length < 2 ? "0" + value : value.toString();

    const takeSegment =
        (dateItems, segmentIdex) => isNaN(Number(dateItems[segmentIdex]))
            ? undefined
            : parseInt(dateItems[segmentIdex]);

    const splitDateString = (dateString) => {
        const normalized = dateString.replace(/[^0-9]/g, "-");
        const dateItems = normalized.split("-");

        return {
            year: takeSegment(dateItems, yearIndex),
            month: takeSegment(dateItems, monthIndex),
            day: takeSegment(dateItems, dayIndex),
            hour: takeSegment(dateItems, hourIndex),
            minute: takeSegment(dateItems, minuteIndex),
            second: takeSegment(dateItems, secondIndex)
        };
    };

    // Datum nach String
    // Beispiele:
    // formatDate(new Date(),"%d.%M.%Y");
    const formatDate = (date, toFmt) => {
        const usedFmt = toFmt || fmt;

        return usedFmt.replace(/%([a-zA-Z])/g, (_, fmtCode) => {
            switch (fmtCode) {
                case "Y":
                    return date.getFullYear().toString();
                case "M":
                    return datePad(date.getMonth() + 1);
                case "d":
                    return datePad(date.getDate());
                case "H":
                    return datePad(date.getHours());
                case "m":
                    return datePad(date.getMinutes());
                case "s":
                    return datePad(date.getSeconds());
                default:
                    throw new Error("Unsupported format code: " + fmtCode);
            }
        });
    };

    const isDate = (dateString) => {
        const splitted = typeof dateString === "string"
            ? splitDateString(dateString)
            : dateString;
        const isLeapYear = (splitted.year % 4 === 0 || splitted.year % 100 === 0) && splitted.year % 400 !== 0;
        const daysToMonth = [ 31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        const isYearCorrect = () => splitted.year !== undefined && splitted.year >= 0;
        const isMonthCorrect = () => splitted.month !== undefined && splitted.month >= 0 && splitted.month <= 11;
        const isDayCorrect = () => splitted.day !== undefined && splitted.day > 0 && splitted.day <= daysToMonth[splitted.month];
        const isHourCorrect = () => splitted.hour >= 0 && splitted.hour < 24;
        const isMinuteCorrect = () => splitted.minute >= 0 && splitted.minute <= 59;
        const isSecondCorrect = () => splitted.second >= 0 && splitted.second <= 59;

        return (
            isYearCorrect() && isMonthCorrect() && isDayCorrect() && isHourCorrect() && isMinuteCorrect() && isSecondCorrect()
        );
    };

    // Beispiele:
    // stringToDate("17.9.2014","%d.%M.%Y");
    const stringToDate = (dateString) => {
        const splitted = splitDateString(dateString);

        return isDate(splitted)
            ? new Date( splitted.year, splitted.month, splitted.day, splitted.hour, splitted.minute, splitted.second )
            : new Date(1900, 1, 1, 0, 0, 0);
    };

    return {
        stringToDate: stringToDate,
        isDate: isDate,
        dateToString: (date) => formatDate(date),
        convertToFormat: (toFmt, dateString) => formatDate(stringToDate(dateString), toFmt),
    };
};

const findFormat = (date) => {
    const formats = [
        "%Y-%M-%d %H:%m:%s",
        "%d-%M-%Y %H:%m:%s",
        "%Y-%M-%d %H:%m",
        "%d-%M-%Y %H:%m",
        "%Y-%M-%d",
        "%d-%M-%Y"
    ];

    return formats.reduce(
        (res, format) => {
            res.isDate = res.isDate || dateFormater(format).isDate(date);
            res.format = res.isDate && res.format === "" ? format : res.format;

            return res;
        }, { isDate: false, format: "" }
    );
};

export default {
    Difference: Difference,
    isDst: isDst,
    trunc: trunc,
    dateFormater: dateFormater,
    findFormat: findFormat
};
