import { useParentSize } from "@cutting/use-get-parent-size";
import { Grid } from "@mui/material";
import {  DataSet, Genetique, HillClimbing, Metaheuristique, RecruitSimule, Tabou } from "polytech_opti-dis_bin_packing_2d";
import Bin from "polytech_opti-dis_bin_packing_2d/dist/src/bin";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UncontrolledReactSVGPanZoom } from "react-svg-pan-zoom";
import BinSVG from "./BinSVG";
import ItemSVG from "./ItemSVG";
import { useAppDispatch, useAppSelector } from "./hooks";
import { setState } from "./reducers/rootReducer";

type SvgState = [
  {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
  }[],
  {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    id: number;
  }[],
]


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
    const [items, setItems] = useState<SvgState>([[],[]])
    const [generator, setGenerator] = useState<ReturnType<Metaheuristique["run"]> | null>(null)
    const dispatch = useAppDispatch()

    const run = useCallback(()=>{
        if(!generator) return
        const value = generator.next()
        if(value.done){
            dispatch(setState("finished"))
            return
        }

        const bins:SvgState = [[],[]]
        value.value.solution[0].bins.forEach((bin,i) => {
            let result = draw(bin,i*(binWidth+50),i.toString())
            bins[0].push(...result[0])
            bins[1].push(...result[1])
        });
        setItems(bins)
        

        function draw(bin:Bin,d:number,id:string){
            const items:SvgState = [[],[]]
            
            items[0].push({x:bin.x+d,y:bin.y,width:bin.width,height:bin.height,id})
            if(bin.item){
                items[1].push({x:bin.x+d,y:bin.y,width:bin.item.width,height:bin.item.height,color:bin.item.color,id:bin.item.id})
            }
            
            bin.subBins.forEach((item,i) => {
                let result = draw(item,d,id+"-"+i)
                items[0].push(...result[0])
                items[1].push(...result[1])
            });

            return items
        }
        
    },[binWidth, dispatch, generator])

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

    const svgWidht = useMemo(()=>{
        return items[0].reduce((acc,item)=>Math.max(acc,item.x+item.width),0)
    },[items])

    useEffect(()=>{
        
        run()
        if(state === "running"){
             //@ts-ignore
             Viewer.current?.fitToViewer("center","center")
        }
    },[generator, run])

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
             <svg width={svgWidht} height={binHeight} style={{
           }} > 
             {items[1].sort((a,b)=>a.id-b.id).map((item,i) => {
                 return <ItemSVG {...item } transitionDuration={speed/1000/2} key={item.id}/>
             })}
             {items[0].sort((a,b)=>{
                if(a.id === b.id) return 0
                return a.id > b.id ? 1 : -1
             }).map((item) => {
                 return <BinSVG {...item } transitionDuration={speed/1000/2} key={item.id}/>
             })}
           </svg>
         </UncontrolledReactSVGPanZoom>  
        }
        </Grid>
    )
}