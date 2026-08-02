import { Paths, File, Directory } from 'expo-file-system';

function boardStateFile() {
  return new File(Paths.document, 'markers', 'boardState.json');
}

export async function saveBoardState(state) {
  const dir = new Directory(Paths.document, 'markers');
  dir.create({ intermediates: true, idempotent: true });
  boardStateFile().write(JSON.stringify(state));
}

export async function getBoardState() {
  const file = boardStateFile();
  if (!file.exists) return null;
  try {
    return JSON.parse(await file.text());
  } catch {
    return null;
  }
}

export async function clearBoardState() {
  const file = boardStateFile();
  if (file.exists) {
    file.delete();
  }
}
