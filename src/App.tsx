import AddIcon from '@mui/icons-material/Add';
import { Button, Grid, Paper, ThemeProvider, createTheme } from "@mui/material";
import { useState } from "react";
import "./App.css";
import ButtonPercent from "./ButtonPercent";
import Header from "./Header";
import Modal from './Modal';
import Solution from "./Solution";
import { useAppSelector } from "./hooks";

function App() {
  const darkMode = useAppSelector((state) => state.rootReducer.darkMode);
  const solutions = useAppSelector((state) => state.metaheuristique.metaheuristiques.length);
  const current = useAppSelector((state) => state.metaheuristique.current);

  const [open, setOpen] = useState(false);

  const darkTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  function handleCreateSoltion() {
    setOpen(true);
  }

  function handleClose(): void {
    setOpen(false);
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Grid
        container
        sx={{
          bgcolor: "background.default",
        }}
        minHeight={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        alignContent={"flex-start"}
      >
        <Grid
          container
          justifyContent={"space"}
          flexDirection={"row"}
          className="App"
          p={1}
          spacing={2}
          minHeight={"100%"}
          maxWidth={"100%"}
        >
          <Grid item xs={12}>
            <Header />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item   >
                <Paper elevation={2} sx={{
                  height: "100%",
                }}>
                  <Grid item xs={12} p={1}>
                  <Button startIcon={<AddIcon/>} onClick={handleCreateSoltion} variant="contained">Create solution</Button>
                  </Grid>
                {Array(solutions)
                  .fill(0)
                  .map((_, i) => (
                    <Grid item xs={12}>
                      <ButtonPercent id={i} key={i} />
                    </Grid>
                  ))}
                </Paper>
              </Grid>
              <Grid item flex={1} >
                {current !== -1 && <Solution id={current} key={current} />}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Modal open={open} handleClose={handleClose}/>
    </ThemeProvider>
  );
}

export default App;
