"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input, Label } from "@school-admin/ui";
import { apiGet, apiPost } from "@/lib/api-client";
import { parseCSV, mapCSVRowToStudent, detectColumnMapping } from "@/lib/csv-parser";
import { Select } from "@school-admin/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@school-admin/ui";

export default function ImportStudentsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Fetch academic years
  useEffect(() => {
    apiGet<{ academicYears: any[] }>("/academic-years").then((res) => {
      if (res.success && res.data) {
        setAcademicYears(res.data.academicYears);
      }
    });
  }, []);

  // Fetch classes when academic year changes
  useEffect(() => {
    if (selectedAcademicYearId) {
      apiGet<{ classes: any[] }>(`/classes?academicYearId=${selectedAcademicYearId}`).then(
        (res) => {
          if (res.success && res.data) {
            setClasses(res.data.classes);
          }
        }
      );
    } else {
      setClasses([]);
    }
  }, [selectedAcademicYearId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Read file
    const text = await selectedFile.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      alert("Le fichier CSV est vide");
      return;
    }

    setCsvData(rows);

    // Auto-detect mapping
    const headers = Object.keys(rows[0]);
    const detectedMapping = detectColumnMapping(headers);
    setMapping(detectedMapping);

    // Preview first 5 rows
    setPreviewData(rows.slice(0, 5));
  };

  const handleImport = async () => {
    if (!selectedAcademicYearId || !selectedClassId) {
      alert("Veuillez sélectionner une année scolaire et une classe");
      return;
    }

    if (csvData.length === 0) {
      alert("Aucune donnée à importer");
      return;
    }

    setImporting(true);

    try {
      // Map CSV rows to student format
      const students = csvData.map((row) =>
        mapCSVRowToStudent(row, mapping, selectedClassId, selectedAcademicYearId)
      );

      // Validate required fields
      const validStudents = students.filter(
        (s) => s.firstName && s.lastName && s.dateOfBirth
      );

      if (validStudents.length === 0) {
        alert("Aucun élève valide trouvé dans le fichier");
        setImporting(false);
        return;
      }

      // Import
      const response = await apiPost("/students/import", {
        students: validStudents,
      });

      if (response.success) {
        setImportResult(response.data);
        if (response.data.imported > 0) {
          setTimeout(() => {
            router.push("/admin/students");
          }, 2000);
        }
      } else {
        alert(`Erreur: ${response.error}`);
      }
    } catch (error) {
      console.error("Error importing:", error);
      alert("Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  const csvHeaders = csvData.length > 0 ? Object.keys(csvData[0]) : [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Import d'élèves</h1>
        <p className="text-muted-foreground">
          Importez des élèves depuis un fichier CSV
        </p>
      </div>

      {importResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Résultat de l'import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Importés:</span> {importResult.imported}
              </div>
              <div>
                <span className="font-medium">Échoués:</span> {importResult.failed}
              </div>
              <div>
                <span className="font-medium">Total:</span> {importResult.total}
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium">Erreurs:</p>
                  <ul className="list-disc list-inside">
                    {importResult.errors.map((err: any, i: number) => (
                      <li key={i}>
                        Ligne {err.row}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Étape 1 : Sélectionner le fichier CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Fichier CSV</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>
            {csvData.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {csvData.length} ligne(s) détectée(s)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {csvData.length > 0 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Étape 2 : Mapping des colonnes</CardTitle>
              <CardDescription>
                Associez les colonnes CSV aux champs de l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="academicYearId">Année scolaire *</Label>
                    <Select
                      id="academicYearId"
                      value={selectedAcademicYearId}
                      onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      {academicYears.map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="classId">Classe *</Label>
                    <Select
                      id="classId"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      disabled={!selectedAcademicYearId}
                    >
                      <option value="">Sélectionner...</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mapping des colonnes</Label>
                  {["firstName", "lastName", "dateOfBirth", "email", "phone"].map((field) => (
                    <div key={field} className="flex items-center gap-2">
                      <Label className="w-32">{field}:</Label>
                      <Select
                        value={mapping[field] || ""}
                        onChange={(e) =>
                          setMapping({ ...mapping, [field]: e.target.value })
                        }
                      >
                        <option value="">-</option>
                        {csvHeaders.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Étape 3 : Aperçu</CardTitle>
              <CardDescription>Vérifiez les données avant l'import</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Date naissance</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, i) => {
                    const student = mapCSVRowToStudent(
                      row,
                      mapping,
                      selectedClassId,
                      selectedAcademicYearId
                    );
                    return (
                      <TableRow key={i}>
                        <TableCell>{student.firstName || "-"}</TableCell>
                        <TableCell>{student.lastName || "-"}</TableCell>
                        <TableCell>{student.dateOfBirth || "-"}</TableCell>
                        <TableCell>{student.email || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleImport} disabled={importing || !selectedClassId}>
              {importing ? "Import en cours..." : `Importer ${csvData.length} élève(s)`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
