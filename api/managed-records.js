import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

var primaryColors = ["red", "blue", "yellow"];

const markPrimaryColor = (records) => {
    records.map(record => record.isPrimary = primaryColors.includes(record.color));
};

const constructURI = (limit, page, options) => {
    const uri = URI(window.path).addSearch("limit", limit+1).addSearch("offset", (page-1) * limit);
    if(options.colors && options.colors.length) {
        uri.addSearch("color[]", options.colors);
    }
    return uri;
};

const createTransformedObject = (records, limit, page) => {
    const isLastPage = records.length <= limit;
    if(!isLastPage) {
        records.splice(limit, 1);
    }

    const transformedObj = {};
    transformedObj.ids = records.map(record => record.id);
    transformedObj.open = records.filter(record => record.disposition === "open");
    transformedObj.closedPrimaryCount = records.filter(record => record.disposition === "closed" && record.isPrimary === true).length;
    transformedObj.previousPage = page == 1 ? null : page - 1;
    transformedObj.nextPage = isLastPage ? null : page + 1;

    return transformedObj;
};

const retrieve = (options) => {
    var options = options || {};
    const limit = 10;
    const page = options.page || 1;

    let uri = constructURI(limit, page, options);

    return fetch(uri)
        .then(response => response.json())
        .then(records => {
            markPrimaryColor(records);
            return createTransformedObject(records, limit, page);
        })
        .catch(error => {
            console.log('There was a problem fetching the /records endpoint', error);
        });
};

export default retrieve;
