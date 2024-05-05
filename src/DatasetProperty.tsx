import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { useAppSelector } from "./hooks"

export default function DatasetProperty(){
    
    const dataSet = useAppSelector(state=>state.metaheuristique.dataSet)
    
    return <>
        {/* {dataset && <>
            <h2>Dataset properties</h2>
            <p>Number of items: {dataset.items.length}</p>
            <p>Bin width: {dataset.binWidth}</p>
            <p>Bin height: {dataset.binHeight}</p>
            {dataset.items.map((item,index)=><p key={index}>Item {index+1}: {item.width}x{item.height}</p>)}

        </>} */}
         <TableContainer component={Paper}>
      <Table >
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
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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

}
