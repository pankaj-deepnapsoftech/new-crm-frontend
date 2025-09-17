import {configureStore} from '@reduxjs/toolkit';
import miscSlice from './reducers/misc';
import authSlice from './reducers/auth';
import subscriptionAuthSlice from '../subscription/redux/reducer/auth';
import Chatsystem from './reducers/Chatsystem';
const store = configureStore({
    reducer: {
        [subscriptionAuthSlice.name]: subscriptionAuthSlice.reducer,
        [authSlice.name]: authSlice.reducer,
        [miscSlice.name]: miscSlice.reducer,
        data: Chatsystem,
    }
})

export default store;