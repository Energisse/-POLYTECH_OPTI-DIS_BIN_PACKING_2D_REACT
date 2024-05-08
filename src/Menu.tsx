import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { Button, Grid, Slider, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import FormGenetiqueConfig from "./Menu/FormGenetiqueConfig";
import FormHillClimbingConfig from "./Menu/FormHillClimbingConfig";
import FormRecuitSimuleConfig from "./Menu/FormRecuitSimuleConfig";
import FormTabouConfig from "./Menu/FormTabouConfig";
import { useAppDispatch, useAppSelector } from "./hooks";
import { pause, setSpeed, start, stop } from "./reducers/metaheuristique";

export default function Menu({ id }: { id: number }) {
  const dispatch = useAppDispatch();
  const speed = useAppSelector(
    (state) => state.metaheuristique.metaheuristiques[id].speed
  );
  const fileContent = useAppSelector(
    (state) => state.metaheuristique.metaheuristiques[id].dataSet
  );
  const state = useAppSelector(
    (state) => state.metaheuristique.metaheuristiques[id].state
  );
  const metaheuristique = useAppSelector(
    (state) => state.metaheuristique.metaheuristiques[id].metaheuristique
  );
  const [selectedSpeed, setSelectedSpeed] = useState(speed);

  function handleRun() {
    dispatch(start({ id: id }));
  }

  function commitChange() {
    dispatch(
      setSpeed({
        id: 0,
        ...selectedSpeed,
      })
    );
  }

  function setValue(type: "interval" | "iterationCount", value: number) {
    setSelectedSpeed({
      ...speed,
      [type]: value,
    });
  }

  function valueLabelFormat(value: number) {
    return `${value / 1000}s`;
  }

  const form: JSX.Element = useMemo(() => {
    switch (metaheuristique) {
      case "Tabou":
        return <FormTabouConfig id={id} />;
      case "Recuit simulé":
        return <FormRecuitSimuleConfig id={id} />;
      case "Hill Climbing":
        return <FormHillClimbingConfig />;
      case "Genetique":
        return <FormGenetiqueConfig id={id} />;
    }
  }, [id, metaheuristique]);

  return (
    <Grid container justifyContent={"center"} className="App" p={1}>
      <Grid item p={1}>
        {(state === "idle" || state === "finished") && (
          <Button
            variant="contained"
            color="primary"
            disabled={!fileContent}
            onClick={handleRun}
          >
            <PlayArrowIcon />
          </Button>
        )}
        {state === "running" && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => dispatch(pause({ id: id }))}
          >
            <PauseIcon />
          </Button>
        )}
        {state === "paused" && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => dispatch(start({ id: id }))}
          >
            <PlayArrowIcon />
          </Button>
        )}
        {(state === "running" || state === "paused") && (
          <Button
            variant="contained"
            color="error"
            onClick={() => dispatch(stop({ id: id }))}
          >
            <StopIcon />
          </Button>
        )}
      </Grid>
      <Grid item xs={12}>
        {form}
      </Grid>

      <Typography gutterBottom>
        Temps entre chaque affichage : {selectedSpeed.interval / 1000}s
      </Typography>
      <Slider
        aria-label="vitesse"
        value={selectedSpeed.interval}
        onChangeCommitted={commitChange}
        onChange={(_, val) => setValue("interval", val as number)}
        min={100}
        max={5000}
        step={100}
        marks
        valueLabelDisplay="auto"
        valueLabelFormat={valueLabelFormat}
      />

      <Typography gutterBottom>
        Iteration par affichage : {selectedSpeed.iterationCount}
      </Typography>
      <Slider
        aria-label="vitesse"
        value={selectedSpeed.iterationCount}
        onChangeCommitted={commitChange}
        onChange={(_, val) => setValue("iterationCount", val as number)}
        min={1}
        max={100}
        marks
        valueLabelDisplay="auto"
      />
    </Grid>
  );
}
