"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  CssBaseline,
  ButtonGroup,
  Autocomplete,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Grid,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import XMLViewer from "react-xml-viewer";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bank, setBank] = useState("0033");
  const [procnumber, setProcnumber] = useState("");
  const [xml1, setXml1] = useState("");
  const [xml2, setXml2] = useState("");
  const [xml1Name, setXml1Name] = useState("");
  const [xml2Name, setXml2Name] = useState("");
  const [items, setItems] = useState([]);
  const [collapsedLeft, setCollapsedLeft] = useState(false);
  const [collapsedRight, setCollapsedRight] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const formatXML = (xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const serializer = new XMLSerializer();
      const rawXML = serializer.serializeToString(xmlDoc);
      const PADDING = "  ";
      const lines = rawXML.replace(/>\s*</g, ">\n<").split("\n");

      let indentLevel = 0;
      return lines
        .map((line) => {
          line = line.trim();
          if (line.match(/^<\/.+>/)) indentLevel--;
          const pad = PADDING.repeat(indentLevel);
          if (line.match(/^<[^!?][^>]*[^\/]>$/)) indentLevel++;
          return pad + line;
        })
        .join("\n");
    } catch {
      return xmlString;
    }
  };

  const fetchData = async (endpoint) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3001/${endpoint}?procnumber=${procnumber}&bank=${bank}`
      );
      const data = await res.json();
      setItems(data);
      setSidebarOpen(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadXMLPair = async (fileName, dir) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3001/getProcPair?filename=${fileName}&fileloc=${dir}&procnumber=${procnumber}&bank=${bank}`
      );
      const data = await res.json();
      const request = data.find((x) => x.fileName.includes("REQUEST"));
      const response = data.find((x) => x.fileName.includes("RESPONSE"));

      setXml1(request ? request.xml : "No REQUEST XML found");
      setXml2(response ? response.xml : "No RESPONSE XML found");
      setXml1Name(`${request?.fileName || "N/A"}`);
      setXml2Name(`${response?.fileName || "N/A"}`);
      setSidebarOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearXML = () => {
    setXml1("");
    setXml2("");
    setXml1Name("");
    setXml2Name("");
  };

  const xmlviewerTheme = {
    textColor: "#355691",
    attributeValueColor: "#413F54",
    tagColor: "#5F5AA2",
    separatorColor: "#30292F",
    lineNumberBackground: "#355691",
  };

  const bankOptions = [
    { code: "0033", label: "MBCP" },
    { code: "0023", label: "AB" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <IconButton color="inherit" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>

          <Autocomplete
            options={bankOptions}
            getOptionLabel={(option) => option.label}
            value={bankOptions.find((opt) => opt.code === bank) || null}
            onChange={(event, newValue) => {
              setBank(newValue ? newValue.code : "");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Bank" size="small" />
            )}
            sx={{ minWidth: 200 }}
          />

          <TextField
            label="ProcNumber"
            value={procnumber}
            size="small"
            onChange={(e) => setProcnumber(e.target.value)}
          />

          <ButtonGroup variant="contained">
            <Button onClick={() => fetchData("getGecoLog")}>Search GECO</Button>
            <Button onClick={() => fetchData("getBalcLog")}>Search BALC</Button>
          </ButtonGroup>

          {/* This Box pushes the right buttons to the end */}
          <Box sx={{ flexGrow: 1 }} />

          <Button variant="outlined" color="secondary" onClick={clearXML}>
            Clear
          </Button>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={sidebarOpen} onClose={toggleSidebar}>
        <Box>
          <TableContainer component={Paper}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Dir</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>File Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    sx={{
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                    onClick={() => loadXMLPair(item.fileName, item.dir)}
                  >
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.dir}</TableCell>
                    <TableCell>{item.fileName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Drawer>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          height: "calc(100vh - 64px)",
        }}
      >
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 64,
              left: 0,
              width: "100%",
              height: "calc(100% - 64px)",
              bgcolor: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Grid
          container
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Grid
            container
            direction="row"
            sx={{
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {xml1Name}
            </Typography>

            <IconButton onClick={() => setCollapsedLeft(!collapsedLeft)}>
              {collapsedLeft ? (
                <KeyboardDoubleArrowRightIcon />
              ) : (
                <KeyboardDoubleArrowLeftIcon />
              )}
            </IconButton>
          </Grid>

          {collapsedLeft && collapsedRight ? (
            <Button
              size="small"
              onClick={() => {
                setCollapsedLeft(false), setCollapsedRight(false);
              }}
            >
              Expand All
            </Button>
          ) : (
            <></>
          )}

          <Grid
            container
            direction="row"
            sx={{
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >

            <IconButton onClick={() => setCollapsedRight(!collapsedRight)}>
              {collapsedRight ? (
                <KeyboardDoubleArrowLeftIcon />
              ) : (
                <KeyboardDoubleArrowRightIcon />
              )}
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {xml2Name}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          {!collapsedLeft && (
            <Box
              sx={{
                flex: collapsedRight ? 1 : 0.5,
                overflow: "auto",
                pr: 1,
                borderRight: "1px solid",
                borderColor: "divider",
              }}
            >
              <XMLViewer
                xml={formatXML(xml1)}
                collapsible
                showLineNumbers
                theme={xmlviewerTheme}
              />
            </Box>
          )}

          {!collapsedRight && (
            <Box
              sx={{
                flex: collapsedLeft ? 1 : 0.5,
                overflow: "auto",
                pl: 1,
              }}
            >
              <XMLViewer
                xml={formatXML(xml2)}
                collapsible
                showLineNumbers
                theme={xmlviewerTheme}
              />
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
