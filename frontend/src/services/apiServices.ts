import { api } from "./api";

export const getServices = async () => {
    const response = await api.get("/services");
    console.log(response)
    return response.data;
};
