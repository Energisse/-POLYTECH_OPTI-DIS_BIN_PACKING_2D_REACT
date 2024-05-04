import { Grid, Paper, ThemeProvider, createTheme } from "@mui/material";
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Affichage from "./Affichage";
import "./App.css";
import { useAppSelector } from "./hooks";
import Menu from "./Menu";
import DatasetProperty from "./DatasetProperty";
import Header from "./Header";

function App() {
  const fitness = useAppSelector((state) => state.fitness);
  const darkMode = useAppSelector((state) => state.darkMode);

  const darkTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });
  
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

          <Grid item xs={2}>
            <DatasetProperty />
          </Grid>

          <Grid item xs={10}>
            <Grid container flexDirection={"row"} rowGap={2}>
              <Grid item xs={12} component={Paper} p={1}>
                <Menu />
              </Grid>

              <Grid item xs={12} component={Paper} p={1} overflow={"hidden"}>
                <Affichage />
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Paper>
                    <ResponsiveContainer height={250} width="100%">
                      <LineChart
                        data={fitness}
                        syncId="anyId"
                        margin={{ top: 25, right: 25, left: 25, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="5 5 " />
                        <XAxis dataKey="iteration" scale={"linear"} type="number" domain={["auto","auto"]}>
                          <Label value="Iteration" position="bottom" />
                        </XAxis>  
                        <YAxis
                          yAxisId="fitness"
                          type="number"
                          tickFormatter={(value) =>
                            Number(value.toFixed(10)).toExponential()
                          }
                        >
                          <Label
                            value="Fitness"
                            position="center"
                            angle={-90}
                          />
                        </YAxis>
                        <Tooltip contentStyle={{
                          background: darkTheme.palette.background.default
                        }}/>
                        <Line
                          yAxisId="fitness"
                          type="monotone"
                          dataKey="fitness"
                          stroke="#8884d8"
                          strokeWidth={5}
                          isAnimationActive={false} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper>
                    <ResponsiveContainer height={250} width="100%">
                      <LineChart
                        data={fitness}
                        syncId="anyId"
                        margin={{ top: 25, right: 25, left: 25, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="5 5 "  />
                        <XAxis dataKey="iteration" scale={"linear"} type="number" domain={["auto","auto"]}>
                          <Label value="Iteration" position="bottom" />
                        </XAxis>
                        <YAxis yAxisId="numberOfBin" type="number">
                          <Label
                            value="Number of bin"
                            position="center"
                            angle={-90}
                          />
                        </YAxis>
                        <Tooltip contentStyle={{
                          background: darkTheme.palette.background.default
                        }}/>
                        <Line
                          yAxisId="numberOfBin"
                          type="monotone"
                          dataKey="numberOfBin"
                          stroke="#585"
                          strokeWidth={5}
                          isAnimationActive={false} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
