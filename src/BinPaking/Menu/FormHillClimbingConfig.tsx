import { HillClimbingConfig } from "polytech_opti-dis_bin_packing_2d";
import { TabouConfig } from "polytech_opti-dis_bin_packing_2d/dist/src/metaheuristique/tabou";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAppDispatch } from "../../hooks";
import { editConfig } from "../../reducers/metaheuristique";

export default function FormHillClimbingConfig({ id }: { id: string }) {
  const { handleSubmit } = useForm<HillClimbingConfig>();

  const dispatch = useAppDispatch();

  const onSubmit: SubmitHandler<TabouConfig> = (data) => {
    dispatch(
      editConfig({
        id,
        config: data,
      })
    );
  };

  return <form onSubmit={handleSubmit(onSubmit)}></form>;
}
