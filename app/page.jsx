"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  CssBaseline,
  IconButton,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PestControlRodentIcon from "@mui/icons-material/PestControlRodent";
import { useRouter } from "next/navigation";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const [procnumberError, setProcnumberError] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  const handleNavigate = (path, src) => {
    if (!searchValue.trim()) {
      setProcnumberError(true);
      return;
    } else {
      setProcnumberError(false);
      router.push(
        `${path}?q=${encodeURIComponent(searchValue)}&src=${encodeURIComponent(
          src
        )}`
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <IconButton
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
        }}
        color="inherit"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
      <Snackbar
        open={procnumberError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        onClose={() => setProcnumberError(false)}
      >
        <Alert severity="warning" sx={{ width: "100%" }}>
          Please enter a numeric value before searching
        </Alert>
      </Snackbar>
      <Box
        sx={{
          position: "absolute",
          top: 64,
          left: 0,
          width: "100%",
          height: "calc(100% - 64px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 2,
          paddingTop: 4,
        }}
      >
        <PestControlRodentIcon fontSize="large" />
        <TextField
          id="searchValue"
          label="Search"
          variant="outlined"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            if (procnumberError) setProcnumberError(false);
          }}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => handleNavigate("/contas", "geco")}
          >
            Geco
          </Button>
          <Button
            variant="contained"
            onClick={() => handleNavigate("/contas", "balc")}
          >
            Balc
          </Button>
          <Button
            variant="contained"
            onClick={() => handleNavigate("/penhoras")}
          >
            Penhoras
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
