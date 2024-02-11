import React from 'react';
import "./BoxItem.scss";
import {ImageHelper} from "../../../helper/ImageHelper";
import {IItemModel} from "../../../data/components/IItemModel";

const BoxItem = (
{
    item,
    selected = false,
    onClick
}: {
    item: IItemModel,
    selected?: boolean,
    onClick: (item: IItemModel) => void
}
) => {
    return (
        <div className={"BoxItem" + (selected ? " selected" : "")} onClick={() => onClick(item)}>
            <img src={ImageHelper.getImage(item.image)} alt="item image"/>
            <div>{item.name}</div>
        </div>
    );
};

export default BoxItem;