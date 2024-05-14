import METAFIELDS from "./metafields.js";

export const merge = (...objects) => {
    return Object.assign(Object.create(null), ...objects);
};

export const localdir = () => {
    const foldersWithFile = window.location.pathname.split("/").slice(1);
    const dir = "/" + foldersWithFile.slice(0, foldersWithFile.length - 1).join("/");

    return dir === "/" ? "" : dir;
};

export const queryHelper = (path, json, origin) => {
    const url = new URL(path, origin);

    if (typeof json === "object") {
        Object.keys(json).forEach((key) =>
            url.searchParams.append(key, json[key])
        );
    }

    return url.toString();
};

export const padding = (str = "", amount = 0, char = "", balanced = false) => {
    const toPad = String(str);
    const length = isNaN(Number(amount)) ? 0 : Number(amount);
    const cnt = Math.abs(length) - toPad.length;

    if (balanced) {
        const direction = (length / Math.abs(length));
        const smallerFilling = Math.floor(cnt  / 2) + toPad.length;
        const biggerFilling = Math.abs(length);

        return padding(padding(toPad, direction * smallerFilling, char), -(direction * biggerFilling), char);
    } else {
        const filling = Array(cnt >= 0 ? cnt : 0).fill(char !== "" ? String(char)[0] : "").join("");

        return length >= 0 ? filling + toPad : toPad + filling;
    }
};

export const keyval = (key, val) => ({ [key]: val });

const _compare = (left, right, exceptions) => {
    const leftside = Object.keys(left).filter(
        (leftKey) => !exceptions.includes(leftKey) && right[leftKey] === undefined
    );

    const rightside = Object.keys(right).filter(
        (rightKey) => !exceptions.includes(rightKey) && left[rightKey] === undefined
    );

    return {
        success: leftside.length === 0 && rightside.length === 0,
        leftOverflow: leftside,
        rightOverflow: rightside,
        left: Object.keys(left).filter((k) => !exceptions.includes(k)),
        right: Object.keys(right).filter((k) => !exceptions.includes(k)),
    };
};

export const compare = (left, right) => _compare(left, right, METAFIELDS);

export const compareList = (list = [], right) =>{
    const problems = list
        .map((json) => compare(json, right))
        .filter((result) => result.success);

    return {
        success: problems.length === 0,
        problems: problems
    };
};

export const has = (object, fieldname) => {
    return fieldname === undefined
        ? object !== undefined
        : object[fieldname] !== undefined;
};

export const JSONtryparse = (jsonstring) => {
    try {
        JSON.parse(jsonstring);

        return true;
    } catch (e) {
        return false;
    }
};

export const stringIsNullOrEmpty = (stringValue) => stringValue === null || String(stringValue).trim() === "";
