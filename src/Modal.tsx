import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { ChangeEvent, useMemo, useState } from "react";
import "./App.css";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  Metaheuristiques,
  addFile,
  createSolition,
  metaheuristiques,
  removeFile,
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
  const [rawDataSet, setrawDataSet] = useState<string>("");
  const files = useAppSelector((state) => state.metaheuristique.files);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      dispatch(addFile(e.target?.result as string));
      setrawDataSet(e.target?.result as string);
    };
    reader.readAsText(file);
  }

  const items = useMemo(() => {
    return Object.entries(files)
      .sort()
      .map(([key, value]) => (
        <MenuItem key={key} value={value}>
          {key}
        </MenuItem>
      ));
  }, [files]);

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
              rawDataSet,
            })
          );
          handleClose();
        },
      }}
    >
      <DialogContent>
        <FormControl
          sx={{
            margin: 1,
          }}
        >
          <InputLabel id="select-metaheuristique">Metaheuristique</InputLabel>
          <Select
            onChange={(e) =>
              setSelectedAlgo(e.target.value as Metaheuristiques)
            }
            value={selectedAlgo}
            label="Metaheuristique"
            labelId="select-metaheuristique"
          >
            {metaheuristiques.map((algo) => (
              <MenuItem key={algo} value={algo}>
                {algo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          sx={{
            margin: 1,
          }}
        >
          <InputLabel id="select-fichier">Fichier</InputLabel>
          <Select
            onChange={(e) => setrawDataSet(e.target.value as Metaheuristiques)}
            value={rawDataSet}
            label="Fichier"
            labelId="select-fichier"
          >
            {items}
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
        </FormControl>

        <pre>{rawDataSet}</pre>
        {rawDataSet && (
          <Button
            variant="contained"
            color="primary"
            onClick={(e) => {
              dispatch(removeFile(rawDataSet));
              if (Object.keys(files).length > 1)
                setrawDataSet(Object.entries(files)[0][1]);
              else setrawDataSet("");
            }}
          >
            supprimer
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button type="submit">Ajouter</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Modal;
