
import {Navigate} from "react-router-dom";
import {JSX} from "react";

export default function ConditionReRoute({
   condition,
   reRoutePath,
   children
}: {
    condition: boolean,
    reRoutePath: string,
    children: JSX.Element,
}) {
    if (condition) {
        return <Navigate to={reRoutePath} />;
    } else {
        return children;
    }
};