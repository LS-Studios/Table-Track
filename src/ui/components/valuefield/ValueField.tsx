import React from 'react';
import "./ValueField.scss";

const ValueField = (
{
    value,
    onClick,
    width = "350px"
}: {
    value: string,
    onClick?: () => void,
    width?: string
}
) => {
    return (
        <div style={{width:width}} className={"ValueField" + (onClick ? " clickable" : "")} onClick={onClick}>
            { value }
        </div>
    );
};

export default ValueField;