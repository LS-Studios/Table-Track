import {useState} from "react";

function useLocalStorage<Type>(keyName: string, defaultValue: Type): [Type, (newValue: Type) => void] {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = localStorage.getItem(keyName);
            if (value) {
                return JSON.parse(value);
            } else {
                localStorage.setItem(keyName, JSON.stringify(defaultValue));
                return defaultValue;
            }
        } catch (err) {
            return defaultValue;
        }
    });
    const setValue = (newValue: Type) => {
        try {
            localStorage.setItem(keyName, JSON.stringify(newValue));
        } catch (err) {
            alert(err)
        }
        setStoredValue(newValue);
    };

    return [storedValue, setValue];
};

export default useLocalStorage;