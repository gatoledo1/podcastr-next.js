import axios from 'axios';

export const api = axios.create({
    //baseURL: 'http://localhost:3333/'
    baseURL: 'http://localhost:1337/' //Strapi

});