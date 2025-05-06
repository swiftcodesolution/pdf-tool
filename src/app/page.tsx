"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const Home = () => {
  const [fields, setFields] = useState<
    { date: string; name: string; death_benefit: string; ror: string }[]
  >([]);
  const [tableData, setTableData] = useState<
    { year: string; age: string; cash_value: string; death_benefit: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);

    const file = acceptedFiles[0];

    if (!file.type.includes("pdf")) {
      setError("Please upload PDF!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:8000/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to extract Data");
      }

      const { fields: extractedFields, table: extractedTable } =
        await res.json();
      setFields((prev) => [...prev, extractedFields]);
      setTableData((prev) => [...prev, ...extractedTable]);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Error processing PDF");
      console.error(error.message);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  return (
    <>
      <div className="min-h-screen p-6 bg-background">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>IUL PDF EXTRACTOR</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`p-6 border-2 border-dashed rounded-lg text-center ${
                isDragActive ? "border-primary bg-primary/10" : "border-muted"
              }`}
            >
              <input {...getInputProps()} />
              <p>Drag & Drop an insurance PDF or click to upload</p>
            </div>
            {error && <p className="text-descriptive.mt-2">{error}</p>}
            {fields.length > 0 && (
              <>
                <h3 className="mt-6 text-lg font-semibold">Extracted Fields</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Death Benefit</TableHead>
                      <TableHead>ROR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell>{data.date}</TableCell>
                        <TableCell>{data.name}</TableCell>
                        <TableCell>{data.death_benefit}</TableCell>
                        <TableCell>{data.ror}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
            {tableData.length > 0 && (
              <>
                <h3 className="mt-6 text-lg font-semibold">
                  Extracted Table Data
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>cash Value</TableHead>
                      <TableHead>Death Benefit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell>{row.age}</TableCell>
                        <TableCell>{row.cash_value}</TableCell>
                        <TableCell>{row.death_benefit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => {
                setFields([]);
                setTableData([]);
              }}
            >
              Clear Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Home;
