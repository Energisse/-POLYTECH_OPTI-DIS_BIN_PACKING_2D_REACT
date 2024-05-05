import { useParentSize } from "@cutting/use-get-parent-size";
import { Grid } from "@mui/material";
  import Bin from "polytech_opti-dis_bin_packing_2d/dist/src/bin";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UncontrolledReactSVGPanZoom } from "react-svg-pan-zoom";
import BinSVG from "./BinSVG";
import ItemSVG from "./ItemSVG";
import { useAppDispatch, useAppSelector } from "./hooks";
import { addFitness, setState } from "./reducers/rootReducer";

type SvgState = {
  binPakings: Array<{
    bins: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      id: string;
    }>;
    items: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      id: number;
    }>;
  }>;
  width: number;
  height: number;
};

const paddingPercent = 1.1;

export default function Affichage() {
  const parent = useRef(null);
  const Viewer = useRef<UncontrolledReactSVGPanZoom>(null);
  const { width } = useParentSize(parent);
  const speed = useAppSelector((state) => state.speed);
  const state = useAppSelector((state) => state.state);
  const algo = useAppSelector((state) => state.algo);
  const dataSet = useAppSelector((state) => state.dataSet);
  const [binPackingData, setItems] = useState<SvgState>({
    binPakings: [],
    width: 0,
    height: 0,
  });
  const dispatch = useAppDispatch();

  const run = useCallback(() => {
    if (!dataSet) return;
    if (!algo) return;
    const value = algo.run();
    if (value.done) {
      dispatch(setState("finished"));
      return;
    }
    dispatch(
      addFitness({
        iteration: value.value.iteration,
        fitness: value.value.solution[0].fitness,
        numberOfBin: value.value.solution[0].bins.length,
      })
    );
    console.log(value.value.solution);

    const solutions = value.value.solution.map((solution, y) => {
      const binPaking: SvgState["binPakings"][0] = {
        bins: [],
        items: [],
      };

      solution.bins.forEach((bin, i) => {
        let result = draw(
          bin,
          i * (dataSet.binWidth * paddingPercent),
          y * (dataSet.binWidth * paddingPercent),
          i.toString()
        );
        binPaking.bins.push(...result.bins);
        binPaking.items.push(...result.items);
      });
      return binPaking;
    });
    setItems({
      binPakings: solutions,
      width:
        (value.value.solution.reduce(
          (acc, solution) => Math.max(acc, solution.bins.length),
          0
        ) -
          1) *
          dataSet.binWidth *
          paddingPercent +
        dataSet.binWidth,
      height:
        (value.value.solution.length - 1) * dataSet.binHeight * paddingPercent +
        dataSet.binHeight,
    });

    function draw(bin: Bin, d: number, y: number, id: string) {
      const binPaking: SvgState["binPakings"][0] = {
        bins: [],
        items: [],
      };

      binPaking.bins.push({
        x: bin.x + d,
        y: bin.y + y,
        width: bin.width,
        height: bin.height,
        id,
      });
      if (bin.item) {
        binPaking.items.push({
          x: bin.x + d,
          y: bin.y + y,
          width: bin.item.width,
          height: bin.item.height,
          id: bin.item.id,
        });
      }

      bin.subBins.forEach((item, i) => {
        let result = draw(item, d, y, id + "-" + i);
        binPaking.bins.push(...result.bins);
        binPaking.items.push(...result.items);
      });

      return binPaking;
    }
  }, [dataSet, dispatch, algo]);

  useEffect(() => {
    if (state === "running") {
      run();
      setTimeout(() => {
        //@ts-ignore
        Viewer.current?.fitToViewer("center", "center");
      }, 100);
    } 
  }, [run, state]);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (state === "running") {
      interval = setInterval(run, speed);
    }
    return () => clearInterval(interval);
  }, [state, speed, run]);

  const colors = useMemo(() => {
    const colors: string[] = [];
    if (!dataSet) return colors;
    for (let i = 1; i <= dataSet.items.length; i++) {
      const hue = (i / dataSet.items.length) * 300; //red is 0 and 360, green is 120, blue is 240, purple is 300
      colors.push(`hsl(${hue},100%,${((i % 3) + 1) * 25}%)`);
    }
    return colors;
  }, [dataSet]);

  return (
    <Grid item container xs={12} ref={parent}>
      {width && colors && (
        <UncontrolledReactSVGPanZoom
          ref={Viewer}
          width={width}
          height={500}
          detectAutoPan={false}
        >
          <svg width={binPackingData.width} height={binPackingData.height}>
            {binPackingData.binPakings.map(({ bins, items }, i) => (
              <>
                {items
                  .sort((a, b) => a.id - b.id)
                  .map((item) => (
                    <ItemSVG
                      {...item}
                      color={colors[item.id - 1]}
                      transitionDuration={speed / 1000 / 2}
                      key={item.id}
                    />
                  ))}
                {bins
                  .sort((a, b) => parseInt(a.id) - parseInt(b.id))
                  .map((bin, i) => (
                    <BinSVG
                      {...bin}
                      transitionDuration={speed / 1000 / 2}
                      key={bin.id}
                    />
                  ))}
              </>
            ))}
          </svg>
        </UncontrolledReactSVGPanZoom>
      )}
    </Grid>
  );
}
