import { Grid, Paper } from "@mui/material";
import Menu from "./Menu";
import Affichage from "./Affichage";
import DatasetProperty from "./DatasetProperty";
import Statistic from "./Statistic";

function Solution({ id }: { id: string }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={2}>
        <DatasetProperty id={id} />
      </Grid>

      <Grid item xs={10}>
        <Grid container flexDirection={"row"} rowGap={2}>
          <Grid item xs={12} component={Paper} p={1}>
            <Menu id={id} />
          </Grid>

          <Grid item xs={12} component={Paper} p={1} overflow={"hidden"}>
            <Affichage id={id} />
          </Grid>

          <Grid item xs={12}>
            <Statistic id={id} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Solution;
