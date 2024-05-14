import Utility from "./utility.js"

const namelist = {
    vornamen: ["Thomas","Hedwig","Nicola","Alena","Anni","Rahel","Ilse","Nele","Joana","Marianne","Eugen","Tanja","Fabio","Malin","Ulrike","Mark","Magda","Irmtraut","Simon","Janine"],
    nachnamen: ["Riegler","Töbermann","Stewart","Benthaus","Queri","Kiesewetter","Bossert","Bollmann","Becht","Kohnle","Kircher","Rusche","Fogelberg","Wrede","Fries","Wien","Dudenbostel","Rampke","Prignitz","Volkmer"]
};

const method = (type, config = {}) => {
    if (config.static) {
        return config.static;
    }

    if (config.computed) {
        return config.computed();
    }

    if (config.oneof) {
        return Oneof(config.oneof);
    }

    if (config.optional) {
        const noskip = Random(1, 100) < config.optional;

        if (noskip) {
            return null;
        }
    }

    switch (type) {
        case "string": {
            if (config.type === "name") {
                return Nachname();
            }

            if (config.type === "vorname") {
                return Vorname();
            }

            const charCnt = Random(config.min || 0, config.max || 20);

            return Array.from(Array(charCnt)).map(() => Word()).join("");
        }
        case "number": {
            if (config.increment) {
                if (config._inc_value === undefined) {
                    const seeed = config.seed || 0;
                    config._inc_value = config.incrementor ? config.incrementor(seeed) : seeed;
                } else {
                    config._inc_value += config.incrementor ? config.incrementor(config._inc_value) : config.increment;
                }

                return config._inc_value;
            }

            const min = config.min || 0;
            const max = config.max || 100;

            return Random(min, max);
        }
        case "date": {
            const min = config.min || new Date(2015, 1, 1);
            const max = config.max || new Date(2030, 12, 31)

            return Datum(min, max);
        }
        case "boolean": {
            return Oneof([true, false]);
        }
        default: {
            return "";
        }
    }
};

const prepschema = (schema, config = {}) => {
    return Object.keys(schema)
        .filter((k) => k !== "__Type__")
        .map((k) => {
            return {
                key: k,
                value: schema[k],
                config: config[k]
            };
        });
};

//{ key: "", value: "", config: "" }
const generate = (fields = []) => {
    return fields
        .reduce((res, doer) => Utility.merge(res, Utility.keyval(doer.key, method(doer.value, doer.config))), {});
};

const Multi = (schema, min = 1, max = 9, config = {}) => {
    const fields = prepschema(schema, config);

    return Array.from(Array(Random(min, max)))
        .map(() => generate(fields));
};

const Single = (schema, config = {}) => {
    const fields = prepschema(schema, config);

    return generate(fields);
}

const Random = (min, max) => min + ( Math.round(Math.random() * (max - min)) );
const Letter = (m) => {
    const mode = m || Random(0, 1);
    const letter = Random(0, 25);

    return String.fromCharCode(( mode === 1 ? 65 : 97 ) + letter);
};
const Oneof = (arr) => arr[Random(0, arr.length - 1)];
const Vorname = () => Oneof(namelist.vornamen);
const Nachname = () => Oneof(namelist.nachnamen);
//https://stackoverflow.com/questions/9035627/elegant-method-to-generate-array-of-random-dates-within-two-dates
const Datum = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const Word =(m = Oneof(["L", "N"]), config = {} ) => {
    const methods = {
        L: () => Letter(config.mode),
        N: () => Random(0, 9),
    };

    return (methods)[m]();
};

export default {
    multi: Multi,
    single: Single,
    random: Random,
    letter: Letter,
    oneof: Oneof,
    vorname: Vorname,
    nachname: Nachname,
    datum: Datum,
    word: Word
};
/*
["","","","","","","","","","","","","","","","","","",
"","","","","","","","","","","","","","","","","",""]
.map((name) => {
    return {
        vorname: name.split(" ")[0],
        nachname: name.split(" ")[1]
    };
 })
 .reduce((res, namec) => {
    if (res.vornamen.find(namec.vorname) === undefined) res.vornamen.push(namec.vorname);
    if (res.nachnamen.find(namec.nachname) === undefined) res.nachnamen.push(namec.nachname);

    return res;
 }, namelist)
 */