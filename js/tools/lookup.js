export const lookup = (object, defaultV) => {
    const get = (key) => {
        const value = object[key];

        return value === undefined ? defaultV : value;
    };

    const has = (key) => {
        return object[key] !== undefined;
    };

    const push = (key, v) => {
        object[key] = v;
    };

    return {
        get,
        push,
        has,
    };
}