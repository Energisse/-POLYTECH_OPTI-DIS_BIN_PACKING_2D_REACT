import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { Button, Grid, Slider } from "@mui/material";
import ImportFile from './ImportFIle';
import SelectAlgo from './SelectAlgo';
import { setSpeed, setState } from './reducers/rootReducer';
import { useAppDispatch, useAppSelector } from './hooks';
import FormTabouConfig from './Menu/FormTabouConfig';
import FormRecuitSimuleConfig from './Menu/FormRecuitSimuleConfig';
import FormHillClimbingConfig from './Menu/FormHillClimbingConfig';
import FormGenetiqueConfig from './Menu/FormGenetiqueConfig';
import { useMemo } from 'react';

export default function Menu() {

    const dispatch = useAppDispatch()
    const speed = useAppSelector(state=>state.speed)
    const fileContent = useAppSelector(state=>state.dataSet)
    const state = useAppSelector(state=>state.state)
    const metaheuristique = useAppSelector(state=>state.metaheuristique)

    function handleRun(){
      dispatch(setState("running"))
    }
  
    function setValue(value: number){
      dispatch(setSpeed(value))
    }
  
    function valueLabelFormat(value: number) {
      return `${value/1000}s`;
    }

    const form:JSX.Element = useMemo(()=>{
      switch(metaheuristique){
        case "Tabou":
          return <FormTabouConfig/>
        case "Recuit simulé":
          return <FormRecuitSimuleConfig/>
        case "Hill Climbing":
          return <FormHillClimbingConfig/>
        case "Genetique":
          return <FormGenetiqueConfig/>
      }
      },[metaheuristique])
  
    return (
        <Grid container justifyContent={'center'} className="App" p={1}>
            <Grid item p={1}>
                <SelectAlgo/>
            </Grid>
            <Grid item p={1}>
                <ImportFile/>
            </Grid>
            <Grid item p={1}>
            {(state === "idle" || state === "finished") && <Button variant="contained" color="primary" disabled={!fileContent} onClick={handleRun}><PlayArrowIcon/></Button>}
            {state === "running" && <Button variant="contained" color="primary" onClick={()=>dispatch(setState("paused"))}><PauseIcon/></Button>}
            {state === "paused" && <Button variant="contained" color="primary" onClick={()=>dispatch(setState("running"))}><PlayArrowIcon/></Button>}
            {(state === "running" || state === "paused") && <Button variant="contained" color="error" onClick={()=>dispatch(setState("finished"))}><StopIcon/></Button>}
            </Grid>
            <Grid item xs={12}>
              {form}
            </Grid>
        <Slider aria-label="vitesse" value={speed} onChangeCommitted={(_,val)=>setValue(val as number)} min={100} max={5000} step={100} marks valueLabelDisplay="auto"   valueLabelFormat={valueLabelFormat}/>
        </Grid>
    );
}