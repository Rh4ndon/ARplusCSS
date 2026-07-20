import { Paths, File, Directory } from 'expo-file-system';

function markersDir() {
  return new Directory(Paths.document, 'markers');
}

function markerFile(type) {
  const name = type === 'motherboard' ? 'motherboard.jpg' : 'rj45.jpg';
  return new File(Paths.document, 'markers', name);
}

function configFile() {
  return new File(Paths.document, 'markers', 'config.json');
}

export async function saveMarkerImage(uri, type = 'motherboard') {
  const dir = markersDir();
  dir.create({ intermediates: true, idempotent: true });
  const dest = markerFile(type);
  if (dest.exists) {
    dest.delete();
  }
  const src = new File(uri);
  const destUri = dest.uri;
  src.move(dest);
  return destUri;
}

export async function getMarkerImage(type = 'motherboard') {
  const file = markerFile(type);
  return file.exists ? file.uri : null;
}

export async function deleteMarkerImage(type = 'motherboard') {
  const file = markerFile(type);
  if (file.exists) {
    file.delete();
  }
}

export async function saveMarkerConfig(config) {
  const dir = markersDir();
  dir.create({ intermediates: true, idempotent: true });
  const file = configFile();
  file.write(JSON.stringify(config));
}

export async function getMarkerConfig() {
  const file = configFile();
  if (!file.exists) return null;
  try {
    return JSON.parse(await file.text());
  } catch {
    return null;
  }
}

export async function deleteAllMarkers() {
  const dir = markersDir();
  if (dir.exists) {
    dir.delete();
  }
}
