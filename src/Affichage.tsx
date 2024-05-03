import { useParentSize } from "@cutting/use-get-parent-size";
import { Grid } from "@mui/material";
import { DataSet, Genetique, HillClimbing, Metaheuristique, RecruitSimule, Tabou } from "polytech_opti-dis_bin_packing_2d";
import Bin from "polytech_opti-dis_bin_packing_2d/dist/src/bin";
import { useCallback, useEffect, useRef, useState } from "react";
import { UncontrolledReactSVGPanZoom } from "react-svg-pan-zoom";
import BinSVG from "./BinSVG";
import ItemSVG from "./ItemSVG";
import { useAppDispatch, useAppSelector } from "./hooks";
import { addFitness, setState } from "./reducers/rootReducer";

type SvgState = {
    binPakings:Array<{
        bins:Array<
        {
          x: number;
          y: number;
          width: number;
          height: number;
          id: string;
        }>,
        items:Array<{
          x: number;
          y: number;
          width: number;
          height: number;
          color: string;
          id: number;
        }>,
    }>
    width:number
    height:number
};

const paddingPercent = 1.1

export default function Affichage() {
    const parent = useRef(null);
    const Viewer = useRef<UncontrolledReactSVGPanZoom>(null);
    const {width} = useParentSize(parent)
    const metaheuristique = useAppSelector(state=>state.metaheuristique)
    const speed = useAppSelector(state=>state.speed)
    const state = useAppSelector(state=>state.state)
    const fileContent = useAppSelector(state=>state.fileContent)
    const binWidth = useAppSelector(state=>state.binWidth)
    const binHeight = useAppSelector(state=>state.binHeight)
    const [binPackingData, setItems] = useState<SvgState>({
        binPakings:[],
        width:0,
        height:0
    })
    const [generator, setGenerator] = useState<ReturnType<Metaheuristique["run"]> | null>(null)
    const dispatch = useAppDispatch()

    const run = useCallback(()=>{
        if(!generator) return
        const value = generator.next()
        if(value.done){
            dispatch(setState("finished"))
            return
        }
        dispatch(addFitness({
            iteration: value.value.iteration,
            fitness: value.value.solution[0].fitness,
            numberOfBin: value.value.solution[0].bins.length
        }))

        const solutions = value.value.solution.map((solution,y)=>{
            const binPaking:SvgState["binPakings"][0] = {
                bins:[],
                items:[]
            }

            solution.bins.forEach((bin,i) => {
                let result = draw(bin,i*(binWidth*paddingPercent),y*(binWidth*paddingPercent),i.toString())
                binPaking.bins.push(...result.bins)
                binPaking.items.push(...result.items)
            });
            return binPaking
        }) 
        setItems({
            binPakings:solutions,
            width:(value.value.solution.reduce((acc,solution)=>Math.max(acc,solution.bins.length),0)-1)*binWidth*paddingPercent + binWidth,
            height:(value.value.solution.length-1)*binHeight*paddingPercent + binHeight
        
        })
        

        function draw(bin:Bin,d:number,y:number,id:string){
            const binPaking:SvgState["binPakings"][0] = {
                bins:[],
                items:[]
            }
            
            binPaking.bins.push({x:bin.x+d,y:bin.y+y,width:bin.width,height:bin.height,id})
            if(bin.item){
                binPaking.items.push({x:bin.x+d,y:bin.y+y,width:bin.item.width,height:bin.item.height,color:bin.item.color,id:bin.item.id})
            }
            
            bin.subBins.forEach((item,i) => {
                let result = draw(item,d,y,id+"-"+i)
                binPaking.bins.push(...result.bins)
                binPaking.items.push(...result.items)
            });

            return binPaking
        }
        
    },[binHeight, binWidth, dispatch, generator])

    useEffect(()=>{
        if(state === "running"){
            if(!generator){
                const dataSet = new DataSet(fileContent!)
                switch(metaheuristique){
                    case "Recuit simulé":
                        setGenerator(new RecruitSimule(dataSet).run())
                        break;
                    case "Tabou":
                        setGenerator( new Tabou(dataSet).run())
                        break;
                    case "Genetique":
                        setGenerator( new Genetique(dataSet).run())
                        break;
                    case "Hill Climbing":
                        setGenerator( new HillClimbing(dataSet).run())
                        break;
                }
            }
        }
        if(state === "finished"){
            setGenerator(null)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[state])

    useEffect(()=>{
        run()
        if(state === "running"){
            setTimeout(()=>{
                //@ts-ignore
                Viewer.current?.fitToViewer("center","center")
            },50)
        }
    },[generator, run, state])

    useEffect(()=>{
        let interval:NodeJS.Timer
        if(state === "running"){
            interval=setInterval(run,speed)
        }
        return ()=>clearInterval(interval)

    },[state, speed, run, generator])

    return (
        <Grid item container xs={12} ref={parent}>
        {
          width &&   <UncontrolledReactSVGPanZoom
          ref={Viewer}
          width={width} height={500}
          detectAutoPan={false}
        >
            <svg width={binPackingData.width} height={binPackingData.height}> 
            {binPackingData.binPakings.map(({bins,items},i) => 
                <>
                    {items.sort((a,b)=>a.id-b.id).map((item,i) => <ItemSVG {...item } transitionDuration={speed/1000/2} key={item.id}/>)}
                    {bins.sort((a,b)=>parseInt(a.id)-parseInt(b.id)).map((bin,i) => <BinSVG {...bin} transitionDuration={speed/1000/2} key={bin.id}/>)}    
                </>
            )}
                </svg>
           
           
         </UncontrolledReactSVGPanZoom>  
        }
        </Grid>
    )
}