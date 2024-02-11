import React from 'react';
import "./Button.scss";

const Button = (
{
    text,
    onClick,
    enabled = true,
    width = "350px",
}: {
    text: string,
    onClick: () => void,
    enabled?: boolean,
    width?: string
}
) => {
    return (
        <button style={{width:width}} className={"Button" + (enabled ? "" : " disabled")} onClick={() => enabled && onClick()}>{ text }</button>
    );
};

export default Button;