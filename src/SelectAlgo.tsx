import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./hooks"
import { Metaheuristiques, setAlgo,metaheuristiques } from "./reducers/rootReducer";

export default function SelectAlgo() {

    const selectedAlgo = useAppSelector(state=>state.metaheuristique)
    const dispatch = useAppDispatch()

    const handleChangeAlgo = (event: SelectChangeEvent<Metaheuristiques>) => {
        dispatch(setAlgo(event.target.value as Metaheuristiques))
    };

    return (
        <Select onChange={handleChangeAlgo} value={selectedAlgo} defaultValue={selectedAlgo} label="Metaheuristique">
            {metaheuristiques.map((algo) => <MenuItem key={algo} value={algo}>{algo}</MenuItem>)}
        </Select>
    )
}