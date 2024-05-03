import { Button, Grid, Slider } from '@mui/material';
import './App.css';
import ImportFile from './ImportFIle';
import SelectAlgo from './SelectAlgo';
import { useAppDispatch, useAppSelector } from './hooks';
import { setSpeed, setState } from './reducers/rootReducer';
import Affichage from './Affichage';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
function App() {

  const dispatch = useAppDispatch()
  const speed = useAppSelector(state=>state.speed)
  const fileContent = useAppSelector(state=>state.fileContent)
  const fitness = useAppSelector(state=>state.fitness)
  const state = useAppSelector(state=>state.state)

  function handleRun(){
    dispatch(setState("running"))
  }

  function setValue(value: number){
    dispatch(setSpeed(value))
  }

  function valueLabelFormat(value: number) {
    return `${value/1000}s`;
  }

  return (
    <Grid container justifyContent={'center'} className="App" p={1}>
      <Grid container item xs={8} justifyContent={'center'} alignItems={"center"} p={1}>
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
       <Slider aria-label="vitesse" value={speed} onChangeCommitted={(_,val)=>setValue(val as number)} min={100} max={5000} step={100} marks valueLabelDisplay="auto"   valueLabelFormat={valueLabelFormat}/>
      </Grid>
      <Affichage/>
      <LineChart width={730} height={250} data={fitness}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="iteration" />
      <YAxis yAxisId="fitness" orientation='right'/>
      <YAxis yAxisId="numberOfBin"/>
      <Tooltip />
      <Legend />
      <Line yAxisId="fitness" type="monotone" dataKey="fitness" stroke="#8884d8" />
      <Line yAxisId="numberOfBin" type="monotone" dataKey="numberOfBin" stroke="#585" />
  </LineChart>
    </Grid>
  );
}

export default App;
