export default function StatusRing() {
  return <span className="status-marker" aria-hidden="true"><svg className="status-ring" viewBox="0 0 48 48" focusable="false">
    <circle className="status-ring__track" cx="24" cy="24" r="20" />
    <circle className="status-ring__progress" cx="24" cy="24" r="20" pathLength="100" data-status-ring />
    <circle className="status-ring__dot" cx="24" cy="24" r="20" />
  </svg></span>
}
