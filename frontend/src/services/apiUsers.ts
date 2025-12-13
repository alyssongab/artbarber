import { api } from "./api";

export const getBarbers = async () => {
    const response = await api.get("/users/barbers");
    console.log(response.data)
    return response.data;
}