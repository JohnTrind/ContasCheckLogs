"use client";

import { useState, useMemo ,useEffect} from "react";
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
  Alert,
  Snackbar ,
  MuiAlert
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ClientXMLViewer from "./components/ClientXMLViewer";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import PestControlRodentIcon from '@mui/icons-material/PestControlRodent';
import DownloadIcon from '@mui/icons-material/Download';
import SortableTable from './components/SortableTable'
import { useSearchParams } from 'next/navigation';
export default function Home() {
  const searchParams = useSearchParams();
  const initialProc = searchParams.get('q');
  const source = searchParams.get('src') ;
console.log(source)

console.log(initialProc)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bank, setBank] = useState("0033");
  const [procnumber, setProcnumber] = useState(initialProc || "");

  const [xml1, setXml1] = useState("");
  const [xml2, setXml2] = useState("");
  const [xml1Name, setXml1Name] = useState("");
  const [xml2Name, setXml2Name] = useState("");

  const [items, setItems] = useState([]);

  const [collapsedLeft, setCollapsedLeft] = useState(false);
  const [collapsedRight, setCollapsedRight] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [procnumberError, setProcnumberError] = useState(false);

  const [copied, setCopied] = useState(false);


  
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
    if (!procnumber.trim() || !bank) {
      setProcnumberError(true);
      return;
    }
    setProcnumberError(false);
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
	toggleSidebar()
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

  useEffect(() => {
    if (initialProc) {
      setProcnumber(initialProc)
      fetchData(source === 'balc' ? 'getBalcLog' : 'getGecoLog');
    }
  }, [initialProc, source]);

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
	{ code: "0010", label: "BPI" },
  ];
  
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      setCopied(true);
    })
    .catch(err => {
      console.error('Could not copy text: ', err);
    });
}
const downloadPair = () => {
    const sanitizePassword = (xmlString) => {
        return xmlString.replace(/<password>(.*?)<\/password>/gi, '<password>*PASSWORD_HERE*</password>');
    };

    const sanitizedXml1 = sanitizePassword(xml1);
    const sanitizedXml2 = sanitizePassword(xml2);

    const blob1 = new Blob([sanitizedXml1], { type: "text/xml" });
    const link1 = document.createElement("a");
    link1.href = URL.createObjectURL(blob1);
    link1.download = xml1Name || "request.xml";
    document.body.appendChild(link1);
    link1.click();
    document.body.removeChild(link1);
    URL.revokeObjectURL(link1.href);

    const blob2 = new Blob([sanitizedXml2], { type: "text/xml" });
    const link2 = document.createElement("a");
    link2.href = URL.createObjectURL(blob2);
    link2.download = xml2Name || "response.xml";
    document.body.appendChild(link2);
    link2.click();
    document.body.removeChild(link2);
    URL.revokeObjectURL(link2.href);
};


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
            onChange={(e) => {
              setProcnumber(e.target.value);
              if (procnumberError) setProcnumberError(false);
            }}
          />

          <ButtonGroup variant="contained">
            <Button onClick={() => fetchData("getGecoLog")}>Search GECO</Button>
            <Button onClick={() => fetchData("getBalcLog")}>Search BALC</Button>
          </ButtonGroup>

          <Box sx={{ flexGrow: 1 }} />
			{xml1 && xml2 ? <Button variant="outlined" color="primary" onClick={downloadPair}>
            Download Pair
          </Button> : <></> }
		  
          <Button variant="outlined" color="secondary" onClick={clearXML}>
            Clear
          </Button>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Snackbar
        open={copied}
		anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={()=>setCopied(false)}
      >
	  <Alert
          severity="success"
          sx={{ width: '100%' }}
        >
		Path copied
		</Alert>
	   </Snackbar>
		<Snackbar
        open={procnumberError}
		anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={()=>setProcnumberError(false)}
      >
	  <Alert
          severity="warning"
          sx={{ width: '100%' }}
        >
		Please enter a ProcNumber and Bank before searching
		</Alert>
	   </Snackbar>
      <Drawer anchor="left" open={sidebarOpen} onClose={toggleSidebar}>
          <SortableTable
			items={items}
			copyToClipboard={copyToClipboard}
			loadXMLPair={loadXMLPair}
		  />
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
            <CircularProgress size="6rem" />
          </Box>
        )}
		{xml1 && xml2 ? 
		<>
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
              <ClientXMLViewer
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
              <ClientXMLViewer
                xml={formatXML(xml2)}
                collapsible
                showLineNumbers
                theme={xmlviewerTheme}
              />
            </Box>
          )}
        </Box>
		</>
		:
		
<Box
            sx={{
              position: "absolute",
              top: 64,
              left: 0,
              width: "100%",
              height: "calc(100% - 64px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
>
<PestControlRodentIcon fontSize="large"/></Box>}
      </Box>
    </ThemeProvider>
  );
}
