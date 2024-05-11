import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useAppSelector } from "../hooks";
import { DataSet } from "polytech_opti-dis_bin_packing_2d";
import { useMemo } from "react";

export default function DatasetProperty({ id }: { id: number }) {
  const rawDataSet = useAppSelector(
    (state) => state.metaheuristique.entities[id].rawDataSet
  );

  const dataSet = useMemo(() => {
    if (!rawDataSet) return null;
    return new DataSet(rawDataSet);
  }, [rawDataSet]);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Largeur</TableCell>
              <TableCell>Hauteur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataSet?.items.map((item) => (
              <TableRow
                key={item.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.width}</TableCell>
                <TableCell>{item.height}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
