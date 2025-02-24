import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
    name: "products",
    initialState: {
        data : [],
    }
    ,
    reducers: {
        createProducts: (state,action) =>{
            state.data.push(action.payload)
        },
        readProducts: (state,action) =>{
            state.data = action.payload; //action.payload es lo que viene de la api
        },

        updateProducts: (state,action) =>{
            const{id,name} = action.payload;
            const product = state.data.find((product)=> product.id === id);
            if (product){
                product.name= name;
            }
            
        },
        deleteProducts: (state,action) =>{}
    },
});

export const {createProducts, readProducts, updateProducts, deleteProducts} = productsSlice.actions;

export default productsSlice.reducer