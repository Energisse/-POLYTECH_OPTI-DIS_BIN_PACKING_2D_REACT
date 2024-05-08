import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Grid, Paper, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./hooks";
import { setDarkMode } from "./reducers/rootReducer";

export default function Header() {
  const dispatch = useAppDispatch();

  const darkMode = useAppSelector((state) => state.rootReducer.darkMode);

  function toggleDarkMode() {
    dispatch(setDarkMode(!darkMode));
  }

  return (
    <header>
      <Grid
        container
        justifyContent={"space-between"}
        p={1}
        alignItems={"center"}
        component={Paper}
      >
        <Typography variant="h3" gutterBottom>
          OptiDis Bin Packing 2D
        </Typography>
        {darkMode ? (
          <LightModeIcon onClick={toggleDarkMode} fontSize="large" />
        ) : (
          <DarkModeIcon onClick={toggleDarkMode} fontSize="large" />
        )}
      </Grid>
    </header>
  );
}
