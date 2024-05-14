import { noMetafields, METAFIELDS, metaFieldToDefault, EMPTYFIELD } from "./metafields";
import { lookup, stringIsNullOrEmpty, has, compare } from "./utility";

export const empty = (dtoblueprint, initvalues) => {
    const schema = dtoblueprint.schema;
    const dependencies = dtoblueprint.dependencies;

    const lookuphandle = lookup({
        string: (initvalue) => initvalue || null,
        number: (initvalue) => initvalue || null,
        boolean: (initvalue) => initvalue ||  null,
        date: (initvalue) => initvalue === undefined ?  null : initvalue
    }, (initvalue, type) => {
        if (type.indexOf("[]") > -1) {
            return initvalue || [];
        } else {
            const childBlueprint = dependencies[type];

            return initvalue ? empty(childBlueprint(), initvalue) : null;
         }
    });

    if (schema) {
        const emptyResult = {};

        noMetafields(schema).forEach((keyvalue) => {
            const key = keyvalue.key;
            const type = keyvalue.value;
            const initvalue = initvalues[key];

            emptyResult[key] = lookuphandle.get(type)(initvalue, type);
        });

        METAFIELDS.forEach((metafield) => {
            emptyResult[metafield] = metaFieldToDefault.get(metafield)(schema);
        });

        return emptyResult;
    }
};


const toBoolean = (value) => {
    const truthyValues = ["t", "true", "1"];
    const falsyValues = ["f", "false", "0"];

    return (
        truthyValues.indexOf(String(value).toLowerCase())  > -1
            ? true
            : (
                falsyValues.indexOf(String(value).toLowerCase())  > -1
                    ? false
                    : null
            )
    );
};

const toDate = (value) => {
    return (
        stringIsNullOrEmpty(value)
            ? null
            : (
                has("toISOString", value)
                    ? value
                    : Formater.toDate.fromAny(value)
            )
    );
};

const baseBuild = (dtoblueprint, data) => {
    const schema = dtoblueprint.schema;
    const dependencies = dtoblueprint.dependencies;

    const lookuphandle = lookup({
        string: (fieldValue) => fieldValue ? String(fieldValue) : null,
        number: (fieldValue) => fieldValue ? Number(fieldValue) : null,
        boolean: (fieldValue) => toBoolean(fieldValue),
        date: (fieldValue) => toDate(fieldValue)
    }, (fieldValue, type) => {
        if (type.indexOf("[]") > -1) {
            const arrayType = type.substring(0, type.length - 2);
            const childBlueprint = dependencies[arrayType];

            return fieldValue.map((singleValue) => buildf(childBlueprint(), singleValue));
        } else {
            const childBlueprint = dependencies[type];

            return build(childBlueprint(), fieldValue);
         }
    });

    if (schema) {
        const result = {};

        noMetafields(schema).forEach((keyvalue) => {
            const key = keyvalue.key;
            const type = keyvalue.value;
            const fieldValue = data[key];

            result[key] = lookuphandle.get(type)(fieldValue, type);
        });

        METAFIELDS.forEach((metafield) => {
            result[metafield] = metaFieldToDefault.get(metafield)(schema);
        });

        result[EMPTYFIELD] = false;

        return result;
    }
};

const build = (dtoblueprint, data) => {
    const schema = dtoblueprint.schema;
    const result = compare(schema, data);

    if (!result.success) {
        return {
            success: false,
            result: empty(dtoblueprint)
        };
    }

    const buildData =  build(dtoblueprint, data);
};