import DateUtility from "./date-utility.js";
import { has } from "./utility.js"

const db = DateUtility.dateFormater("%Y-%M-%d %H:%m:%s");
const user = DateUtility.dateFormater("%d.%M.%Y %H:%m:%s");

const typeguard = (dateString, formater, format) => {
    if (dateString === null) {
        return "";
    }

    if (typeof(dateString) === "string") {
        const foundformat = DateUtility.findFormat(dateString);
        const foundformater = DateUtility.dateFormater(foundformat.format);

        return foundformater.convertToFormat(format, dateString);
    }

    if (!has("toISOString", dateString)) {
        return formater.convertToFormat(format, formater.dateToString(dateString));
    }

    return "FALSCHER DATENTYP: " + typeof(dateString);
};

const preprocess = (dateString, formater, format) => {
    return dateString === undefined
        ? "UNDEFINED"
        : typeguard(dateString, formater, format);
};

export default {
    db: {
        date: (dateString) => preprocess(dateString, db, "%Y-%M-%d"),
        dateTime: (dateString) => preprocess(dateString, db, "%Y-%M-%d %H:%m:%s"),
        isDate: (dateString) => db.isDate(dateString)
    },
    user: {
        date: (dateString) => preprocess(dateString, user, "%d.%M.%Y"),
        dateTime: (dateString) => preprocess(dateString, user, "%d.%M.%Y %H:%m:%s"),
        isDate: (dateString) => user.isDate(dateString)
    },
    toDate: {
        fromUser: (dateString) => user.stringToDate(dateString),
        fromDb: (dateString) => db.stringToDate(dateString),
        fromAny: (dateString) => db.stringToDate(preprocess(dateString, db, "%Y-%M-%d %H:%m:%s"))
    }
};
