import { Button, CircularProgress, IconButton } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./hooks";
import { removeSolition, setCurrentId } from "./reducers/metaheuristique";
import CloseIcon from "@mui/icons-material/Close";

export default function ButtonPercent({ id }: { id: number }) {
  const state = useAppSelector(
    (state) => state.metaheuristique.entities[id].state
  );

  const metaheuristique = useAppSelector(
    (state) => state.metaheuristique.entities[id].metaheuristique
  );
  const dispatch = useAppDispatch();

  function handleRemove(id: number) {
    dispatch(removeSolition(id));
  }

  function handleClick(id: number) {
    dispatch(setCurrentId(id));
  }

  return (
    <>
      <Button onClick={() => handleClick(id)}>{metaheuristique}</Button>
      <IconButton onClick={() => handleRemove(id)}>
        <CloseIcon />
      </IconButton>
      {state === "running" && <CircularProgress />}
    </>
  );
}
