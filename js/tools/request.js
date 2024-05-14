import METAFIELDS from "./metafields.js"
import { merge, queryHelper, has, JSONtryparse } from "./utility.js";
import { empty, build } from "./dto.js";

export const RequestConfig = (config) => {
    const standard = () => ({
        method: "GET",
        mode: "same-origin",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrer: "client",
        timeout: 30000
    });

    const buildRequestConfig = (config) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        return merge(config,  { signal: controller.signal, timeoutId: timeoutId } );
    };

    const getJSON = () => buildRequestConfig(merge(standard(), config));
    const sendJSON = (data) => buildRequestConfig(merge(standard(), config, { method: "POST", body: JSON.stringify(data) }));

    return {
        getJSON,
        sendJSON
    };
};

const AppOrigin = () => {
    return window ? window.location.href : "";
};

export const requestURL = ({url = "", queryParams = {}, urlParams = {}, origin = new URL(AppOrigin()).origin}) => {
    const removeMetafields = (params) => {
        const queryParamsCopy = { ...params };
        METAFIELDS.forEach((METAFIELDIDENT) => {
            delete queryParamsCopy[METAFIELDIDENT];
        });

        return queryParamsCopy;
    };

    const betterRemoveMetafields = (params) => {
        return Object
            .keys(params)
            .filter((fieldIdent) => METAFIELDS.indexOf(fieldIdent) == -1)
            .reduce((acc, ident, _, arr) => merge(acc, { [ident]: arr[ident] }), {});
    };

    const insertURLParams = (url) => {
        const withoutMetafields = betterRemoveMetafields(urlParams);
        const replaceInfos = Object.keys(withoutMetafields)
            .map((paramIdent) => {
                const name = "{" + paramIdent + "}";

                return {
                    name: name,
                    value: pathParams[paramIdent],
                    covered: url.indexOf(name) > -1
                };
            });
        const uncovered = replaceInfos.filter((info) => !info.covered);

        return {
            success: uncovered.length === 0,
            uncovered: uncovered,
            result: replaceInfos.reduce(
                (processedUrl, info) => processedUrl.replaceAll(info.name, info.value),
                url
            )
        };
    };

    const appendQueryParams = (url) => {
        const withoutMetafields = betterRemoveMetafields(queryParams);

        return queryHelper(url, withoutMetafields, origin);
    };

    const urlWithQueryparams = appendQueryParams(url);
    const urlComplete = insertURLParams(urlWithQueryparams);

    return urlComplete.result;
};

export const Request = () => {
    const errorStates = ["400", "401", "404", "405", "500"];
    const ExtendedResponse = (status, failed, response) => ({
        isextended: true,
        status: status,
        failed: failed || ( has(response) && !response.ok ),
        response: response
    });

    const baseFetch = (url, config) => {
        return fetch(url, config)
            .catch((error) => (
                error.name === "AbortError"
                    ? ExtendedResponse("ERR1", true)
                    : ExtendedResponse("ERR2", true)
            ))
            .then((response) => {
                const status = String(res.status);

                clearTimeout(timeoutId);
                return has(response, "isextended")
                    ? ExtendedResponse(status, errorStates.indexOf(status) > -1, response)
                    : response;
            })
            .then((extended) => {
                //Error managment
                return extended.failed
                    ? Promise.reject(extended)
                    : Promise.resolve(extended);
            })
            .then((extended) => (
                extended.response.arrayBuffer().then(
                    (buffer) =>
                        merge(res, {
                            result: new TextDecoder("UTF-8").decode(buffer),
                        })
                  )
            ));
    };

    const secureParse = (response) => {
        const parseble = response.result === ""
            ? JSONtryparse(response.result)
            : true;

        return {
            success: parseble,
            result: parseble ? JSON.parse(response.result) : response.result
        };
    };

    const secureConvert = (response) => {
        const parsed = secureParse();

        if (!parsed.success) {
            return parsed;
        }

        const converted = parsed.result;
    };

    return {

    };
};