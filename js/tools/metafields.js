import { lookup } from "./lookup";

export const TYPEFIELD = "__TYPE__";
export const EMPTYFIELD = "__EMPTY__";
export const METAFIELDS = [TYPEFIELD, EMPTYFIELD];

export const metaFieldToDefault = lookup({
    [TYPEFIELD]: (schema) => schema[TYPEFIELD],
    [EMPTYFIELD]: (schema) => true
}, () => "");

export const noMetafields = (object) => {
    return Object.keys(object)
        .filter((key) => METAFIELDS.indexOf(key) === -1)
        .map((key) => ({ key: key, value: object[key]}));
};

export default () => METAFIELDS;