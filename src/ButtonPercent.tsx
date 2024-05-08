import { Button, CircularProgress, IconButton } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./hooks";
import { removeSolition, setCurrent } from "./reducers/metaheuristique";
import CloseIcon from "@mui/icons-material/Close";

export default function ButtonPercent({ id }: { id: number }) {
  const solutions = useAppSelector(
    (state) => state.metaheuristique.metaheuristiques[id]
  );
  const dispatch = useAppDispatch();

  function handleSelection(id: number) {
    dispatch(setCurrent({ id }));
  }

  function handleRemove(id: number) {
    dispatch(removeSolition({ id }));
  }

  return (
    <>
      <Button key={id} onClick={() => handleSelection(id)}>
        {solutions.metaheuristique}
      </Button>
      <IconButton onClick={() => handleRemove(id)}>
        <CloseIcon />
      </IconButton>
      {solutions.state === "running" && <CircularProgress />}
    </>
  );
}
