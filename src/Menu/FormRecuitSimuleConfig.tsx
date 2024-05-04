import { Button, TextField } from "@mui/material";
import { RecuitSimuleConfig } from "polytech_opti-dis_bin_packing_2d";
import { TabouConfig } from 'polytech_opti-dis_bin_packing_2d/dist/src/metaheuristique/tabou';
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setConfig } from "../reducers/rootReducer";
import isEqual from "lodash.isequal";

export default function FormRecuitSimuleConfig() {
    const algo = useAppSelector(state=>state.algo)
  
    const { handleSubmit, control, reset, watch } = useForm<RecuitSimuleConfig>({
        defaultValues: algo?.config ||  {
          iteration: 0,
          iterationByTemperature: 0,
          temperature: 0,
          temperatureDecrease: 0,
        },
      }) 
      
    useEffect(()=>{
        if(!algo?.config)return
        reset(algo?.config)
    },[algo?.config, reset])

    const dispatch = useAppDispatch()
    
    const onSubmit: SubmitHandler<TabouConfig> = (data) => {
        dispatch(setConfig(data))
    }

    return <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
            name="iteration"
            control={control}
            rules={{ required: false,min:0 }}
            render={({ field }) => 
                <TextField 
                    {...field} 
                    label="iteration" 
                    type="number" 
                    InputProps={{
                        inputProps: { 
                            min: 0 
                        }
                    }}  
                />
            }
        />
        <Controller
            name="iterationByTemperature"
            control={control}
            rules={{ required: false,min:0 }}
            render={({ field }) => 
                <TextField 
                    {...field} 
                    label="Nombre d'iteration par temperature" 
                    type="number" 
                    InputProps={{
                        inputProps: { 
                            min: 0 
                        }
                    }}  
                /> 
            }
        />

        <Controller
            name="temperature"
            control={control}
            rules={{ required: false,min:0 }}
            render={({ field }) => 
                <TextField 
                    {...field} 
                    label="temperature" 
                    type="number" 
                    InputProps={{
                        inputProps: { 
                            min: 0 
                        }
                    }}  
                /> 
            }
        />

        <Controller
            name="temperatureDecrease"
            control={control}
            rules={{ required: false,min:0 }}
            render={({ field }) => 
                <TextField 
                    {...field} 
                    label="decroissane" 
                    type="number" 
                    InputProps={{
                        inputProps: { 
                            step:0.01,
                            min:0,
                            max:1
                        }
                    }}  
                /> 
            }
        />

        <Button type="submit" variant="contained" disabled={isEqual(algo?.config,
            Object.entries(watch()).reduce((acc,[k,v])=>({...acc,[k]:+v}),{})
        )}>
            Valider
        </Button>
    </form>
}