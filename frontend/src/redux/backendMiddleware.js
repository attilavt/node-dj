const BACKEND_GET_IP_ADDRESSES_REQUEST = "BACKEND_GET_IP_ADDRESSES_REQUEST";
const BACKEND_PUT_SKIP_TO_NEXT_SONG = "BACKEND_PUT_SKIP_TO_NEXT_SONG";

const request = (key, payload, callback) => { return { type: key, payload: { payload: payload, callback: callback } }; };

export const backendGetIpAddressesRequestAction = request(BACKEND_GET_IP_ADDRESSES_REQUEST);
export const backendPutSkipToNextSongRequestAction = request(BACKEND_PUT_SKIP_TO_NEXT_SONG);

const baseUrl = "http://localhost:3001";

const fetchAndWriteTo = (url, dataFieldKey, requestActionKey, store) => {
    const reqUrl = baseUrl + url;
    console.log("Initializing GET request to " + reqUrl);
    fetch(reqUrl).then(function (response) {
        response.json().then(function (obj) {
            console.log("Received backend response for GET " + dataFieldKey, obj);
            const responseActionKey = requestActionKey.replace("REQUEST", "RESPONSE");
            const responseAction = { type: responseActionKey, payload: obj, key: dataFieldKey };
            // console.log("Dispatching response action:", responseAction);
            store.dispatch(responseAction);
        })
    });
};

const putAndDo = (url, payload, callback) => {
    const reqUrl = baseUrl + url;
    const reqObj = { method: "PUT", body: payload, mode: "cors" };
    console.log("Initializing PUT request to " + reqUrl, reqObj);
    fetch(reqUrl, reqObj).then((response) => {
        console.log("Received backend response for PUT " + url);
        callback(response);
    });
};

const logIt = (message) => (response) => {
    console.log(message, response);
}

export const asyncDispatchMiddleware = store => next => action => {
    switch (action.type) {
        case BACKEND_GET_IP_ADDRESSES_REQUEST:
            fetchAndWriteTo("/api/ip-addresses", "ipAddresses", BACKEND_GET_IP_ADDRESSES_REQUEST, store);
            break;
        case BACKEND_PUT_SKIP_TO_NEXT_SONG:
            putAndDo("/api/skip-track", {}, logIt("PUT SKIP TO NEXT SONG SUCCESSFUL"))
            break;
        default:
        // console.warn("No action found in asyncDispatchMiddleware for " + action.type);
    }
    next(action);
}