import { Button } from "@mui/material";
import { ChangeEvent } from "react";
import { useAppDispatch } from "./hooks";
import { setFileContent } from "./reducers/metaheuristique";

export default function ImportFile() {

    const dispatch = useAppDispatch()

    function onChange(event:  ChangeEvent<HTMLInputElement>) {
        if(!event.target.files) return
        const file = event.target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
            dispatch(setFileContent(e.target?.result as string))
        }
        reader.readAsText(file)
    }

    return (
        <>
            <input
                id="contained-button-file"
                multiple
                type="file"
                style={{ display: "none" }} 
                onChange={onChange}
                />
            <label htmlFor="contained-button-file">
                <Button variant="contained" color="primary" component="span">Importer</Button>
            </label>
        </>
    )
}