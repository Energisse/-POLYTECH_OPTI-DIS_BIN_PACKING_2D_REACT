import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Divider,
  Grid,
  Paper,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { useMemo, useState } from "react";
import "./App.css";
import Solution from "./BinPaking/Solution";
import ButtonPercent from "./ButtonPercent";
import Header from "./Header";
import MainGraphic from "./MainGraphic";
import Modal from "./Modal";
import { useAppDispatch, useAppSelector } from "./hooks";
import { setCurrentId } from "./reducers/metaheuristique";

function App() {
  const darkMode = useAppSelector((state) => state.rootReducer.darkMode);
  const current = useAppSelector((state) => state.metaheuristique.currentId);
  const metas = useAppSelector((state) => state.metaheuristique.entities);

  const dispatch = useAppDispatch();

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

  function handleMainMenu() {
    dispatch(setCurrentId(""));
  }

  const buttons = useMemo(() => {
    return Object.entries(
      Object.groupBy(Object.values(metas), (v) => v.name)
    ).map(([name, meta]) => (
      <>
        <Divider key={name}>{name}</Divider>
        {meta!.map((m) => (
          <Grid item xs={12}>
            <ButtonPercent id={m.id} key={m.id} />
          </Grid>
        ))}
      </>
    ));
  }, [metas]);

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
          flexDirection={"column"}
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
              <Grid item>
                <Paper
                  elevation={2}
                  sx={{
                    height: "100%",
                  }}
                >
                  <Grid item xs={12} p={1}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleCreateSoltion}
                      variant="contained"
                    >
                      Ajouter
                    </Button>
                  </Grid>
                  <Grid item xs={12} p={1}>
                    <Button onClick={handleMainMenu} variant="contained">
                      Menu
                    </Button>
                  </Grid>
                  {buttons}
                </Paper>
              </Grid>
              <Grid item flex={1}>
                {current !== "" && <Solution id={current} key={current} />}
                {current === "" && <MainGraphic />}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Modal open={open} handleClose={handleClose} />
    </ThemeProvider>
  );
}

export default App;
