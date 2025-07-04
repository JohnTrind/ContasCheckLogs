"use client";

import { useState } from "react";
import styles from "./page.module.css";
import XMLViewer from "react-xml-viewer";

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bank, setBank] = useState("0033");
  const [procnumber, setProcnumber] = useState("");
  const [xml1, setXml1] = useState("");
  const [xml2, setXml2] = useState("");
  const [xml1Name, setXml1Name] = useState("XML 1:");
  const [xml2Name, setXml2Name] = useState("XML 2:");
  const [items, setItems] = useState([]);
  const [collapsedLeft, setCollapsedLeft] = useState(false);
  const [collapsedRight, setCollapsedRight] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

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
      setXml1Name(`XML 1: ${request?.fileName || "N/A"}`);
      setXml2Name(`XML 2: ${response?.fileName || "N/A"}`);
      setSidebarCollapsed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearXML = () => {
    setXml1("");
    setXml2("");
    setXml1Name("XML 1:");
    setXml2Name("XML 2:");
  };

  return (
    <div className={styles.page}>
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      )}

      <div
        className={sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebar}
      >
        {items.map((item, idx) => (
          <><div
            key={idx}
            className={styles.sidebarItem}
            onClick={() => loadXMLPair(item.fileName, item.dir)}
          >
            {item.fileName}
          </div></>
          
        ))}
      </div>

      <main className={styles.main}>
        <div className={styles.inputs}>
          <input
            placeholder="Bank"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
          />
          <input
            placeholder="ProcNumber"
            value={procnumber}
            onChange={(e) => setProcnumber(e.target.value)}
          />
          <button onClick={() => fetchData("getGecoLog")}>Search GECO</button>
          <button onClick={() => fetchData("getBalcLog")}>Search BALC</button>
          <button onClick={toggleSidebar}>Toggle Sidebar</button>
          <button onClick={clearXML}>Clear</button>
        </div>
        <div className={styles.xmlContainer}>
          <div className={styles.controlGroup}>
            <span>{xml1Name}</span>
            <button onClick={() => setCollapsedLeft(!collapsedLeft)}>
              {collapsedLeft ? "Expand Request" : "Collapse Request"}
            </button>
            
          </div>

          <div className={styles.controlGroup}>
            <button onClick={() => setCollapsedRight(!collapsedRight)}>
              {collapsedRight ? "Expand Response" : "Collapse Response"}
            </button>
            <span>{xml2Name}</span>
          </div>
        </div>

        <div className={styles.xmlContainer}>
          <div></div>
          {!collapsedLeft && (
            <div
              className={styles.xmlViewerWrapper}
              style={{ width: collapsedRight ? "100%" : "50%" }}
            >
              <div className={styles.xmlViewer}>
                <XMLViewer
                  xml={xml1}
                  collapsible={true}
                  showLineNumbers={true}
                />
              </div>
            </div>
          )}

          {!collapsedRight && (
            <div
              className={styles.xmlViewerWrapper}
              style={{ width: collapsedLeft ? "100%" : "50%" }}
            >
              <div className={styles.xmlViewer}>
                <XMLViewer
                  xml={xml2}
                  collapsible={true}
                  showLineNumbers={true}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
