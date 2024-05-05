import { HillClimbingConfig } from "polytech_opti-dis_bin_packing_2d";
import { TabouConfig } from 'polytech_opti-dis_bin_packing_2d/dist/src/metaheuristique/tabou';
import { SubmitHandler, useForm } from "react-hook-form";
import { useAppDispatch } from "../hooks";
import { setConfig } from "../reducers/metaheuristique";

export default function FormHillClimbingConfig() {
    const { handleSubmit } = useForm<HillClimbingConfig>()
    
    const dispatch = useAppDispatch()
    
    const onSubmit: SubmitHandler<TabouConfig> = (data) => {
        dispatch(setConfig(data))
    }

    return <form onSubmit={handleSubmit(onSubmit)}></form>
    
}