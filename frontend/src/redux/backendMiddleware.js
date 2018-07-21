const BACKEND_GET_IP_ADDRESSES_REQUEST = "BACKEND_GET_IP_ADDRESSES_REQUEST";

const getRequest = (key) => { return { type: key }; };

export const backendGetIpAddressesRequestAction = getRequest(BACKEND_GET_IP_ADDRESSES_REQUEST);

const baseUrl = "http://localhost:3001";

const fetchAndWriteTo = (url, dataFieldKey, requestActionKey, store) => {
    const reqUrl = baseUrl + url;
    console.log("Initializing request to " + reqUrl);
    fetch(reqUrl).then(function (response) {
        response.json().then(function (obj) {
            console.log("Received backend response for " + dataFieldKey, obj);
            const responseActionKey = requestActionKey.replace("REQUEST", "RESPONSE");
            const responseAction = { type: responseActionKey, payload: obj, key: dataFieldKey };
            // console.log("Dispatching response action:", responseAction);
            store.dispatch(responseAction);
        })
    });
}


export const asyncDispatchMiddleware = store => next => action => {
    switch (action.type) {
        case BACKEND_GET_IP_ADDRESSES_REQUEST:
            fetchAndWriteTo("/api/ip-addresses", "ipAddresses", BACKEND_GET_IP_ADDRESSES_REQUEST, store);
            break;
        default:
        // console.warn("No action found in asyncDispatchMiddleware for " + action.type);
    }
    next(action);
}