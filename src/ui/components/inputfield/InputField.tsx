import React, {FormEventHandler, HTMLInputTypeAttribute, useRef} from 'react';
import './InputField.scss';

const InputField = (
    {
        type = "text",
        currentState,
        setCurrentState,
        onValueChange = () => {},
        placeholder = "",
        multiline = false,
        rows = 3,
        enabled = true,
        width = "350px"
    }: {
        type?: HTMLInputTypeAttribute,
        currentState: string,
        setCurrentState?:  React.Dispatch<React.SetStateAction<string>>,
        onValueChange?: (value: string) => void,
        placeholder?: string,
        multiline?: boolean,
        rows?: number,
        enabled?: boolean,
        width?: string
}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef< | HTMLTextAreaElement>(null)

    const handleKeyDownOnInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.currentTarget.blur()
        }
    }

    const onChangeOnInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (setCurrentState) {
            setCurrentState(event.currentTarget.value)
        } else if (onValueChange) {
            onValueChange(event.currentTarget.value)
        }
    }

    const onMouseDownOnInput = (event: React.MouseEvent<HTMLInputElement>) => {
        if (!enabled) {
            event.preventDefault()
        }
    }

    const onChangeOnTextarea = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (setCurrentState) {
            setCurrentState(event.currentTarget.value)
        } else if (onValueChange) {
            onValueChange(event.currentTarget.value)
        }
    }

    const onMouseDownOnTextarea = (event: React.MouseEvent<HTMLTextAreaElement>) => {
        if (!enabled) {
            event.preventDefault()
        }
    }

    return (
        multiline ? <textarea style={{width:width}} className="inputField" ref={textareaRef} value={currentState} onMouseDown={onMouseDownOnTextarea}
                              placeholder={placeholder} onChange={onChangeOnTextarea} rows={rows}/> :
            <input style={{width:width}} className="inputField" ref={inputRef} value={currentState} onMouseDown={onMouseDownOnInput}
                   type={type} placeholder={placeholder} onChange={onChangeOnInput} onKeyDown={handleKeyDownOnInput}/>
    );
};

export default InputField;