
import { useEffect } from "react";
export default function useWebSocket(url, setConnected, setObjects, setTouches, setLogs) {

useEffect(() => {
const ws = new WebSocket(url);
ws.addEventListener('open', () => {
setConnected(true);
setLogs(l => [`Connected to ${url}`, ...l]);
});
ws.addEventListener('message', (ev) => {
try {
const msg = JSON.parse(ev.data);
if (msg.type === 'tuio_frame') handleFrame(msg.payload, setObjects, setTouches);
} catch (err) { console.error(err); }
});
ws.addEventListener('close', () => setConnected(false));
return () => ws.close();
}, [url]);
}


function handleFrame(frame, setObjects, setTouches) {
const objs = {};
frame.objects?.forEach(o => objs[o.sessionID] = o);
setObjects(objs);
const ts = {};
frame.touches?.forEach(t => ts[t.id] = t);
setTouches(ts);
}