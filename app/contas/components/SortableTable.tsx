import React, { useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableSortLabel,
} from "@mui/material";

function SortableTable({ items, copyToClipboard, loadXMLPair }) {
  const [orderBy, setOrderBy] = useState("date");
  const [order, setOrder] = useState("desc");

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedItems = [...items].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (orderBy === "date") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else {
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
    }

    if (aValue < bValue) return order === "asc" ? -1 : 1;
    if (aValue > bValue) return order === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <TableContainer component={Paper}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {["date", "dir", "fileName"].map((column) => (
              <TableCell
                key={column}
                sortDirection={orderBy === column ? order : false}
                sx={{ fontWeight: "bold" }}
              >
                <TableSortLabel
                  active={orderBy === column}
                  direction={orderBy === column ? order : "asc"}
                  onClick={() => handleSort(column)}
                >
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedItems.map((item, idx) => (
            <TableRow
              key={idx}
              hover
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
              <TableCell onClick={() => copyToClipboard(item.dir)}>
                {item.dir}
              </TableCell>
              <TableCell onClick={() => loadXMLPair(item.fileName, item.dir)}>
                {item.fileName}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SortableTable;
