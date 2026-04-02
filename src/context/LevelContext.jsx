import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getLevels as getLevelsThunk,
    createLevel as createLevelThunk,
    updateLevel as updateLevelThunk,
    deleteLevel as deleteLevelThunk,
    getLevelById as getLevelByIdThunk
} from '../redux/slices/levelSlice';

const LevelContext = createContext();

export const LevelProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { levels, currentLevel, pagination, isLoading, error } = useSelector((state) => state.level);

    const getLevels = async (page = 1) => {
        return dispatch(getLevelsThunk(page));
    };

    const createLevel = async (data) => {
        return dispatch(createLevelThunk(data));
    };

    const updateLevel = async (id, data) => {
        return dispatch(updateLevelThunk({ id, data }));
    };

    const deleteLevel = async (id) => {
        return dispatch(deleteLevelThunk(id));
    };

    const getLevelById = async (id) => {
        return dispatch(getLevelByIdThunk(id));
    };

    return (
        <LevelContext.Provider value={{
            levels,
            currentLevel,
            pagination,
            isLoading,
            error,
            getLevels,
            createLevel,
            updateLevel,
            deleteLevel,
            getLevelById
        }}>
            {children}
        </LevelContext.Provider>
    );
};

export const useLevel = () => useContext(LevelContext);
