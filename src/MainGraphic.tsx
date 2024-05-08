import { Grid, Paper, useTheme } from "@mui/material";
import { useMemo } from "react";
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
import "./App.css";
import { useAppSelector } from "./hooks";
import { selectAllStatistic } from "./reducers/metaheuristique";

function MainGraphic() {
  const statistic = useAppSelector(selectAllStatistic);
  const metaheuristiques = useAppSelector(
    (state) => state.metaheuristique.metaheuristiques
  );

  const theme = useTheme();

  const colors = useMemo(() => {
    const colors: string[] = [];
    if (!statistic) return colors;
    for (let i = 1; i <= metaheuristiques.length; i++) {
      const hue = (i / metaheuristiques.length) * 300; //red is 0 and 360, green is 120, blue is 240, purple is 300
      colors.push(`hsl(${hue},100%,50%)`);
    }
    return colors;
  }, [statistic, metaheuristiques.length]);

  return (
    <Grid container justifyContent={"center"} alignItems={"center"}>
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ height: "100%" }}>
          <ResponsiveContainer height={250} width="100%">
            <LineChart
              data={statistic}
              syncId="anyId"
              margin={{
                top: 25,
                right: 25,
                left: 25,
                bottom: 25,
              }}
            >
              <CartesianGrid strokeDasharray="5 5 " />
              <XAxis
                dataKey="iteration"
                scale={"linear"}
                type="number"
                domain={["auto", "auto"]}
              >
                <Label value="Iteration" position="bottom" />
              </XAxis>
              <YAxis yAxisId="numberOfBin" type="number">
                <Label value="Number of bin" position="center" angle={-90} />
              </YAxis>
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.default,
                }}
              />
              {Array(metaheuristiques.length)
                .fill(0)
                .map((_, i) => (
                  <Line
                    yAxisId="numberOfBin"
                    name={metaheuristiques[i].metaheuristique}
                    type="monotone"
                    dataKey={`solutions[${i}].numberOfBin`}
                    stroke={colors[i]}
                    isAnimationActive={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ height: "100%" }}>
          <ResponsiveContainer height={250} width="100%">
            <LineChart
              data={statistic}
              syncId="anyId"
              margin={{
                top: 25,
                right: 25,
                left: 25,
                bottom: 25,
              }}
            >
              <CartesianGrid strokeDasharray="5 5 " />
              <XAxis
                dataKey="iteration"
                scale={"linear"}
                type="number"
                domain={["auto", "auto"]}
              >
                <Label value="Iteration" position="bottom" />
              </XAxis>
              <YAxis
                yAxisId="fitness"
                type="number"
                tickFormatter={(value) =>
                  Number(value.toFixed(10)).toExponential()
                }
              >
                <Label value="Fitness" position="center" angle={-90} />
              </YAxis>
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.default,
                }}
              />
              {Array(metaheuristiques.length)
                .fill(0)
                .map((_, i) => (
                  <Line
                    yAxisId="fitness"
                    type="monotone"
                    name={metaheuristiques[i].metaheuristique}
                    dataKey={`solutions[${i}].fitness`}
                    stroke={colors[i]}
                    isAnimationActive={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default MainGraphic;
