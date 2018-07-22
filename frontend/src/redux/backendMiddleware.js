const BACKEND_GET_IP_ADDRESSES_REQUEST = "BACKEND_GET_IP_ADDRESSES_REQUEST";
const BACKEND_GET_CURRENT_SONG_REQUEST = "BACKEND_GET_CURRENT_SONG_REQUEST";
const BACKEND_PUT_SKIP_TO_NEXT_SONG = "BACKEND_PUT_SKIP_TO_NEXT_SONG";
const BACKEND_PUT_SKIP_TO_NEXT_ALBUM = "BACKEND_PUT_SKIP_TO_NEXT_ALBUM";
const BACKEND_PUT_STOP_MUSIC = "BACKEND_PUT_STOP_MUSIC";
const BACKEND_PUT_START_MUSIC = "BACKEND_PUT_START_MUSIC";

const request = (key, payload, callback) => { return { type: key, payload: { payload: payload, callback: callback } }; };

export const backendGetIpAddressesRequestAction = request(BACKEND_GET_IP_ADDRESSES_REQUEST);
export const backendPutSkipToNextSongRequestAction = request(BACKEND_PUT_SKIP_TO_NEXT_SONG);
export const backendPutSkipToNextAlbumRequestAction = request(BACKEND_PUT_SKIP_TO_NEXT_ALBUM);
export const backendPutStopMusicRequestAction = request(BACKEND_PUT_STOP_MUSIC);
export const backendPutStartMusicRequestAction = request(BACKEND_PUT_START_MUSIC);
export const backendGetCurrentSongRequestAction = request(BACKEND_GET_CURRENT_SONG_REQUEST);

// workaround since _not_ loading from .env.local when doing `npm run build` does not seem to work
const baseUrl = (process.env.NODE_ENV === "development") ? "" : process.env.REACT_APP_BACKEND_BASE_PATH;
console.log("Backend Base Url: ", baseUrl, process.env.NODE_ENV);

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

const logItAndReloadCurrentSong = (actionType, store) => (response) => {
    console.log(actionType, "request successful", response);
    store.dispatch(backendGetCurrentSongRequestAction);
}

export const asyncDispatchMiddleware = store => next => action => {
    switch (action.type) {
        case BACKEND_GET_IP_ADDRESSES_REQUEST:
            fetchAndWriteTo("/api/ip-addresses", "ipAddresses", action.type, store);
            break;
        case BACKEND_PUT_SKIP_TO_NEXT_SONG:
            putAndDo("/api/skip-track", {}, logItAndReloadCurrentSong(action.type, store))
            break;
        case BACKEND_PUT_SKIP_TO_NEXT_ALBUM:
            putAndDo("/api/skip-album", {}, logItAndReloadCurrentSong(action.type, store))
            break;
        case BACKEND_PUT_STOP_MUSIC:
            putAndDo("/api/music-stop", {}, logItAndReloadCurrentSong(action.type, store))
            break;
        case BACKEND_PUT_START_MUSIC:
            putAndDo("/api/music-start", {}, logItAndReloadCurrentSong(action.type, store))
            break;
        case BACKEND_GET_CURRENT_SONG_REQUEST:
            fetchAndWriteTo("/api/current-song", "currentSong", action.type, store);
            break;
        default:
        // console.warn("No action found in asyncDispatchMiddleware for " + action.type);
    }
    next(action);
}