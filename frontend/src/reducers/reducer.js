const initialState = {
    global: {}
};
export const rootReducer = (state = initialState, action) => {
    let newState = { ...state };

    if (action.type.indexOf("RESPONSE") === action.type.length - 8) {
        console.log("Writing response to global state in reducer");
        newState.global[action.key] = action.payload;
    }
    console.log("Reduced state to ", newState, "after action", action);
    return newState;
};