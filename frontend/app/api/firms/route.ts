import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const revalidate = 30;

const loggedIds = new Set<string>();

async function appendLog(newRecords: any[]) {
  if (newRecords.length === 0) return;
  const dataDir = path.join(process.cwd(), 'data');
  const logFile = path.join(dataDir, 'ml_training_log.csv');
  try {
    await fs.mkdir(dataDir, { recursive: true });
    let fileExists = true;
    try {
      await fs.access(logFile);
    } catch {
      fileExists = false;
    }
    
    let csvContent = !fileExists ? 'id,lat,lng,brightness,frp,confidence,timestamp,satellite,classification\n' : '';
    const rows = newRecords.map(r => {
      loggedIds.add(r.id);
      return `${r.id},${r.lat},${r.lng},${r.brightness},${r.frp},${r.confidence},${r.timestamp},${r.satellite},${r.classification}`;
    });
    
    csvContent += rows.join('\n') + '\n';
    
    if (loggedIds.size > 20000) {
      const itemsToRemove = loggedIds.size - 20000;
      const iterator = loggedIds.values();
      for (let i = 0; i < itemsToRemove; i++) {
        loggedIds.delete(iterator.next().value);
      }
    }
    
    await fs.appendFile(logFile, csvContent, 'utf-8');
  } catch {}
}

export async function GET() {
  const MAP_KEY = process.env.NASA_FIRMS_MAP_KEY;
  if (!MAP_KEY) {
    return NextResponse.json({ error: 'NASA_FIRMS_MAP_KEY missing' }, { status: 500 });
  }
  const url = `https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_Asia_24h.csv`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(response.statusText);
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) {
      return NextResponse.json({
        summary: { totalDetections: 0, severeAnomalies: 0, routineFlares: 0, avgConfidence: 0, lastUpdated: new Date().toISOString() },
        detections: []
      });
    }
    const headers = lines[0].split(',');
    const colIdx = (name: string) => headers.findIndex(h => h.trim() === name);
    const latIdx = colIdx('latitude');
    const lngIdx = colIdx('longitude');
    const brightIdx = colIdx('bright_ti4');
    const frpIdx = colIdx('frp');
    const confIdx = colIdx('confidence');
    const dateIdx = colIdx('acq_date');
    const timeIdx = colIdx('acq_time');
    const satIdx = colIdx('satellite');
    let totalDetections = 0;
    let severeAnomalies = 0;
    let routineFlares = 0;
    let totalConfidence = 0;
    const detections: any[] = [];
    const newRecordsForML: any[] = [];
    const nowMs = Date.now();
    const cutoffMs = nowMs - 12 * 60 * 60 * 1000;
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length < headers.length) continue;
      const lat = parseFloat(parts[latIdx]);
      const lng = parseFloat(parts[lngIdx]);
      const brightness = parseFloat(parts[brightIdx]);
      const frp = parseFloat(parts[frpIdx]);
      const rawConf = parts[confIdx]?.trim();
      const acqDate = parts[dateIdx];
      let acqTime = parts[timeIdx];
      if (!acqTime || acqTime.length < 4) acqTime = (acqTime || '0').padStart(4, '0');
      
      const timeStr = `${acqTime.slice(0, 2)}:${acqTime.slice(2, 4)}:00Z`;
      const timestamp = `${acqDate}T${timeStr}`;
      const recordTimeMs = new Date(timestamp).getTime();
      
      if (recordTimeMs < cutoffMs) continue;
      
      const satellite = parts[satIdx] || 'NOAA-20';
      let confidence = 50;
      let severity = 'Low';
      if (rawConf === 'h') { confidence = 95; severity = 'High'; }
      else if (rawConf === 'n') { confidence = 75; severity = 'Medium'; }
      else if (!isNaN(parseFloat(rawConf))) {
        confidence = parseFloat(rawConf);
        if (confidence > 80) severity = 'High';
        else if (confidence > 50) severity = 'Medium';
      }
      const isIndustrialFire = frp > 15.0 || brightness > 360.0;
      const classification = isIndustrialFire ? 'Industrial Fire' : 'Routine Flare';
      if (isIndustrialFire) severeAnomalies++;
      else routineFlares++;
      totalConfidence += confidence;
      totalDetections++;
      
      const id = `firms-${acqDate}-${acqTime}-${i}`;
      const record = {
        id, lat, lng, brightness, frp, confidence, timestamp,
        satellite, source: `VIIRS / ${satellite}`, classification, severity,
        industrialSite: `Unknown Zone [${lat.toFixed(2)}, ${lng.toFixed(2)}]`,
        recordTimeMs
      };
      detections.push(record);
      if (!loggedIds.has(id)) newRecordsForML.push(record);
    }
    
    appendLog(newRecordsForML).catch(() => {});
    const sortedDetections = detections.sort((a, b) => b.recordTimeMs - a.recordTimeMs).slice(0, 200);
    sortedDetections.forEach(d => delete d.recordTimeMs);
    
    const summary = {
      totalDetections, severeAnomalies, routineFlares,
      avgConfidence: totalDetections > 0 ? Math.round(totalConfidence / totalDetections) : 0,
      lastUpdated: new Date().toISOString()
    };
    return NextResponse.json({ summary, detections: sortedDetections });
  } catch (error) {
    console.error('FIRMS API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch telemetry data.' }, { status: 500 });
  }
}
