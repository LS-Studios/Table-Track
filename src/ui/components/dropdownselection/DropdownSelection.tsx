import React, {useState} from 'react';
import "./DropdownSelection.scss"
import DropDialog from "../dropdialog/DropDialog";

const DropdownSelection = (
{
    currentState,
    setCurrentState,
    items,
    width = "350px",
    color = "tomato"
}: {
    currentState: number,
    setCurrentState: React.Dispatch<React.SetStateAction<number>>,
    items: string[],
    width?: string,
    color?: string
}
) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isDroppedUp, setIsDroppedUp] = useState<boolean>(false)

    return (
        <DropDialog isOpen={isOpen} setIsOpen={setIsOpen} setIsDroppedUp={setIsDroppedUp} content={
            <div style={{backgroundColor:color}} className={"DropdownSelectionDropdown " + (isDroppedUp ? " isDroppedUp" : " isDroppedDown")}>
                {
                    items.map((item, index) => {
                            return <h4 onClick={() => {
                                setCurrentState(index)
                                setIsOpen(false)
                            }}>
                                {item}
                            </h4>
                        }
                    )
                }
            </div>
        }>
            <div style={{width:width}} className={"DropdownSelectionSelector" + (isOpen ? (isDroppedUp ? " isDroppedUp" : " isDroppedDown") : "")} onClick={() => {
                setIsOpen(!isOpen)
            }}>
                {items[currentState]}
            </div>
        </DropDialog>
    );
};

export default DropdownSelection;