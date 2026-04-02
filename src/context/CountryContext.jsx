import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getCountries as getCountriesThunk,
    createCountry as createCountryThunk,
    updateCountry as updateCountryThunk,
    deleteCountry as deleteCountryThunk,
    getCountryById as getCountryByIdThunk
} from '../redux/slices/countrySlice';

const CountryContext = createContext();

export const CountryProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { countries, currentCountry, pagination, isLoading, error } = useSelector((state) => state.country);

    const getCountries = async (page = 1) => {
        return dispatch(getCountriesThunk(page));
    };

    const createCountry = async (data) => {
        return dispatch(createCountryThunk(data));
    };

    const updateCountry = async (id, data) => {
        return dispatch(updateCountryThunk({ id, data }));
    };

    const deleteCountry = async (id) => {
        return dispatch(deleteCountryThunk(id));
    };

    const getCountryById = async (id) => {
        return dispatch(getCountryByIdThunk(id));
    };

    return (
        <CountryContext.Provider value={{
            countries,
            currentCountry,
            pagination,
            isLoading,
            error,
            getCountries,
            createCountry,
            updateCountry,
            deleteCountry,
            getCountryById
        }}>
            {children}
        </CountryContext.Provider>
    );
};

export const useCountry = () => useContext(CountryContext);
