import * as XLSX from 'xlsx';
import crypto from 'crypto';
import fs from 'fs';

export interface ExcelMetadata {
  filiale: string;
  reference: string;
  demandeur: string | null;
  titre: string | null;
  contexte: string | null;
  chargeTotale: number;
  dateDebut: Date | null;
  dateMEP: Date | null;
  dateValidation: Date | null;
}

export interface CollaboratorCharge {
  name: string;
  instruction: number;
  cadrage: number;
  conception: number;
  administration: number;
  technique: number;
  developpement: number;
  testUnitaire: number;
  testIntegration: number;
  assistanceRecette: number;
  deploiement: number;
  assistancePost: number;
  total: number;
}

export interface DailyImputationData {
  phase: string;
  dayNumber: number;
  datePrevu: Date | null;
}

export interface CollaboratorWithDays extends CollaboratorCharge {
  dailyImputations: DailyImputationData[];
}

export interface PlanningPhase {
  phase: string;
  startDate: Date | null;
  endDate: Date | null;
  note: string | null;
}

export interface ParsedExcel {
  metadata: ExcelMetadata;
  collaborators: CollaboratorCharge[];
  planning: PlanningPhase[];
  fileHash: string;
  invalidCollaborators?: string[];
}

function getCellValue(sheet: XLSX.WorkSheet, cellRef: string): string | number | Date | null {
  const cell = sheet[cellRef];
  if (!cell) return null;
  if (cell.t === 'd') return new Date(cell.v as string);
  return cell.v ?? null;
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

function getRowData(sheet: XLSX.WorkSheet, rowNum: number): Map<string, any> {
  const data = new Map<string, any>();
  const startCol = 'A'.charCodeAt(0);
  const endCol = 'M'.charCodeAt(0);
  
  for (let col = startCol; col <= endCol; col++) {
    const colLetter = String.fromCharCode(col);
    const cellRef = `${colLetter}${rowNum}`;
    const value = getCellValue(sheet, cellRef);
    data.set(colLetter, value);
  }
  
  return data;
}

function findCellValueByLabel(
  sheet: XLSX.WorkSheet,
  labelCell: string,
  valueOffsets: string[] = []
): string | null {
  const label = getCellValue(sheet, labelCell);
  if (!label || typeof label !== 'string') return null;
  
  // Extract column from labelCell (e.g., 'A6' -> 'A')
  const labelCol = labelCell.charCodeAt(0);
  const labelRow = parseInt(labelCell.slice(1));
  
  // Look in cells to the right of the label
  for (let offset = 1; offset <= 5; offset++) {
    const colLetter = String.fromCharCode(labelCol + offset);
    const cellRef = `${colLetter}${labelRow}`;
    const value = getCellValue(sheet, cellRef);
    if (value !== null && value !== '') {
      return String(value);
    }
  }
  
  return null;
}

export async function parseExcelFile(filePathOrBuffer: string | Buffer | ArrayBuffer): Promise<ParsedExcel> {
  try {
    // Read file or buffer
    let workbook: XLSX.WorkBook;
    let filePath: string;
    
    if (typeof filePathOrBuffer === 'string') {
      // File path
      workbook = XLSX.readFile(filePathOrBuffer);
      filePath = filePathOrBuffer;
    } else if (Buffer.isBuffer(filePathOrBuffer)) {
      // Node.js Buffer
      workbook = XLSX.read(filePathOrBuffer, { type: 'buffer' });
      filePath = '';
    } else {
      // ArrayBuffer from browser
      workbook = XLSX.read(filePathOrBuffer, { type: 'array' });
      filePath = '';
    }
    
    const sheet = workbook.Sheets['Fiche Instruction'];
    
    if (!sheet) {
      throw new Error('Sheet "Fiche Instruction" not found in Excel file');
    }

    // Extract Metadata (exact coordinates)
    const filiale = String(getCellValue(sheet, 'D3') || '');
    const reference = String(getCellValue(sheet, 'D4') || '');
    const demandeur = findCellValueByLabel(sheet, 'A6');
    const titre = String(getCellValue(sheet, 'B7') || null);
    const contexte = String(getCellValue(sheet, 'E7') || null);
    const chargeTotale = parseFloat(String(getCellValue(sheet, 'D10') || 0));
    const dateDebut = parseDate(getCellValue(sheet, 'D11'));
    const dateMEP = parseDate(getCellValue(sheet, 'D12'));
    const dateValidation = findCellValueByLabel(sheet, 'E9');

    // Parse Chiffrage Prévisionnel (rows 17 onwards)
    const collaborators: CollaboratorCharge[] = [];
    const invalidCollaborators: string[] = [];
    let row = 18;
    
    while (row <= 30) {
      const nameCell = getCellValue(sheet, `A${row}`);
      
      if (!nameCell) {
        row++;
        continue;
      }
      
      const name = String(nameCell).trim();
      
      // Stop at "Charge / phase" line
      if (name === 'Charge / phase') {
        break;
      }
      
      // Parse charges for this collaborator FIRST
      // Colonnes correspondant aux headers de la ligne 7:
      // B=Instruction, C=Cadrage, D=Conception, E=Administration Technique
      // F=Développement/Paramétrage, G=Test Unitaire, H=Test d'Intégration
      // I=Assistance Recette, J=Déploiement, K=Assistance Post Déploiement, L=Total
      const instruction = parseFloat(String(getCellValue(sheet, `B${row}`) || 0));
      const cadrage = parseFloat(String(getCellValue(sheet, `C${row}`) || 0));
      const conception = parseFloat(String(getCellValue(sheet, `D${row}`) || 0));
      const administration = parseFloat(String(getCellValue(sheet, `E${row}`) || 0));
      const technique = parseFloat(String(getCellValue(sheet, `E${row}`) || 0)); // E = Administration Technique
      const developpement = parseFloat(String(getCellValue(sheet, `F${row}`) || 0)); // F = Développement
      const testUnitaire = parseFloat(String(getCellValue(sheet, `G${row}`) || 0)); // G = Test Unitaire
      const testIntegration = parseFloat(String(getCellValue(sheet, `H${row}`) || 0)); // H = Test Intégration
      const assistanceRecette = parseFloat(String(getCellValue(sheet, `I${row}`) || 0)); // I = Assistance Recette
      const deploiement = parseFloat(String(getCellValue(sheet, `J${row}`) || 0)); // J = Déploiement
      const assistancePost = parseFloat(String(getCellValue(sheet, `K${row}`) || 0)); // K = Assistance Post
      
      // L column is total
      let total = parseFloat(String(getCellValue(sheet, `L${row}`) || 0));
      if (total === 0 || isNaN(total)) {
        total = instruction + cadrage + conception + administration + technique +
                developpement + testUnitaire + testIntegration + assistanceRecette +
                deploiement + assistancePost;
      }
      
      // Skip completely empty rows (no name AND no charges)
      const hasValidName = name.trim().length > 0;
      const hasCharges = total > 0;
      
      if (!hasValidName && !hasCharges) {
        // Skip this empty row silently
        row++;
        continue;
      }
      
      // Accept ONLY if:
      // 1. Has parentheses with content: "Collaborateur (I.KADA)" or "Collaborateur (John Doe)"
      // 2. OR has at least 2 REAL words (letters only, no numbers): "Jean Dupont", "John Smith"
      // Reject: "Collaborateur 2", "Collaborateur 3", "xxx", single words, etc.
      
      const hasParenthesesWithContent = /\([A-Za-zÀ-ÿ\s.]+\)/.test(name.trim()); // e.g., "Collaborateur (I.KADA)"
      
      // Check for at least 2 real words (containing only letters, not numbers)
      const words = name.trim().split(/\s+/).filter(word => /^[A-Za-zÀ-ÿ\-'.]+$/.test(word));
      const hasMultipleRealWords = words.length >= 2;
      
      const isValidName = hasParenthesesWithContent || hasMultipleRealWords;
      
      if (!isValidName) {
        invalidCollaborators.push(`${name}: Must have format like "Collaborateur (I.KADA)" or "Jean Dupont"`);
        row++;
        continue;
      }
      
      // Accept: "Collaborateur (I.KADA)", "Jean Dupont", etc.

      collaborators.push({
        name,
        instruction: isNaN(instruction) ? 0 : instruction,
        cadrage: isNaN(cadrage) ? 0 : cadrage,
        conception: isNaN(conception) ? 0 : conception,
        administration: isNaN(administration) ? 0 : administration,
        technique: isNaN(technique) ? 0 : technique,
        developpement: isNaN(developpement) ? 0 : developpement,
        testUnitaire: isNaN(testUnitaire) ? 0 : testUnitaire,
        testIntegration: isNaN(testIntegration) ? 0 : testIntegration,
        assistanceRecette: isNaN(assistanceRecette) ? 0 : assistanceRecette,
        deploiement: isNaN(deploiement) ? 0 : deploiement,
        assistancePost: isNaN(assistancePost) ? 0 : assistancePost,
        total: isNaN(total) ? 0 : total,
      });
      
      row++;
    }

    // Parse Planning Prévisionnel (rows 31 onwards)
    const planning: PlanningPhase[] = [];
    const phases = ['Instruction', 'Cadrage', 'Conception', 'Réalisation', 'Recette', 'Déploiement', 'Post Déploiement'];
    
    for (let i = 0; i < phases.length; i++) {
      const planRow = 32 + i;
      const phase = String(getCellValue(sheet, `A${planRow}`) || phases[i]);
      const startDate = parseDate(getCellValue(sheet, `B${planRow}`));
      const endDate = parseDate(getCellValue(sheet, `C${planRow}`));
      
      planning.push({
        phase,
        startDate,
        endDate,
        note: null,
      });
    }

    // Calculate file hash
    let fileHash: string;
    if (typeof filePathOrBuffer === 'string') {
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(filePathOrBuffer);
      fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } else if (Buffer.isBuffer(filePathOrBuffer)) {
      fileHash = crypto.createHash('sha256').update(filePathOrBuffer).digest('hex');
    } else {
      fileHash = crypto.createHash('sha256').update(Buffer.from(filePathOrBuffer)).digest('hex');
    }

    return {
      metadata: {
        filiale,
        reference,
        demandeur,
        titre: titre || null,
        contexte: contexte || null,
        chargeTotale,
        dateDebut,
        dateMEP,
        dateValidation: parseDate(dateValidation),
      },
      collaborators,
      planning,
      fileHash,
      invalidCollaborators: invalidCollaborators.length > 0 ? invalidCollaborators : undefined,
    };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw error;
  }
}

/**
 * Génère les lignes d'imputation quotidienne pour un collaborateur
 * Pour chaque phase avec une charge > 0, crée autant de lignes que de jours
 */
export function generateDailyImputations(
  collaborator: CollaboratorCharge,
  planning: PlanningPhase[]
): DailyImputationData[] {
  const dailyImputations: DailyImputationData[] = [];
  
  const phaseMapping: { [key: string]: { field: keyof CollaboratorCharge, planningName: string } } = {
    instruction: { field: 'instruction', planningName: 'Instruction' },
    cadrage: { field: 'cadrage', planningName: 'Cadrage' },
    conception: { field: 'conception', planningName: 'Conception' },
    administration: { field: 'administration', planningName: 'Réalisation' },
    technique: { field: 'technique', planningName: 'Réalisation' },
    developpement: { field: 'developpement', planningName: 'Réalisation' },
    testUnitaire: { field: 'testUnitaire', planningName: 'Recette' },
    testIntegration: { field: 'testIntegration', planningName: 'Recette' },
    assistanceRecette: { field: 'assistanceRecette', planningName: 'Recette' },
    deploiement: { field: 'deploiement', planningName: 'Déploiement' },
    assistancePost: { field: 'assistancePost', planningName: 'Post Déploiement' },
  };

  Object.entries(phaseMapping).forEach(([phaseName, { field, planningName }]) => {
    const charge = collaborator[field] as number;
    
    if (charge > 0) {
      // Arrondir la charge pour obtenir le nombre de jours
      const numberOfDays = Math.ceil(charge);
      
      // Trouver les dates de planning pour cette phase
      const planningPhase = planning.find(p => p.phase === planningName);
      const startDate = planningPhase?.startDate;
      
      // Générer une ligne pour chaque jour
      for (let day = 1; day <= numberOfDays; day++) {
        let datePrevu: Date | null = null;
        
        if (startDate) {
          // Calculer la date prévue (en sautant les weekends si nécessaire)
          datePrevu = new Date(startDate);
          let daysToAdd = day - 1;
          let currentDate = new Date(startDate);
          
          while (daysToAdd > 0) {
            currentDate.setDate(currentDate.getDate() + 1);
            // Sauter les weekends (0 = dimanche, 6 = samedi)
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
              daysToAdd--;
            }
          }
          
          datePrevu = currentDate;
        }
        
        dailyImputations.push({
          phase: phaseName,
          dayNumber: day,
          datePrevu,
        });
      }
    }
  });

  return dailyImputations;
}
