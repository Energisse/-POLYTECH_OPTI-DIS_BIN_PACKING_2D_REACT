import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import AirlineStopsIcon from "@mui/icons-material/AirlineStops";
import LoopIcon from "@mui/icons-material/Loop";

import {
  Button,
  CircularProgress,
  Grid,
  Slider,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSpeed, setState } from "../reducers/metaheuristique";
import FormGenetiqueConfig from "./Menu/FormGenetiqueConfig";
import FormHillClimbingConfig from "./Menu/FormHillClimbingConfig";
import FormRecuitSimuleConfig from "./Menu/FormRecuitSimuleConfig";
import FormTabouConfig from "./Menu/FormTabouConfig";

export default function Menu({ id }: { id: number }) {
  const dispatch = useAppDispatch();
  const speed = useAppSelector(
    (state) => state.metaheuristique.entities[id].speed
  );

  const state = useAppSelector(
    (state) => state.metaheuristique.entities[id].state
  );
  const metaheuristique = useAppSelector(
    (state) => state.metaheuristique.entities[id].metaheuristique
  );
  const [selectedSpeed, setSelectedSpeed] = useState(speed);

  function commitChange() {
    dispatch(
      setSpeed({
        id,
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

  if (state === "convergence")
    return (
      <Grid container justifyContent={"center"} className="App" p={1}>
        <CircularProgress />
      </Grid>
    );

  return (
    <Grid container justifyContent={"center"} className="App" p={1}>
      <Grid item p={1}>
        {state !== "running" && (
          <Tooltip title="Lancer la simulation">
            <Button
              variant="contained"
              color="primary"
              onClick={() => dispatch(setState({ id: id, state: "running" }))}
            >
              <PlayArrowIcon />
            </Button>
          </Tooltip>
        )}
        {state === "running" && (
          <Tooltip title="Mettre en pause">
            <Button
              variant="contained"
              color="primary"
              onClick={() => dispatch(setState({ id: id, state: "paused" }))}
            >
              <PauseIcon />
            </Button>
          </Tooltip>
        )}
        {(state === "running" || state === "paused") && (
          <Tooltip title="Arrêter la simulation">
            <Button
              variant="contained"
              color="error"
              onClick={() => dispatch(setState({ id: id, state: "idle" }))}
            >
              <StopIcon />
            </Button>
          </Tooltip>
        )}
        {state !== "running" && (
          <Tooltip title="Lancer une itération">
            <Button
              variant="contained"
              color="primary"
              onClick={() => dispatch(setState({ id, state: "step" }))}
            >
              <AirlineStopsIcon />
            </Button>
          </Tooltip>
        )}
        {state !== "running" && (
          <Tooltip title="Lancer jusqu'a convergence">
            <Button
              variant="contained"
              color="primary"
              onClick={() => dispatch(setState({ id, state: "convergence" }))}
            >
              <LoopIcon />
            </Button>
          </Tooltip>
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
