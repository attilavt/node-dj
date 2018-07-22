const initialState = {
    global: {}
};
export const rootReducer = (state = initialState, action) => {
    let newState = { ...state };
    let touched = false;
    const applyToGlobalState = (key, value) => {
        touched = true;
        newState.global[key] = value;
    };

    if (action.type.indexOf("RESPONSE") === action.type.length - 8) {
        console.log("Writing response to global state in reducer");
        applyToGlobalState(action.key, action.payload);
    }
    if (!touched) {
        console.log("No change in state");
        return state;
    }
    console.log("Reduced state to ", newState, "after action", action);
    return newState;
};