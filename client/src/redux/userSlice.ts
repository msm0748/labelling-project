import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserProps {
    isLoined: boolean;
    value: {
        email: string;
    };
}

interface PayloadProps {
    email: string;
}

const initialState: UserProps = {
    isLoined: false,
    value: {
        email: "",
    },
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        authLogin: (state, action: PayloadAction<PayloadProps>) => {
            state.isLoined = true;
            state.value = { ...state.value, ...action.payload };
        },
        authLogOut: (state, action: PayloadAction<undefined>) => {
            state.isLoined = false;
            state.value = initialState.value;
        },
    },
});

export const { authLogOut, authLogin } = userSlice.actions;
export default userSlice.reducer;
