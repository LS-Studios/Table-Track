import React, {ReactElement} from 'react';
import "./ItemGrid.scss";
import {ImageHelper} from "../../../helper/ImageHelper";
import {MdAdd} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import {IItemModel} from "../../../data/components/IItemModel";

const ItemGrid = (
{
    itemComponent,
    items = [],
    onAddClick,
    width = "365px",
    itemSpacing = "25px"
}: React.PropsWithChildren<{
    itemComponent: (item: IItemModel) => ReactElement,
    items: IItemModel[],
    onAddClick?: () => void,
    width?: string
    itemSpacing?: string
}>) => {
    return (
        <div style={{width:width, gap:itemSpacing}} className="ItemGrid">
            { items.map((item, index) => itemComponent(item)) }
            { onAddClick && <div className="BoxItem" onClick={onAddClick}>
                <MdAdd size={"50px"}/>
                <div>Spieler hinzufügen</div>
            </div> }

        </div>
    );
};

export default ItemGrid;