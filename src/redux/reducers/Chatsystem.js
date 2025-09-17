import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const baseURL = process.env.REACT_APP_BACKEND_URL;

export const fetchData = createAsyncThunk('data/fetchData', async (userid, token,) => {
    console.log('fetchData =dedwe', userid);
    const response = await fetch(`${baseURL}chat/all-user/${userid}`, {
        method: "GET",
        headers: {
            authorization: `Bearer ${token}`,
        },
    });
    return await response.json();
});


export const createGroupForm = createAsyncThunk('data/createGroupForm', async (groupData, token) => {
    const response = await fetch(`${baseURL}chat/createGroup`, {
        method: "POST",
        headers: {
            authorization: `Bearer ${token}`,
        },
        body:  groupData,
    });
    return await response.json();
});


export const fetchGroup = createAsyncThunk('data/fetchGroup', async (adminId, token) => {
    const response = await fetch(`${baseURL}chat/fetchGroup/${adminId}`, {
        method: "GET",
        headers: {
            authorization: `Bearer ${token}`,
        }
    });
    return await response.json();
});

const Chatsystem = createSlice({
    name: 'data',
    initialState: {
        data: [],
        groupPerson: [],
        recipient: null,
        selectedGroup: null,
        togglechat: null,
        chatmessages: null,
        status: 'idle',
        error: null,
    },

    reducers: {
        addRecipient: (state, action) => {
            state.recipient = action.payload; // Add a new user
        },
        
        selectedGroupperson: (state, action) => {
            state.selectedGroup = action.payload; // Add a new user
        },

        updateChatMessages: (state, action) => {
            console.log("updateChatMessages action.payload:", action.payload);
            state.chatmessages.push(action.payload); // 
        },

        addChatMessages: (state, action) => {
            state.chatmessages = action.payload; // Add a new message to the chat
            console.log("updateChatMessages action.payload:", state.chatmessages);
        },

        togglechatarea: (state, action) => {
            state.togglechat = action.payload; // Add a new user
        }
    },

    extraReducers: builder => {
        builder
            .addCase(fetchData.pending, state => {
                state.status = 'loading';
            })
            .addCase(fetchData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload.admins;
                console.log("Data fetched state.data:", action.payload);
            })
            .addCase(fetchData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // create group Chat
            .addCase(createGroupForm.pending, state => {
                state.status = 'loading';
            })
            .addCase(createGroupForm.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.groupPerson.push(action.payload.chatgroup);
            })
            .addCase(createGroupForm.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // fatch group data
            .addCase(fetchGroup.pending, state => {
                state.status = 'loading';
            })
            .addCase(fetchGroup.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.groupPerson = action.payload.chatgroup;
            })
            .addCase(fetchGroup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
    },

});

export const { addRecipient, selectedGroupperson, updateChatMessages, addChatMessages, togglechatarea } = Chatsystem.actions;

export default Chatsystem.reducer;
