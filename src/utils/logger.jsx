export function mockAddObject(setObjects, setLogs) {
const id = String(Math.floor(Math.random() * 10000));
const o = { id, sessionID: id, fiducialID: Math.floor(Math.random() * 10), x: Math.random(), y: Math.random(), angle: Math.random() * Math.PI * 2 };
setObjects(prev => ({ ...prev, [id]: o }));
setLogs(l => [`Mock object ${id}`, ...l]);
}