import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Select,
} from "@mui/material";
import { ChangeEvent, useState } from "react";
import "./App.css";
import { useAppDispatch } from "./hooks";
import {
  Metaheuristiques,
  createSolition,
  metaheuristiques,
} from "./reducers/metaheuristique";

function Modal({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const dispatch = useAppDispatch();

  const [selectedAlgo, setSelectedAlgo] = useState<Metaheuristiques>("Tabou");
  const [fileContent, setFileContent] = useState<string>("");

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    console.log(event.target);
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
    };
    reader.readAsText(file);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          dispatch(
            createSolition({
              metaheuristique: selectedAlgo,
              fileContent,
            })
          );
          handleClose();
        },
      }}
    >
      <DialogContent>
        <Select
          onChange={(e) => setSelectedAlgo(e.target.value as Metaheuristiques)}
          value={selectedAlgo}
          label="Metaheuristique"
        >
          {metaheuristiques.map((algo) => (
            <MenuItem key={algo} value={algo}>
              {algo}
            </MenuItem>
          ))}
        </Select>
        <label>
          <input
            multiple
            type="file"
            style={{ display: "none" }}
            onChange={onChange}
          />
          <Button
            variant="contained"
            color="primary"
            component="span"
            startIcon={<FileDownloadIcon />}
          >
            Importer un fichier
          </Button>
        </label>
        <pre>{fileContent}</pre>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button type="submit">Ajouter</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Modal;
