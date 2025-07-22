// components/ClientXMLViewer.tsx
"use client";

import dynamic from "next/dynamic";

const XMLViewer = dynamic(() => import("react-xml-viewer"), {
  ssr: false, // disables server-side rendering for this component
});

export default XMLViewer;
